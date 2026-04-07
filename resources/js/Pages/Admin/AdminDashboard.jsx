import { getAdminLinks } from "@/Config/navigation";
import SidebarLayout from "@/Layouts/SidebarLayout";
import { Head } from "@inertiajs/react";

// Accept the new props passed from our Laravel route, setting a default of 0 just in case
export default function AdminDashboard({ totalActiveEmployees = 0, totalBranches = 0 }) {

    const adminLinks = getAdminLinks();

    return (
        <SidebarLayout
            activeModule="Admin"
            sidebarLinks={adminLinks}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Admin Control Panel
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Card */}
                    <div className="mb-6 overflow-hidden bg-white shadow-sm sm:rounded-lg border-l-4 border-red-500">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-bold">Welcome, System Administrator</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                You have full access to all modules and employee records.
                            </p>
                        </div>
                    </div>

                    {/* Admin stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-gray-500 text-sm font-medium">Total Active Employees</div>
                            {/* Dynamically render the total active employees */}
                            <div className="mt-2 text-3xl font-bold text-gray-900">{totalActiveEmployees}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-gray-500 text-sm font-medium">Active Branches</div>
                            {/* Dynamically render the total branches */}
                            <div className="mt-2 text-3xl font-bold text-gray-900">{totalBranches}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-gray-500 text-sm font-medium">System Status</div>
                            <div className="mt-2 text-3xl font-bold text-green-600">Online</div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}