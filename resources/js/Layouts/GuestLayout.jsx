import ApplicationLogo from '@/Components/ApplicationLogo';
import BackgroundCarousel from '@/Components/BackgroundCarousel';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center bg-white pt-6 sm:justify-center sm:pt-0">
            <BackgroundCarousel />
            <div className="absolute inset-0 bg-black/30"></div>
          

            <div className="relative mt-6 w-full overflow-hidden bg-[#f8f7e2] opacity-90 px-6 py-4 shadow-2xl sm:max-w-md sm:rounded-2xl">
                {children}
            </div>
        </div>
    );
}
