<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckDutyMealAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        $rawRoleName = $request->user()?->role?->name ?? '';   
        $userRole = strtolower($rawRoleName);

        $allowedRoles = ['admin', 'duty meal custodian'];

        if (!in_array($userRole, $allowedRoles)) {
        abort(403, 'You do not have permission to access the Duty Meal module.');
        }

        return $next($request);
    }
}
