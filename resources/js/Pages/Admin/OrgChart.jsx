import SidebarLayout from '@/Layouts/SidebarLayout';
import { getAdminLinks } from '@/Config/navigation';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useState, useEffect } from 'react';

const CLINIC_BRANCHES = [
    'ExeCom and ManComm',
    'Corporate Operations Team',
    'Makati Branch Medical Operations Team',
    'Alabang Branch Medical Operations Team',
    'Greenhills Branch Medical Operations Team',
    'Makati Branch Services Operations Team',
    'Alabang Branch Services Operations Team',
    'Greenhills Branch Services Operations Team',
];

const BRANCH_SPECIFIC_POSITIONS = {
    'ExeCom and ManComm': [
        'Chairman',
        'President',
        'Director of Corporate & Services Operations',
        'Medical Director',
        'Operations & Finance Coordination Lead',
        'Sales & Marketing Manager',
        'Operations Manager',
        'Store Manager',
        'HR Business Partner',
        'Internal Auditor',
        'Executive Assistant',
        'Chief Veterinarian',
        'Senior Veterinarian TL',
        'Junior Veterinarian TL',
    ],

    'Corporate Operations Team': [
        'HR Business Partner',
        'HR Consultant',
        'HR Assistant',
        'Procurement TL',
        'Procurement Assistant',
        'Internal Auditor',
        'Audit Assistant',
        'IT TL',
        'IT Associates',
        'Accounting Staff',
    ],

    'Makati Branch Medical Operations Team': [
        'Veterinarian Assistant TL',
        'Veterinarians',
        'Vet Tech TL',
        'Vet Tech',
        'Clinic Assistant TL',
        'Clinic Assistants',
    ],
    'Alabang Branch Medical Operations Team': [
        'Veterinarian Assistant TL',
        'Veterinarians',
        'Vet Tech TL',
        'Vet Tech',
        'Clinic Assistant TL',
        'Clinic Assistants',
    ],
    'Greenhills Branch Medical Operations Team': [
        'Veterinarian Assistant TL',
        'Veterinarians',
        'Vet Tech TL',
        'Vet Tech',
        'Clinic Assistant TL',
        'Clinic Assistants',
    ],

    'Makati Branch Services Operations Team': [
        'Reception TL',
        'Receptionist',
        'Cashier TL',
        'Cashier Assistant',
        'Inventory TL',
        'Inventory Assistant',
        'Security Guard',
        'Company Drivers',
    ],
    'Alabang Branch Services Operations Team': [
        'Reception TL',
        'Receptionist',
        'Cashier TL',
        'Cashier Assistant',
        'Inventory TL',
        'Inventory Assistant',
        'Security Guard',
        'Company Drivers',
    ],
    'Greenhills Branch Services Operations Team': [
        'Reception TL',
        'Receptionist',
        'Cashier TL',
        'Cashier Assistant',
        'Inventory TL',
        'Inventory Assistant',
        'Security Guard',
        'Company Drivers',
    ],
};

const SECTION_TITLES = {
    'ExeCom and ManComm': 'Executive and Management Committee',
    'Corporate Operations Team': 'Corporate Operations Team',
    'Makati Branch Medical Operations Team': 'Makati Branch Medical Operations Team',
    'Alabang Branch Medical Operations Team': 'Alabang Branch Medical Operations Team',
    'Greenhills Branch Medical Operations Team': 'Greenhills Branch Medical Operations Team',
    'Makati Branch Services Operations Team': 'Makati Branch Services Operations Team',
    'Alabang Branch Services Operations Team': 'Alabang Branch Services Operations Team',
    'Greenhills Branch Services Operations Team': 'Greenhills Branch Services Operations Team',
};

