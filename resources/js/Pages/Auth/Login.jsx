import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import fpPromise from '@fingerprintjs/fingerprintjs';
import { Head, useForm } from '@inertiajs/react';


export default function Login({ status}) {
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

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

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

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
