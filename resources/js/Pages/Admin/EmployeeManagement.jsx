import settingsIcon from '@/assets/settings.png';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

export default function EmployeeManagement({ users = [], departments = [] }) {
    
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isPositionModalOpen, setPositionModalOpen] = useState(false);

    const {data, setData, post , processing, errors, reset, clearErrors} = useForm({
        department_id: '',
        position_name: '',
    });
    
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

    const closePositionModal = () => {
        setPositionModalOpen(false);
        clearErrors();
        reset();
    };

    const submitPosition = (e) => {
        e.preventDefault();
        post(route('admin.positions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closePositionModal();
                reset();
            },
        });
    };

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
                        <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 hover:bg-gray-50" onClick={() => setPositionModalOpen(true)}>
                            + Add Position
                        </button>
                        <button className="rounded-md border border-gray-300 bg-yellow-500 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 hover:bg-yellow-600">
                            + Add Branch
                        </button>
                    </div>

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
                                            
                                           
                                            <td className="relative px-6 py-4 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); 
                                                        setActiveDropdown(activeDropdown === employee.id ? null : employee.id);
                                                    }}
                                                    className="inline-flex items-center justify-center rounded-md p-1 hover:bg-gray-200 focus:outline-none"
                                                >
                                                    <img src={settingsIcon} alt="Settings" className="h-5 w-5 opacity-70 hover:opacity-100" />
                                                </button>

                                                
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

            {/* Add Position Modal */}

            <Modal show={isPositionModalOpen} onClose={closePositionModal}>
    <form onSubmit={submitPosition} className="p-6">
        <h2 className="text-lg font-medium text-gray-900">
            Add New Position
        </h2>
        <p className="mt-1 text-sm text-gray-600">
            Select the department and enter the new position name.
        </p>

        
        <div className="mt-6">
            <InputLabel htmlFor="department_id" value="Select Department" />
            <select
                id="department_id"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={data.department_id}
                onChange={(e) => setData('department_id', e.target.value)}
                required
            >
                <option value="" disabled>Select a department...</option>
                {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                        {dept.name}
                    </option>
                ))}
            </select>
            <InputError message={errors.department_id} className="mt-2" />
        </div>

        <div className="mt-6">
            <InputLabel htmlFor="position_name" value="Position Name" />
            <TextInput
                id="position_name"
                className="mt-1 block w-full"
                value={data.position_name}
                onChange={(e) => setData('position_name', e.target.value)}
                required
                placeholder="e.g. Veterinarian, Tech Support"
            />
            <InputError message={errors.position_name} className="mt-2" />
        </div>

        <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={closePositionModal}>Cancel</SecondaryButton>
            <PrimaryButton className="ms-3" disabled={processing}>
                Save Position
            </PrimaryButton>
        </div>
    </form>
</Modal>
        </SidebarLayout>
    );
}