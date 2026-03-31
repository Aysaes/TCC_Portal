<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    // =====================================================================
    // 1. VIEW ALL PURCHASE ORDERS (Procurement Dashboard)
    // =====================================================================
    public function index(Request $request)
    {
        $userRole = strtolower(trim(Auth::user()->role->name ?? ''));
        $allowedRoles = ['procurement assist', 'procurement tl', 'director of corporate services and operations', 'admin'];
        
        if (!in_array($userRole, $allowedRoles)) {
            abort(403, 'Unauthorized Action. Only Procurement can access the PO Dashboard.');
        }

        // 1. Get the requested view (default to action_needed)
        $view = $request->query('view', 'action_needed');

        $query = PurchaseOrder::with([
            'supplier', 'preparedBy', 'items.product',
            'purchaseRequest.user', 'purchaseRequest.items.product', 'purchaseRequest.items.supplier'
        ])->latest();

        // 2. Filter based on what the specific role needs to take action on
        if ($view === 'action_needed') {
            if (in_array($userRole, ['procurement assist', 'procurement tl'])) {
                $query->where('status', 'drafted'); // Procurement must edit and submit drafts
            } elseif ($userRole === 'director of corporate services and operations') {
                $query->where('status', 'pending_approval'); // DCSO must approve submitted POs
            } elseif ($userRole === 'admin') {
                $query->whereIn('status', ['drafted', 'pending_approval']);
            }
        }
        // If $view === 'all', it bypasses the above and loads everything.

        $purchaseOrders = $query->paginate(15)->withQueryString();

        return Inertia::render('PRPO/PurchaseOrdersIndex', [
            'purchaseOrders' => $purchaseOrders,
            'currentView' => $view
        ]);
    }

    // =====================================================================
    // 2. UPDATE / FINALIZE A PURCHASE ORDER
    // =====================================================================
    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'delivery_date' => 'nullable|date',
            'payment_terms' => 'nullable|string|max:255',
            'ship_to' => 'nullable|string|max:255',
            'discount_total' => 'nullable|numeric|min:0',
            'vat_rate' => 'nullable|numeric|min:0|max:100', // e.g. 12 for 12%
            'status' => 'required|in:drafted,pending_approval,approved,cancelled'
        ]);

        // 1. Calculate the new math based on negotiated discounts and VAT
        $grossAmount = $purchaseOrder->gross_amount;
        $discount = $validated['discount_total'] ?? 0;
        
        $netOfDiscount = $grossAmount - $discount;
        
        // Convert VAT percentage (e.g., 12) to a decimal (0.12)
        $vatDecimal = ($validated['vat_rate'] ?? 12) / 100;
        $vatTotal = $netOfDiscount * $vatDecimal;
        
        $grandTotal = $netOfDiscount + $vatTotal;

        // 2. Save the updates to the database
        $purchaseOrder->update([
            'delivery_date' => $validated['delivery_date'],
            'payment_terms' => $validated['payment_terms'],
            'ship_to' => $validated['ship_to'],
            'discount_total' => $discount,
            'net_of_discount' => $netOfDiscount,
            'vat_total' => $vatTotal,
            'grand_total' => $grandTotal,
            'status' => $validated['status'],
        ]);

        $message = match($validated['status']) {
            'approved' => 'Purchase Order has been officially Approved by DCSO!',
            'pending_approval' => 'Purchase Order submitted to DCSO for approval.',
            'cancelled' => 'Purchase Order has been cancelled.',
            default => 'Purchase Order draft updated successfully.'
        };

        return back()->with('success', $message);
    }


    public function generateFromPR(Request $request, PurchaseRequest $purchaseRequest)
    {

        $userRole = strtolower(trim(Auth::user()->role->name ?? ''));
        $allowedRoles = ['procurement assist', 'procurement tl', 'director of corporate services and operations', 'admin'];
        
        if (!in_array($userRole, $allowedRoles)) {
            abort(403, 'Unauthorized Action. Only Procurement or Directors can generate Purchase Orders.');
        }

        // 1. Safety Checks
        if ($purchaseRequest->status !== 'approved') {
            return back()->with('error', 'Only approved Purchase Requests can be converted to Purchase Orders.');
        }

        if (PurchaseOrder::where('purchase_request_id', $purchaseRequest->id)->exists()) {
            return back()->with('error', 'Purchase Orders have already been generated for this request.');
        }

        // 2. Fetch items and group them by Supplier
        $items = $purchaseRequest->items()->with('product')->get();
        $groupedBySupplier = $items->groupBy('supplier_id');

        // Use a transaction so if one PO fails to generate, they all roll back
        DB::transaction(function () use ($groupedBySupplier, $purchaseRequest) {
            foreach ($groupedBySupplier as $supplierId => $supplierItems) {
                
                // Safety catch: Skip items that don't have a supplier assigned
                if (!$supplierId) continue;

                // 3. Generate Unique PO Number (Format: PO-YYYY-XXXX)
                $year = date('Y');
                $latestPo = PurchaseOrder::whereYear('created_at', $year)->orderBy('id', 'desc')->first();
                $nextNumber = $latestPo ? intval(substr($latestPo->po_number, -4)) + 1 : 1;
                $poNumber = 'PO-' . $year . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

                // 4. Create the PO Header
                $po = PurchaseOrder::create([
                    'purchase_request_id' => $purchaseRequest->id,
                    'supplier_id' => $supplierId,
                    'prepared_by_id' => Auth::id(),
                    'po_number' => $poNumber,
                    'po_date' => now()->toDateString(),
                    'delivery_date' => $purchaseRequest->date_needed,
                    'purpose' => $purchaseRequest->purpose_of_request,
                    'department' => $purchaseRequest->department,
                    'status' => 'drafted' // Starts as a draft so Procurement can negotiate/edit it
                ]);

                $grossAmount = 0;

                // 5. Create PO Items
                foreach ($supplierItems as $prItem) {
                    // Combine product name and specs for the PO description
                    $description = $prItem->product ? $prItem->product->name : 'Custom Item';
                    if ($prItem->specifications) {
                        $description .= ' - ' . $prItem->specifications;
                    }

                    $qty = $prItem->qty_requested;
                    $unitPrice = $prItem->est_unit_cost ?? 0;
                    $lineTotal = $qty * $unitPrice;
                    
                    $grossAmount += $lineTotal;

                    PurchaseOrderItem::create([
                        'purchase_order_id' => $po->id,
                        'product_id' => $prItem->product_id,
                        'description' => $description,
                        'qty' => $qty,
                        'unit' => $prItem->unit,
                        'unit_price' => $unitPrice,
                        'vat_rate' => 12.00, // Default to 12% VAT
                        'net_payable' => $lineTotal
                    ]);
                }

                // 6. Update Initial PO Totals
                // We do basic math here; the Procurement team can tweak discounts/VAT in the UI later
                $vatTotal = $grossAmount * 0.12;
                $grandTotal = $grossAmount + $vatTotal;

                $po->update([
                    'gross_amount' => $grossAmount,
                    'vat_total' => $vatTotal,
                    'grand_total' => $grandTotal
                ]);

            }
            
            DB::table('purchase_requests')
                ->where('id', $purchaseRequest->id)
                ->update([
                    'status' => 'po_generated',
                    'updated_at' => now()
                ]);
                
        });

        return back()->with('success', 'Purchase Orders drafted successfully! You can now review them.');
    }
}
