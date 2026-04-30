import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import ImageIcon from '@/Components/ImageIcon';

// Import your government portals logos here
import birlogo from '@/Assets/BIR.png';
import Avegalogo from '@/Assets/Avega.png';
import pagibiglogo from '@/Assets/Pag-Ibig.png';
import vplogo from '@/Assets/VP.png';
import philhealthlogo from '@/Assets/PH.png';
import ssslogo from '@/Assets/SSS.png';

export default function ExternalLinks() {
    // 🟢 This array restores the General Menu in the sidebar
    const generalSidebarLinks = [
        { href: route('dashboard'), label: 'Overview', active: route().current('dashboard') },
        { href: route('dashboard.announcements'), label: 'Announcements', active: route().current('dashboard.announcements') },
        { href: route('dashboard.mission-vision'), label: 'About Us', active: route().current('dashboard.mission-vision') },
        { href: route('dashboard.org-chart'), label: 'Organizational Directory', active: route().current('dashboard.org-chart') },
    ];

    const governmentPortals = [
        {
            name: 'BIR TIN Inquiry',
            url: 'https://revie.bir.gov.ph/tin-inquiry',
            bg: 'bg-red-50', 
            iconSrc: birlogo
        },
        {
            name: 'HMO AVEGA Request for LOA',
            url: 'https://avega.com.ph/ercsrequest/',
            bg: 'bg-red-50',
            iconSrc: Avegalogo
        },
        {       
            name: 'PhilHealth',
            url: 'https://www.philhealth.gov.ph/',
            bg: 'bg-red-50',
            iconSrc: philhealthlogo
        },
        {
            name: 'Social Security System (SSS)',
            url: 'https://www.sss.gov.ph/',
            bg: 'bg-red-50',
            iconSrc: ssslogo
        },
        {
            name: 'Virtual Pag-IBIG',
            url: 'https://www.pagibigfundservices.com/virtualpagibig/',
            bg: 'bg-red-50', 
            iconSrc: vplogo
        },
        {
            name: 'Pag-IBIG Salary Loan Form',
            url: 'https://www.pagibigfund.gov.ph/documents/SLF065_MultiPurposeLoanApplicationForm.pdf',
            bg: 'bg-red-50', 
            iconSrc: pagibiglogo
        },
        
        
    ];

    const header = (
        <div>
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                Employee Benefits & Services
            </h2>
            <p className="text-sm text-gray-500 mt-1">External links for your statutory, healthcare, and government portals.</p>
        </div>
    );

    return (
        <SidebarLayout 
            header={header} 
            activeModule="General" 
            sidebarLinks={generalSidebarLinks} 
        >
            <Head title="External Links" />

            {/* Added a minimum height and flex centering to handle dead space */}
            <div className="bg-gray-50/50 p-6 shadow-sm sm:rounded-2xl sm:p-12 min-h-[65vh] flex flex-col justify-center border border-gray-100">
                
                {/* Modern Grid:
                    - Uses gaps to separate items nicely.
                    - Centered vertically inside the larger container. 
                */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto w-full">
                    {governmentPortals.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            // Modern Card Styling with Smooth Hover Animations
                            className="group relative flex flex-col items-center text-center gap-6 p-8 bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-gray-100 hover:border-red-200 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                        >
                            {/* Subtle Background Gradient reveal on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            {/* Icon Container - Larger and Circular */}
                            <div className={`relative z-10 flex-shrink-0 flex items-center justify-center w-24 h-24 rounded-full ${link.bg} group-hover:bg-white group-hover:shadow-md transition-all duration-500`}>
                                <ImageIcon 
                                    src={link.iconSrc} 
                                    alt={`${link.name} icon`} 
                                    className="w-14 h-14 object-contain group-hover:scale-110 transition-transform duration-500" 
                                />
                            </div>
                            
                            {/* Text Container */}
                            <div className="relative z-10 flex-grow flex flex-col justify-center">
                                <span className="block text-lg font-bold text-gray-900 group-hover:text-red-700 transition-colors duration-300">
                                    {link.name}
                                </span>
                                
                                {/* Hidden text that slides up on hover to add moving visual interest */}
                                <span className="block text-sm font-medium text-red-500 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                                    Visit Portal &rarr;
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </SidebarLayout>
    );
}