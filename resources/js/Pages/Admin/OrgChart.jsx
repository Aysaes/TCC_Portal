import SidebarLayout from '@/Layouts/SidebarLayout';
import { getAdminLinks } from '@/Config/navigation';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useState, useEffect } from 'react';

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

export default function OrgChartAdmin({ auth, members }) {
    const adminLinks = getAdminLinks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Local state to handle visual drag-and-drop instantly
    const [localMembers, setLocalMembers] = useState([]);
    const [draggedItemId, setDraggedItemId] = useState(null);

    // Sync local members when database members prop changes
    useEffect(() => {
        setLocalMembers(members || []);
    }, [members]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', position: '', branch: 'Executives', image: null,
    });

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => { setIsModalOpen(false); reset(); };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.org-chart.store'), { onSuccess: () => closeModal() });
    };

    const deleteMember = (id) => {
        if (confirm('Are you sure you want to remove this member?')) {
            router.delete(route('admin.org-chart.destroy', id), { preserveScroll: true });
        }
    };

    // --- DRAG AND DROP LOGIC ---
    const handleDragStart = (e, id) => {
        setDraggedItemId(id);
        // Make the dragged item slightly transparent
        setTimeout(() => e.target.classList.add('opacity-50'), 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
        setDraggedItemId(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetId) return;

        // Find indexes
        const draggedIndex = localMembers.findIndex(m => m.id === draggedItemId);
        const targetIndex = localMembers.findIndex(m => m.id === targetId);

        // Reorder the array visually
        const newMembers = [...localMembers];
        const [removed] = newMembers.splice(draggedIndex, 1);
        newMembers.splice(targetIndex, 0, removed);
        setLocalMembers(newMembers);

        // Save the new order to the database!
        const orderedIds = newMembers.map(m => m.id);
        router.post(route('admin.org-chart.reorder'), { orderedIds }, { preserveScroll: true });
    };

    // --- GROUPING LOGIC (Same as Dashboard) ---
    const groupedMembers = CLINIC_BRANCHES.reduce((acc, branch) => {
        const peopleInThisBranch = localMembers.filter(m => m.branch === branch);
        if (peopleInThisBranch.length > 0) {
            acc[branch] = peopleInThisBranch;
        }
        return acc;
    }, {});

    const otherMembers = localMembers.filter(m => !CLINIC_BRANCHES.includes(m.branch));
    if (otherMembers.length > 0) groupedMembers['Other Staff'] = otherMembers;

    return (
        <SidebarLayout
            activeModule="Admin"
            sidebarLinks={adminLinks}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Organizational Chart Management</h2>}
        >
            <Head title="Manage Org Chart" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="mb-10 flex flex-col sm:flex-row items-center justify-between bg-white p-5 rounded-xl shadow-sm border border-gray-100 gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Manage Team Hierarchy</h3>
                            <p className="text-sm text-gray-500 mt-1">Upload members, assign departments, and <b>drag-and-drop to sort their ranking!</b></p>
                        </div>
                        <button onClick={openModal} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                            + ADD NEW MEMBER
                        </button>
                    </div>

                    {Object.keys(groupedMembers).length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900">No team members found</h3>
                            <p className="text-gray-500 mt-1">Click "Add New Member" to build your organization.</p>
                        </div>
                    ) : (
                        Object.keys(groupedMembers).map((branchName) => (
                            <div key={branchName} className="mb-14">
                                
                                <div className="mb-6 border-b-2 border-indigo-100 pb-3 flex items-center justify-between">
                                    <h4 className="text-2xl font-bold text-gray-800">{branchName}</h4>
                                    <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                        Drag to sort hierarchy
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {groupedMembers[branchName].map((member) => (
                                        <div 
                                            key={member.id} 
                                            draggable // Enables Native HTML5 Dragging
                                            onDragStart={(e) => handleDragStart(e, member.id)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, member.id)}
                                            className="group relative flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-indigo-300 cursor-grab active:cursor-grabbing"
                                        >
                                            {/* Drag Handle Icon (Visual Indicator) */}
                                            <div className="absolute top-4 left-4 text-gray-300 group-hover:text-indigo-400 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                                                </svg>
                                            </div>

                                            {/* Delete Button */}
                                            <button onClick={() => deleteMember(member.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors z-20">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>

                                            <div className="relative z-10 h-28 w-28 shrink-0 overflow-hidden rounded-full bg-gray-100 border-4 border-white shadow-md mb-4 pointer-events-none">
                                                {member.image_path ? (
                                                    <img src={`/storage/${member.image_path}`} alt={member.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <svg className="h-full w-full text-gray-300 p-6 bg-gray-50" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                )}
                                            </div>
                                            
                                            <div className="relative z-10 text-center w-full pointer-events-none">
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

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-3">Add New Member</h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Display Name</label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Position / Title</label>
                            <input type="text" value={data.position} onChange={(e) => setData('position', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department / Branch</label>
                            <select value={data.branch} onChange={(e) => setData('branch', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required>
                                {CLINIC_BRANCHES.map((branch) => (<option key={branch} value={branch}>{branch}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo (Optional)</label>
                            <input type="file" onChange={(e) => setData('image', e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors" accept="image/*" />
                        </div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                            <button type="button" onClick={closeModal} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={processing} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">Save Member</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </SidebarLayout>
    );
}