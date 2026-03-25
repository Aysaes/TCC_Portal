import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import fpPromise from '@fingerprintjs/fingerprintjs';
import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';


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
                    
                    
              <div>
                 
            <form onSubmit={submit} className="font-sans"> 
                <div className="text-center mb-6">
                    <h1 className="font-sans text-3xl font-bold text-black drop-shadow-lg shadow-lg">The Cat Clinic Purrtal</h1>
                    <Link href="/" className="inline-block">
                        <ApplicationLogo className="h-40 w-30 fill-current text-gray-100" />
                    </Link>
                </div>
                
                <div>
                    <InputLabel htmlFor="email" value="Email" className="font-semibold text-gray-900" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        placeholder="email"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" className="font-semibold text-gray-900" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        placeholder="password"
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
                        <span className="ms-2 text-sm font-bold text-black drop-shadow-sm">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-center mb-8">

                    <PrimaryButton disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
            </div>  
        </GuestLayout>
    );
}
