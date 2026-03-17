import { getDashboardLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';

import { Head } from '@inertiajs/react';
export default function Home() {
    const dashboardLinks = getDashboardLinks();

    return (
        <SidebarLayout
                    activeModule="General"
                    sidebarLinks={dashboardLinks}
                    header={
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Mission & Vision
                        </h2>
                    }
                >
                    <Head title="Mission & Vision" />
        
                    <div className="py-12">
                        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6 text-gray-900">
                                    Mission & Vision
                                </div>
                            </div>
                        </div>
                    </div>
                </SidebarLayout>
    );
}