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
                // If "Authentication" is selected, group these actions together
                $query->where(function($q) {
                    $q->where('module', 'Authentication')
                      ->orWhere('module', 'Auth') // Captures older logs if they were named 'Auth'
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

        $logs = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/SystemLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'module', 'action', 'status', 'start_date', 'end_date']),
        ]);
    }
}