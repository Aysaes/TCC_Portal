import ApplicationLogo from '@/Components/ApplicationLogo';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import fpPromise from '@fingerprintjs/fingerprintjs';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';


export default function Login({ status}) {

    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    const submitForgotPassword = (e) => {
        e.preventDefault();
        router.post(route('password.request.admin'), { email: resetEmail }, {
            onSuccess: () => {
                setShowForgotPassword(false);
                setResetEmail('');
            }
        });
    };

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        email: '',
        password: '',
        remember: false,
        device_id: '',
    });

    const submit = async (e) => {
        e.preventDefault();

        try {

            let currenntDeviceId = localStorage.getItem('device_id');

        if(!currenntDeviceId){
            const fp = await fpPromise.load();
        const result = await fp.get();
        currenntDeviceId = result.visitorId;

        localStorage.setItem('device_id', currenntDeviceId);
        }

        

        console.log("🚀 Sending this data to Laravel:", data);

        transform((currentData) => ({
            ...currentData,
            device_id: currenntDeviceId,
        }));

        post(route('login'), {
            onFinish: () => reset('password'),
        });
        } catch (error) {
            console.error('Fingerprint Failed', error);
            alert('Device verification failed. Please check your browser settings.');
        }
        
        
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
                    
                    
              <div>
            {showForgotPassword ? (
                    <form onSubmit={submitForgotPassword} className="font-sans">
                        <div className="mb-0 text-center">
                            <h1 className="whitespace-nowrap font-sans text-[2rem] font-bold text-white [text-shadow:0_4px_16px_rgba(0,0,0,0.72),0_2px_8px_rgba(0,0,0,0.48)] sm:text-black sm:[text-shadow:0_4px_14px_rgba(255,255,255,0.95),0_2px_6px_rgba(0,0,0,0.45)]">The Cat Clinic Purrtal</h1>
                            <Link href="/" className="inline-block">
                                <ApplicationLogo className="h-40 w-30 fill-current text-gray-100" />
                            </Link>
                        </div>
                        
                        <div className="mb-4 text-sm text-white sm:text-gray-600 text-center px-4">
                            Enter your email address and we will notify the Admin to reset your password.
                        </div>

                        <div className="-mt-2">
                            <InputLabel htmlFor="reset_email" value="Email" className="font-semibold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.7)] sm:text-gray-900 sm:[text-shadow:0_2px_8px_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.35)]" />
                            <TextInput
                                id="reset_email"
                                type="email"
                                name="email"
                                value={resetEmail}
                                className="mt-1 block w-full border-transparent bg-black/28 text-black placeholder:text-black/70 shadow-[0_8px_24px_rgba(15,23,42,0.18)] sm:border-gray-300 sm:bg-white/95 sm:text-gray-900 sm:placeholder:text-gray-500"
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                                isFocused={true}
                            />
                        </div>

                        <div className="mt-6 flex items-center justify-between mb-8 px-2">
                            <button 
                                type="button" 
                                onClick={() => setShowForgotPassword(false)}
                                className="text-sm font-bold text-white hover:text-gray-300 underline sm:text-gray-600 sm:hover:text-gray-900"
                            >
                                Back to Login
                            </button>
                            <PrimaryButton className="shadow-[0_10px_26px_rgba(15,23,42,0.35)]">
                                Notify Admin
                            </PrimaryButton>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={submit} className="font-sans"> 
                        <div className="mb-0 text-center">
                            <h1 className="whitespace-nowrap font-sans text-[2rem] font-bold text-white [text-shadow:0_4px_16px_rgba(0,0,0,0.72),0_2px_8px_rgba(0,0,0,0.48)] sm:text-black sm:[text-shadow:0_4px_14px_rgba(255,255,255,0.95),0_2px_6px_rgba(0,0,0,0.45)]">The Cat Clinic Purrtal</h1>
                            <Link href="/" className="inline-block">
                                <ApplicationLogo className="h-40 w-30 fill-current text-gray-100" />
                            </Link>
                        </div>
                        
                        <div className="-mt-5">
                            <InputLabel htmlFor="email" value="Email" className="font-semibold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.7)] sm:text-gray-900 sm:[text-shadow:0_2px_8px_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.35)]" />

                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full border-transparent bg-black/28 text-black placeholder:text-black/70 shadow-[0_8px_24px_rgba(15,23,42,0.18)] sm:border-gray-300 sm:bg-white/95 sm:text-gray-900 sm:placeholder:text-gray-500"
                                placeholder="email"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Password" className="font-semibold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.7)] sm:text-gray-900 sm:[text-shadow:0_2px_8px_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.35)]" />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full border-transparent bg-black/28 text-black placeholder:text-black/70 shadow-[0_8px_24px_rgba(15,23,42,0.18)] sm:border-gray-300 sm:bg-white/95 sm:text-gray-900 sm:placeholder:text-gray-500"
                                placeholder="password"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                />
                                <span className="ms-2 text-sm font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.7)] sm:text-black sm:[text-shadow:0_2px_8px_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.35)]">
                                    Remember me
                                </span>
                            </label>

                            {/* 🟢 NEW: Forgot Password Trigger */}
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm font-bold text-white hover:text-gray-300 underline sm:text-gray-600 sm:hover:text-gray-900"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <div className="mt-6 flex items-center justify-center mb-8">
                            <PrimaryButton className="shadow-[0_10px_26px_rgba(15,23,42,0.35)] w-full justify-center py-3" disabled={processing}>
                                Log in
                            </PrimaryButton>
                        </div>
                    </form>
                )}
            </div>  
        </GuestLayout>
    );
}
