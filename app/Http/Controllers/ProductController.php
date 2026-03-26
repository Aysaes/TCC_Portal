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
        // Ensure they actually sent an array of IDs
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'exists:products,id',
        ]);

        // Delete all products where the ID is in the provided array
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
        return back()->withErrors(['import_file' => 'Error importing file. Please check your template format.']);
    }
}

public function downloadTemplate()
    {
        return response()->streamDownload(function () {
            $file = fopen('php://output', 'w');
            
            // 1. The Headers (Must match exactly what the Import class expects)
            fputcsv($file, ['supplier_name', 'product_name', 'details', 'price']);
            
            // 2. An Example Row (To guide the admin)
            fputcsv($file, ['Example Supplier Inc.', 'Paracetamol 500mg', 'Box of 100 tablets', '150.50']);
            
            fclose($file);
        }, 'product_import_template.csv');
    }


// Add this method anywhere inside the class
public function export(Request $request)
{
    // Grab the active filter from the URL
    $supplierId = $request->input('supplier_id');
    $search = $request->input('search');
    
    // Generate a clean filename with a timestamp
    $fileName = 'products_export_' . date('Y-m-d_H-i-s') . '.xlsx';

    // Download the Excel file
    return Excel::download(new ProductsExport($supplierId, $search), $fileName);
}
}