<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemLogController extends Controller
{
    public function index(Request $request)
    {
        $query = SystemLog::with('user')->latest();

        $this->applyFilters($query, $request);

        $logs = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/SystemLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'module', 'action', 'status', 'start_date', 'end_date']),
        ]);
    }

    public function export(Request $request)
    {
        $query = SystemLog::with('user')->latest();

        // Apply the exact same filters as the index method
        $this->applyFilters($query, $request);

        $logs = $query->get(); // Get all filtered logs instead of paginating

        $fileName = 'system_logs_' . date('Y-m-d_H-i-s') . '.csv';

        // Prepare the CSV headers
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        // Prepare the Columns
        $columns = ['Timestamp', 'User', 'Module', 'Action', 'Description', 'IP Address', 'Status'];

        $callback = function() use($logs, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns); // Write column headers

            foreach ($logs as $log) {
                // Format data for the CSV row
                fputcsv($file, [
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->user ? $log->user->name : 'System',
                    $log->module,
                    $log->action,
                    $log->description,
                    $log->ip_address,
                    $log->status
                ]);
            }

            fclose($file);
        };

        // Stream the download response back to the browser
        return response()->stream($callback, 200, $headers);
    }

    /**
     * Reusable method to apply query filters for both Index and Export
     */
    private function applyFilters($query, Request $request)
    {
        // 1. Search Filter
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhere('ip_address', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function($userQuery) use ($request) {
                      $userQuery->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        // 2. Module Filter (with custom Authentication logic)
        if ($request->filled('module')) {
            if ($request->module === 'Authentication') {
                $query->where(function($q) {
                    $q->where('module', 'Authentication')
                      ->orWhere('module', 'Auth') 
                      ->orWhereIn('action', ['Login', 'Failed Login', 'Logout']);
                });
            } else {
                $query->where('module', $request->module);
            }
        }

        // 3. Action Filter
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        // 4. Status Filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // 5. Date Range Filters
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
    }
}