<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Carbon;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // If the user is logged in, load their role and position names from the database!
        if ($user) {
            $user->load(['role', 'position', 'department']);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    
                    // Now we send the FULL role, position, and department objects to React!
                    'role' => $user->role, 
                    'position' => $user->position,
                    'department' => $user->department,
                    
                    'is_rotating' => $user->is_rotating,
                    
                    // 🟢 PROTECT OUR PREVIOUS WORK: Ensure the global access helper makes it to React!
                    'has_global_access' => $user->has_global_access, 
                ] : null,
                
                // 🟢 NEW: Here is the bridge for your notifications!
                'notifications' => $user ? $user->unreadNotifications()->take(5)->get() : [],
                'unreadNotificationsCount' => $user ? $user->unreadNotifications()->count() : 0,
            ],

            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            'system' => [
                'serverDate' => fn() => \Carbon\Carbon::now()->toDateString(),
                'serverNow' => fn() => \Carbon\Carbon::now()->toIso8601String(),
                'timezone' => config('app.timezone'),
            ],
        ];
    }
}
