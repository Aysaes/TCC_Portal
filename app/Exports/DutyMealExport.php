<?php

namespace App\Exports;

use App\Models\DutyMealParticipant;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Carbon\Carbon;

class DutyMealExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $dutyMealIds;

    public function __construct($dutyMealIds)
    {
        // Accept an array of IDs from the frontend
        $this->dutyMealIds = is_array($dutyMealIds) ? $dutyMealIds : [$dutyMealIds];
    }

    public function collection()
    {
        return DutyMealParticipant::with(['user', 'dutyMeal.branch'])
            ->whereIn('duty_meal_id', $this->dutyMealIds)
            ->get()
            ->sortBy(function($participant) {
                // Sort the exported list chronologically by date
                return $participant->dutyMeal->duty_date ?? '';
            });
    }

    public function headings(): array
    {
        return [
            'Duty Date',
            'User',
            'Branch',
            'Shift',
            'Menu',
            'Note'
        ];
    }

    public function map($participant): array
    {
        // Handle Menu Choice string
        $menu = 'Pending';
        if ($participant->choice === 'main') {
            $menu = 'Main';
        } elseif ($participant->choice === 'alt') {
            $menu = 'Alt';
        }

        // Handle Shift string for cleaner Excel formatting
        $shift = 'Unassigned';
        if ($participant->shift_type === 'day') {
            $shift = 'Day Shift';
        } elseif ($participant->shift_type === 'graveyard') {
            $shift = 'Graveyard';
        } elseif ($participant->shift_type === 'straight') {
            $shift = 'Straight';
        }

        // Format the dates using Laravel's Carbon tool
        $dutyDateObj = $participant->dutyMeal ? Carbon::parse($participant->dutyMeal->duty_date) : null;
            
        // Shows the exact day (e.g., "Mon, Apr 13, 2026")
        $specificDate = $dutyDateObj 
            ? $dutyDateObj->format('D, M j, Y') 
            : 'N/A';

        return [
            $specificDate,
            $participant->user ? $participant->user->name : 'N/A',
            $participant->dutyMeal && $participant->dutyMeal->branch ? $participant->dutyMeal->branch->name : 'N/A',
            $shift,
            $menu,
            $participant->custom_request ?? ''
        ];
    }
}