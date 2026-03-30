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
        $suppliers = Supplier::select('id', 'name')->get();
        $products = Product::select('id', 'name', 'supplier_id', 'details')->get();
        $branches = Branch::select('id', 'name')->get();
        $departments = Department::select('id', 'name')->get();

        return Inertia::render('PRPO/CreatePR', [
            'suppliers' => $suppliers,
            'products' => $products,
            'branches' => $branches,
            'departments' => $departments,
        ]);
    }

    // =====================================================================
    // 2. STORE REQUEST (Save to Database)
    // =====================================================================
    public function store(Request $request)
    {
        // Validate the incoming data
        $validated = $request->validate([
            'branch' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'date_prepared' => 'required|date',
            'request_type' => 'nullable|string|max:255',
            'priority' => 'nullable|string|max:255',
            'date_needed' => 'nullable|date|after_or_equal:today', // Backend check for past dates
            'budget_status' => 'nullable|string|max:255',
            'budget_ref' => 'required|string|max:255',
            'no_of_quotations' => 'required|integer|min:0',
            'purpose_of_request' => 'nullable|string',
            'impact_if_not_procured' => 'nullable|string',
            
            // Validate the array of items
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
            // Custom error message for the date
            'date_needed.after_or_equal' => 'The date needed cannot be a past date.',
        ]);

        // Safely save using a Database Transaction
        DB::transaction(function () use ($validated) {
            
            // Create the main header record
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
                'status' => 'pending_inventory_assistant', // Initial State
            ]);

            // Loop through and attach all the dynamic items
            foreach ($validated['items'] as $item) {
                $pr->items()->create($item);
            }
            
        });

        // Redirect back with a flash message
        return redirect()->route('prpo.approval-board')->with('success', 'Purchase Request submitted successfully!');
    }

    // =====================================================================
    // 3. APPROVAL BOARD (View Requests based on Role)
    // =====================================================================
    public function approvalBoard()
    {
        $user = Auth::user();
        $roleName = strtolower($user->role->name ?? '');

        // Define which statuses each role is allowed to see
        $visibleStatuses = [];
        
        if ($roleName === 'inventory assistant') {
            $visibleStatuses = ['pending_inventory_assistant'];
        } elseif ($roleName === 'inventory tl') {
            $visibleStatuses = ['pending_inventory_tl'];
        } elseif (in_array($roleName, ['procurement', 'procurement tl'])) {
            $visibleStatuses = ['pending_procurement'];
        } elseif ($roleName === 'admin') {
            // Admins see everything to oversee the process
            $visibleStatuses = [
                'pending_inventory_assistant', 
                'pending_inventory_tl', 
                'pending_procurement', 
                'approved', 
                'rejected'
            ];
        }

        // Fetch requests with their relationships
       $requests = PurchaseRequest::with(['user', 'items.product', 'items.supplier'])
            ->when(count($visibleStatuses) > 0, function ($query) use ($visibleStatuses) {
                $query->whereIn('status', $visibleStatuses);
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('PRPO/ApprovalBoard', [
            'requests' => $requests,
        ]);
    }

    // =====================================================================
    // 4. UPDATE STATUS (Approve / Reject Logic)
    // =====================================================================
    public function updateStatus(Request $request, PurchaseRequest $purchaseRequest)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject'
        ]);

        $currentStatus = $purchaseRequest->status;
        $newStatus = $currentStatus;

        if ($validated['action'] === 'approve') {
            // State Machine: Move to the next step based on the current step
            if ($currentStatus === 'pending_inventory_assistant') {
                $newStatus = 'pending_inventory_tl';
            } elseif ($currentStatus === 'pending_inventory_tl') {
                $newStatus = 'pending_procurement';
            } elseif ($currentStatus === 'pending_procurement') {
                $newStatus = 'approved';
            }
        } else {
            // If rejected, it immediately goes to the rejected state
            $newStatus = 'rejected';
        }

        // Update the database
        $purchaseRequest->update(['status' => $newStatus]);

        return back()->with('success', "Request has been {$validated['action']}d successfully.");
    }
}