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
                    Mission & Vision
                </h2>
            }
        >
            <Head title="Mission & Vision" />

            <div className="py-0 sm:py-12">
                <div className="mx-auto w-full max-w-[96rem] sm:px-2 lg:px-4 2xl:max-w-[112rem]">
                    
                    {/* 2. Replaced the single white box with a CSS Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* 3. Loop through the contents array from the database */}
                        {contents && contents.length > 0 ? (
                            contents.map((content) => (
                                <div key={content.id} className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-100">
                                    
                                    {/* Image display */}
                                    {content.image_path && (
                                        <img 
                                            src={`/storage/${content.image_path}`} 
                                            alt={content.title || "Company Content"} 
                                            className="w-full h-64 object-cover"
                                        />
                                    )}
                                    
                                    {/* Text display */}
                                    <div className="p-6">
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
                            // Fallback message if database is empty
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
