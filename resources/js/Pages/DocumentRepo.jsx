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

    const [viewingDoc, setViewingDoc] = useState(null);

    const getViewerUrl = (doc) => {
        const appUrl = window.location.origin; 
        const fullFileUrl = `${appUrl}/storage/${doc.file_path}`; 
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullFileUrl)}`;
    };

    // --- UPDATED: Manage Categories Modal State ---
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const { data: catData, setData: setCatData, post: postCategory, processing: catProcessing, reset: resetCat, clearErrors: clearCatErrors } = useForm({ name: '' });

    const closeCategoryModal = () => { setIsCategoryModalOpen(false); resetCat(); clearCatErrors(); };
    
    const submitCategory = (e) => {
        e.preventDefault();
        postCategory(route('admin.documents.category.store'), { 
            preserveScroll: true, 
            onSuccess: () => {
                resetCat();
                // We don't close the modal anymore so they can see it added to the list immediately!
            } 
        });
    };

    // --- NEW: Function to delete a category ---
    const deleteCategory = (categoryId, categoryName) => {
        if (confirm(`Are you sure you want to delete the "${categoryName}" category?`)) {
            router.delete(route('admin.documents.category.destroy', categoryId), {
                preserveScroll: true,
            });
        }
    };

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const { data: uploadData, setData: setUploadData, post: postDocument, processing: uploadProcessing, errors: uploadErrors, reset: resetUpload, clearErrors: clearUploadErrors } = useForm({
        title: '', category: activeCategory !== 'Overview' ? activeCategory : '', description: '', file: null
    });

    const closeUploadModal = () => { setIsUploadModalOpen(false); resetUpload(); clearUploadErrors(); };
    const submitDocument = (e) => {
        e.preventDefault();
        postDocument(route('admin.documents.store'), { 
            preserveScroll: true, 
            forceFormData: true,
            onSuccess: () => closeUploadModal() 
        });
    };

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);

    const triggerDelete = (doc) => {
        setDocumentToDelete(doc);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setDocumentToDelete(null);
    };

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

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">{activeCategory}</h1>
                
                {isAdmin && (
                    <div className="flex items-center gap-3">
                        
                        {/* --- NEW: Gear Icon for Manage Categories --- */}
                        <button 
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="flex items-center justify-center rounded-lg border border-transparent p-2 text-black transition-colors hover:bg-gray-100 hover:text-black"
                            title="Manage Categories"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        <PrimaryButton onClick={() => setIsUploadModalOpen(true)}>
                            Upload Document
                        </PrimaryButton>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {documents.length === 0 ? (
                    <div className="col-span-full rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm border border-gray-100">
                        <svg className="mx-auto mb-3 h-12 w-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        No documents found in this category.
                    </div>
                ) : (
                    documents.map((doc) => (
                        <div key={doc.id} className="flex flex-col rounded-lg bg-white p-5 shadow-sm border border-gray-100 transition hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded bg-red-50 p-2 text-black">
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
                                    <button 
                                        onClick={() => setViewingDoc(doc)}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        View
                                    </button>
                                    {isAdmin && (
                                        <button 
                                            onClick={() => triggerDelete(doc)}
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

            {/* --- UPDATED: MANAGE CATEGORY MODAL --- */}
            <Modal show={isCategoryModalOpen} onClose={closeCategoryModal} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <h2 className="text-lg font-bold text-gray-900">Manage Categories</h2>
                        <button onClick={closeCategoryModal} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    {/* Current Categories List */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Current Categories</h3>
                        {categories.length === 0 ? (
                            <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded border border-gray-100">No custom categories yet.</p>
                        ) : (
                            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {categories.map(cat => (
                                    <li key={cat.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                                        <button 
                                            onClick={() => deleteCategory(cat.id, cat.name)}
                                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Add New Category Form */}
                    <form onSubmit={submitCategory} className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <h3 className="text-sm font-semibold text-indigo-900 mb-3">Create New Category</h3>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <TextInput 
                                    id="name" 
                                    className="block w-full h-10 text-sm" 
                                    placeholder="e.g. Employee Handbooks"
                                    value={catData.name} 
                                    onChange={(e) => setCatData('name', e.target.value)} 
                                    required 
                                />
                                <InputError message={clearCatErrors?.name} className="mt-1" />
                            </div>
                            <button 
                                type="submit" 
                                disabled={catProcessing}
                                className="h-10 px-4 bg-indigo-600 text-white text-sm font-bold rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
                            >
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

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
                        <select id="category" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={uploadData.category} onChange={(e) => setUploadData('category', e.target.value)} required>
                            <option value="" disabled>Select a category...</option>
                            {categories.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                        </select>
                        <InputError message={uploadErrors.category} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="description" value="Short Description (Optional)" />
                        <textarea id="description" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" rows="2" value={uploadData.description} onChange={(e) => setUploadData('description', e.target.value)} />
                        <InputError message={uploadErrors.description} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="file" value="Select File (PDF, DOCX, XLSX)" />
                        <input type="file" id="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={(e) => setUploadData('file', e.target.files[0])} required />
                        <InputError message={uploadErrors.file} className="mt-2" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton type="button" onClick={closeUploadModal}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={uploadProcessing}>Upload File</PrimaryButton>
                    </div>
                </form>
            </Modal>

            <ConfirmModal show={isConfirmModalOpen} onClose={closeConfirmModal} onConfirm={executeDelete} title="Delete Document" message={`Are you sure you want to delete the document "${documentToDelete?.title}"?\n\nThis will permanently remove the file from the server.`} confirmText="Delete Document" />

            <Modal show={!!viewingDoc} onClose={() => setViewingDoc(null)} maxWidth="4xl">
                {viewingDoc && (
                    <div className="flex flex-col bg-white overflow-hidden h-[85vh]">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 shrink-0">
                            <h2 className="text-lg font-bold text-gray-800">{viewingDoc.title}</h2>
                            <button onClick={() => setViewingDoc(null)} className="text-gray-500 hover:text-red-600 font-bold">✕ Close</button>
                        </div>
                        {window.location.hostname === '127.0.0.1' && (
                            <div className="bg-yellow-50 p-3 text-sm text-yellow-800 border-b border-yellow-200 shrink-0 text-center">
                                <strong>Note:</strong> You are on localhost (127.0.0.1). Microsoft Office Viewer cannot access local files. 
                                <br/>If the document doesn't load below, it is because your site is not live yet!
                            </div>
                        )}
                        <div className="flex-1 w-full bg-gray-100 relative">
                            {viewingDoc.file_path?.endsWith('.pdf') ? (
                                <iframe src={`/storage/${viewingDoc.file_path}`} className="absolute inset-0 w-full h-full" title="PDF Viewer"></iframe>
                            ) : (
                                <iframe src={getViewerUrl(viewingDoc)} className="absolute inset-0 w-full h-full" title="Office Viewer"></iframe>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </SidebarLayout>
    );
}
