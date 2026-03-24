import SidebarLayout from '@/Layouts/SidebarLayout';
import { getDashboardLinks } from '@/Config/navigation';
import { Head } from '@inertiajs/react';

// We use the exact same list to maintain the correct display order
const CLINIC_BRANCHES = [
    "Executives", "Management Team", "Human Resource Department",
    "Makati Operations Manager", "Makati Doctors", "Makati Veterinary technicians",
    "Makati Veterinary Assistants", "Makati Front Desk associates and Cashier and Billing Team",
    "Alabang Operations Manager", "Alabang Doctors", "Alabang Veterinary Technicians",
    "Alabang Veterinary Assistants", "Alabang Front Desk associates and Cashier and Billing Team",
    "Greenhills Operations Manager", "Greenhills Doctor", "Greenhills Veterinary Technicians",
    "Greenhills Veterinary Assistants", "Greenhills Front Desk associates and Cashier and Billing Team",
    "Sales Marketing Department - GMA", "Marketing Department - CS Team", "Finance and Audit Team",
    "The Procurement and Inventory Team", "IT Team", "EA and Security Guards", "Our Resident Cats"
];

export default function OrgChart({ auth, members }) {
    const dashboardLinks = getDashboardLinks();
    const memberList = members || [];

    // Group the members by their branch based on the official order
    const groupedMembers = CLINIC_BRANCHES.reduce((acc, branch) => {
        const peopleInThisBranch = memberList.filter(m => m.branch === branch);
        if (peopleInThisBranch.length > 0) {
            acc[branch] = peopleInThisBranch;
        }
        return acc;
    }, {});

    // Catch any members who somehow have an old or missing branch
    const otherMembers = memberList.filter(m => !CLINIC_BRANCHES.includes(m.branch));
    if (otherMembers.length > 0) {
        groupedMembers['Other Staff'] = otherMembers;
    }

    return (
        <SidebarLayout
            activeModule="General"
            sidebarLinks={dashboardLinks}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Organizational Chart</h2>}
        >
            <Head title="Organizational Chart" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="mb-12 text-center">
                        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">The Cat Clinic Directory</h3>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Meet the dedicated team working behind the scenes to provide the best care.</p>
                    </div>

                    {Object.keys(groupedMembers).length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900">No team members found</h3>
                            <p className="text-gray-500 mt-1">The organizational chart has not been populated yet.</p>
                        </div>
                    ) : (
                        // Map through each department/branch that actually has people in it
                        Object.keys(groupedMembers).map((branchName) => (
                            <div key={branchName} className="mb-14">
                                
                                {/* Section Header */}
                                <div className="mb-6 border-b-2 border-indigo-100 pb-3">
                                    <h4 className="text-2xl font-bold text-gray-800">{branchName}</h4>
                                </div>

                                {/* Grid of People for this specific branch */}
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {groupedMembers[branchName].map((member) => (
                                        <div key={member.id} className="group relative flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-100">
                                            
                                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl pointer-events-none"></div>

                                            <div className="relative z-10 h-28 w-28 shrink-0 overflow-hidden rounded-full bg-gray-100 border-4 border-white shadow-md mb-4 transition-transform duration-300 group-hover:scale-105">
                                                {member.image_path ? (
                                                    <img src={`/storage/${member.image_path}`} alt={member.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <svg className="h-full w-full text-gray-300 p-6 bg-gray-50" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                )}
                                            </div>
                                            
                                            <div className="relative z-10 text-center w-full">
                                                <h4 className="text-lg font-bold text-gray-900 truncate px-2">{member.name}</h4>
                                                <div className="mt-1.5 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                                                    {member.position}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}