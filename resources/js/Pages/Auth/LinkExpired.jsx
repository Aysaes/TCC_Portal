import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function LinkExpired() {
    return (
        <GuestLayout>
            <Head title="Link Expired" />

            <div className="text-center p-4 sm:p-6">
                
                {/* Warning Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="h-16 w-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired or Invalid</h2>
                <p className="text-sm text-gray-600 mb-8">
                    The password reset or setup link you clicked is no longer valid. It may have already been used, or it has expired for your security.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 text-left">
                    <p className="text-sm text-gray-700">
                        <strong className="text-gray-900 block mb-1">What should I do?</strong>
                        Please contact your <span className="font-semibold text-indigo-600">IT Support</span> or <span className="font-semibold text-indigo-600">HR Department</span> to request a fresh activation link.
                    </p>
                </div>

                <Link
                    href={route('login')}
                    className="inline-flex w-full justify-center items-center py-2.5 px-4 bg-indigo-600 text-white rounded-md font-semibold text-sm hover:bg-indigo-500 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                >
                    Return to Login
                </Link>
            </div>
        </GuestLayout>
    );
}