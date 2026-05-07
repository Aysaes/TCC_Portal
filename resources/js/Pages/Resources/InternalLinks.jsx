import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';

// --- NEW: Automated Logo Fetcher Component ---
const ResourceLogo = ({ url, title }) => {
    const [hasError, setHasError] = useState(false);

    // Automatically extract the domain
    const domain = useMemo(() => {
        try {
            return new URL(url).hostname;
        } catch (e) {
            return null;
        }
    }, [url]);

    // Fetch from Clearbit Logo API
    const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;

    // Blue-themed Fallback
    if (!logoUrl || hasError) {
        return (
            <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-28 h-28 rounded-full bg-blue-50 group-hover:bg-white group-hover:shadow-md transition-all duration-500">
                <span className="text-4xl font-extrabold text-blue-400 group-hover:text-blue-600 transition-colors duration-500 uppercase">
                    {title.charAt(0)}
                </span>
            </div>
        );
    }

    // Render automated image
    return (
        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-28 h-28 rounded-full bg-white shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-500 p-4">
            <img
                src={logoUrl}
                alt={`${title} logo`}
                onError={() => setHasError(true)} // Triggers fallback if image is missing
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            />
        </div>
    );
};

export default function InternalLinks({ links = [] }) {
    const generalSidebarLinks = [
        { href: route('dashboard'), label: 'Overview', active: route().current('dashboard') },
        { href: route('dashboard.announcements'), label: 'Announcements', active: route().current('dashboard.announcements') },
        { href: route('dashboard.mission-vision'), label: 'About Us', active: route().current('dashboard.mission-vision') },
        { href: route('dashboard.org-chart'), label: 'Organizational Directory', active: route().current('dashboard.org-chart') },
    ];

    const header = (
        <div>
            <h2 className="text-xl font-semibold leading-tight text-gray-800">Corporate Resources</h2>
            <p className="text-sm text-gray-500 mt-1">Essential links for internal operations and company systems.</p>
        </div>
    );

    return (
        <SidebarLayout header={header} activeModule="General" sidebarLinks={generalSidebarLinks}>
            <Head title="Internal Links" />

            <div className="bg-gray-50/50 p-6 shadow-sm sm:rounded-2xl sm:p-12 min-h-[65vh] flex flex-col items-center justify-center border border-gray-100">
                {links.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto w-full">
                        {links.map((link) => (
                            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="group relative flex flex-col items-center text-center gap-6 p-10 bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 hover:border-blue-200 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                {/* Call our new automated logo component here */}
                                <ResourceLogo url={link.url} title={link.title} />
                                
                                <div className="relative z-10">
                                    <span className="block text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                                        {link.title}
                                    </span>
                                    {link.description && (
                                        <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-500">{link.description}</p>
                                    )}
                                    <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                                        <span>Open System</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <p className="text-lg font-medium">No Internal Links Configured</p>
                        <p className="text-sm">Administrators can add links from the Admin Dashboard.</p>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}