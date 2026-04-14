<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Notification;
use Illuminate\Auth\Events\PasswordReset;
use App\Notifications\PasswordResetSuccess;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class SetupAccountController extends Controller
{
    public function showSetupForm(Request $request)
    {
        $email = $request->email;
        $token = $request->token;

        $user = User::where('email', $email)->first();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Invalid request. Please contact IT support for assistance.');
        }

        $tokenRecord = DB::table('password_reset_tokens')
        ->where('email', $user->email)
        ->first();

        $isValid = $tokenRecord && 
               Hash::check($token, $tokenRecord->token) &&
               Carbon::parse($tokenRecord->created_at)->addMinutes(config('auth.passwords.users.expire', 60))->isFuture();

        if (!$isValid) {
            return redirect()->route('link.expired')->with('error', 'This setup link is invalid or has expired. Please contact IT support for assistance.');
        }

        return Inertia::render('Auth/SetupAccount', [
            'email' => $email,
            'token' => $token,
        ]);
    }

    public function setupPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                
                // 🟢 Safety catch: Guarantee the red badge is cleared
                $user->status = 'Active'; 
                $user->save();
                
                event(new PasswordReset($user));

                // 🟢 NEW: Notify the Admin team
                $admins = User::whereHas('role', function ($q) {
                    $q->where('name', 'Admin');
                })->get();

                if ($admins->isNotEmpty()) {
                    Notification::send($admins, new PasswordResetSuccess($user));
                }
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('success', 'Password set successfully! You may now log in.');
        }   

        return back()->withErrors(['email' => __($status)]);
    }
}