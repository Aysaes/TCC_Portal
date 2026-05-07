import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { getAdminLinks } from "@/Config/navigation";

export default function ResourceLinks({ auth, links }) {
    const adminLinks = getAdminLinks(auth);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [linkToDelete, setLinkToDelete] = useState(null);

    // Form handling
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        title: '',
        url: '',
        description: '',
        type: 'internal',
        is_active: true,
    });

    // Open modal for creating a new link
    const openCreateModal = () => {
        setEditingLink(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    // Open modal for editing an existing link
    const openEditModal = (link) => {
        setEditingLink(link);
        setData({
            title: link.title,
            url: link.url,
            description: link.description || '',
            type: link.type,
            is_active: link.is_active,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    // Handle form submission (Create or Update)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingLink) {
            put(route('admin.resource-links.update', editingLink.id), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('admin.resource-links.store'), {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    // Handle delete confirmation
    const confirmDelete = (link) => {
        setLinkToDelete(link);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        destroy(route('admin.resource-links.destroy', linkToDelete.id), {
            onSuccess: () => setIsDeleteModalOpen(false),
        });
    };

    return (
        <SidebarLayout
            activeModule="Admin"
            sidebarLinks={adminLinks}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Resource Links Management</h2>}
        >
            <Head title="Manage Resource Links" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Header & Add Button */}
                    <div className="mb-6 flex justify-between items-center">
                        <p className="text-gray-600">Manage links displayed in the Internal and External Resources directories.</p>
                        <PrimaryButton onClick={openCreateModal}>
                            + Add New Link
                        </PrimaryButton>
                    </div>

                    {/* Links Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {links && links.length > 0 ? links.map((link) => (
                                        <tr key={link.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{link.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${link.type === 'internal' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                                    {link.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link.url}</a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {link.is_active ? <span className="text-green-600 font-semibold text-sm">Active</span> : <span className="text-gray-400 font-semibold text-sm">Hidden</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal(link)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                                <button onClick={() => confirmDelete(link)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No resource links found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingLink ? 'Edit Resource Link' : 'Add New Resource Link'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="title" value="Link Title" />
                            <TextInput
                                id="title"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="url" value="Target URL" />
                            <TextInput
                                id="url"
                                type="url"
                                className="mt-1 block w-full"
                                value={data.url}
                                onChange={e => setData('url', e.target.value)}
                                placeholder="https://..."
                                required
                            />
                            <InputError message={errors.url} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Short Description (Optional)" />
                            <TextInput
                                id="description"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="type" value="Directory Type" />
                            <select
                                id="type"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.type}
                                onChange={e => setData('type', e.target.value)}
                            >
                                <option value="internal">Internal Links</option>
                                <option value="external">External Links</option>
                            </select>
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        <div className="flex items-center mt-4">
                            <input
                                id="is_active"
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                            />
                            <label htmlFor="is_active" className="ml-2 text-sm text-gray-600">Active (Visible to employees)</label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {editingLink ? 'Save Changes' : 'Create Link'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to delete the link for <strong>{linkToDelete?.title}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Cancel</SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing}>Delete</DangerButton>
                    </div>
                </div>
            </Modal>
        </SidebarLayout>
    );
}