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

export default function CompanyContent({ auth, contents = [] }) {
    const adminLinks = getAdminLinks();

    // --- GLOBAL CONFIRMATION MODAL (For Deletes) ---
    const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, title: '', message: '', confirmText: '', confirmColor: '', onConfirm: () => {} 
    });
    const closeConfirmModal = () => setConfirmDialog({ ...confirmDialog, isOpen: false });

    const confirmDeleteContent = (content) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Content',
            message: `Are you sure you want to delete this ${content.type}? \n\nThe text and its image will be permanently removed.`,
            confirmText: 'Delete',
            confirmColor: 'bg-red-600 hover:bg-red-500',
            onConfirm: () => {
                router.delete(route('admin.company-content.destroy', content.id), {
                    preserveScroll: true,
                    onSuccess: () => closeConfirmModal(),
                });
            }
        });
    };

    // --- ADD CONTENT LOGIC ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { data: addData, setData: setAddData, post: postContent, processing: addProcessing, errors: addErrors, clearErrors: clearAddErrors, reset: resetAdd } = useForm({
        type: 'mission',
        title: '',
        content: '',
        image: null,
    });

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        clearAddErrors();
        resetAdd();
    };

    const submitAdd = (e) => {
        e.preventDefault();
        postContent(route('admin.company-content.store'), {
            preserveScroll: true,
            onSuccess: () => closeAddModal(),
        });
    };

    // --- EDIT CONTENT LOGIC ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { data: editData, setData: setEditData, post: updateContent, processing: editProcessing, errors: editErrors, clearErrors: clearEditErrors, reset: resetEdit } = useForm({
        _method: 'put', // Required by Laravel to process file uploads on an update
        type: 'mission',
        title: '',
        content: '',
        image: null,
    });

    const openEditModal = (contentItem) => {
        setEditingId(contentItem.id);
        setEditData({
            _method: 'put',
            type: contentItem.type,
            title: contentItem.title || '',
            content: contentItem.content || '',
            image: null, // Keep null unless they upload a new one
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        clearEditErrors();
        resetEdit();
        setEditingId(null);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        // We use post() here instead of put() because of the _method: 'put' spoofing above
        updateContent(route('admin.company-content.update', editingId), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    return (
        <SidebarLayout
            activeModule="Company Content"
            sidebarLinks={adminLinks}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Company Content Management</h2>}
        >
            <Head title="Company Content" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Header & Add Button */}
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-gray-600">Manage the Mission, Vision, and core identity text for the clinic.</p>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-gray-700"
                        >
                            + Add Content
                        </button>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {contents.length === 0 ? (
                            <div className="col-span-full rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm">
                                No content found. Click "+ Add Content" to create your first Mission or Vision statement.
                            </div>
                        ) : (
                            contents.map((item) => (
                                <div key={item.id} className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
                                    {/* Image Preview Area */}
                                    <div className="h-48 w-full bg-gray-100 relative">
                                        {item.image_path ? (
                                            <img src={`/storage/${item.image_path}`} alt={item.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-400 italic">No Image</div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded capitalize">
                                            {item.type}
                                        </div>
                                    </div>
                                    
                                    {/* Text Area */}
                                    <div className="flex flex-1 flex-col p-4">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title || 'Untitled'}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1 whitespace-pre-line">
                                            {item.content}
                                        </p>
                                        
                                        {/* Actions */}
                                        <div className="flex justify-end gap-3 border-t pt-3 mt-auto">
                                            <button onClick={() => openEditModal(item)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Edit</button>
                                            <button onClick={() => confirmDeleteContent(item)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>

            {/* --- ADD MODAL --- */}
            <Modal show={isAddModalOpen} onClose={closeAddModal} maxWidth="xl">
                <form onSubmit={submitAdd} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Add New Content</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="add_type" value="Content Type" />
                            <select id="add_type" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={addData.type} onChange={(e) => setAddData('type', e.target.value)} required>
                                <option value="mission">Mission</option>
                                <option value="vision">Vision</option>
                            </select>
                            <InputError message={addErrors.type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="add_title" value="Display Title" />
                            <TextInput id="add_title" className="mt-1 block w-full" value={addData.title} onChange={(e) => setAddData('title', e.target.value)} placeholder="e.g. Our Core Mission" />
                            <InputError message={addErrors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="add_content" value="Paragraph Text" />
                            <textarea id="add_content" rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={addData.content} onChange={(e) => setAddData('content', e.target.value)} required />
                            <InputError message={addErrors.content} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="add_image" value="Upload Image (Optional)" />
                            <input id="add_image" type="file" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={(e) => setAddData('image', e.target.files[0])} />
                            <InputError message={addErrors.image} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeAddModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={addProcessing}>Save Content</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* --- EDIT MODAL --- */}
            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="xl">
                <form onSubmit={submitEdit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Edit Content</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_type" value="Content Type" />
                            <select id="edit_type" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={editData.type} onChange={(e) => setEditData('type', e.target.value)} required>
                                <option value="mission">Mission</option>
                                <option value="vision">Vision</option>
                            </select>
                            <InputError message={editErrors.type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_title" value="Display Title" />
                            <TextInput id="edit_title" className="mt-1 block w-full" value={editData.title} onChange={(e) => setEditData('title', e.target.value)} />
                            <InputError message={editErrors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_content" value="Paragraph Text" />
                            <textarea id="edit_content" rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={editData.content} onChange={(e) => setEditData('content', e.target.value)} required />
                            <InputError message={editErrors.content} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_image" value="Replace Image (Leave empty to keep current image)" />
                            <input id="edit_image" type="file" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={(e) => setEditData('image', e.target.files[0])} />
                            <InputError message={editErrors.image} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeEditModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={editProcessing}>Update Content</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Global Delete Confirmation Modal */}
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