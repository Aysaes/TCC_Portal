<?php

namespace App\Observers;

use App\Services\LoggerService;
use Illuminate\Database\Eloquent\Model;

class AuditObserver
{
    private function getModuleName(Model $model)
    {
        return match (get_class($model)) {
            // Admin & Employee
            \App\Models\User::class => 'Employee Management',
            \App\Models\Announcement::class => 'Announcements',
            \App\Models\CompanyContent::class => 'Company Content',
            \App\Models\OrgChartMember::class => 'Organizational Chart',

            // HR Module
            \App\Models\HrRequest::class => 'HR Module',
            \App\Models\ManpowerRequest::class => 'Manpower Request',

            // PR/PO Module
            \App\Models\Product::class => 'PR/PO Module',
            \App\Models\PurchaseRequest::class => 'PR/PO Module',
            \App\Models\PurchaseOrder::class => 'PR/PO Module',
            \App\Models\Supplier::class => 'PR/PO Module',

            // Duty Meal Module
            \App\Models\DutyMeal::class => 'Duty Meal Module', // Update with your actual model name
            
            default => 'System',
        };
    }

    public function created(Model $model): void
    {
        LoggerService::log($this->getModuleName($model), 'Create', "New record added in " . $this->getModuleName($model));
    }

    public function updated(Model $model): void
    {
        // Capture status changes specifically for HR/PRPO (e.g., Pending -> Released)
        $description = "Updated record in " . $this->getModuleName($model);
        
        if ($model->wasChanged('status')) {
            $description = "Status changed to: " . $model->status;
        }

        LoggerService::log($this->getModuleName($model), 'Update', $description, 'warning');
    }

    public function deleted(Model $model): void
    {
        LoggerService::log($this->getModuleName($model), 'Delete', "Deleted a record from " . $this->getModuleName($model), 'danger');
    }
}