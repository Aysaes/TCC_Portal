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
            'address' => 'nullable|string|max:255',
            'tin' => 'nullable|string|max:255',
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
            'address' => 'nullable|string|max:255',
            'tin' => 'nullable|string|max:255',
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

    public function toggleStatus(Supplier $supplier)
    {
        try {
            if ($supplier->status === 'Disabled') {
                $supplier->update(['status' => null]);
                
                // 🟢 CASCADE: Re-enable all products handled by this supplier
                $supplier->products()->update(['status' => null]);
                
                $message = "Supplier '{$supplier->name}' and all their products have been re-enabled.";
            } else {
                $supplier->update(['status' => 'Disabled']);
                
                // 🟢 CASCADE: Disable all products handled by this supplier
                $supplier->products()->update(['status' => 'Disabled']);
                
                $message = "Supplier '{$supplier->name}' and all their products have been disabled.";
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update supplier status: ' . $e->getMessage());
        }
    }
}