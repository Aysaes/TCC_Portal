import settingsIcon from '@/assets/settings.png';
import ConfirmModal from '@/Components/ConfirmModal';
import { getAdminLinks } from "@/Config/navigation";
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

export default function EmployeeManagement({ users = [], departments = [], positions = [], branches = [], roles = [] }) {

    const adminLinks = getAdminLinks();

    // Global Confirm Modal
    const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, title: '', message: '', confirmText: '', confirmColor: '', onConfirm: () => {} 
    });

    const closeConfirmModal = () => setConfirmDialog({ ...confirmDialog, isOpen: false,});

    // ==========================================
    // For Edit Departments
    // ==========================================
    const [isDepartmentModalOpen, setDepartmentModalOpen] = useState(false);

    const {
        data: deptData,
        setData: setDeptData,
        post: postDept,
        processing: deptProcessing,
        errors: deptErrors,
        reset: resetDept,
        clearErrors: clearDeptErrors
    } = useForm({ name: '' });

    const closeDepartmentModal = () => {
        setDepartmentModalOpen(false);
        clearDeptErrors();
        resetDept();
    };

    const submitDepartment = (e) => {
        e.preventDefault();
        postDept(route('admin.departments.store'), {
            preserveScroll: true,
            onSuccess: () => resetDept(), // Keep modal open to show the new addition
        });
    };

    // ==========================================
    // For Edit Roles
    // ==========================================
    const [isRoleModalOpen, setRoleModalOpen] = useState(false);

    const {
        data: roleData,
        setData: setRoleData,
        post: postRole,
        processing: roleProcessing,
        errors: roleErrors,
        reset: resetRole,
        clearErrors: clearRoleErrors
    } = useForm({ name: '' });

    const closeRoleModal = () => {
        setRoleModalOpen(false);
        clearRoleErrors();
        resetRole();
    };

    const submitRole = (e) => {
        e.preventDefault();
        postRole(route('admin.roles.store'), {
            preserveScroll: true,
            onSuccess: () => resetRole(),
        });
    };
    
    // For Position
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isPositionModalOpen, setPositionModalOpen] = useState(false);

    // For Position
    const {data, setData, post , processing, errors, reset, clearErrors} = useForm({
        department_id: '',
        position_name: '',
    });
    
    useEffect(() => {
        const closeDropdown = () => setActiveDropdown(null);
        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    }, []);

    //For Position

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

    // For Branch

    const [isBranchModalOpen, setBranchModalOpen] = useState(false);

    const{
    data: branchData,
    setData: setBranchData,
    post: postBranch,
    processing: branchProcessing,
    errors: branchErrors,
    clearErrors: clearBranchErrors,
    reset: resetBranch
    } = useForm({
        branch_name: '',
    });

    const closeBranchModal = () => {
        setBranchModalOpen(false);
        clearBranchErrors();
        resetBranch();
    }

    const submitBranch = (e) => {
        e.preventDefault();
        postBranch(route('admin.branches.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeBranchModal();
                resetBranch();
            },
        });
    }

    // For Users

    const [isUserModalOpen, setUserModalOpen] = useState(false);

    const {
        data: userData,
        setData: setUserData,
        post: postUser,
        processing: userProcessing,
        errors: userErrors,
        clearErrors: clearUserErrors,
        reset: resetUser
    } = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
        department_id: '',
        position_id: '',
        branch_ids: [],
    });

    const closeUserModal = () => {
        setUserModalOpen(false);
        clearUserErrors();
        resetUser();
    }

    const submitUser = (e) => {
        e.preventDefault();
        postUser(route('admin.users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeUserModal();
                reset();
                resetUser();
            },
        });
    }

    const handleBranchCheckbox = (e, branchId) => {
        if (e.target.checked) {
            setUserData('branch_ids', [...userData.branch_ids, branchId]);
        } else {
            setUserData('branch_ids', userData.branch_ids.filter(id => id !== branchId));
        }
    };

    const filteredPositions = positions.filter(
        pos => pos.department_id === parseInt(userData.department_id)
    );

    // For Edit Users

    const [isEditUserModalOpen, setEditUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const{
    data: editUserData,
    setData: setEditData,
    put: putUser,
    processing: editProcessing,
    errors: editErrors,
    clearErrors: clearEditErrors,
    reset: resetEditUser
    } = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
        department_id: '',
        position_id: '',
        device_limit: 2,
        branch_ids: [], 
    });

    const openEditUserModal = (user) => {
        setEditingUser(user);
        setEditData({
            name: user.name,
            email: user.email,
            password: '',
            role_id: user.role_id,
            department_id: user.department_id,
            position_id: user.position_id,
            device_limit: user.device_limit,
            branch_ids: user.branches ? user.branches.map(b => b.id) : [],
        });
        setEditUserModalOpen(true);
    }

    const closeEditUserModal = () => {  
        setEditUserModalOpen(false);
        setEditingUser(null);
        clearEditErrors();
        resetEditUser();
    }

    const submitEditUser = (e) => {
        e.preventDefault();
        putUser(route('admin.users.update', editingUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeEditUserModal();
                resetEditUser();
            },
        });
    }

    const handleEditBranchCheckbox = (e, branchId) => {
        if (e.target.checked) {
            setEditData('branch_ids', [...editUserData.branch_ids, branchId]);
        } else {
            setEditData('branch_ids', editUserData.branch_ids.filter(id => id !== branchId));
        }
    };

    const filteredEditPositions = positions.filter(
        (pos) => pos.department_id === parseInt(editUserData.department_id)
    );

    // For Device Reset

    const confirmDeviceReset = (employee) => {
        setActiveDropdown(null);
        setConfirmDialog({
            isOpen: true,
            title: 'Reset Device Connection',
            message: `Are you sure you want to reset the device connection for ${employee.name}? \n\nThey will be required to re-authenticate.`,
            confirmText: 'Reset Device',
            confirmColor: 'bg-yellow-600 hover:bg-yellow-500',
            onConfirm: () => {
                router.patch(route('admin.users.reset-device', employee.id), {}, {
                    preserveScroll: true,
                    onSuccess: () => closeConfirmModal(),
                });
            }
        })
    }

    // For Delete

    const confirmDeleteUser = (employee) => {
        setActiveDropdown(null);
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Employee',
            message: `Are you absolutely sure you want to permanently delete ${employee.name}? \n\nThis action cannot be undone.`,
            confirmText: 'Delete Employee',
            confirmColor: 'bg-red-600 hover:bg-red-500',
            onConfirm: () => {
                router.delete(route('admin.users.destroy', employee.id), {
                    preserveScroll: true,
                    onSuccess: () => closeConfirmModal(),
                });
            }
        });
    };

    
    const confirmDeleteRole = (role) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete System Role',
            message: `Are you sure you want to permanently delete the ${role.name} role?\n\nThis may strip access from users currently holding this role.`,
            confirmText: 'Delete Role',
            confirmColor: 'bg-red-600 hover:bg-red-500',
            onConfirm: () => {
                router.delete(route('admin.roles.destroy', role.id), {
                    preserveScroll: true,
                    onSuccess: () => closeConfirmModal(),
                });
            }
        });
    };

        const confirmDeleteDepartment = (department) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Department',
            message: `Are you sure you want to permanently delete the ${department.name} department?\n\nThis may affect employees currently assigned to it.`,
            confirmText: 'Delete Department',
            confirmColor: 'bg-red-600 hover:bg-red-500',
            onConfirm: () => {
                router.delete(route('admin.departments.destroy', department.id), {
                    preserveScroll: true,
                    onSuccess: () => closeConfirmModal(),
                });
            }
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
                        <button className="rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-gray-700" onClick={() =>setUserModalOpen(true)}>
                            + Add Users
                        </button>
                        <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 hover:bg-gray-50" onClick={() => setPositionModalOpen(true)}>
                            + Add Position
                        </button>
                        <button className="rounded-md border border-gray-300 bg-yellow-500 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 hover:bg-yellow-600" onClick={() => setBranchModalOpen(true)}>
                            + Add Branch
                        </button>
                        <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 hover:bg-gray-50" onClick={() => setDepartmentModalOpen(true)}>
                            Edit Departments
                        </button>
                        <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 hover:bg-gray-50" onClick={() => setRoleModalOpen(true)}>
                            Edit Roles
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
                                        <th scope="col" className="px-6 py-3">Branch</th>
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
                                            {employee.branches && employee.branches.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                 {employee.branches.map((branch) => (
                                                 <span key={branch.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1      text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                    {branch.name}
                                                 </span>
                                                        ))}
                                                </div>
                                               ) : (
                                                  <span className="text-gray-300 italic">N/A</span>
                                                                     )}
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
                                                        <Link as="button" className="block px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100" onClick = {(e) =>{ 
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            openEditUserModal(employee)}}>
                                                            Edit
                                                        </Link>
                                                        <Link as="button" className="block px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-100" onClick = {(e)=> {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            confirmDeviceReset(employee);
                                                        }}>
                                                            Device Reset
                                                        </Link>
                                                        <Link  as="button" method="delete" className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100" onClick = {(e)=> {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            confirmDeleteUser(employee);
                                                        }}>
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

            {/* Add Branch Modal */}

            <Modal show={isBranchModalOpen} onClose={closeBranchModal}>
                <form onSubmit={submitBranch} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Add New Branch
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Enter the name of the new clinic location.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="branch_name" value="Branch Name" />
                        <TextInput
                            id="branch_name"
                            className="mt-1 block w-full"
                            value={branchData.name}
                            onChange={(e) => setBranchData('name', e.target.value)}
                            required
                            placeholder="e.g. Makati"
                        />
                        <InputError message={branchErrors.name} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeBranchModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={branchProcessing}>
                            Save Branch
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>


            {/* Add User Modal */}
            <Modal show={isUserModalOpen} onClose={closeUserModal} maxWidth="2xl">
                <form onSubmit={submitUser} className="p-6">
                    <h2 className="mb-6 text-lg font-medium text-gray-900">Add New Employee</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Left Column: Personal & Access Details */}
                        <div>
                            <div>
                                <InputLabel htmlFor="name" value="Full Name" />
                                <TextInput id="name" className="mt-1 block w-full" value={userData.name} onChange={(e) => setUserData('name', e.target.value)} required />
                                <InputError message={userErrors.name} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="email" value="Email Address" />
                                <TextInput id="email" type="email" className="mt-1 block w-full" value={userData.email} onChange={(e) => setUserData('email', e.target.value)} required />
                                <InputError message={userErrors.email} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="password" value="Temporary Password" />
                                <TextInput id="password" type="password" className="mt-1 block w-full" value={userData.password} onChange={(e) => setUserData('password', e.target.value)} required />
                                <InputError message={userErrors.password} className="mt-2" />
                            </div>
                            
                            {/* THE NEW ROLE DROPDOWN */}
                            <div className="mt-4">
                                <InputLabel htmlFor="role_id" value="System Role" />
                                <select id="role_id" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={userData.role_id} onChange={(e) => setUserData('role_id', e.target.value)} required>
                                    <option value="" disabled>Select Role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id} className="capitalize">{role.name}</option>
                                    ))}
                                </select>
                                <InputError message={userErrors.role_id} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="device_limit" value="Device Login Limit" />
                                <TextInput id="device_limit" type="number" min="1" className="mt-1 block w-full" value={userData.device_limit} onChange={(e) => setUserData('device_limit', e.target.value)} required />
                                <InputError message={userErrors.device_limit} className="mt-2" />
                            </div>
                        </div>

                        {/* Right Column: Job Details */}
                        <div>
                            <div>
                                <InputLabel htmlFor="user_department" value="Department" />
                                <select id="user_department" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={userData.department_id} onChange={(e) => setUserData('department_id', e.target.value)} required>
                                    <option value="" disabled>Select Department</option>
                                    {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                                </select>
                                <InputError message={userErrors.department_id} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="user_position" value="Position" />
                                <select id="user_position" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={userData.position_id} onChange={(e) => setUserData('position_id', e.target.value)} required disabled={!userData.department_id}>
                                    <option value="" disabled>Select Position</option>
                                    {filteredPositions.map((pos) => <option key={pos.id} value={pos.id}>{pos.name}</option>)}
                                </select>
                                <InputError message={userErrors.position_id} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel value="Assign Branches" />
                                <div className="mt-2 max-h-32 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-3">
                                    {branches.map((branch) => (
                                        <label key={branch.id} className="flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" value={branch.id} checked={userData.branch_ids.includes(branch.id)} onChange={(e) => handleBranchCheckbox(e, branch.id)} />
                                            <span className="ml-2 text-sm text-gray-600">{branch.name}</span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={userErrors.branch_ids} className="mt-2" />
                                <p className="mt-1 text-xs text-gray-500">Selecting multiple branches automatically sets the employee as rotating.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeUserModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={userProcessing}>
                            Create Employee
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit User Modal */}
            <Modal show={isEditUserModalOpen} onClose={closeEditUserModal} maxWidth="2xl">
                <form onSubmit={submitEditUser} className="p-6">
                    <h2 className="mb-6 text-lg font-medium text-gray-900">Edit Employee</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Left Column */}
                        <div>
                            <div>
                                <InputLabel htmlFor="edit_name" value="Full Name" />
                                <TextInput id="edit_name" className="mt-1 block w-full" value={editUserData.name} onChange={(e) => setEditData('name', e.target.value)} required />
                                <InputError message={editErrors.name} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="edit_email" value="Email Address" />
                                <TextInput id="edit_email" type="email" className="mt-1 block w-full" value={editUserData.email} onChange={(e) => setEditData('email', e.target.value)} required />
                                <InputError message={editErrors.email} className="mt-2" />
                            </div>
                            
                            <div className="mt-4">
                                <InputLabel htmlFor="edit_role_id" value="System Role" />
                                <select id="edit_role_id" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={editUserData.role_id} onChange={(e) => setEditData('role_id', e.target.value)} required>
                                    <option value="" disabled>Select Role</option>
                                    {roles.map((role) => <option key={role.id} value={role.id} className="capitalize">{role.name}</option>)}
                                </select>
                                <InputError message={editErrors.role_id} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="edit_device_limit" value="Device Login Limit" />
                                <TextInput id="edit_device_limit" type="number" min="1" className="mt-1 block w-full" value={editUserData.device_limit} onChange={(e) => setEditData('device_limit', e.target.value)} required />
                                <InputError message={editErrors.device_limit} className="mt-2" />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            <div>
                                <InputLabel htmlFor="edit_department" value="Department" />
                                <select id="edit_department" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={editUserData.department_id} onChange={(e) => setEditData('department_id', e.target.value)} required>
                                    <option value="" disabled>Select Department</option>
                                    {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                                </select>
                                <InputError message={editErrors.department_id} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="edit_position" value="Position" />
                                <select id="edit_position" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={editUserData.position_id} onChange={(e) => setEditData('position_id', e.target.value)} required disabled={!editUserData.department_id}>
                                    <option value="" disabled>Select Position</option>
                                    {filteredEditPositions.map((pos) => <option key={pos.id} value={pos.id}>{pos.name}</option>)}
                                </select>
                                <InputError message={editErrors.position_id} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel value="Assign Branches" />
                                <div className="mt-2 max-h-32 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-3">
                                    {branches.map((branch) => (
                                        <label key={`edit-branch-${branch.id}`} className="flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" value={branch.id} checked={editUserData.branch_ids.includes(branch.id)} onChange={(e) => handleEditBranchCheckbox(e, branch.id)} />
                                            <span className="ml-2 text-sm text-gray-600">{branch.name}</span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={editErrors.branch_ids} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeEditUserModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={editProcessing}>
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={isDepartmentModalOpen} onClose={closeDepartmentModal}>
    <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Departments</h2>
        
        <form onSubmit={submitDepartment} className="mb-6 flex items-end gap-3 rounded-md bg-gray-50 p-4 border border-gray-100">
            <div className="flex-grow">
                <InputLabel htmlFor="dept_name" value="New Department Name" />
                <TextInput id="dept_name" className="mt-1 block w-full" value={deptData.name} onChange={(e) => setDeptData('name', e.target.value)} required placeholder="e.g. Grooming, Surgery" />
                <InputError message={deptErrors.name} className="mt-2" />
            </div>
            <PrimaryButton disabled={deptProcessing}>Add</PrimaryButton>
        </form>

        <h3 className="text-sm font-semibold text-gray-700 mb-2">Existing Departments</h3>
        <div className="max-h-60 overflow-y-auto rounded-md border border-gray-200">
            <ul className="divide-y divide-gray-200">
                {departments.map((dept) => (
                    <li key={dept.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <span className="text-sm text-gray-800">{dept.name}</span>
                        <button onClick={() => confirmDeleteDepartment(dept)} className="text-xs font-medium text-red-600 hover:text-red-900">
                            Delete
                        </button>
                    </li>
                ))}
                {departments.length === 0 && (
                    <li className="p-4 text-sm text-gray-500 text-center">No departments found.</li>
                )}
            </ul>
        </div>

        <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={closeDepartmentModal}>Close</SecondaryButton>
        </div>
    </div>
</Modal>

{/* Edit Roles Modal */}
<Modal show={isRoleModalOpen} onClose={closeRoleModal}>
    <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Roles</h2>
        
        <form onSubmit={submitRole} className="mb-6 flex items-end gap-3 rounded-md bg-gray-50 p-4 border border-gray-100">
            <div className="flex-grow">
                <InputLabel htmlFor="role_name" value="New Role Name" />
                <TextInput id="role_name" className="mt-1 block w-full" value={roleData.name} onChange={(e) => setRoleData('name', e.target.value)} required placeholder="e.g. Admin, Staff" />
                <InputError message={roleErrors.name} className="mt-2" />
            </div>
            <PrimaryButton disabled={roleProcessing}>Add</PrimaryButton>
        </form>

        <h3 className="text-sm font-semibold text-gray-700 mb-2">Existing System Roles</h3>
        <div className="max-h-60 overflow-y-auto rounded-md border border-gray-200">
            <ul className="divide-y divide-gray-200">
                {roles.map((role) => (
                    <li key={role.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <span className="text-sm text-gray-800 capitalize">{role.name}</span>
                        <button onClick={() => confirmDeleteRole(role)} className="text-xs font-medium text-red-600 hover:text-red-900">
                            Delete
                        </button>
                    </li>
                ))}
                {roles.length === 0 && (
                    <li className="p-4 text-sm text-gray-500 text-center">No roles found.</li>
                )}
            </ul>
        </div>

        <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={closeRoleModal}>Close</SecondaryButton>
        </div>
    </div>
</Modal>

            {/* Global Confirmation Modal */}
            <ConfirmModal 
                show={confirmDialog.isOpen}
                onClose={closeConfirmModal}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                confirmColor={confirmDialog.confirmColor}
                onConfirm={confirmDialog.onConfirm}
            />
        </SidebarLayout>
    );
}