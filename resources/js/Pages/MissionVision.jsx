import { getDashboardLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';

// 1. Add { contents } here to receive the data from web.php
export default function Home({ contents }) {
    const dashboardLinks = getDashboardLinks();

    return (
        <SidebarLayout
            activeModule="General"
            sidebarLinks={dashboardLinks}
            headerClassName="mx-auto mb-1 w-full max-w-[96rem] sm:mb-6 2xl:max-w-[112rem]"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    About Us
                </h2>
            }
        >
            <Head title="About Us" />

            <div className="py-0 sm:py-12">
                <div className="mx-auto w-full max-w-[96rem] sm:px-2 lg:px-4 2xl:max-w-[112rem]">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {contents && contents.length > 0 ? (
                            contents.map((content) => (
                                <div key={content.id} className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-100 flex flex-col">
                                    
                                    {/* ✅ FIXED: Image container now uses the 16:9 zooming frame */}
                                    {content.image_path && (
                                        <div className="relative aspect-[16/9] w-full shrink-0 bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden">
                                            <img 
                                                src={`/storage/${content.image_path}`} 
                                                alt={content.title || "Company Content"} 
                                                className="absolute left-1/2 top-1/2"
                                                style={{
                                                    transform: `translate(calc(-50% + ${content.image_offset_x ?? 0}px), calc(-50% + ${content.image_offset_y ?? 0}px)) scale(${content.image_zoom ?? 1})`,
                                                    transformOrigin: 'center center',
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="p-6 flex-1">
                                        <span className="block mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                                            {content.type}
                                        </span>
                                        <h3 className="mb-3 text-xl font-bold text-gray-900">{content.title}</h3>
                                        <p className="text-base leading-relaxed text-gray-600 whitespace-pre-wrap">
                                            {content.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 p-6 text-center text-gray-500 bg-white shadow-sm sm:rounded-lg">
                                No Mission or Vision content has been added yet.
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}