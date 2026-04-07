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

export default function Login({ status }) {

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

            if (!currenntDeviceId) {
                const fp = await fpPromise.load();
                const result = await fp.get();
                currenntDeviceId = result.visitorId;

                localStorage.setItem('device_id', currenntDeviceId);
            }

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
                            <h1 className="whitespace-nowrap font-sans text-[2rem] font-bold text-white sm:text-black">
                                The Cat Clinic Purrtal
                            </h1>
                            <Link href="/" className="inline-block">
                                <ApplicationLogo className="h-40 w-30 fill-current text-gray-100" />
                            </Link>
                        </div>

                        <div className="mb-4 text-sm text-white sm:text-gray-600 text-center px-4">
                            Enter your email address and we will notify the Admin to reset your password.
                        </div>

                        <div className="-mt-2">
                            <InputLabel htmlFor="reset_email" value="Email"
                                className="font-semibold text-white sm:text-gray-900" />

                            <TextInput
                                id="reset_email"
                                type="email"
                                name="email"
                                value={resetEmail}
                                className="mt-1 block w-full"
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                                isFocused
                            />
                        </div>

                        <div className="mt-6 flex items-center justify-between mb-8 px-2">
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(false)}
                                className="text-sm font-bold text-white underline sm:text-gray-600"
                            >
                                Back to Login
                            </button>

                            <PrimaryButton>
                                Notify Admin
                            </PrimaryButton>
                        </div>

                    </form>
                ) : (
                    <form onSubmit={submit} className="font-sans">

                        <div className="mb-0 text-center">
                            <h1 className="whitespace-nowrap font-sans text-[2rem] font-bold text-white sm:text-black">
                                The Cat Clinic Purrtal
                            </h1>
                            <Link href="/" className="inline-block">
                                <ApplicationLogo className="h-40 w-30 fill-current text-gray-100" />
                            </Link>
                        </div>

                        <div className="-mt-5">
                            <InputLabel htmlFor="email" value="Email"
                                className="font-semibold text-white sm:text-gray-900" />

                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                isFocused
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* ✅ PASSWORD FIELD (no duplicate eye icon) */}
                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Password"
                                className="font-semibold text-white sm:text-gray-900" />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
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
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="ms-2 text-sm font-bold text-white sm:text-black">
                                    Remember me
                                </span>
                            </label>

                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm font-bold text-white underline sm:text-gray-600"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <div className="mt-6 flex items-center justify-center mb-8">
                            <PrimaryButton
                                className="w-full justify-center py-3"
                                disabled={processing}
                            >
                                Log in
                            </PrimaryButton>
                        </div>

                    </form>
                )}
            </div>
        </GuestLayout>
    );
}