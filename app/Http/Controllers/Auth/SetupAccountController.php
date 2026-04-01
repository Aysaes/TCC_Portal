<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
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
                $user->save();
                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('success', 'Password set successfully! You may now log in.');
        }

        return back()->withErrors(['email' => __($status)]);
    }
}