import settingsIcon from '@/assets/settings.png';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react'; // Added these imports

export default function EmployeeManagement({ users = [] }) {
    
    // 1. State to track exactly which dropdown is open
    const [activeDropdown, setActiveDropdown] = useState(null);

    // 2. Listen for clicks anywhere on the screen to instantly close the dropdown
    useEffect(() => {
        const closeDropdown = () => setActiveDropdown(null);
        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    }, []);

    // ESS Sidebar Pattern Links
    const adminLinks = [
        { label: 'Admin Overview', href: route('admin.dashboard'), active: false },
        { label: 'Employee Management', href: route('admin.employees'), active: true },
        { label: 'Branch Assignments', href: '#', active: false },
        { label: 'System Logs & Security', href: '#', active: false },
    ];

    return (
        <SidebarLayout
            activeModule="Admin"
            sidebarLinks={adminLinks}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Employee Management
                </h2>
            }
        >
            <Head title="Employee Management" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="mb-4 flex gap-4">
                        <button className="rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-gray-700">
                            + Add Users
                        </button>
                        <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 hover:bg-gray-50">
                            + Add Position
                        </button>
                        <button className="rounded-md border border-gray-300 bg-yellow-500 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 hover:bg-yellow-600">
                            + Add Branch
                        </button>
                    </div>

                    {/* 3. Removed 'overflow-hidden' and added 'pb-32' to give the bottom dropdown room to breathe */}
                    <div className="bg-white shadow-sm sm:rounded-lg pb-32">
                        <div className="overflow-visible">
                            <table className="w-full whitespace-nowrap text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Name</th>
                                        <th scope="col" className="px-6 py-3">Department</th>
                                        <th scope="col" className="px-6 py-3">Position</th>
                                        <th scope="col" className="px-6 py-3">Branch ID</th>
                                        <th scope="col" className="px-6 py-3">Is Rotating</th>
                                        <th scope="col" className="px-6 py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((employee) => (
                                        <tr key={employee.id} className="border-b bg-white hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {employee.name}
                                                <div className="text-xs text-gray-400">{employee.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {employee.department?.name || <span className="text-gray-300 italic">Unassigned</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {employee.position?.name || <span className="text-gray-300 italic">Unassigned</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {employee.branch_id ? `Branch ${employee.branch_id}` : <span className="text-gray-300 italic">N/A</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${employee.is_rotating ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {employee.is_rotating ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            
                                            {/* 4. The Action Cell must be 'relative' so the absolute dropdown anchors to it */}
                                            <td className="relative px-6 py-4 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Stops the document click listener from instantly closing it
                                                        setActiveDropdown(activeDropdown === employee.id ? null : employee.id);
                                                    }}
                                                    className="inline-flex items-center justify-center rounded-md p-1 hover:bg-gray-200 focus:outline-none"
                                                >
                                                    <img src={settingsIcon} alt="Settings" className="h-5 w-5 opacity-70 hover:opacity-100" />
                                                </button>

                                                {/* 5. The Custom Dropdown Menu */}
                                                {activeDropdown === employee.id && (
                                                    <div
                                                        onClick={(e) => e.stopPropagation()} 
                                                        className="absolute right-8 top-10 z-50 w-36 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                                                    >
                                                        <Link href="#" className="block px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100">
                                                            Edit
                                                        </Link>
                                                        <Link href="#" className="block px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-100">
                                                            Device Reset
                                                        </Link>
                                                        <Link href="#" as="button" method="delete" className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">
                                                            Delete
                                                        </Link>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </SidebarLayout>
    );
}