<?php

namespace App\Exports;

use App\Models\Department;
use App\Models\Position;
use App\Models\Branch;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;

class UsersTemplateExport implements WithHeadings, WithEvents
{
    public function headings(): array
    {
        return ['Name', 'Email', 'Department', 'Position', 'Branch'];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                // 1. Fetch the data for the dropdowns
                $departments = Department::pluck('name')->implode(',');
                $positions = Position::pluck('name')->implode(',');
                $branches = Branch::pluck('name')->implode(',');

                $sheet = $event->sheet->getDelegate();

                // 2. Apply dropdowns to Rows 2 through 500
                for ($row = 2; $row <= 500; $row++) {
                    
                    // Column C: Department
                    $validation = $sheet->getCell("C{$row}")->getDataValidation();
                    $validation->setType(DataValidation::TYPE_LIST)
                               ->setErrorStyle(DataValidation::STYLE_INFORMATION)
                               ->setAllowBlank(true)
                               ->setShowDropDown(true)
                               ->setFormula1('"' . $departments . '"');

                    // Column D: Position
                    $validation = $sheet->getCell("D{$row}")->getDataValidation();
                    $validation->setType(DataValidation::TYPE_LIST)
                               ->setAllowBlank(true)
                               ->setShowDropDown(true)
                               ->setFormula1('"' . $positions . '"');

                    // Column E: Branch (Note: Since they can have multiple branches, 
                    // a single Excel dropdown only allows selecting ONE. If they need multiple, 
                    // they will have to type them separated by commas, e.g., "Makati, Alabang")
                    // We will add the dropdown anyway to help with exact spelling.
                    $validation = $sheet->getCell("E{$row}")->getDataValidation();
                    $validation->setType(DataValidation::TYPE_LIST)
                               ->setAllowBlank(true)
                               ->setShowDropDown(true)
                               ->setFormula1('"' . $branches . '"');
                }
            },
        ];
    }
}