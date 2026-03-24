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
    
    const [editingMember, setEditingMember] = useState(null);
    const [localMembers, setLocalMembers] = useState([]);
    const [draggedItemId, setDraggedItemId] = useState(null);

    useEffect(() => {
        setLocalMembers(members || []);
    }, [members]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '', position: '', branch: 'Executives', image: null,
    });

    // BULLETPROOF MODAL OPENER
    const openModal = (member = null) => {
        clearErrors();
        
        // Ensure 'member' is an actual database object (has an id) and not a random click event
        if (member && member.id) {
            setEditingMember(member);
            setData({
                name: member.name || '',
                position: member.position || '',
                branch: member.branch || 'Executives',
                image: null,
            });
        } else {
            // Guarantee a completely fresh form
            setEditingMember(null);
            setData({
                name: '',
                position: '',
                branch: 'Executives',
                image: null,
            });
        }
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setEditingMember(null);
            reset(); // Tells Inertia to clear its internal memory 
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

    // --- DRAG AND DROP LOGIC ---
    const handleDragStart = (e, id) => {
        setDraggedItemId(id);
        setTimeout(() => e.target.classList.add('opacity-50'), 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
        setDraggedItemId(null);
    };

    const handleDragOver = (e) => { e.preventDefault(); };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetId) return;
        const draggedIndex = localMembers.findIndex(m => m.id === draggedItemId);
        const targetIndex = localMembers.findIndex(m => m.id === targetId);
        const newMembers = [...localMembers];
        const [removed] = newMembers.splice(draggedIndex, 1);
        newMembers.splice(targetIndex, 0, removed);
        setLocalMembers(newMembers);
        const orderedIds = newMembers.map(m => m.id);
        router.post(route('admin.org-chart.reorder'), { orderedIds }, { preserveScroll: true });
    };

    // --- GROUPING LOGIC ---
    const groupedMembers = CLINIC_BRANCHES.reduce((acc, branch) => {
        const peopleInThisBranch = localMembers.filter(m => m.branch === branch);
        if (peopleInThisBranch.length > 0) acc[branch] = peopleInThisBranch;
        return acc;
    }, {});
    const otherMembers = localMembers.filter(m => !CLINIC_BRANCHES.includes(m.branch));
    if (otherMembers.length > 0) groupedMembers['Other Staff'] = otherMembers;

    return (
        <SidebarLayout activeModule="Admin" sidebarLinks={adminLinks} header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Organizational Chart Management</h2>}>
            <Head title="Manage Org Chart" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="mb-10 flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">The Cat Clinic Hierarchy Directory</h3>
                            <p className="text-sm text-gray-500">Add members, assign departments, and <b>drag-and-drop cards</b> within sections to sort their ranking!</p>
                        </div>
                        
                        <button 
                            onClick={() => openModal()} 
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-500 transition-colors"
                        >
                            + Add member
                        </button>
                    </div>

                    {Object.keys(groupedMembers).length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900">Directory is currently empty</h3>
                            <p className="text-gray-500 mt-1">Click "+ Add member" in the header to configure your first member.</p>
                        </div>
                    ) : (
                        Object.keys(groupedMembers).map((branchName) => (
                            <div key={branchName} className="mb-14">
                                <div className="mb-6 border-b-2 border-indigo-100 pb-3 flex items-center justify-between">
                                    <h4 className="text-2xl font-bold text-gray-800">{branchName}</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {groupedMembers[branchName].map((member) => (
                                        <div key={member.id} draggable onDragStart={(e) => handleDragStart(e, member.id)} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, member.id)}
                                            className="group relative flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-indigo-300 cursor-grab active:cursor-grabbing">
                                            
                                            {/* Drag Handle Icon */}
                                            <div className="absolute top-4 left-4 text-gray-300 group-hover:text-indigo-400 transition-colors pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                                                </svg>
                                            </div>

                                            {/* Edit Icon */}
                                            <button 
                                                onClick={() => openModal(member)} 
                                                className="absolute top-4 right-4 text-gray-300 group-hover:text-indigo-600 transition-colors z-20 bg-white/70 p-1.5 rounded-full" 
                                                title="Edit Member"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                  <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.199z" />
                                                </svg>
                                            </button>

                                            <div className="relative z-10 h-28 w-28 shrink-0 overflow-hidden rounded-full bg-gray-100 border-4 border-white shadow-md mb-4 pointer-events-none group-hover:border-indigo-100 transition-colors">
                                                {member.image_path ? (
                                                    <img src={`/storage/${member.image_path}`} alt={member.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <svg className="h-full w-full text-gray-300 p-6 bg-gray-50" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="relative z-10 text-center w-full pointer-events-none">
                                                <h4 className="text-lg font-bold text-gray-900 truncate px-2 group-hover:text-indigo-900 transition-colors">{member.name}</h4>
                                                <div className="mt-1.5 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 uppercase tracking-wider group-hover:bg-indigo-100 transition-colors">
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
                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            {editingMember ? 'Edit Team Member' : 'Add New Member'}
                        </h2>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <form onSubmit={submit} className="space-y-4">
                        
                        {editingMember && editingMember.image_path && (
                            <div className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg bg-gray-50 mb-3">
                                <span className="text-xs font-semibold text-gray-500 mb-2">Current Photo</span>
                                <img src={`/storage/${editingMember.image_path}`} className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md" />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Display Name</label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. Dr. Jane Doe" required />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Position / Title</label>
                            <input type="text" value={data.position} onChange={(e) => setData('position', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. Chief Veterinarian" required />
                            {errors.position && <p className="mt-1 text-xs text-red-500">{errors.position}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Department / Branch</label>
                            <select value={data.branch} onChange={(e) => setData('branch', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required>
                                {CLINIC_BRANCHES.map((branch) => (<option key={branch} value={branch}>{branch}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                {editingMember ? 'Replace Photo (Optional)' : 'Upload Photo (Optional)'}
                            </label>
                            <input type="file" onChange={(e) => setData('image', e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors" accept="image/*" />
                            {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
                        </div>

                        <div className={`mt-8 flex gap-3 pt-4 border-t ${editingMember ? 'justify-between' : 'justify-end'}`}>
                            
                            {editingMember && (
                                <button
                                    type="button"
                                    onClick={() => deleteMemberAction(editingMember.id)}
                                    disabled={processing}
                                    className="flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 shadow-inner hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478 48.567 48.567 0 01-3.622-.472v13.064c0 1.725-1.4 3.125-3.125 3.125H10.875c-1.725 0-3.125-1.4-3.125-3.125V6.16c-1.248.06-2.492.16-3.722.299a.75.75 0 01-.256-1.478 48.84 48.84 0 013.878-.512V4.478c0-1.326 1.057-2.382 2.382-2.382h2.236c1.326 0 2.382 1.056 2.382 2.382zm-9.431 3.524a.75.75 0 018.802 0 .75.75 0 01-.65 1.35 1.125 1.125 0 00-.918 0 .75.75 0 01-.65-1.35zM9 10.875a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v6.75a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-6.75z" clipRule="evenodd" /></svg>
                                    DELETE MEMBER
                                </button>
                            )}

                            <div className="flex gap-3">
                                <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-indigo-500 disabled:opacity-50 transition-colors">
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