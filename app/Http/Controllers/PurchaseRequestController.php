<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Supplier;
use App\Models\PurchaseRequest;
use App\Models\Branch;
use App\Models\Department;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

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

        return Inertia::render('PRPO/CreatePR', [
            'suppliers' => $suppliers,
            'products' => $products,
            'branches' => $branches,
            'departments' => $departments,
            'userBranches' => $userBranches,
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
        } elseif (str_contains($userRole, 'director') || str_contains($userRole, 'admin')) {
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
            ]);

            foreach ($validated['items'] as $item) {
                $pr->items()->create($item);
            }
        });

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
        
        $defaultView = str_contains($userRole, 'assistant') ? 'all' : 'action_needed';
        $view = $request->query('view', $defaultView);

        $query = PurchaseRequest::with(['user', 'items.product', 'items.supplier'])->latest();
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
        } else {
            if (!$isAdmin && str_contains($userRole, 'assistant')) {
                $query->where('user_id', $user->id);
            } elseif (!$isAdmin && !empty($userBranches)) {
                $query->whereIn('branch', $userBranches);
            }
        }

        $requests = $query->paginate(15)->withQueryString();

        return Inertia::render('PRPO/ApprovalBoard', [
            'requests' => $requests,
            'currentView' => $view,
            'userBranches' => $userBranches, 
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

        return back()->with('success', $message);
    }

    public function print(PurchaseRequest $purchaseRequest)
    {
        $purchaseRequest->load(['user', 'items.product', 'items.supplier']);

        return Inertia::render('PRPO/PrintablePR', [
            'pr' => $purchaseRequest
        ]);
    }
}