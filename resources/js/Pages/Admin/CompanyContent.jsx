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
import { useEffect, useMemo, useState } from 'react';

export default function CompanyContent({ auth, contents = [], contentTypes = [] }) {
    const adminLinks = getAdminLinks();

    const normalizedTypeOptions = useMemo(() => {
        return (contentTypes || [])
            .map((type) => {
                if (typeof type === 'string') {
                    return { id: type, name: type };
                }

                return {
                    id: type?.id ?? type?.name,
                    name: typeof type?.name === 'string' ? type.name.trim() : '',
                };
            })
            .filter((type) => type.name)
            .reduce((acc, current) => {
                if (!acc.some((item) => item.name.toLowerCase() === current.name.toLowerCase())) {
                    acc.push(current);
                }
                return acc;
            }, []);
    }, [contentTypes]);

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: '',
        onConfirm: () => {},
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [isTypeOverlayOpen, setIsTypeOverlayOpen] = useState(false);
    const [typeOverlayMode, setTypeOverlayMode] = useState('create'); // create | edit | manage
    const [typeModalTarget, setTypeModalTarget] = useState('add'); // add | edit | manage
    const [editingId, setEditingId] = useState(null);
    const [editingTypeId, setEditingTypeId] = useState(null);

    const {
        data: addData,
        setData: setAddData,
        post: postContent,
        processing: addProcessing,
        errors: addErrors,
        clearErrors: clearAddErrors,
        reset: resetAdd,
    } = useForm({
        type: '',
        title: '',
        content: '',
        image: null,
    });

    const {
        data: editData,
        setData: setEditData,
        post: updateContent,
        processing: editProcessing,
        errors: editErrors,
        clearErrors: clearEditErrors,
        reset: resetEdit,
    } = useForm({
        _method: 'put',
        type: '',
        title: '',
        content: '',
        image: null,
    });

    const {
        data: typeCreateData,
        setData: setTypeCreateData,
        post: postType,
        processing: typeCreateProcessing,
        reset: resetTypeCreate,
        clearErrors: clearTypeCreateErrors,
        errors: typeCreateErrors,
    } = useForm({
        name: '',
    });

    const {
        data: typeEditData,
        setData: setTypeEditData,
        post: updateType,
        processing: typeEditProcessing,
        reset: resetTypeEdit,
        clearErrors: clearTypeEditErrors,
        errors: typeEditErrors,
    } = useForm({
        _method: 'put',
        name: '',
    });

    useEffect(() => {
        if (normalizedTypeOptions.length === 0) return;

        if (isAddModalOpen && !addData.type) {
            setAddData('type', normalizedTypeOptions[0].name);
        }
    }, [normalizedTypeOptions, isAddModalOpen]);

    const closeConfirmModal = () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    };

    const confirmDeleteContent = (content) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Content',
            message: `Are you sure you want to delete this ${content.type}? \n\nThe text and its image will be permanently removed.`,
            confirmText: 'Delete',
            confirmColor: 'bg-red-600 hover:bg-red-500',
            onConfirm: () => {
                router.delete(route('admin.company-content.destroy', [content.id]), {
                    preserveScroll: true,
                    onSuccess: () => closeConfirmModal(),
                });
            },
        });
    };

    const confirmDeleteType = (typeItem) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Content Type',
            message: `Are you sure you want to delete the content type "${typeItem.name}"?\n\nExisting content using this type may be affected.`,
            confirmText: 'Delete',
            confirmColor: 'bg-red-600 hover:bg-red-500',
            onConfirm: () => {
                router.delete(route('admin.company-content.type.destroy', [typeItem.id]), {
                    preserveScroll: true,
                    onSuccess: () => {
                        closeConfirmModal();

                        if (addData.type === typeItem.name) {
                            setAddData('type', '');
                        }

                        if (editData.type === typeItem.name) {
                            setEditData('type', '');
                        }
                    },
                });
            },
        });
    };

    const openAddModal = () => {
        clearAddErrors();
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setIsTypeOverlayOpen(false);
        setTypeOverlayMode('create');
        setTypeModalTarget('add');
        clearAddErrors();
        clearTypeCreateErrors();
        clearTypeEditErrors();
        resetAdd();
        resetTypeCreate();
        resetTypeEdit();
        setEditingTypeId(null);
    };

    const submitAdd = (e) => {
        e.preventDefault();

        postContent(route('admin.company-content.store'), {
            preserveScroll: true,
            onSuccess: () => closeAddModal(),
        });
    };

    const openEditModal = (contentItem) => {
        setEditingId(contentItem.id);
        setEditData({
            _method: 'put',
            type: contentItem.type || '',
            title: contentItem.title || '',
            content: contentItem.content || '',
            image: null,
        });
        clearEditErrors();
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setIsTypeOverlayOpen(false);
        setTypeOverlayMode('create');
        setTypeModalTarget('add');
        clearEditErrors();
        clearTypeCreateErrors();
        clearTypeEditErrors();
        resetEdit();
        resetTypeCreate();
        resetTypeEdit();
        setEditingId(null);
        setEditingTypeId(null);
    };

    const submitEdit = (e) => {
        e.preventDefault();

        updateContent(route('admin.company-content.update', [editingId]), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const openCreateTypeOverlay = (target = 'add') => {
        setTypeModalTarget(target);
        setTypeOverlayMode('create');
        setEditingTypeId(null);
        clearTypeCreateErrors();
        clearTypeEditErrors();
        resetTypeCreate();
        resetTypeEdit();
        setIsTypeOverlayOpen(true);
    };

    const openManageTypesOverlay = (target = 'add') => {
        setTypeModalTarget(target);
        setTypeOverlayMode('manage');
        setEditingTypeId(null);
        clearTypeCreateErrors();
        clearTypeEditErrors();
        resetTypeCreate();
        resetTypeEdit();
        setIsTypeOverlayOpen(true);
    };

    const openEditTypeOverlay = (typeItem, target = 'manage') => {
        setTypeModalTarget(target);
        setTypeOverlayMode('edit');
        setEditingTypeId(typeItem.id);
        clearTypeCreateErrors();
        clearTypeEditErrors();
        setTypeEditData({
            _method: 'put',
            name: typeItem.name,
        });
        setIsTypeOverlayOpen(true);
    };

    const closeTypeOverlay = () => {
        setIsTypeOverlayOpen(false);
        setTypeOverlayMode('create');
        setTypeModalTarget('add');
        setEditingTypeId(null);
        clearTypeCreateErrors();
        clearTypeEditErrors();
        resetTypeCreate();
        resetTypeEdit();
    };

    const applyTypeToTargetForm = (typeName) => {
        if (typeModalTarget === 'edit') {
            setEditData('type', typeName);
        } else {
            setAddData('type', typeName);
        }
    };

    const submitCreateType = (e) => {
        e.preventDefault();

        const trimmedName = typeCreateData.name.trim();
        setTypeCreateData('name', trimmedName);

        postType(route('admin.company-content.type.store'), {
            preserveScroll: true,
            onSuccess: () => {
                applyTypeToTargetForm(trimmedName);
                closeTypeOverlay();
            },
        });
    };

    const submitEditType = (e) => {
        e.preventDefault();

        const trimmedName = typeEditData.name.trim();
        setTypeEditData('name', trimmedName);

        updateType(route('admin.company-content.type.update', [editingTypeId]), {
            preserveScroll: true,
            onSuccess: () => {
                closeTypeOverlay();

                if (addData.type && normalizedTypeOptions.some((t) => t.id === editingTypeId)) {
                    const currentType = normalizedTypeOptions.find((t) => t.id === editingTypeId);
                    if (currentType && addData.type === currentType.name) {
                        setAddData('type', trimmedName);
                    }
                }

                if (editData.type && normalizedTypeOptions.some((t) => t.id === editingTypeId)) {
                    const currentType = normalizedTypeOptions.find((t) => t.id === editingTypeId);
                    if (currentType && editData.type === currentType.name) {
                        setEditData('type', trimmedName);
                    }
                }
            },
        });
    };

    const renderTypeOverlay = () => {
        if (!isTypeOverlayOpen) return null;

        return (
            <div
                className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4"
                onClick={closeTypeOverlay}
            >
                <div
                    className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {typeOverlayMode === 'create' && (
                        <>
                            <h2 className="mb-4 text-lg font-medium text-gray-900">
                                Add Custom Content Type
                            </h2>

                            <form onSubmit={submitCreateType}>
                                <div>
                                    <InputLabel
                                        htmlFor="new_type_name"
                                        value="Type Name (e.g. Core Values)"
                                    />
                                    <TextInput
                                        id="new_type_name"
                                        className="mt-1 block w-full"
                                        value={typeCreateData.name}
                                        onChange={(e) => setTypeCreateData('name', e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <InputError message={typeCreateErrors.name} className="mt-2" />
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <SecondaryButton type="button" onClick={closeTypeOverlay}>
                                        Cancel
                                    </SecondaryButton>
                                    <PrimaryButton className="ms-3" disabled={typeCreateProcessing}>
                                        Save Type
                                    </PrimaryButton>
                                </div>
                            </form>
                        </>
                    )}

                    {typeOverlayMode === 'edit' && (
                        <>
                            <h2 className="mb-4 text-lg font-medium text-gray-900">
                                Edit Content Type
                            </h2>

                            <form onSubmit={submitEditType}>
                                <div>
                                    <InputLabel
                                        htmlFor="edit_type_name"
                                        value="Type Name"
                                    />
                                    <TextInput
                                        id="edit_type_name"
                                        className="mt-1 block w-full"
                                        value={typeEditData.name}
                                        onChange={(e) => setTypeEditData('name', e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <InputError message={typeEditErrors.name} className="mt-2" />
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <SecondaryButton type="button" onClick={closeTypeOverlay}>
                                        Cancel
                                    </SecondaryButton>
                                    <PrimaryButton className="ms-3" disabled={typeEditProcessing}>
                                        Update Type
                                    </PrimaryButton>
                                </div>
                            </form>
                        </>
                    )}

                    {typeOverlayMode === 'manage' && (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Manage Content Types
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => openCreateTypeOverlay(typeModalTarget)}
                                    className="rounded-md bg-indigo-100 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-200"
                                >
                                    + Add Type
                                </button>
                            </div>

                            {normalizedTypeOptions.length === 0 ? (
                                <div className="rounded-md border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
                                    No content types found yet.
                                </div>
                            ) : (
                                <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                                    {normalizedTypeOptions.map((typeItem) => (
                                        <div
                                            key={typeItem.id}
                                            className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
                                        >
                                            <span className="text-sm font-medium text-gray-800">
                                                {typeItem.name}
                                            </span>

                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditTypeOverlay(typeItem, typeModalTarget)}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => confirmDeleteType(typeItem)}
                                                    className="text-sm font-medium text-red-600 hover:text-red-800"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <SecondaryButton type="button" onClick={closeTypeOverlay}>
                                    Close
                                </SecondaryButton>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderTypeControls = (value, onChange, target, errorMessage, selectId) => (
        <div>
            <InputLabel htmlFor={selectId} value="Content Type" />
            <div className="mt-1 flex gap-2">
                <select
                    id={selectId}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                >
                    <option value="" disabled>
                        Select content type
                    </option>
                    {normalizedTypeOptions.map((typeItem) => (
                        <option key={typeItem.id} value={typeItem.name}>
                            {typeItem.name}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    onClick={() => openCreateTypeOverlay(target)}
                    className="whitespace-nowrap rounded-md bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-200"
                >
                    + Add Type
                </button>

                <button
                    type="button"
                    onClick={() => openManageTypesOverlay(target)}
                    className="whitespace-nowrap rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                >
                    Manage
                </button>
            </div>
            <InputError message={errorMessage} className="mt-2" />
        </div>
    );

    return (
        <SidebarLayout
            activeModule="Admin"
            sidebarLinks={adminLinks}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Company Content Management
                </h2>
            }
        >
            <Head title="Company Content" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-gray-600">
                            Manage the Mission, Vision, and core identity text for the clinic.
                        </p>
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-gray-700"
                        >
                            + Add Content
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {contents.length === 0 ? (
                            <div className="col-span-full rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm">
                                No content found. Click &quot;+ Add Content&quot; to create your first company content entry.
                            </div>
                        ) : (
                            contents.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
                                >
                                    <div className="relative h-48 w-full bg-gray-100">
                                        {item.image_path ? (
                                            <img
                                                src={`/storage/${item.image_path}`}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-400 italic">
                                                No Image
                                            </div>
                                        )}

                                        <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs capitalize text-white">
                                            {item.type}
                                        </div>
                                    </div>

                                    <div className="flex flex-1 flex-col p-4">
                                        <h3 className="mb-2 text-lg font-bold text-gray-900">
                                            {item.title || 'Untitled'}
                                        </h3>

                                        <p className="mb-4 flex-1 whitespace-pre-line break-words text-sm text-gray-600 line-clamp-3">
                                            {item.content}
                                        </p>

                                        <div className="mt-auto flex justify-end gap-3 border-t pt-3">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(item)}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => confirmDeleteContent(item)}
                                                className="text-sm font-medium text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Modal show={isAddModalOpen} onClose={closeAddModal} maxWidth="xl">
                <div className="relative">
                    <form onSubmit={submitAdd} className="p-6">
                        <h2 className="mb-6 text-lg font-medium text-gray-900">Add New Content</h2>

                        <div className="space-y-4">
                            {renderTypeControls(
                                addData.type,
                                (value) => setAddData('type', value),
                                'add',
                                addErrors.type,
                                'add_type'
                            )}

                            <div>
                                <InputLabel htmlFor="add_title" value="Display Title" />
                                <TextInput
                                    id="add_title"
                                    className="mt-1 block w-full"
                                    value={addData.title}
                                    onChange={(e) => setAddData('title', e.target.value)}
                                    placeholder="e.g. Our Core Values"
                                />
                                <InputError message={addErrors.title} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="add_content" value="Paragraph Text" />
                                <textarea
                                    id="add_content"
                                    rows="4"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={addData.content}
                                    onChange={(e) => setAddData('content', e.target.value)}
                                    required
                                />
                                <InputError message={addErrors.content} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="add_image" value="Upload Image (Optional)" />
                                <input
                                    id="add_image"
                                    type="file"
                                    accept="image/*"
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                                    onChange={(e) => setAddData('image', e.target.files[0] || null)}
                                />
                                <InputError message={addErrors.image} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <SecondaryButton type="button" onClick={closeAddModal}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton className="ms-3" disabled={addProcessing}>
                                Save Content
                            </PrimaryButton>
                        </div>
                    </form>

                    {renderTypeOverlay()}
                </div>
            </Modal>

            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="xl">
                <div className="relative">
                    <form onSubmit={submitEdit} className="p-6">
                        <h2 className="mb-6 text-lg font-medium text-gray-900">Edit Content</h2>

                        <div className="space-y-4">
                            {renderTypeControls(
                                editData.type,
                                (value) => setEditData('type', value),
                                'edit',
                                editErrors.type,
                                'edit_type'
                            )}

                            <div>
                                <InputLabel htmlFor="edit_title" value="Display Title" />
                                <TextInput
                                    id="edit_title"
                                    className="mt-1 block w-full"
                                    value={editData.title}
                                    onChange={(e) => setEditData('title', e.target.value)}
                                />
                                <InputError message={editErrors.title} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_content" value="Paragraph Text" />
                                <textarea
                                    id="edit_content"
                                    rows="4"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={editData.content}
                                    onChange={(e) => setEditData('content', e.target.value)}
                                    required
                                />
                                <InputError message={editErrors.content} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="edit_image"
                                    value="Replace Image (Leave empty to keep current image)"
                                />
                                <input
                                    id="edit_image"
                                    type="file"
                                    accept="image/*"
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                                    onChange={(e) => setEditData('image', e.target.files[0] || null)}
                                />
                                <InputError message={editErrors.image} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <SecondaryButton type="button" onClick={closeEditModal}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton className="ms-3" disabled={editProcessing}>
                                Update Content
                            </PrimaryButton>
                        </div>
                    </form>

                    {renderTypeOverlay()}
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