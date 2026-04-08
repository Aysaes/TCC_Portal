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
use Illuminate\Validation\Rule;
use App\Notifications\PRStatusUpdate;

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

        $suppliers = Supplier::where(function($query) {
        $query->where('status', '!=', 'Disabled')
              ->orWhereNull('status');
    })
    ->select('id', 'name')
    ->get();
        $products = Product::where(function($query) {
        $query->where('status', '!=', 'Disabled')
              ->orWhereNull('status');
    })
    ->select('id', 'name', 'supplier_id', 'details', 'unit', 'price')
    ->get();
        $branches = Branch::select('id', 'name')->get();
        $departments = Department::select('id', 'name')->get();

        return Inertia::render('PRPO/CreatePR', [
            'suppliers' => $suppliers,
            'products' => $products,
            'branches' => $branches,
            'departments' => $departments,
            'userBranches' => $userBranches,
        ]);
    }


    private function notifyNextApprovers($pr, $status)
    {
        $usersToNotify = User::whereHas('role', function ($q) use ($status) {
            if ($status === 'pending_inv_tl') {
                $q->where('name', 'like', '%inventory tl%');
            } elseif ($status === 'pending_ops_manager') {
                $q->where('name', 'like', '%operations%')->orWhere('name', 'like', '%ops manager%');
            } elseif ($status === 'approved') {
                $q->where('name', 'like', '%procurement%')->orWhere('name', 'like', '%director%');
            }
            $q->orWhere('name', 'admin'); // Admin always gets notified
        })->get();

        // Optional: If you want to strictly filter by branch here, you could, 
        // but since the Approval Board already filters their view, a general ping is safe!
        if ($usersToNotify->isNotEmpty()) {
            Notification::send($usersToNotify, new PRStatusUpdate($pr, "Action Required: " . str_replace('_', ' ', strtoupper($status))));
        }
    }

    // =====================================================================
    // 2. STORE REQUEST (Save to Database)
    // =====================================================================
   public function store(Request $request)
    {
        // 1. Validate the incoming data (Kept exactly as you had it)
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
            
            // Validate the array of items
            'items' => 'required|array|min:1',
            'items.*.product_id' => [
    'required',
    Rule::exists('products', 'id')->where(function ($query) {
        $query->where('status', '!=', 'Disabled')->orWhereNull('status');
    }),
],
            'items.*.supplier_id' => [
    'nullable',
    Rule::exists('suppliers', 'id')->where(function ($query) {
        $query->where('status', '!=', 'Disabled')->orWhereNull('status');
    }),
],
            'items.*.specifications' => 'nullable|string|max:255',
            'items.*.unit' => 'nullable|string|max:50',
            'items.*.qty_requested' => 'required|numeric|min:0',
            'items.*.qty_on_hand' => 'nullable|numeric|min:0',
            'items.*.reorder_level' => 'nullable|numeric|min:0',
            'items.*.est_unit_cost' => 'nullable|numeric|min:0',
            'items.*.total_cost' => 'nullable|numeric|min:0',
        ], [
            // Custom error message for the date
            'date_needed.after_or_equal' => 'The date needed cannot be a past date.',
        ]);

        // 2. 🟢 DYNAMIC WORKFLOW ROUTING
        $userRole = strtolower(Auth::user()->role->name ?? '');
        $initialStatus = 'pending_inv_tl'; // Scenario 1 Default (Inventory Assistant)

        if (str_contains($userRole, 'tl')) {
            // Scenario 2: TL creates it, skips TL approval, goes straight to Ops Manager
            $initialStatus = 'pending_ops_manager'; 
        } elseif (str_contains($userRole, 'director') || str_contains($userRole, 'admin')) {
            // Scenario 3: DCSO creates it, goes straight to Procurement for PO
            $initialStatus = 'approved'; 
        }

        // 3. 🟢 Execute within a safe Database Transaction (Using your original safe code)
        DB::transaction(function () use ($validated, $initialStatus) {
            
            $pr = PurchaseRequest::create([
                'user_id' => Auth::id(), // ✨ This safely handles the user_id!
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
                'status' => $initialStatus, // ✨ Injects the dynamic status
            ]);

            foreach ($validated['items'] as $item) {
                $pr->items()->create($item);
            }
        });

        $newPr = PurchaseRequest::latest()->first(); 
        if ($newPr) {
            $this->notifyNextApprovers($newPr, $initialStatus);
        }

        return redirect()->route('prpo.approval-board')->with('success', 'Purchase Request submitted successfully!');
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
        
        $isAssistant = str_contains($userRole, 'assistant');
        $isAdmin = str_contains($userRole, 'admin');

        // 🟢 If they are an assistant, FORCE 'my_requests'. Otherwise default to 'action_needed'
        $view = $request->query('view', $isAssistant ? 'my_requests' : 'action_needed');
        if ($isAssistant) {
            $view = 'my_requests';
        }

        $query = PurchaseRequest::with(['user', 'items.product', 'items.supplier'])->latest();

        // 🟢 1. MY REQUESTS (Strictly created by the logged-in user)
        if ($view === 'my_requests') {
            $query->where('user_id', $user->id);
        } 
        
        // 🟢 2. ACTION NEEDED (Pending their specific approval)
        elseif ($view === 'action_needed') {
            if ($isAdmin) {
                $query->whereIn('status', ['pending_inv_tl', 'pending_ops_manager', 'approved']);
            } 
            elseif (str_contains($userRole, 'inventory tl')) {
                $query->where('status', 'pending_inv_tl');
                if (!empty($userBranches)) $query->whereIn('branch', $userBranches); 
            } 
            elseif (str_contains($userRole, 'operations') || str_contains($userRole, 'ops manager')) {
                $query->where('status', 'pending_ops_manager');
                if (!empty($userBranches)) $query->whereIn('branch', $userBranches); 
            } 
            elseif (str_contains($userRole, 'director') || str_contains($userRole, 'procurement')) {
                $query->where('status', 'approved');
            } 
            else {
                $query->whereRaw('1 = 0'); 
            }
        } 
        
        // 🟢 3. FINISHED REQUESTS (Moved past their desk or finalized)
        elseif ($view === 'finished') {
            if ($isAdmin) {
                $query->whereIn('status', ['po_generated', 'rejected', 'cancelled']);
            } 
            elseif (str_contains($userRole, 'inventory tl')) {
                $query->whereIn('status', ['pending_ops_manager', 'approved', 'po_generated', 'rejected', 'cancelled']);
                if (!empty($userBranches)) $query->whereIn('branch', $userBranches);
            } 
            elseif (str_contains($userRole, 'operations') || str_contains($userRole, 'ops manager')) {
                $query->whereIn('status', ['approved', 'po_generated', 'rejected', 'cancelled']);
                if (!empty($userBranches)) $query->whereIn('branch', $userBranches);
            } 
            elseif (str_contains($userRole, 'director') || str_contains($userRole, 'procurement')) {
                $query->whereIn('status', ['po_generated', 'rejected', 'cancelled']);
            } 
            else {
                $query->whereRaw('1 = 0'); 
            }
        }

        // 🟢 4. ALL ACTIVE (For directors/admins)
        elseif ($view === 'all') {
            if (!$isAdmin && !empty($userBranches)) {
                $query->whereIn('branch', $userBranches);
            }
        }

        $requests = $query->paginate(15)->withQueryString();

        return Inertia::render('PRPO/ApprovalBoard', [
            'requests' => $requests,
            'currentView' => $view,
            'userBranches' => $userBranches,
            'isAssistant' => $isAssistant, 
            'canSeeAll' => !$isAssistant && ($isAdmin || str_contains($userRole, 'director') || str_contains($userRole, 'procurement')),
        ]);
    }

    // =====================================================================
    // 4. UPDATE STATUS (Approve / Reject Logic)
    // =====================================================================
  public function updateStatus(Request $request, PurchaseRequest $purchaseRequest)
    {
        // 🟢 1. Added 'cancel' to the allowed actions
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,cancel' 
        ]);

        $originalRequester = $purchaseRequest->user;

        // 🟢 2. Handle the Cancellation
        if ($validated['action'] === 'cancel') {
            // Security check: Only the owner can cancel it
            if ($originalRequester && $originalRequester->id !== Auth::id()) {
                abort(403, 'You can only cancel your own purchase requests.');
            }
            
            $purchaseRequest->status = 'cancelled';
            $purchaseRequest->save();
            
            return back()->with('success', 'Your purchase request has been cancelled.');
        }

        // 3. Handle Standard Approvals
        if ($validated['action'] === 'approve') {
            if ($purchaseRequest->status === 'pending_inv_tl') {
                $purchaseRequest->status = 'pending_ops_manager';
            } elseif ($purchaseRequest->status === 'pending_ops_manager') {
                $purchaseRequest->status = 'approved'; 
            }
            
            $message = 'Purchase request moved to the next approval stage.';
            
            $this->notifyNextApprovers($purchaseRequest, $purchaseRequest->status);
            
            if ($originalRequester) {
                $statusText = $purchaseRequest->status === 'approved' ? 'Fully Approved! Sent to Procurement.' : 'Approved by TL. Sent to Ops Manager.';
                $originalRequester->notify(new PRStatusUpdate($purchaseRequest, $statusText));
            }

        // 4. Handle Standard Rejections
        } else {
            $purchaseRequest->status = 'rejected';
            $message = 'Purchase request has been rejected.';
            
            if ($originalRequester) {
                $originalRequester->notify(new PRStatusUpdate($purchaseRequest, "Rejected by Management."));
            }
        }

        $purchaseRequest->save();

        return back()->with('success', $message);
    }

    public function print(PurchaseRequest $purchaseRequest)
    {
        // Load all the necessary relationships
        $purchaseRequest->load(['user', 'items.product', 'items.supplier']);

        return Inertia::render('PRPO/PrintablePR', [
            'pr' => $purchaseRequest
        ]);
    }
}