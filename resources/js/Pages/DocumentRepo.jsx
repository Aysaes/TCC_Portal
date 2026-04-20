import ConfirmModal from '@/Components/ConfirmModal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { getDocumentSidebarLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { formatAppDate } from '@/Utils/date';
import { useState } from 'react';

export default function Documents({ auth, documents = [], categories = [], activeCategory }) {

    const isAdmin = auth.user?.role?.name === 'admin';
    const sidebarLinks = getDocumentSidebarLinks(categories, activeCategory);
    const { system } = usePage().props;

    const [viewingDoc, setViewingDoc] = useState(null);

    // Office Viewer for Word/Excel files
    const getViewerUrl = (doc) => {
        const appUrl = window.location.origin; 
        const fullFileUrl = `${appUrl}/storage/${doc.file_path}`; 
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullFileUrl)}`;
    };

    // Google Docs Viewer for PDFs (Mobile & Desktop)
    const getPdfViewerUrl = (doc) => {
        const appUrl = window.location.origin; 
        const fullFileUrl = `${appUrl}/storage/${doc.file_path}`; 
        return `https://docs.google.com/gview?url=${encodeURIComponent(fullFileUrl)}&embedded=true&rm=minimal`;
    };

    // --- Manage Categories Modal State ---
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const { data: catData, setData: setCatData, post: postCategory, processing: catProcessing, reset: resetCat, clearErrors: clearCatErrors } = useForm({ name: '' });

    const closeCategoryModal = () => { setIsCategoryModalOpen(false); resetCat(); clearCatErrors(); };
    
    const submitCategory = (e) => {
        e.preventDefault();
        postCategory(route('admin.documents.category.store'), { 
            preserveScroll: true, 
            onSuccess: () => {
                resetCat();
            } 
        });
    };

    const deleteCategory = (categoryId, categoryName) => {
        if (confirm(`Are you sure you want to delete the "${categoryName}" category?`)) {
            router.delete(route('admin.documents.category.destroy', categoryId), {
                preserveScroll: true,
            });
        }
    };

    // --- Upload Document Modal State ---
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

    // --- Delete Document Modal State ---
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

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold leading-tight text-gray-900">{activeCategory}</h1>
                
                {isAdmin && (
                    <div className="grid w-full grid-cols-1 gap-4 sm:w-auto sm:grid-cols-2 sm:min-w-[520px]">
                        <button 
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="inline-flex min-h-[64px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center text-base font-bold uppercase tracking-[0.1em] text-slate-700 shadow-md transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-lg"
                            title="Manage Categories"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 shrink-0 text-indigo-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h10.5" />
                            </svg>
                            Manage Categories
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsUploadModalOpen(true)}
                            className="inline-flex min-h-[64px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center text-base font-bold uppercase tracking-[0.1em] text-slate-700 shadow-md transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 shrink-0 text-indigo-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V6.75m0 0L8.25 10.5M12 6.75l3.75 3.75M4.5 17.25v.75A1.5 1.5 0 006 19.5h12a1.5 1.5 0 001.5-1.5v-.75" />
                            </svg>
                            Upload Document
                        </button>
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
                                <span className="text-xs text-gray-400">Uploaded {formatAppDate(doc.created_at, system?.timezone)}</span>
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

            {/* --- MANAGE CATEGORY MODAL --- */}
            <Modal show={isCategoryModalOpen} onClose={closeCategoryModal} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <h2 className="text-lg font-bold text-gray-900">Manage Categories</h2>
                        <button onClick={closeCategoryModal} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>

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

            {/* --- DELETE CONFIRMATION MODAL --- */}
            <ConfirmModal show={isConfirmModalOpen} onClose={closeConfirmModal} onConfirm={executeDelete} title="Delete Document" message={`Are you sure you want to delete the document "${documentToDelete?.title}"?\n\nThis will permanently remove the file from the server.`} confirmText="Delete Document" />

            {/* --- VIEWER MODAL (WITH ANTI-DOWNLOAD & HIDDEN TOOLBAR) --- */}
            <Modal show={!!viewingDoc} onClose={() => setViewingDoc(null)} maxWidth="7xl">
                {viewingDoc && (
                    <div className="flex flex-col bg-white overflow-hidden h-[95vh] sm:h-[90vh]">
                        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 bg-gray-50 shrink-0 gap-3 sm:gap-4 relative z-20 shadow-sm">
                            <h2 
                                className="text-base sm:text-lg font-bold text-gray-800 truncate flex-1" 
                                title={viewingDoc.title}
                            >
                                {viewingDoc.title}
                            </h2>

                            <button 
                                onClick={() => setViewingDoc(null)} 
                                className="flex items-center gap-1.5 rounded-lg bg-gray-200/80 px-3.5 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-red-100 hover:text-red-700 shrink-0"
                            >
                                ✕ <span className="hidden sm:inline">Close</span>
                            </button>
                        </div>

                        {/* Localhost Warning */}
                        {(window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') && (
                            <div className="bg-yellow-50 p-2 sm:p-3 text-xs sm:text-sm text-yellow-800 border-b border-yellow-200 shrink-0 text-center z-20">
                                <strong>Note:</strong> You are on localhost. External viewers cannot access local files. 
                                <br className="hidden sm:block"/>If the document doesn't load below, it is because your site is not live yet!
                            </div>
                        )}

                        {/* Document iFrame Area */}
                        <div 
                            className="flex-1 w-full bg-[#525659] relative overflow-hidden select-none"
                            onContextMenu={(e) => e.preventDefault()} // Disables right-click
                        >
                            {viewingDoc.file_path?.endsWith('.pdf') ? (
                                <iframe 
                                    src={
                                        window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
                                            ? `/storage/${viewingDoc.file_path}#toolbar=0&navpanes=0&scrollbar=0`
                                            : getPdfViewerUrl(viewingDoc)
                                    } 
                                    className={`absolute left-0 w-full border-0 pointer-events-auto ${
                                        window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
                                            ? 'top-0 h-full' 
                                            : '-top-14 h-[calc(100%+3.5rem)]' 
                                    }`}
                                    title="PDF Viewer"
                                />
                            ) : (
                                <iframe 
                                    src={getViewerUrl(viewingDoc)} 
                                    className="absolute inset-0 w-full h-full border-0 bg-white pointer-events-auto" 
                                    title="Office Viewer"
                                />
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </SidebarLayout>
    );
}