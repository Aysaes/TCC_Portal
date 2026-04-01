<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:suppliers,name',
            'contact_person' => 'nullable|string|max:255', 
            'contact_number' => 'nullable|string|max:255', 
        ]);

        Supplier::create($validated);

        return back()->with('success', 'Supplier added successfully.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:suppliers,name,' . $supplier->id,
            'contact_person' => 'nullable|string|max:255', 
            'contact_number' => 'nullable|string|max:255', 
        ]);

        $supplier->update($validated);

        return back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier)
    {
        try {
            $supplier->delete();
            return back()->with('success', 'Supplier deleted successfully.');
        } catch (\Illuminate\Database\QueryException $e) {
            // Error code 23000 is a foreign key constraint violation
            if ($e->getCode() == 23000) {
                return back()->withErrors(['error' => 'Cannot delete supplier. There are still products assigned to it.']);
            }
            return back()->withErrors(['error' => 'An error occurred while deleting the supplier.']);
        }
    }
}