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

    // Helper to manually trigger the global toast
    const triggerToast = (message, type = 'success') => {
        window.dispatchEvent(new CustomEvent('flash-toast', { detail: { message, type } }));
    };

    // Global Confirm Modal
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false, title: '', message: '', confirmText: '', confirmColor: '', onConfirm: () => {}
    });

    const closeConfirmModal = () => setConfirmDialog({ ...confirmDialog, isOpen: false });

    // ==========================================
    // FILTER STATE & LOGIC
    // ==========================================
    const [filterSearch, setFilterSearch] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterBranch, setFilterBranch] = useState('');

    // Sorting state
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortValue = (employee, field) => {
        switch (field) {
            case 'name':
                return employee.name || '';
            case 'department':
                return employee.department?.name || '';
            case 'position':
                return employee.position?.name || '';
            default:
                return '';
        }
    };

    // 1. Automatically extract unique Departments and Branches from the users array for the dropdowns
    const uniqueDepartments = [...new Set(users.map(u => u.department?.name).filter(Boolean))].sort();
    const uniqueBranches = [...new Set(users.flatMap(u => u.branches?.map(b => b.name) || []).filter(Boolean))].sort();

    // 2. The Live Filter Math
    const filteredUsers = [...users]
        .filter(employee => {
            const searchTerm = filterSearch.trim().toLowerCase();

            // Search matches name, email, department, position, or branch
            const matchesSearch = searchTerm === '' ||
                (employee.name || '').toLowerCase().includes(searchTerm) ||
                (employee.email || '').toLowerCase().includes(searchTerm) ||
                (employee.department?.name || '').toLowerCase().includes(searchTerm) ||
                (employee.position?.name || '').toLowerCase().includes(searchTerm) ||
                (employee.branches && employee.branches.some(b =>
                    (b.name || '').toLowerCase().includes(searchTerm)
                ));

            // Department matches exactly
            const matchesDept = filterDepartment === '' ||
                employee.department?.name === filterDepartment;

            // Branch matches if the employee is assigned to it
            const matchesBranch = filterBranch === '' ||
                (employee.branches && employee.branches.some(b => b.name === filterBranch));

            return matchesSearch && matchesDept && matchesBranch;
        })
        .sort((a, b) => {
            const aValue = getSortValue(a, sortField).toLowerCase();
            const bValue = getSortValue(b, sortField).toLowerCase();

            const comparison = aValue.localeCompare(bValue, undefined, {
                numeric: true,
                sensitivity: 'base',
            });

            return sortDirection === 'asc' ? comparison : -comparison;
        });

    const renderHeaderSortButton = (field) => {
        const isActive = sortField === field;

        const upClass =
            isActive && sortDirection === 'asc' ? 'text-gray-900' : 'text-gray-300';
        const downClass =
            isActive && sortDirection === 'desc' ? 'text-gray-900' : 'text-gray-300';

        return (
            <button
                type="button"
                onClick={() => toggleSort(field)}
                className="ml-2 inline-flex items-center justify-center hover:opacity-80 transition"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-4 h-4"
                >
                    {/* Up arrow */}
                    <g
                        className={upClass}
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M7 17V7" />
                        <path d="M4 10l3-3 3 3" />
                    </g>

                    {/* Down arrow */}
                    <g
                        className={downClass}
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M17 7v10" />
                        <path d="M14 14l3 3 3-3" />
                    </g>
                </svg>
            </button>
        );
    };

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
            onSuccess: () => resetDept(),
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

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        department_id: '',
        position_name: '',
    });

    useEffect(() => {
        const closeDropdown = () => setActiveDropdown(null);
        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    }, []);

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

    const {
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
    };

    const submitBranch = (e) => {
        e.preventDefault();
        postBranch(route('admin.branches.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeBranchModal();
                resetBranch();
            },
        });
    };

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
        role_id: '',
        department_id: '',
        position_id: '',
        branch_ids: [],
    });

    const closeUserModal = () => {
        setUserModalOpen(false);
        clearUserErrors();
        resetUser();
    };

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
    };

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

    const {
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
    };

    const closeEditUserModal = () => {
        setEditUserModalOpen(false);
        setEditingUser(null);
        clearEditErrors();
        resetEditUser();
    };

    const submitEditUser = (e) => {
        e.preventDefault();
        putUser(route('admin.users.update', editingUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeEditUserModal();
                resetEditUser();
            },
        });
    };

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
        });
    };

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

    // For Disable/Enable Toggle
    const confirmToggleStatus = (employee) => {
        setActiveDropdown(null);
        const isDisabling = employee.status !== 'Disabled';
        
        setConfirmDialog({
            isOpen: true,
            title: isDisabling ? 'Disable Account' : 'Enable Account',
            message: isDisabling 
                ? `Are you sure you want to disable access for ${employee.name}? \n\nThey will immediately be locked out of the system.`
                : `Are you sure you want to re-enable access for ${employee.name}?`,
            confirmText: isDisabling ? 'Disable Account' : 'Enable Account',
            confirmColor: isDisabling ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500',
            onConfirm: () => {
                router.patch(route('admin.users.toggle-status', employee.id), {}, {
                    preserveScroll: true,
                    onSuccess: () => closeConfirmModal(),
                });
            }
        });
    };

    // ==========================================
    // EMAIL SETUP / RESET ACTION
    // ==========================================
    const handleAccountAction = (employee) => {
        setActiveDropdown(null); // Close the cog menu
        
        if (employee.has_password) {
            // Phase 2: Send Password Reset
            router.post(route('employees.send-reset', employee.id), {}, {
                preserveScroll: true,
                onSuccess: () => triggerToast(`Reset link sent to ${employee.email}`, 'success'),
            });
        } else {
            // Phase 1: Send Account Activation
            router.post(route('employees.send-activation', employee.id), {}, {
                preserveScroll: true,
                onSuccess: () => triggerToast(`Activation link sent to ${employee.email}`, 'success'),
            });
        }
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

    const { processing: importProcessing, reset: resetImport } = useForm({
        import_file: null,
    });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];

        if (file) {
            setConfirmDialog({
                isOpen: true,
                title: 'Confirm Batch Import',
                message: `Are you sure you want to import employees from "${file.name}"? Make sure you used the official template to prevent errors.`,
                confirmText: 'Import Employees',
                confirmColor: 'bg-green-600 hover:bg-green-700',
                onConfirm: () => {
                    closeConfirmModal();

                    router.post(route('admin.employees.import'), {
                        import_file: file
                    }, {
                        preserveScroll: true,
                        forceFormData: true,
                        onSuccess: () => {
                            resetImport();
                            e.target.value = null;
                        },
                        onError: () => {
                            e.target.value = null;
                        }
                    });
                }
            });
        }
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

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:h-[calc(100vh-240px)] md:overflow-hidden">

                <div className="flex-none mb-4 space-y-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <button className="rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-sm hover:bg-gray-700 transition flex-shrink-0" onClick={() => setUserModalOpen(true)}>
                                + Add Users
                            </button>
                            <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm hover:bg-gray-50 transition flex-shrink-0" onClick={() => setPositionModalOpen(true)}>
                                + Add Position
                            </button>
                            <button className="rounded-md border border-gray-300 bg-yellow-500 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-sm hover:bg-yellow-600 transition flex-shrink-0" onClick={() => setBranchModalOpen(true)}>
                                + Add Branch
                            </button>
                            <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm hover:bg-gray-50 transition flex-shrink-0" onClick={() => setDepartmentModalOpen(true)}>
                                Edit Departments
                            </button>
                            <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm hover:bg-gray-50 transition flex-shrink-0" onClick={() => setRoleModalOpen(true)}>
                                Edit Roles
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:justify-end">
                            <a
                                href={route('admin.employees.export', {
                                    search: filterSearch,
                                    department: filterDepartment,
                                    branch: filterBranch
                                })}
                                onClick={() => triggerToast('Preparing export. Download will start shortly...', 'success')}
                                className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-700 shadow-sm hover:bg-indigo-100 transition flex-shrink-0"
                            >
                                📥 Export
                            </a>

                            <a
                                href={route('admin.employees.template')}
                                onClick={() => triggerToast('Downloading Excel template...', 'success')}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm hover:bg-gray-50 transition flex-shrink-0"
                            >
                                📄 Template
                            </a>

                            <div className="relative inline-block flex-shrink-0">
                                <input
                                    type="file"
                                    id="excel-upload-emp"
                                    className="hidden"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUpload}
                                />
                                <button
                                    onClick={() => document.getElementById('excel-upload-emp').click()}
                                    disabled={importProcessing}
                                    className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-green-700 shadow-sm hover:bg-green-100 transition"
                                >
                                    {importProcessing ? 'Importing...' : '📁 Batch Import'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-8"
                                placeholder="Search by name, email, department, position, or branch..."
                                value={filterSearch}
                                onChange={(e) => setFilterSearch(e.target.value)}
                            />
                            {filterSearch && (
                                <button
                                    type="button"
                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 font-bold"
                                    onClick={() => setFilterSearch('')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <select
                            className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {uniqueDepartments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>

                        <select
                            className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={filterBranch}
                            onChange={(e) => setFilterBranch(e.target.value)}
                        >
                            <option value="">All Branches</option>
                            {uniqueBranches.map(branch => (
                                <option key={branch} value={branch}>{branch}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 min-h-0 flex flex-col md:overflow-hidden">
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto overflow-y-auto flex-1 relative">
                        <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-500">
                            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm text-xs uppercase text-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 bg-gray-50 font-bold tracking-wider">
                                        <div className="flex items-center">
                                            <span>Name</span>
                                            {renderHeaderSortButton('name')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 bg-gray-50 font-bold tracking-wider">
                                        <div className="flex items-center">
                                            <span>Department</span>
                                            {renderHeaderSortButton('department')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 bg-gray-50 font-bold tracking-wider">
                                        <div className="flex items-center">
                                            <span>Position</span>
                                            {renderHeaderSortButton('position')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 bg-gray-50 font-bold tracking-wider">Branch</th>
                                    <th scope="col" className="px-6 py-3 bg-gray-50 font-bold tracking-wider">Is Rotating</th>
                                    <th scope="col" className="px-6 py-3 bg-gray-50 font-bold tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 bg-gray-50 font-bold tracking-wider text-center w-20">Action</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                                            No employees found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((employee) => (
                                        <tr key={employee.id} className="border-b bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                {employee.name}
                                                <div className="text-xs text-gray-500 mt-0.5">{employee.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {employee.department?.name ? <span className="text-gray-900">{employee.department.name}</span> : <span className="text-gray-400 italic">Unassigned</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {employee.position?.name ? <span className="text-gray-900 font-medium">{employee.position.name}</span> : <span className="text-gray-400 italic">Unassigned</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {employee.branches && employee.branches.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {employee.branches.map((branch) => (
                                                            <span key={branch.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                                {branch.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${employee.is_rotating ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'}`}>
                                                    {employee.is_rotating ? 'Yes' : 'No'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${
        employee.status === 'Disabled'
            ? 'bg-gray-100 text-gray-600 ring-gray-500/20'
            : employee.status === 'Password reset' 
                ? 'bg-red-50 text-red-700 ring-red-600/20' 
                : employee.has_password 
                    ? 'bg-green-50 text-green-700 ring-green-600/20' 
                    : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
    }`}>
        {employee.status === 'Disabled' ? 'Disabled' : 
         employee.status === 'Password reset' ? 'Password Reset' : 
         (employee.has_password ? 'Active' : 'Pending Setup')}
    </span>
</td>

                                            <td className="px-6 py-4 whitespace-nowrap text-center relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDropdown(activeDropdown === employee.id ? null : employee.id);
                                                    }}
                                                    className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-gray-200 focus:outline-none transition-colors"
                                                >
                                                    <img src={settingsIcon} alt="Settings" className="h-5 w-5 opacity-70 hover:opacity-100" />
                                                </button>

                                                {activeDropdown === employee.id && (
                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="absolute right-8 top-10 z-50 w-36 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                                                    >

                                                        <button 
                                                            className={`block w-full px-4 py-2 text-left text-sm font-medium transition-colors ${employee.has_password ? 'text-green-600 hover:bg-green-50' : 'text-blue-600 hover:bg-blue-50'}`}
                                                            onClick={(e) => {
                                                                e.preventDefault(); 
                                                                e.stopPropagation(); 
                                                                handleAccountAction(employee);
                                                            }}
                                                        >
                                                            {employee.has_password ? 'Password Reset' : 'Activation Link'}
                                                        </button>

                                                        <Link as="button" className="block w-full px-4 py-2 text-left text-sm font-medium text-blue-600 hover:bg-gray-100 transition-colors" onClick={(e) => {
                                                            e.preventDefault(); e.stopPropagation(); openEditUserModal(employee);
                                                        }}>
                                                            Edit
                                                        </Link>
                                                        <Link as="button" className="block w-full px-4 py-2 text-left text-sm font-medium text-orange-600 hover:bg-gray-100 transition-colors" onClick={(e) => {
                                                            e.preventDefault(); e.stopPropagation(); confirmDeviceReset(employee);
                                                        }}>
                                                            Device Reset
                                                        </Link>
                                                        <button 
    className="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors" 
    onClick={(e) => {
        e.preventDefault(); e.stopPropagation(); confirmToggleStatus(employee);
    }}
>
    {employee.status === 'Disabled' ? 'Enable Account' : 'Disable Account'}
</button>
                                                        <Link as="button" method="delete" className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-gray-100 transition-colors" onClick={(e) => {
                                                            e.preventDefault(); e.stopPropagation(); confirmDeleteUser(employee);
                                                        }}>
                                                            Delete
                                                        </Link>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden">
                        {filteredUsers.length === 0 ? (
                            <div className="px-4 py-12 text-center text-gray-500 font-medium">
                                No employees found.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredUsers.map((employee) => (
                                    <div key={employee.id} className="p-4 bg-white">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 break-words">
                                                    {employee.name}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5 break-all">
                                                    {employee.email}
                                                </div>
                                            </div>

                                            <div className="relative shrink-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDropdown(activeDropdown === employee.id ? null : employee.id);
                                                    }}
                                                    className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-gray-200 focus:outline-none transition-colors"
                                                >
                                                    <img src={settingsIcon} alt="Settings" className="h-5 w-5 opacity-70 hover:opacity-100" />
                                                </button>

                                                {activeDropdown === employee.id && (
                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                                                    >

                                                        <button 
                                                            className={`block w-full px-4 py-2 text-left text-sm font-medium transition-colors ${employee.has_password ? 'text-green-600 hover:bg-green-50' : 'text-blue-600 hover:bg-blue-50'}`}
                                                            onClick={(e) => {
                                                                e.preventDefault(); 
                                                                e.stopPropagation(); 
                                                                handleAccountAction(employee);
                                                            }}
                                                        >
                                                            {employee.has_password ? 'Password Reset' : 'Activation Link'}
                                                        </button>

                                                        <Link as="button" className="block w-full px-4 py-2 text-left text-sm font-medium text-blue-600 hover:bg-gray-100 transition-colors" onClick={(e) => {
                                                            e.preventDefault(); e.stopPropagation(); openEditUserModal(employee);
                                                        }}>
                                                            Edit
                                                        </Link>
                                                        <Link as="button" className="block w-full px-4 py-2 text-left text-sm font-medium text-orange-600 hover:bg-gray-100 transition-colors" onClick={(e) => {
                                                            e.preventDefault(); e.stopPropagation(); confirmDeviceReset(employee);
                                                        }}>
                                                            Device Reset
                                                        </Link>
                                                        <Link as="button" method="delete" className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-gray-100 transition-colors" onClick={(e) => {
                                                            e.preventDefault(); e.stopPropagation(); confirmDeleteUser(employee);
                                                        }}>
                                                            Delete
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            <div>
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Department</div>
                                                <div className="mt-1 text-sm text-gray-900">
                                                    {employee.department?.name ? employee.department.name : <span className="text-gray-400 italic">Unassigned</span>}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Position</div>
                                                <div className="mt-1 text-sm text-gray-900">
                                                    {employee.position?.name ? employee.position.name : <span className="text-gray-400 italic">Unassigned</span>}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Branch</div>
                                                <div className="mt-1">
                                                    {employee.branches && employee.branches.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {employee.branches.map((branch) => (
                                                                <span key={branch.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                                    {branch.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">N/A</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Is Rotating</div>
                                                <div className="mt-1">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${employee.is_rotating ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'}`}>
                                                        {employee.is_rotating ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Status</div>
    <div className="mt-1">
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${
            employee.status === 'Password reset' 
                ? 'bg-red-50 text-red-700 ring-red-600/20' 
                : employee.has_password 
                    ? 'bg-green-50 text-green-700 ring-green-600/20' 
                    : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
        }`}>
            {employee.status === 'Password reset' ? 'Password Reset' : (employee.has_password ? 'Active' : 'Pending Setup')}
        </span>
    </div>
</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

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

            <Modal show={isUserModalOpen} onClose={closeUserModal} maxWidth="2xl">
                <form onSubmit={submitUser} className="p-6">
                    <h2 className="mb-6 text-lg font-medium text-gray-900">Add New Employee</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

            <Modal show={isEditUserModalOpen} onClose={closeEditUserModal} maxWidth="2xl">
                <form onSubmit={submitEditUser} className="p-6">
                    <h2 className="mb-6 text-lg font-medium text-gray-900">Edit Employee</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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