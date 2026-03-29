<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Supplier;
use App\Models\PurchaseRequest;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseRequestController extends Controller
{
    public function create()
    {
        $suppliers = Supplier::select('id', 'name')->get();
        $products = Product::select('id', 'name', 'supplier_id', 'details')->get();

        return Inertia::render('PRPO/CreatePR', [
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validate the incoming React data
        $validated = $request->validate([
            'branch' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'date_prepared' => 'required|date',
            'request_type' => 'nullable|string|max:255',
            'priority' => 'nullable|string|max:255',
            'date_needed' => 'nullable|date',
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
        ]);

        // 2. Use a Database Transaction to safely save everything
        DB::transaction(function () use ($validated) {
            
            // Save the main header info
            $pr = PurchaseRequest::create([
                'user_id' => auth()->id(),
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
                'status' => 'pending_inventory_assistant',
            ]);

            // Loop through and save each item row attached to the PR
            foreach ($validated['items'] as $item) {
                $pr->items()->create($item);
            }
            
        });

        // 3. Redirect back with a success message
        // Make sure you have an 'index' route, or redirect to dashboard for now
        return redirect()->route('dashboard')->with('success', 'Purchase Request submitted successfully!');
    }
}