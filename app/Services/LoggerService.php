<?php

namespace App\Services;

use App\Models\SystemLog;
use Illuminate\Support\Facades\Request;

class LoggerService
{
    public static function log($module, $action, $description, $status = 'success', $userId = null)
    {
        SystemLog::create([
            'user_id' => $userId ?? auth()->id(),
            'module' => $module,
            'action' => $action,
            'description' => $description,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'status' => $status,
        ]);
    }
}