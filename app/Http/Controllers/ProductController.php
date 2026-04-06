<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Imports\ProductsImport;
use App\Exports\ProductsExport;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{

    public function index()
    {
        // 1. Fetch products with their linked suppliers
        $products = Product::with('supplier')->latest()->get();
        
        // 2. Fetch all suppliers for the filter dropdown and manage modal
        $suppliers = Supplier::orderBy('name')->get();

        // 3. Render the React component and pass the data as props
        // Note: Make sure the path matches where you saved ProductsIndex.jsx 
        // (e.g., 'PRPO/ProductsIndex')
        return Inertia::render('PRPO/ProductsIndex', [
            'products' => $products,
            'suppliers' => $suppliers,
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'name' => 'required|string|max:255',
            'details' => 'nullable|string',
            'unit' => 'nullable|string|max:50',
            'price' => 'required|numeric|min:0',
        ]);

        Product::create($validated);

        return back()->with('success', 'Product added successfully.');
    }

public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'name' => 'required|string|max:255',
            'unit' => 'nullable|string|max:50', // 🟢 NEW: Added unit validation
            'details' => 'nullable|string',
            'price' => 'required|numeric|min:0',
        ]);

        $product->update($validated);

        return back()->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return back()->with('success', 'Product deleted successfully.');
    }

    public function batchDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'exists:products,id',
        ]);

        Product::whereIn('id', $request->ids)->delete();

        return back()->with('success', count($request->ids) . ' products deleted successfully.');
    }

    public function import(Request $request)
    {
        $request->validate([
            'import_file' => 'required|mimes:xlsx,csv,xls|max:10240', // Max 10MB
        ]);

        try {
            Excel::import(new ProductsImport, $request->file('import_file'));
            return back()->with('success', 'Products imported successfully!');
        } catch (\Exception $e) {
            // 🟢 FIXED: Changed to with('error', ...) to trigger your custom red toast
            return back()->with('error', 'Error importing file. Please check your template format.');
        }
    }

    public function downloadTemplate()
    {
        return response()->streamDownload(function () {
            $file = fopen('php://output', 'w');
            
            // 🟢 FIXED: Added 'unit' to the headers
            fputcsv($file, ['supplier_name', 'product_name', 'unit', 'details', 'price']);
            
            // 🟢 FIXED: Added 'BOX' as the example unit
            fputcsv($file, ['Example Supplier Inc.', 'Paracetamol 500mg', 'BOX', 'Box of 100 tablets', '150.50']);
            
            fclose($file);
        }, 'product_import_template.csv');
    }

    public function export(Request $request)
    {
        $supplierId = $request->input('supplier_id');
        $search = $request->input('search');
        
        $fileName = 'products_export_' . date('Y-m-d_H-i-s') . '.xlsx';

        return Excel::download(new ProductsExport($supplierId, $search), $fileName);
    }

    public function toggleStatus(Product $product)
    {
        try {
            if ($product->status === 'Disabled') {
                $product->update(['status' => null]);
                $message = "Product '{$product->name}' has been re-enabled.";
            } else {
                $product->update(['status' => 'Disabled']);
                $message = "Product '{$product->name}' has been disabled.";
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update product status: ' . $e->getMessage());
        }
    }
}