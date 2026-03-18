import ConfirmModal from '@/Components/ConfirmModal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { getAdminLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Announcements({ auth, announcements = [], branches = [], priorities = [] }) {
    const adminLinks = getAdminLinks();

    // --- SAFE COLOR CONVERTER ---
    const getPastelStyle = (hexColor) => {
        const fallback = '#4F46E5'; // Default indigo
        let hex = (hexColor || fallback).replace('#', '');
        
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        
        const r = parseInt(hex.substring(0, 2), 16) || 79;
        const g = parseInt(hex.substring(2, 4), 16) || 70;
        const b = parseInt(hex.substring(4, 6), 16) || 229;

        return {
            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`, 
            color: `#${hex}`,                                
            borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`       
        };
    };

    // --- GLOBAL CONFIRMATION MODAL ---
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', confirmText: '', confirmColor: '', onConfirm: () => {} });
    const closeConfirmModal = () => setConfirmDialog({ ...confirmDialog, isOpen: false });

    const confirmDelete = (announcement) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Announcement',
            message: `Are you sure you want to delete "${announcement.title}"? \n\nThis will remove it from all branch dashboards immediately.`,
            confirmText: 'Delete',
            confirmColor: 'bg-red-600 hover:bg-red-500',
            onConfirm: () => {
                router.delete(route('admin.announcements.destroy', announcement.id), {
                    preserveScroll: true,
                    onSuccess: () => closeConfirmModal(),
                });
            }
        });
    };

    // --- CHECKBOX HELPER ---
    const handleBranchToggle = (branchId, currentIds, setData) => {
        if (currentIds.includes(branchId)) {
            setData('branch_ids', currentIds.filter(id => id !== branchId));
        } else {
            setData('branch_ids', [...currentIds, branchId]);
        }
    };

    // --- MINI-MODAL FOR NEW PRIORITY ---
    const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
    const { data: priorityData, setData: setPriorityData, post: postPriority, processing: priorityProcessing, reset: resetPriority, clearErrors: clearPriorityErrors } = useForm({
        name: '', color: '#4F46E5'
    });

    const closePriorityModal = () => { setIsPriorityModalOpen(false); resetPriority(); clearPriorityErrors(); };
    const submitPriority = (e) => {
        e.preventDefault();
        postPriority(route('admin.announcements.priority.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closePriorityModal();
                // Auto-select the newly created priority in the main form
                setAddData({ ...addData, priority: priorityData.name, priority_color: priorityData.color });
            }
        });
    };

    // --- ADD LOGIC ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { data: addData, setData: setAddData, post: postData, processing: addProcessing, errors: addErrors, clearErrors: clearAddErrors, reset: resetAdd } = useForm({
        title: '', author: '', content: '', priority_level_id: '', branch_ids: [], image: null,
    });

    const closeAddModal = () => { setIsAddModalOpen(false); clearAddErrors(); resetAdd(); };
    const submitAdd = (e) => {
        e.preventDefault();
        postData(route('admin.announcements.store'), { preserveScroll: true, onSuccess: () => closeAddModal() });
    };

    // --- EDIT LOGIC ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { data: editData, setData: setEditData, post: updateData, processing: editProcessing, errors: editErrors, clearErrors: clearEditErrors, reset: resetEdit } = useForm({
        _method: 'put', title: '', author: '', content: '', priority_level_id: '', branch_ids: [], image: null,
    });

    const openEditModal = (item) => {
        setEditingId(item.id);
        setEditData({
            _method: 'put',
            title: item.title,
            author: item.author,
            content: item.content,
            priority_level_id: item.priority_level_id || '',
            branch_ids: item.branches.map(b => b.id), // Extract just the IDs from the relationship
            image: null,
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => { setIsEditModalOpen(false); clearEditErrors(); resetEdit(); setEditingId(null); };
    const submitEdit = (e) => {
        e.preventDefault();
        updateData(route('admin.announcements.update', editingId), { preserveScroll: true, onSuccess: () => closeEditModal() });
    };



    return (
        <SidebarLayout activeModule="Admin" sidebarLinks={adminLinks} header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Announcements</h2>}>
            <Head title="Announcements & Notices" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-gray-600">Broadcast notices and updates to specific clinic branches.</p>
                        <button onClick={() => setIsAddModalOpen(true)} className="rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-gray-700">
                            + Post Announcement
                        </button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {announcements.length === 0 ? (
                            <div className="col-span-full rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm">No announcements posted yet.</div>
                        ) : (
                            announcements.map((item) => {
                               
                                const priorityName = item.priority_level?.name || 'Notice';
                                const badgeColor = item.priority_level?.color || '#4F46E5';

                               
                                return (
                                    <div key={item.id} className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100 relative">
                                        
                                        {/* Priority Badge */}
                                        <div 
                                            className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold uppercase z-10 shadow-sm border"
                                            style={getPastelStyle(badgeColor)}
                                        >
                                            {priorityName}
                                        </div>

                                        {/* Image Placeholder */}
                                        <div className="h-40 w-full bg-gray-100">
                                            {item.image_path ? (
                                                <img src={`/storage/${item.image_path}`} alt={item.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-gray-400 text-sm">No Attachment</div>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-1 flex-col p-5">
                                            <h3 className="text-lg font-bold text-gray-900 pr-16">{item.title}</h3>
                                            <p className="text-xs text-gray-500 mb-3">By {item.author} • {new Date(item.created_at).toLocaleDateString()}</p>
                                            
                                            {/* Branch Tags */}
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {item.branches.map(branch => (
                                                    <span key={branch.id} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full font-semibold">
                                                        {branch.name}
                                                    </span>
                                                ))}
                                            </div>

                                            <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1 whitespace-pre-line">{item.content}</p>
                                            
                                            <div className="flex justify-end gap-3 border-t pt-3 mt-auto">
                                                <button onClick={() => openEditModal(item)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Edit</button>
                                                <button onClick={() => confirmDelete(item)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ); 
                               
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* --- ADD MODAL --- */}
            <Modal show={isAddModalOpen} onClose={closeAddModal} maxWidth="2xl">
                <form onSubmit={submitAdd} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Post New Announcement</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="add_title" value="Title" />
                            <TextInput id="add_title" className="mt-1 block w-full" value={addData.title} onChange={(e) => setAddData('title', e.target.value)} required />
                            <InputError message={addErrors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="add_author" value="Author (Posted By)" />
                            <TextInput id="add_author" className="mt-1 block w-full" value={addData.author} onChange={(e) => setAddData('author', e.target.value)} placeholder="e.g. HR Dept or Dr. Smith" required />
                            <InputError message={addErrors.author} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                                 <InputLabel htmlFor="add_priority" value="Priority Level" />
                            <div className="mt-1 flex gap-2">
                          <select 
            id="add_priority" 
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
            value={addData.priority_level_id} 
            onChange={(e) => setAddData('priority_level_id', e.target.value)} 
            required
        >
            <option value="" disabled>Select a priority...</option>
            {priorities.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option> 
            ))}
        </select>

                                      <button 
                type="button" 
                onClick={() => setIsPriorityModalOpen(true)}
                className="whitespace-nowrap rounded-md bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-200"
            >
                + Add Priority
            </button>
        </div>
        <InputError message={addErrors.priority} className="mt-2" />
    </div>

                        <div className="md:col-span-2">
                            <InputLabel value="Target Branches (Select at least one)" />
                            <div className="mt-2 flex flex-wrap gap-4 p-3 border rounded-md bg-gray-50">
                                {branches.map(branch => (
                                    <label key={branch.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" checked={addData.branch_ids.includes(branch.id)} onChange={() => handleBranchToggle(branch.id, addData.branch_ids, setAddData)} />
                                        <span className="text-sm text-gray-700">{branch.name}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={addErrors.branch_ids} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="add_content" value="Announcement Details" />
                            <textarea id="add_content" rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={addData.content} onChange={(e) => setAddData('content', e.target.value)} required />
                            <InputError message={addErrors.content} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="add_image" value="Attachment / Flyer (Optional)" />
                            <input id="add_image" type="file" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={(e) => setAddData('image', e.target.files[0])} />
                            <InputError message={addErrors.image} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeAddModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={addProcessing}>Post Announcement</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* --- EDIT MODAL --- */}
            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="2xl">
                <form onSubmit={submitEdit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Edit Announcement</h2>
                    {/* ... Same fields as Add form, just mapped to editData ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="edit_title" value="Title" />
                            <TextInput id="edit_title" className="mt-1 block w-full" value={editData.title} onChange={(e) => setEditData('title', e.target.value)} required />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_author" value="Author" />
                            <TextInput id="edit_author" className="mt-1 block w-full" value={editData.author} onChange={(e) => setEditData('author', e.target.value)} required />
                        </div>

                        <div className="md:col-span-2">
        <InputLabel htmlFor="edit_priority" value="Priority Level" />
        <div className="mt-1 flex gap-2">
            <select 
            id="edit_priority" 
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
            value={editData.priority_level_id} 
            onChange={(e) => setEditData('priority_level_id', e.target.value)} 
            required
        >
            <option value="" disabled>Select a priority...</option>
            {priorities.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option> 
            ))}
        </select>
            
            <button 
                type="button" 
                onClick={() => setIsPriorityModalOpen(true)}
                className="whitespace-nowrap rounded-md bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-200"
            >
                + Add Priority
            </button>
        </div>
        <InputError message={addErrors.priority} className="mt-2" />
    </div>

                        <div className="md:col-span-2">
                            <InputLabel value="Target Branches" />
                            <div className="mt-2 flex flex-wrap gap-4 p-3 border rounded-md bg-gray-50">
                                {branches.map(branch => (
                                    <label key={branch.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" checked={editData.branch_ids.includes(branch.id)} onChange={() => handleBranchToggle(branch.id, editData.branch_ids, setEditData)} />
                                        <span className="text-sm text-gray-700">{branch.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="edit_content" value="Announcement Details" />
                            <textarea id="edit_content" rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={editData.content} onChange={(e) => setEditData('content', e.target.value)} required />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="edit_image" value="Replace Attachment (Optional)" />
                            <input id="edit_image" type="file" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={(e) => setEditData('image', e.target.files[0])} />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeEditModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={editProcessing}>Update Announcement</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* --- ADD NEW PRIORITY MODAL --- */}
            <Modal show={isPriorityModalOpen} onClose={closePriorityModal} maxWidth="sm">
                <form onSubmit={submitPriority} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add Custom Priority</h2>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="new_priority_name" value="Priority Name (e.g. Holiday)" />
                            <TextInput id="new_priority_name" className="mt-1 block w-full" value={priorityData.name} onChange={(e) => setPriorityData('name', e.target.value)} required />
                        </div>
                        <div>
                            <InputLabel htmlFor="new_priority_color" value="Badge Color" />
                            <input id="new_priority_color" type="color" className="mt-1 block w-full h-10 p-1 rounded-md border-gray-300 shadow-sm cursor-pointer" value={priorityData.color} onChange={(e) => setPriorityData('color', e.target.value)} required />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closePriorityModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={priorityProcessing}>Save Priority</PrimaryButton>
                    </div>
                </form>
            </Modal>

            <ConfirmModal show={confirmDialog.isOpen} onClose={closeConfirmModal} title={confirmDialog.title} message={confirmDialog.message} confirmText={confirmDialog.confirmText} confirmColor={confirmDialog.confirmColor} onConfirm={confirmDialog.onConfirm} />
        </SidebarLayout>
    );
}