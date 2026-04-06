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
use Inertia\Inertia;

class SetupAccountController extends Controller
{
    public function showSetupForm(Request $request)
    {
        return Inertia::render('Auth/SetupAccount', [
            'email' => $request->email,
            'token' => $request->token,
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
                $user->status = null; 
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