<?php

namespace App\Exports;

use App\Models\DutyMealParticipant;
use App\Models\DutyMeal;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Carbon\Carbon;

class DutyMealExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $dutyMealIds;
    protected $includesMakati = false;

    public function __construct($dutyMealIds)
    {
        $this->dutyMealIds = is_array($dutyMealIds) ? $dutyMealIds : [$dutyMealIds];
        
        $this->includesMakati = DutyMeal::whereIn('id', $this->dutyMealIds)
            ->whereHas('branch', function($q) {
                $q->where('name', 'like', '%Makati%');
            })->exists();
    }

    public function collection()
    {
        return DutyMealParticipant::with(['user', 'dutyMeal.branch'])
            ->whereIn('duty_meal_id', $this->dutyMealIds)
            ->get()
            ->sortBy(function($participant) {
                return $participant->dutyMeal->duty_date ?? '';
            });
    }

    public function headings(): array
    {
        $headings = [
            'Duty Date',
            'User',
            'Branch',
            'Shift',
            'Menu',
            'Note'
        ];

        // Site successfully placed as the 7th column
        if ($this->includesMakati) {
            $headings[] = 'Site';
        }

        return $headings;
    }

    public function map($participant): array
    {
        $menu = 'Pending';
        if ($participant->choice === 'main') $menu = 'Main';
        elseif ($participant->choice === 'alt') $menu = 'Alt';

        $shift = 'Unassigned';
        if ($participant->shift_type === 'day') $shift = 'Day Shift';
        elseif ($participant->shift_type === 'graveyard') $shift = 'Graveyard';
        elseif ($participant->shift_type === 'straight') $shift = 'Straight';

        $dutyDateObj = $participant->dutyMeal ? Carbon::parse($participant->dutyMeal->duty_date) : null;
        $specificDate = $dutyDateObj ? $dutyDateObj->format('D, M j, Y') : 'N/A';

        $row = [
            $specificDate,
            $participant->user ? $participant->user->name : 'N/A',
            $participant->dutyMeal && $participant->dutyMeal->branch ? $participant->dutyMeal->branch->name : 'N/A',
            $shift,
            $menu,
            $participant->custom_request ?? ''
        ];

        if ($this->includesMakati) {
            $isThisMakati = stripos($participant->dutyMeal->branch->name ?? '', 'Makati') !== false;
            $row[] = $isThisMakati ? ($participant->site ?? 'Unassigned') : 'N/A';
        }

        return $row;
    }
}