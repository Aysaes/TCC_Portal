import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessage() {
    const { flash = {} } = usePage().props;

    console.log("Inertia Props:", usePage().props);

    const [toast, setToast] = useState({ message: '', type: '' });
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let currentMessage='';
        let currentType='';

        if (flash?.success) {
            currentMessage = flash.success;
            currentType = 'success';
        } else if (flash?.error) {
            currentMessage = flash.error;
            currentType = 'error';
        }
        
        if (currentMessage) {
            setToast({ message: currentMessage, type: currentType });
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
         }, [flash.success, flash.error]);

         return (
            <div
            className={`fixed bottom-10 right-10 z-50 transform transition-all duration-500 ease-in-out ${
                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
            }`}
        >
            {toast.message && (
                <div 
                    className={`flex items-center gap-3 rounded-lg px-6 py-4 shadow-xl ${
                        toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                >
                    {toast.type === 'success' ? (
                        <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    
                    <span className="text-sm font-semibold tracking-wide text-white">{toast.message}</span>
                </div>
            )}
        </div>
        );
}   
