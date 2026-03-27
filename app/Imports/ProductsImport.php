<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Supplier;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // 1. Skip empty rows
        if (!isset($row['product_name']) || !isset($row['price'])) {
            return null;
        }

        // 2. Find the supplier by the name provided in the Excel file
        $supplier = Supplier::where('name', trim($row['supplier_name']))->first();

        // 3. If the supplier doesn't exist, skip this row 
        // (You can also throw an exception here if you want it to halt completely)
        if (!$supplier) {
            return null; 
        }

        // 4. Create the product
        return new Product([
            'supplier_id' => $supplier->id,
            'name'        => $row['product_name'],
            'details'     => $row['details'] ?? null,
            'price'       => $row['price'],
        ]);
    }
}