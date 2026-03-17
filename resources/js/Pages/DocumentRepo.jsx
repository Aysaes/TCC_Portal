import { getDocumentRepoLinks } from "@/Config/navigation";
import SidebarLayout from "@/Layouts/SidebarLayout";
import { Head } from "@inertiajs/react";

export default function DocumentRepo() {
    const documentRepoLinks = getDocumentRepoLinks();

    return (
        <SidebarLayout
            activeModule="Document Repository"
            sidebarLinks={documentRepoLinks}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Document Repository
                </h2>
            }
        >
            <Head title="Document Repository" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            Document Repository
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}   