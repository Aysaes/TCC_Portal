import { Head, useForm } from '@inertiajs/react';

export default function SetupAccount({ email, token }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('setup.account.store'));
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <Head title="Setup Account" />

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Set Your Password</h2>
                
                <form onSubmit={submit}>
                    {/* Hidden inputs to pass data safely */}
                    <input type="hidden" value={data.token} />
                    <input type="hidden" value={data.email} />

                    <div className="mb-4">
                        <label className="block font-medium text-sm text-gray-700">Email Address</label>
                        <input type="email" value={data.email} disabled className="mt-1 block w-full border-gray-300 bg-gray-50 rounded-md shadow-sm" />
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-sm text-gray-700">New Password</label>
                        <input 
                            type="password" 
                            value={data.password} 
                            onChange={e => setData('password', e.target.value)} 
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                            required 
                        />
                        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div className="mb-6">
                        <label className="block font-medium text-sm text-gray-700">Confirm Password</label>
                        <input 
                            type="password" 
                            value={data.password_confirmation} 
                            onChange={e => setData('password_confirmation', e.target.value)} 
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                            required 
                        />
                    </div>

                    <button disabled={processing} className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition">
                        {processing ? 'Saving...' : 'Save Password & Activate'}
                    </button>
                </form>
            </div>
        </div>
    );
}