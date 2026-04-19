<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Supplier;
use App\Models\PurchaseRequest;
use App\Models\Branch;
use App\Models\Department;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use App\Notifications\PendingApprovalNotification;

class PurchaseRequestController extends Controller
{
    // =====================================================================
    // 1. CREATE REQUEST (Frontend Form)
    // =====================================================================
    public function create()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $userBranches = $user->branches()->pluck('name')->toArray();

        $suppliers = Supplier::select('id', 'name')->get();
        $products = Product::select('id', 'name', 'supplier_id', 'details', 'unit', 'price')->get();
        $branches = Branch::select('id', 'name')->get();
        $departments = Department::select('id', 'name')->get();
        $employees = User::with('branches:id,name')
                         ->where('id', '!=', Auth::id())
                         ->select('id', 'name')
                         ->orderBy('name')
                         ->get();

        return Inertia::render('PRPO/CreatePR', [
            'suppliers' => $suppliers,
            'products' => $products,
            'branches' => $branches,
            'departments' => $departments,
            'userBranches' => $userBranches,
            'employees' => $employees,
        ]);
    }

    // =====================================================================
    // 2. STORE REQUEST (Save to Database)
    // =====================================================================
   public function store(Request $request)
    {
        $validated = $request->validate([
            'branch' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'date_prepared' => 'required|date',
            'request_type' => 'nullable|string|max:255',
            'priority' => 'nullable|string|max:255',
            'date_needed' => 'nullable|date|after_or_equal:today', 
            'budget_status' => 'nullable|string|max:255',
            'budget_ref' => 'nullable|string|max:255',
            'no_of_quotations' => 'required|integer|min:0',
            'purpose_of_request' => 'nullable|string',
            'impact_if_not_procured' => 'nullable|string',
            'cc_user_id' => 'nullable|exists:users,id',

            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.supplier_id' => 'nullable|exists:suppliers,id',
            'items.*.specifications' => 'nullable|string|max:255',
            'items.*.unit' => 'nullable|string|max:50',
            'items.*.qty_requested' => 'required|numeric|min:0',
            'items.*.qty_on_hand' => 'nullable|numeric|min:0',
            'items.*.reorder_level' => 'nullable|numeric|min:0',
            'items.*.est_unit_cost' => 'nullable|numeric|min:0',
            'items.*.total_cost' => 'nullable|numeric|min:0',
        ], [
            'date_needed.after_or_equal' => 'The date needed cannot be a past date.',
        ]);

        // 2. 🟢 DYNAMIC WORKFLOW ROUTING
        $userRole = strtolower(Auth::user()->role->name ?? '');
        $initialStatus = 'pending_inv_tl'; 

        if (str_contains($userRole, 'tl')) {
            $initialStatus = 'pending_ops_manager'; 
        } 
        elseif (str_contains($userRole, 'director') || str_contains($userRole, 'admin') || str_contains($userRole, 'operations') || str_contains($userRole, 'procurement'))  {
            $initialStatus = 'approved'; 
        }

        DB::transaction(function () use ($validated, $initialStatus) {
            
            $pr = PurchaseRequest::create([
                'user_id' => Auth::id(), 
                'branch' => $validated['branch'],
                'department' => $validated['department'],
                'date_prepared' => $validated['date_prepared'],
                'request_type' => $validated['request_type'],
                'priority' => $validated['priority'],
                'date_needed' => $validated['date_needed'],
                'budget_status' => $validated['budget_status'],
                'budget_ref' => $validated['budget_ref'],
                'no_of_quotations' => $validated['no_of_quotations'],
                'purpose_of_request' => $validated['purpose_of_request'],
                'impact_if_not_procured' => $validated['impact_if_not_procured'],
                'status' => $initialStatus,
                'cc_user_id' => $validated['cc_user_id'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $pr->items()->create($item);
            }

            $this->notifyNextApprovers($pr);
        });

        return redirect()->route('prpo.approval-board', ['view' => 'my_requests'])
                         ->with('success', 'Purchase Request submitted successfully!');
    }

    // =====================================================================
    // 3. APPROVAL BOARD (View Requests based on Role)
    // =====================================================================
  public function approvalBoard(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $userRole = strtolower($user->role->name ?? '');
        $userBranches = $user->branches()->pluck('name')->toArray(); 
        
        // 🟢 1. Define if they are an assistant to pass to React
        $isAssistant = str_contains($userRole, 'assist');
        
        // 🟢 2. Default assistants to 'my_requests', everyone else to 'action_needed'
        $defaultView = $isAssistant ? 'my_requests' : 'action_needed';
        $view = $request->query('view', $defaultView);

        $query = PurchaseRequest::with(['user', 'cc_user', 'items.product', 'items.supplier'])->latest();
        $isAdmin = str_contains($userRole, 'admin');

        if ($view === 'action_needed') {
            if ($isAdmin) {
                $query->whereIn('status', ['pending_inv_tl', 'pending_ops_manager', 'approved']);
            } 
            elseif (str_contains($userRole, 'inventory tl')) {
                $query->where('status', 'pending_inv_tl');
                if (!empty($userBranches)) {
                    $query->whereIn('branch', $userBranches); 
                }
            } 
            elseif (str_contains($userRole, 'operations') || str_contains($userRole, 'ops manager')) {
                $query->where('status', 'pending_ops_manager');
                if (!empty($userBranches)) {
                    $query->whereIn('branch', $userBranches); 
                }
            } 
            elseif (str_contains($userRole, 'director') || str_contains($userRole, 'procurement')) {
                $query->where('status', 'approved');
            } 
            else {
                $query->whereRaw('1 = 0'); 
            }
        } 
        // 🟢 3. Add explicit logic for the 'my_requests' tab
        elseif ($view === 'my_requests') {
            $query->where('user_id', $user->id);
        } 
        // Logic for 'all' or 'finished'
        else {
            if (!$isAdmin && !empty($userBranches)) {
                $query->whereIn('branch', $userBranches);
            }
        }

        $requests = $query->paginate(15)->withQueryString();

        return Inertia::render('PRPO/ApprovalBoard', [
            'requests' => $requests,
            'currentView' => $view,
            'userBranches' => $userBranches, 
            'isAssistant' => $isAssistant, // 🟢 4. Pass to React so it hides the Action Needed tab!
            'canSeeAll' => $isAdmin || str_contains($userRole, 'director'), // Optional: Pass your all-access flag
        ]);
    }

    // =====================================================================
    // 4. UPDATE STATUS (Approve / Reject Logic)
    // =====================================================================
    public function updateStatus(Request $request, PurchaseRequest $purchaseRequest)
    {
        // 🟢 1. Added cancel to the allowed actions, and validate the reason
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,cancel',
            'rejection_reason' => 'required_if:action,reject|nullable|string'
        ]);

        if ($validated['action'] === 'approve') {
            if ($purchaseRequest->status === 'pending_inv_tl') {
                $purchaseRequest->status = 'pending_ops_manager';
            } elseif ($purchaseRequest->status === 'pending_ops_manager') {
                $purchaseRequest->status = 'approved'; 
            }
            $message = 'Purchase request moved to the next approval stage.';
        
        } elseif ($validated['action'] === 'cancel') {
            $purchaseRequest->status = 'cancelled';
            $message = 'Purchase request has been cancelled.';
            
        } else {
            // 🟢 2. Handle Rejection & Save Reason
            $purchaseRequest->status = 'rejected';
            $purchaseRequest->rejection_reason = $validated['rejection_reason'];
            $message = 'Purchase request has been rejected.';
        }

        $purchaseRequest->save();

        $this->notifyNextApprovers($purchaseRequest);

        return back()->with('success', $message);
    }

    public function print(PurchaseRequest $purchaseRequest)
    {
        $purchaseRequest->load(['user','cc_user', 'items.product', 'items.supplier']);

        return Inertia::render('PRPO/PrintablePR', [
            'pr' => $purchaseRequest
        ]);
    }

    private function notifyNextApprovers(PurchaseRequest $pr)
    {
        
        // 🟢 1. Always start the list with the original requester!
        $usersToNotify = collect([$pr->user]); 
        $message = '';

        if ($pr->status === 'pending_inv_tl') {
            // Find Inventory TLs
            $approvers = User::whereHas('role', function ($q) {
                $q->where('name', 'like', '%Inventory TL%');
            })->whereHas('branches', function ($q) use ($pr) {
                $q->where('name', $pr->branch);
            })->get();
            
            // Add approvers to our list
            $usersToNotify = $usersToNotify->merge($approvers);
            // Adjusted message to make sense for both parties
            $message = "PR from {$pr->department} ({$pr->branch}) is now pending Inventory TL approval.";

        } elseif ($pr->status === 'pending_ops_manager') {
            // Find Ops Managers
            $approvers = User::whereHas('role', function ($q) {
                $q->where('name', 'like', '%Ops Manager%')->orWhere('name', 'like', '%Operations%');
            })->whereHas('branches', function ($q) use ($pr) {
                $q->where('name', $pr->branch);
            })->get();

            $usersToNotify = $usersToNotify->merge($approvers);
            $message = "PR from {$pr->department} ({$pr->branch}) is now pending Operations Manager approval.";

        } elseif ($pr->status === 'approved') {
            // Find Procurement
            $procurementTeam = User::whereHas('role', function ($q) {
                $q->where('name', 'like', '%Procurement%');
            })->get();

            $usersToNotify = $usersToNotify->merge($procurementTeam);
            $message = "PR from {$pr->department} ({$pr->branch}) is approved. The PO is ready for generation.";
            
        } elseif ($pr->status === 'rejected') {
             $message = "PR from {$pr->department} ({$pr->branch}) was rejected.";
             
        } elseif ($pr->status === 'cancelled') {
             $message = "PR from {$pr->department} ({$pr->branch}) was cancelled.";
        }

        if (!empty($pr->cc_users)) {
            $ccUsers = User::whereIn('id', $pr->cc_users)->get();
            $usersToNotify = $usersToNotify->merge($ccUsers);
        }

        // 🟢 2. Filter out duplicates (Just in case an Inventory TL made their own request!)
        $usersToNotify = $usersToNotify->unique('id');

        // Send the notification to everyone on the final list
        if ($usersToNotify->isNotEmpty()) {
            Notification::send($usersToNotify, new PendingApprovalNotification($pr, $message));
        }
    }
}