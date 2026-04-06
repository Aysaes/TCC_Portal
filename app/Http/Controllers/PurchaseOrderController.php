<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Notifications\POStatusUpdate;
use App\Notifications\PRStatusUpdate;

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
        // 1. Forgiving Validation (Removed strict array and mime checks that block FormData)
        $validated = $request->validate([
            'delivery_date' => 'nullable|date',
            'payment_terms' => 'nullable|string|max:255',
            'ship_to' => 'nullable|string|max:255',
            'discount_total' => 'nullable|numeric|min:0',
            'vat_rate' => 'nullable|numeric|min:0|max:100', 
            'status' => 'required|in:drafted,pending_approval,approved,cancelled',
            'removed_item_ids' => 'nullable', // Relaxed array rule
            'new_attachments' => 'nullable',  // Relaxed array rule
            'new_attachments.*' => 'file|max:10240',
            'items' => 'nullable|array',
            'items.*.id' => 'required_with:items',
            'items.*.notes' => 'nullable|string|max:255', // Max 10MB per file, any standard file type
        ]);

        // 2. Process Removed Items
        if ($request->filled('removed_item_ids')) {
            $removedIds = is_array($request->removed_item_ids) 
                ? $request->removed_item_ids 
                : explode(',', $request->removed_item_ids); // Fallback for FormData strings
                
            $purchaseOrder->items()->whereIn('id', $removedIds)->update(['status' => 'removed']);
        }

       if ($request->has('items')) {
            foreach ($request->items as $itemData) {
                PurchaseOrderItem::where('id', $itemData['id'])
                    ->where('purchase_order_id', $purchaseOrder->id)
                    ->update(['notes' => $itemData['notes'] ?? null]);
            }
        }

        // 3. Process New File Uploads (Bulletproof Loop)
        $attachments = $purchaseOrder->attachments ?? []; // Keep existing files
        
        if ($request->hasFile('new_attachments')) {
            $files = $request->file('new_attachments');
            
            // Force it to be an array just in case FormData sent a single file weirdly
            if (!is_array($files)) {
                $files = [$files];
            }

            foreach ($files as $file) {
                if ($file->isValid()) {
                    // Save the file securely to the public disk
                    $path = $file->store('po_attachments', 'public');
                    
                    // Add the new file to our array
                    $attachments[] = [
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'url' => Storage::url($path)
                    ];
                }
            }
        }

        // 4. Recalculate the Math based ONLY on active items
        $activeItems = $purchaseOrder->items()->where('status', 'active')->get();
        $grossAmount = $activeItems->sum('net_payable');
        
        $discount = $validated['discount_total'] ?? 0;
        $netOfDiscount = $grossAmount - $discount;
        $vatDecimal = ($validated['vat_rate'] ?? 12) / 100;
        $vatTotal = $netOfDiscount * $vatDecimal;
        $grandTotal = $netOfDiscount + $vatTotal;

        // 5. Save updates to the Database
        $purchaseOrder->update([
            'delivery_date' => $validated['delivery_date'],
            'payment_terms' => $validated['payment_terms'],
            'ship_to' => $validated['ship_to'],
            'gross_amount' => $grossAmount,
            'discount_total' => $discount,
            'net_of_discount' => $netOfDiscount,
            'vat_total' => $vatTotal,
            'grand_total' => $grandTotal,
            'status' => $validated['status'],
            'attachments' => empty($attachments) ? null : $attachments, // 🟢 Forces save!
        ]);

        $status = $validated['status'];
        $originalRequester = $purchaseOrder->purchaseRequest->user ?? null;

        if ($status === 'pending_approval') {
            $message = 'Purchase Order submitted to DCSO for approval.';
            
            // Ping the Directors / Admins
            $dcsoUsers = User::whereHas('role', function($q) {
                $q->where('name', 'like', '%director%')->orWhere('name', 'admin');
            })->get();
            
            if ($dcsoUsers->isNotEmpty()) {
                Notification::send($dcsoUsers, new POStatusUpdate($purchaseOrder, "Requires DCSO Approval"));
            }

        } elseif ($status === 'approved') {
            $message = 'Purchase Order has been officially Approved by DCSO!';
            
            // Ping Procurement so they know they can send it to the supplier
            $procurementUsers = User::whereHas('role', function($q) {
                $q->where('name', 'like', '%procurement%')->orWhere('name', 'admin');
            })->get();
            
            if ($procurementUsers->isNotEmpty()) {
                Notification::send($procurementUsers, new POStatusUpdate($purchaseOrder, "Officially Approved by DCSO!"));
            }

            // Ping the original employee who requested the items!
            if ($originalRequester) {
                $originalRequester->notify(new POStatusUpdate($purchaseOrder, "Great news! Your items have been officially ordered."));
            }

        } elseif ($status === 'cancelled') {
            $message = 'Purchase Order has been cancelled.';
            
            if ($originalRequester) {
                $originalRequester->notify(new POStatusUpdate($purchaseOrder, "Notice: The Purchase Order for your items was cancelled."));
            }
        } else {
            $message = 'Purchase Order draft updated successfully.';
        }

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

        $originalRequester = $purchaseRequest->user;
        if ($originalRequester) {
            $originalRequester->notify(new PRStatusUpdate($purchaseRequest, "Your request is currently being processed into Purchase Orders."));
        }

        return back()->with('success', 'Purchase Orders drafted successfully! You can now review them.');
    }

    public function print(PurchaseOrder $purchaseOrder)
    {
        // 1. Load relationships, but ONLY grab active items!
        $purchaseOrder->load([
            'supplier', 
            'preparedBy', 
            'items' => fn($query) => $query->where('status', 'active')
        ]);

        // 2. Return the PDF view
        // Note: If you use barryvdh/laravel-dompdf, you would do this instead:
        // $pdf = \PDF::loadView('prpo.pdf.purchase-order', ['po' => $purchaseOrder]);
        // return $pdf->stream($purchaseOrder->po_number . '.pdf');

        return view('prpo.pdf.purchase-order', ['po' => $purchaseOrder]);
    }
}
