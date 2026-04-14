
import ImageIcon from '@/Components/ImageIcon';

import pagibiglogo from '@/Assets/Pag-Ibig.png';
import philhealthlogo from '@/Assets/PH.png';
import ssslogo from '@/Assets/SSS.png';
import zkbiologo from '@/Assets/ZKBioZKlink.png';
export default function CompanyLinks({ className = '' }) {

    const companyWebsites = [
        {
            name: 'ZKBio ZKlink',
            url: 'https://zlink.minervaiot.com/login',
            bg: 'bg-green-50',
            iconSrc: zkbiologo
        },

    ];

    const governmentPortals = [
        {
            name: 'Pag-IBIG Fund',
            url: 'https://www.pagibigfund.gov.ph/',
            bg: 'bg-blue-50',
            iconSrc: pagibiglogo
        },
        {
            name: 'Social Security System (SSS)',
            url: 'https://www.sss.gov.ph/',
            bg: 'bg-gray-50',
            iconSrc: ssslogo
        },
        {
            name: 'PhilHealth',
            url: 'https://www.philhealth.gov.ph/',
            bg: 'bg-yellow-50',
            iconSrc: philhealthlogo
        },
    ];

    const LinkGrid = ({ links }) => (
       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link, index) => (
                <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-indigo-300 transition-colors group"
                >
                    {/* Icon Container - Larger and more prominent */}
               <div className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-lg ${link.bg} group-hover:scale-105 transition-transform overflow-hidden`}>
    <ImageIcon 
        src={link.iconSrc} 
        alt={`${link.name} icon`} 
        
        className="w-full h-full object-contain p-1" 
    />
</div>
                    
                    {/* Text Container */}
                    <div className="flex-grow">
                        <span className="block text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {link.name}
                        </span>
                        
                    </div>
                </a>
            ))}
        </div>
    );
    

    return (
       <section className={`bg-white p-4 shadow sm:rounded-lg sm:p-8 ${className}`}>
            
            {/* Main Section Header */}
            <header className="mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">External Portals & Links</h2>
                <p className="mt-1 text-sm text-gray-600">Quick access to company tools and government mandates.</p>
            </header>

            {/* Company Tools Group */}
            {companyWebsites.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Company Links
                    </h3>
                    <LinkGrid links={companyWebsites} />
                </div>
            )}

            {governmentPortals.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Government Portals
                    </h3>
                    <LinkGrid links={governmentPortals} />
                    
                   
                    {governmentPortals.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No government portals added yet.</p>
                    )}
                </div>
            )}
            
        </section>
    );
}
