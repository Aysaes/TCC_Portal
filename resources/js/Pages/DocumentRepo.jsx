import ConfirmModal from '@/Components/ConfirmModal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { getDocumentSidebarLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Documents({ auth, documents = [], categories = [], activeCategory }) {

    const isAdmin = auth.user?.role?.name === 'admin';

    const sidebarLinks = getDocumentSidebarLinks(categories, activeCategory);

    // Mini Modal for New Category
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const { data: catData, setData: setCatData, post: postCategory, processing: catProcessing, reset: resetCat, clearErrors: clearCatErrors } = useForm({ name: '' });

    const closeCategoryModal = () => { setIsCategoryModalOpen(false); resetCat(); clearCatErrors(); };
    const submitCategory = (e) => {
        e.preventDefault();
        postCategory(route('admin.documents.category.store'), { preserveScroll: true, onSuccess: () => closeCategoryModal() });
    };

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const { data: uploadData, setData: setUploadData, post: postDocument, processing: uploadProcessing, errors: uploadErrors, reset: resetUpload, clearErrors: clearUploadErrors } = useForm({
        title: '', category: activeCategory !== 'Overview' ? activeCategory : '', description: '', file: null
    });

    const closeUploadModal = () => { setIsUploadModalOpen(false); resetUpload(); clearUploadErrors(); };
    const submitDocument = (e) => {
        e.preventDefault();
        // Force Inertia to send as multipart/form-data for the file
        postDocument(route('admin.documents.store'), { 
            preserveScroll: true, 
            forceFormData: true,
            onSuccess: () => closeUploadModal() 
        });
    };

    // --- 5. DELETE CONFIRMATION STATE ---
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);

    // This opens the modal and remembers which document they clicked
    const triggerDelete = (doc) => {
        setDocumentToDelete(doc);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setDocumentToDelete(null);
    };

    // This actually fires the delete request to Laravel
    const executeDelete = () => {
        if (!documentToDelete) return;
        
        router.delete(route('admin.documents.destroy', documentToDelete.id), { 
            preserveScroll: true,
            onSuccess: () => closeConfirmModal()
        });
    };

    return (
        <SidebarLayout activeModule="Document Repository" sidebarLinks={sidebarLinks}>
            <Head title={`Documents - ${activeCategory}`} />

            {/* HEADER */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">{activeCategory}</h1>
                
                {/* 👇 The buttons are hidden from standard users! */}
                {isAdmin && (
                    <div className="flex gap-3">
                        <SecondaryButton onClick={() => setIsCategoryModalOpen(true)}>
                            + Add Category
                        </SecondaryButton>
                        <PrimaryButton onClick={() => setIsUploadModalOpen(true)}>
                            Upload Document
                        </PrimaryButton>
                    </div>
                )}
            </div>

            {/* DOCUMENT GRID */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {documents.length === 0 ? (
                    <div className="col-span-full rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm border border-gray-100">
                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        No documents found in this category.
                    </div>
                ) : (
                    documents.map((doc) => (
                        <div key={doc.id} className="flex flex-col rounded-lg bg-white p-5 shadow-sm border border-gray-100 transition hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded bg-red-50 p-2 text-red-600">
                                        {/* Simple PDF/Doc Icon */}
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 line-clamp-1" title={doc.title}>{doc.title}</h3>
                                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{doc.category}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="mt-4 text-sm text-gray-600 line-clamp-2 flex-1">{doc.description || 'No description provided.'}</p>
                            
                            <div className="mt-6 flex items-center justify-between border-t pt-4">
                                <span className="text-xs text-gray-400">Uploaded {new Date(doc.created_at).toLocaleDateString()}</span>
                                <div className="flex gap-3">
                                    <a 
                                        href={route('documents.show', [doc.id, `${doc.title.replace(/[^a-zA-Z0-9-_\.]/g, '_')}.pdf`])} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        View
                                    </a>
                                    {isAdmin && (
                                        <button 
                                            onClick={() => triggerDelete(doc)} // 👈 Updated!
                                            className="text-sm font-medium text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- ADD CATEGORY MODAL --- */}
            <Modal show={isCategoryModalOpen} onClose={closeCategoryModal} maxWidth="sm">
                <form onSubmit={submitCategory} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add Document Category</h2>
                    <div>
                        <InputLabel htmlFor="name" value="Category Name (e.g. Handbook)" />
                        <TextInput id="name" className="mt-1 block w-full" value={catData.name} onChange={(e) => setCatData('name', e.target.value)} required />
                        <InputError message={clearCatErrors?.name} className="mt-2" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={closeCategoryModal}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={catProcessing}>Save Category</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* --- UPLOAD DOCUMENT MODAL --- */}
            <Modal show={isUploadModalOpen} onClose={closeUploadModal} maxWidth="md">
                <form onSubmit={submitDocument} className="p-6 space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Upload New Document</h2>
                    
                    <div>
                        <InputLabel htmlFor="title" value="Document Title" />
                        <TextInput id="title" className="mt-1 block w-full" value={uploadData.title} onChange={(e) => setUploadData('title', e.target.value)} required />
                        <InputError message={uploadErrors.title} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="category" value="Category" />
                        <select 
                            id="category" 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                            value={uploadData.category} 
                            onChange={(e) => setUploadData('category', e.target.value)} 
                            required
                        >
                            <option value="" disabled>Select a category...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <InputError message={uploadErrors.category} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="description" value="Short Description (Optional)" />
                        <textarea 
                            id="description" 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                            rows="2"
                            value={uploadData.description} 
                            onChange={(e) => setUploadData('description', e.target.value)} 
                        />
                        <InputError message={uploadErrors.description} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="file" value="Select File (PDF, DOCX, XLSX)" />
                        {/* 👇 Notice how we handle the file input array here */}
                        <input 
                            type="file" 
                            id="file" 
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                            onChange={(e) => setUploadData('file', e.target.files[0])} 
                            required 
                        />
                        <InputError message={uploadErrors.file} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton type="button" onClick={closeUploadModal}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={uploadProcessing}>Upload File</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* --- CONFIRM DELETE MODAL --- */}
            <ConfirmModal 
                show={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={executeDelete}
                title="Delete Document"
                message={`Are you sure you want to delete the document "${documentToDelete?.title}"?\n\nThis will permanently remove the file from the server.`}
                confirmText="Delete Document"
            />

        </SidebarLayout>
    );
}