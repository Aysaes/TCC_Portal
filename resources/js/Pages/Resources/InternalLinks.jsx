import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import ImageIcon from '@/Components/ImageIcon';

// Import your internal company logos here
import zkbiologo from '@/Assets/ZKBioZKlink.png';
import kreloseslogo from '@/Assets/kreloses.png';
import Hubspotlogo from '@/Assets/Hubspot.png';
import Tickittenlogo from '@/Assets/Tickitten.png';

export default function InternalLinks() {
    // 🟢 Sidebar Menu Links
    const generalSidebarLinks = [
        { href: route('dashboard'), label: 'Overview', active: route().current('dashboard') },
        { href: route('dashboard.announcements'), label: 'Announcements', active: route().current('dashboard.announcements') },
        { href: route('dashboard.mission-vision'), label: 'About Us', active: route().current('dashboard.mission-vision') },
        { href: route('dashboard.org-chart'), label: 'Organizational Directory', active: route().current('dashboard.org-chart') },
    ];

    const companyWebsites = [
        {
            name: 'HubSpot',
            url: 'https://app.hubspot.com/login?hubs_signup-url=www.hubspot.com%2F&hubs_signup-cta=nav-utility-login&hubs_content=www.hubspot.com%2F&hubs_content-cta=nav-utility-login&uuid=f02ed015-754b-4b78-8c00-c7d54af9f356&wfoid=2e49487a51.1776249667&_gl=1*1asbult*_gcl_aw*R0NMLjE3NzYyNDk2NjcuQ2p3S0NBanc3dnpPQmhCeEVpd0FjN1dOcjlnQWY3TVh2WGhURVBuRWxWNXFPNGRBdVdock12LUdlNWlDRmFjNTBBdk82alZsSEg0dkRob0NGWUlRQXZEX0J3RQ..*_gcl_au*MTI0MTI1NTQ1MS4xNzc2MjQ5NjY3*FPAU*MTI0MTI1NTQ1MS4xNzc2MjQ5NjY3*_ga*MTA0NzQ1MzAyNS4xNzc2MjQ5NjY3*_ga_LXTM6CQ0XK*czE3NzYyNDk2NjYkbzEkZzEkdDE3NzYyNTAxMzMkajYwJGwwJGgw',
            bg: 'bg-blue-50', 
            iconSrc: Hubspotlogo,
            description: 'Customer Relationship Management'
        },
        {
            name: 'Kreloses',
            url: 'https://www.kreloses.com/account/login',
            bg: 'bg-blue-50', 
            iconSrc: kreloseslogo,
            description: 'Clinic Management System'
        },
        {
            name: 'Tickitten',
            url: '',
            bg: 'bg-blue-50', 
            iconSrc: Tickittenlogo,
            description: 'Ticketing System for IT Support and Staff Service Requests'
        },
        {
            name: 'ZKBio ZKlink',
            url: 'https://zlink.minervaiot.com/login',
            bg: 'bg-blue-50', 
            iconSrc: zkbiologo,
            description: 'Timekeeping & Workforce Management'
        },
    ];

    const header = (
        <div>
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                Company Links
            </h2>
            <p className="text-sm text-gray-500 mt-1">Quick access to our internal systems and platforms.</p>
        </div>
    );

    return (
        <SidebarLayout 
            header={header} 
            activeModule="General" 
            sidebarLinks={generalSidebarLinks}
        >
            <Head title="Internal Links" />

            {/* Main Container: min-h-[65vh] ensures the page feels full even with only 2 links */}
            <div className="bg-gray-50/50 p-6 shadow-sm sm:rounded-2xl sm:p-12 min-h-[65vh] flex flex-col justify-center border border-gray-100">
                
                {/* Modern Grid centered with max-width */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto w-full">
                    {companyWebsites.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            // 🔵 Blue themed modern card with hover lift
                            className="group relative flex flex-col items-center text-center gap-6 p-10 bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 hover:border-blue-200 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                        >
                            {/* Subtle Blue Gradient Background on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            {/* Circular Icon Container */}
                            <div className={`relative z-10 flex-shrink-0 flex items-center justify-center w-28 h-28 rounded-full ${link.bg} group-hover:bg-white group-hover:shadow-md transition-all duration-500`}>
                                <ImageIcon 
                                    src={link.iconSrc} 
                                    alt={`${link.name} icon`} 
                                    className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-500" 
                                />
                            </div>
                            
                            {/* Text Container */}
                            <div className="relative z-10">
                                <span className="block text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                                    {link.name}
                                </span>
                                
                                {link.description && (
                                    <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-500">
                                        {link.description}
                                    </p>
                                )}

                                {/* Animated "Visit" button that slides up */}
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
            </div>
        </SidebarLayout>
    );
}