export default function OrgChartAdmin({ auth, members }) {
    const adminLinks = getAdminLinks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [localMembers, setLocalMembers] = useState([]);
    const [openSections, setOpenSections] = useState({});

    useEffect(() => {
        setLocalMembers(members || []);
    }, [members]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        position: '',
        branch: 'ExeCom and ManComm',
        image: null,
    });

    const selectedBranchPositions = BRANCH_SPECIFIC_POSITIONS[data.branch] || [];

    useEffect(() => {
        if (data.position && !selectedBranchPositions.includes(data.position)) {
            setData('position', '');
        }
    }, [data.branch]);

    const toggleSection = (sectionName) => {
        setOpenSections((prev) => ({
            ...prev,
            [sectionName]: !prev[sectionName],
        }));
    };

    const openModal = (member = null) => {
        clearErrors();

        if (member && member.id) {
            setEditingMember(member);
            setData({
                name: member.name || '',
                position: member.position || '',
                branch: member.branch || 'ExeCom and ManComm',
                image: null,
            });
        } else {
            setEditingMember(null);
            setData({
                name: '',
                position: '',
                branch: 'ExeCom and ManComm',
                image: null,
            });
        }

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setEditingMember(null);
            reset();
            clearErrors();
        }, 300);
    };

    const submit = (e) => {
        e.preventDefault();

        if (editingMember) {
            put(route('admin.org-chart.update', editingMember.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.org-chart.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteMemberAction = (id) => {
        if (confirm('Are you sure you want to remove this member? This action cannot be undone.')) {
            router.delete(route('admin.org-chart.destroy', id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const sortMembersByBranchHierarchy = (branchName, membersInBranch) => {
        const positionOrder = BRANCH_SPECIFIC_POSITIONS[branchName] || [];
        const orderMap = new Map(positionOrder.map((position, index) => [position, index]));

        return [...membersInBranch].sort((a, b) => {
            const aIndex = orderMap.has(a.position) ? orderMap.get(a.position) : Number.MAX_SAFE_INTEGER;
            const bIndex = orderMap.has(b.position) ? orderMap.get(b.position) : Number.MAX_SAFE_INTEGER;

            if (aIndex !== bIndex) return aIndex - bIndex;
            return a.name.localeCompare(b.name);
        });
    };

    const groupedMembers = CLINIC_BRANCHES.reduce((acc, branch) => {
        const peopleInThisBranch = localMembers.filter((m) => m.branch === branch);
        acc[branch] = sortMembersByBranchHierarchy(branch, peopleInThisBranch);
        return acc;
    }, {});

    const otherMembers = localMembers.filter((m) => !CLINIC_BRANCHES.includes(m.branch));
    if (otherMembers.length > 0) {
        groupedMembers['Other Staff'] = otherMembers;
    }

    return (
        <SidebarLayout
            activeModule="Admin"
            sidebarLinks={adminLinks}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Employee Directory Management
                </h2>
            }
        >
            <Head title="Manage Directory" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row">
                        <div>
                            <h3 className="mb-1 text-xl font-bold text-gray-900">
                                The Cat Clinic People Directory
                            </h3>
                            <p className="text-sm text-gray-500">
                                Add members, assign departments, and manage them according to the fixed position hierarchy.
                            </p>
                        </div>

                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-indigo-500"
                        >
                            + Add member
                        </button>
                    </div>

                    <div className="space-y-5">
                        {Object.keys(groupedMembers).map((branchName) => {
                            const membersInBranch = groupedMembers[branchName];
                            const isOpen = !!openSections[branchName];

                            return (
                                <div
                                    key={branchName}
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleSection(branchName)}
                                        className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-gray-50"
                                    >
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-800">
                                                {SECTION_TITLES[branchName] || branchName}
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {membersInBranch.length} {membersInBranch.length === 1 ? 'member' : 'members'}
                                            </p>
                                        </div>

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12.53 16.28a.75.75 0 01-1.06 0l-6-6a.75.75 0 111.06-1.06L12 14.69l5.47-5.47a.75.75 0 111.06 1.06l-6 6z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>

                                    {isOpen && (
                                        <div className="border-t border-gray-200 px-6 py-6">
                                            {membersInBranch.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                                                    <h5 className="text-base font-medium text-gray-900">
                                                        No members yet
                                                    </h5>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Add a member to this department to get started.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                                    {membersInBranch.map((member) => (
                                                        <div
                                                            key={member.id}
                                                            className="group relative flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-xl"
                                                        >
                                                            <button
                                                                onClick={() => openModal(member)}
                                                                className="absolute right-4 top-4 z-20 rounded-full bg-white/70 p-1.5 text-black transition-colors"
                                                                title="Edit Member"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    className="h-5 w-5"
                                                                >
                                                                    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.199z" />
                                                                </svg>
                                                            </button>

                                                            <div className="relative z-10 mb-4 h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md transition-colors group-hover:border-indigo-100">
                                                                {member.image_path ? (
                                                                    <img
                                                                        src={`/storage/${member.image_path}`}
                                                                        alt={member.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <svg
                                                                        className="h-full w-full bg-gray-50 p-6 text-black"
                                                                        fill="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                                    </svg>
                                                                )}
                                                            </div>

                                                            <div className="relative z-10 w-full text-center">
                                                                <h4 className="px-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-900">
                                                                    {member.name}
                                                                </h4>
                                                                <div className="mt-2 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 transition-colors group-hover:bg-indigo-100">
                                                                    {member.position}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between border-b pb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            {editingMember ? 'Edit Team Member' : 'Add New Member'}
                        </h2>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="h-5 w-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {editingMember && editingMember.image_path && (
                            <div className="mb-3 flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-gray-50 p-3">
                                <span className="mb-2 text-xs font-semibold text-gray-500">
                                    Current Photo
                                </span>
                                <img
                                    src={`/storage/${editingMember.image_path}`}
                                    className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm font-bold text-gray-700">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="e.g. Dr. Jane Doe"
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-bold text-gray-700">
                                Department / Branch
                            </label>
                            <select
                                value={data.branch}
                                onChange={(e) => setData('branch', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            >
                                {CLINIC_BRANCHES.map((branch) => (
                                    <option key={branch} value={branch}>
                                        {branch}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-bold text-gray-700">
                                Position / Title
                            </label>

                            <select
                                value={data.position}
                                onChange={(e) => setData('position', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            >
                                <option value="">Select position</option>
                                {selectedBranchPositions.map((position) => (
                                    <option key={position} value={position}>
                                        {position}
                                    </option>
                                ))}
                            </select>

                            {errors.position && (
                                <p className="mt-1 text-xs text-red-500">{errors.position}</p>
                            )}

                            <p className="mt-1 text-xs text-gray-500">
                                Positions are limited to the roles available under the selected section.
                            </p>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-bold text-gray-700">
                                {editingMember ? 'Replace Photo (Optional)' : 'Upload Photo (Optional)'}
                            </label>
                            <input
                                type="file"
                                onChange={(e) => setData('image', e.target.files[0])}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 transition-colors hover:file:bg-indigo-100"
                                accept="image/*"
                            />
                            {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
                        </div>

                        <div
                            className={`mt-8 flex gap-3 border-t pt-4 ${
                                editingMember ? 'justify-between' : 'justify-end'
                            }`}
                        >
                            {editingMember && (
                                <button
                                    type="button"
                                    onClick={() => deleteMemberAction(editingMember.id)}
                                    disabled={processing}
                                    className="flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-bold text-black shadow-inner transition-colors hover:bg-red-100 disabled:opacity-50"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478 48.567 48.567 0 01-3.622-.472v13.064c0 1.725-1.4 3.125-3.125 3.125H10.875c-1.725 0-3.125-1.4-3.125-3.125V6.16c-1.248.06-2.492.16-3.722.299a.75.75 0 01-.256-1.478 48.84 48.84 0 013.878-.512V4.478c0-1.326 1.057-2.382 2.382-2.382h2.236c1.326 0 2.382 1.056 2.382 2.382zm-9.431 3.524a.75.75 0 018.802 0 .75.75 0 01-.65 1.35 1.125 1.125 0 00-.918 0 .75.75 0 01-.65-1.35zM9 10.875a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v6.75a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-6.75z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    DELETE MEMBER
                                </button>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow transition-colors hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    {editingMember ? 'Save Changes' : 'Save Member'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>
        </SidebarLayout>
    );
}