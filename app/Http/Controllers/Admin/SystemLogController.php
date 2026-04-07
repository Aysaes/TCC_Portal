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
        // 1. Start a database query, fetching the user relationship
        $query = SystemLog::with('user')->latest();

        // 2. Apply Search Filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQ) use ($search) {
                      $userQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // 3. Apply Module Filter
        if ($request->filled('module')) {
            $query->where('module', $request->input('module'));
        }

        // 4. Apply Action Filter (Fixed: Simple Exact Match!)
        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        // 5. Apply Status Filter
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // 6. Apply Date Range Filters
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        // 7. Paginate the results and keep the URL query string intact
        $logs = $query->paginate(10)->withQueryString();

        // 8. Send the filtered data back to your React component
        return Inertia::render('Admin/SystemLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'module', 'action', 'status', 'start_date', 'end_date'])
        ]);
    }
}