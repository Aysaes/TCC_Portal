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

                <div className="mt-4 block">
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
                </div>

                <div className="mt-4 flex items-center justify-center mb-8">

                    <PrimaryButton className="shadow-[0_10px_26px_rgba(15,23,42,0.35)]" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
            </div>  
        </GuestLayout>
    );
}
