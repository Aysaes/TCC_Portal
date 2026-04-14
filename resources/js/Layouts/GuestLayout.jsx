import BackgroundCarousel from '@/Components/BackgroundCarousel';

export default function GuestLayout({ children }) {
    return (
        
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-white px-4 py-8 sm:px-0 sm:py-0">
            <BackgroundCarousel />
            <div className="absolute inset-0 bg-black/30"></div>

            <div className="relative w-full px-6 py-4 sm:mt-6 sm:max-w-md sm:overflow-hidden sm:rounded-[32px] sm:border sm:border-white/65 sm:bg-white/55 sm:shadow-[0_18px_45px_rgba(15,23,42,0.30),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-10px_24px_rgba(255,255,255,0.18)] sm:backdrop-blur-md">
                {children}
            </div>
        </div>
    );
}
