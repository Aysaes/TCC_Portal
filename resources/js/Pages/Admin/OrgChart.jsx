import SidebarLayout from '@/Layouts/SidebarLayout';
import { getAdminLinks } from '@/Config/navigation';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useState, useEffect } from 'react';

export default function OrgChartAdmin({ auth, members, orgChartSvg = null, structure }) {
    const adminLinks = getAdminLinks();
    
    // Core Member & UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [localMembers, setLocalMembers] = useState([]);
    const [openSections, setOpenSections] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);

    // Dynamic Branch & Position States from JSON
    const [dynamicBranches, setDynamicBranches] = useState(structure?.branches || []);
    const [dynamicPositions, setDynamicPositions] = useState(structure?.positions || {});
    
    // Manager Modals State
    const [isBranchManagerOpen, setIsBranchManagerOpen] = useState(false);
    const [isPositionManagerOpen, setIsPositionManagerOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');

    // Drag and Drop States
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    // 3-Dot Menu Dropdown State
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        setLocalMembers(members || []);
    }, [members]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const {
        data, setData, post, put, processing, errors, reset, clearErrors,
    } = useForm({
        name: '', position: '', branch: dynamicBranches[0] || '', image: null,
    });

    const {
        data: orgChartData, setData: setOrgChartData, post: postOrgChart, processing: orgChartProcessing, errors: orgChartErrors, reset: resetOrgChart, clearErrors: clearOrgChartErrors,
    } = useForm({
        org_chart_file: null,
    });

    const selectedBranchPositions = dynamicPositions[data.branch] || [];

    useEffect(() => {
        if (data.position && !selectedBranchPositions.includes(data.position)) {
            setData('position', '');
        }
    }, [data.branch]);

    // Database Sync Helper
    const saveStructureToBackend = (newBranches, newPositions) => {
        router.post(route('admin.org-chart.structure.save'), {
            branches: newBranches,
            positions: newPositions
        }, { preserveScroll: true });
    };

    // ==========================================
    // DRAG AND DROP HANDLERS
    // ==========================================
    const handleDragStart = (e, id) => {
        // If dropdown is open, don't drag
        if (activeDropdown) {
            e.preventDefault();
            return;
        }
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id); 
    };

    const handleDragOver = (e, id) => {
        e.preventDefault(); 
        e.dataTransfer.dropEffect = 'move';
        if (dragOverId !== id) setDragOverId(id);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOverId(null);
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        setDragOverId(null);

        if (!draggedId || draggedId === targetId) {
            setDraggedId(null);
            return;
        }

        const draggedIndex = localMembers.findIndex(m => m.id === draggedId);
        const targetIndex = localMembers.findIndex(m => m.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newMembers = [...localMembers];
        const [draggedMember] = newMembers.splice(draggedIndex, 1);
        newMembers.splice(targetIndex, 0, draggedMember);

        const updatedMembers = newMembers.map((m, i) => ({ ...m, sort_order: i }));
        setLocalMembers(updatedMembers);
        setDraggedId(null);

        const orderedIds = updatedMembers.map(m => m.id);
        router.post(route('admin.org-chart.reorder'), { orderedIds }, { preserveScroll: true });
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverId(null);
    };


    // ==========================================
    // BRANCH CRUD FUNCTIONS
    // ==========================================
    const addBranch = () => {
        const name = newItemName.trim();
        if (!name || dynamicBranches.includes(name)) return;
        
        const newBranches = [...dynamicBranches, name];
        const newPositions = { ...dynamicPositions, [name]: [] };

        setDynamicBranches(newBranches);
        setDynamicPositions(newPositions);
        setNewItemName('');
        saveStructureToBackend(newBranches, newPositions);
    };

    const updateBranch = (oldName) => {
        const newName = prompt("Enter new branch/department name:", oldName);
        if (!newName || newName.trim() === '' || newName === oldName) return;
        
        const trimmedNewName = newName.trim();
        const newBranches = dynamicBranches.map(b => b === oldName ? trimmedNewName : b);
        
        const newPositions = { ...dynamicPositions };
        newPositions[trimmedNewName] = newPositions[oldName];
        delete newPositions[oldName];

        setDynamicBranches(newBranches);
        setDynamicPositions(newPositions);
        setLocalMembers(prev => prev.map(member => 
            member.branch === oldName ? { ...member, branch: trimmedNewName } : member
        ));

        saveStructureToBackend(newBranches, newPositions);
    };

    const deleteBranch = (branch) => {
        if (!confirm(`Are you sure you want to delete ${branch}? Members in this branch will also be hidden.`)) return;
        
        const newBranches = dynamicBranches.filter(b => b !== branch);
        const newPositions = { ...dynamicPositions };
        delete newPositions[branch];

        setDynamicBranches(newBranches);
        setDynamicPositions(newPositions);
        setLocalMembers(prev => prev.filter(member => member.branch !== branch));

        saveStructureToBackend(newBranches, newPositions);
    };

    // ==========================================
    // POSITION CRUD FUNCTIONS
    // ==========================================
    const addPosition = (branch) => {
        const name = newItemName.trim();
        if (!name || !branch) return;
        
        const newPositions = { ...dynamicPositions };
        const branchPos = newPositions[branch] || [];
        
        if (!branchPos.includes(name)) {
            newPositions[branch] = [...branchPos, name];
            setDynamicPositions(newPositions);
            setNewItemName('');
            saveStructureToBackend(dynamicBranches, newPositions);
        }
    };

    const updatePosition = (branch, oldPos) => {
        const newPos = prompt("Enter new position title:", oldPos);
        if (!newPos || newPos.trim() === '' || newPos === oldPos) return;
        
        const newPositions = {
            ...dynamicPositions,
            [branch]: dynamicPositions[branch].map(p => p === oldPos ? newPos.trim() : p)
        };
        
        setDynamicPositions(newPositions);
        saveStructureToBackend(dynamicBranches, newPositions);
    };

    const deletePosition = (branch, position) => {
        if (!confirm(`Are you sure you want to delete ${position}?`)) return;
        
        const newPositions = {
            ...dynamicPositions,
            [branch]: dynamicPositions[branch].filter(p => p !== position)
        };

        setDynamicPositions(newPositions);
        saveStructureToBackend(dynamicBranches, newPositions);
    };


    // ==========================================
    // MEMBER FUNCTIONS
    // ==========================================
    const toggleSection = (sectionName) => {
        setOpenSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));
    };

    const openModal = (member = null) => {
        clearErrors();
        if (member && member.id) {
            setEditingMember(member);
            setData({
                name: member.name || '',
                position: member.position || '',
                branch: member.branch || dynamicBranches[0] || '',
                image: null,
            });
        } else {
            setEditingMember(null);
            setData({
                name: '',
                position: '',
                branch: dynamicBranches[0] || '', 
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
            put(route('admin.org-chart.update', editingMember.id), { forceFormData: true, onSuccess: () => closeModal() });
        } else {
            post(route('admin.org-chart.store'), { forceFormData: true, onSuccess: () => closeModal() });
        }
    };

    const submitOrgChartSvg = (e) => {
        e.preventDefault();
        if (!orgChartData.org_chart_file) return;
        postOrgChart(route('admin.org-chart.asset.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                resetOrgChart();
                clearOrgChartErrors();
                setPreviewUrl(null); 
            },
        });
    };

    const deleteMemberAction = (id) => {
        if (confirm('Are you sure you want to remove this member? This action cannot be undone.')) {
            router.delete(route('admin.org-chart.destroy', id), { preserveScroll: true, onSuccess: () => closeModal() });
        }
    };


    // ==========================================
    // SORTING & GROUPING
    // ==========================================
    const sortMembersByBranchHierarchy = (branchName, membersInBranch) => {
        const positionOrder = dynamicPositions[branchName] || [];
        const orderMap = new Map(positionOrder.map((position, index) => [position, index]));

        return [...membersInBranch].sort((a, b) => {
            const aIndex = orderMap.has(a.position) ? orderMap.get(a.position) : Number.MAX_SAFE_INTEGER;
            const bIndex = orderMap.has(b.position) ? orderMap.get(b.position) : Number.MAX_SAFE_INTEGER;

            if (aIndex !== bIndex) return aIndex - bIndex;
            
            return (a.sort_order || 0) - (b.sort_order || 0);
        });
    };

    const groupedMembers = dynamicBranches.reduce((acc, branch) => {
        const peopleInThisBranch = localMembers.filter((m) => m.branch === branch);
        acc[branch] = sortMembersByBranchHierarchy(branch, peopleInThisBranch);
        return acc;
    }, {});

    const otherMembers = localMembers.filter((m) => !dynamicBranches.includes(m.branch));
    if (otherMembers.length > 0) {
        groupedMembers['Other Staff'] = otherMembers;
    }

    const normalizedOrgChartSvg =
        orgChartSvg && orgChartSvg.startsWith('/') ? orgChartSvg : orgChartSvg ? `/${orgChartSvg}` : null;
    const displaySvg = previewUrl || normalizedOrgChartSvg;


    return (
        <SidebarLayout
            activeModule="Admin"
            sidebarLinks={adminLinks}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Employee Directory Management</h2>}
        >
            <Head title="Manage Directory" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ORG CHART SVG MANAGEMENT */}
                    <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-gray-100 p-6 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Organization Chart SVG</h3>
                                <p className="mt-1 text-sm text-gray-500">Upload one SVG file only. Uploading a new file will replace the current org chart.</p>
                                <p className="mt-1 text-xs text-gray-400">Allowed file type: .svg only</p>
                            </div>

                            {normalizedOrgChartSvg && (
                                <a href={normalizedOrgChartSvg} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                                    View Current Saved SVG
                                </a>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                <div className="border-b border-gray-200 px-4 py-3">
                                    <h4 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                                        {previewUrl ? 'Preview of Selected File' : 'Current Org Chart Preview'}
                                    </h4>
                                </div>

                                <div className="flex min-h-[280px] items-center justify-center p-4">
                                    {displaySvg ? (
                                        <img src={displaySvg} alt="Organizational Chart Preview" className="max-h-[420px] w-full object-contain" />
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-base font-medium text-gray-700">No org chart uploaded yet.</p>
                                            <p className="mt-1 text-sm text-gray-500">Upload your first SVG file to show it here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-5">
                                <form onSubmit={submitOrgChartSvg} className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-bold text-gray-700">
                                            {normalizedOrgChartSvg ? 'Replace SVG File' : 'Upload SVG File'}
                                        </label>
                                        <input
                                            type="file"
                                            accept=".svg,image/svg+xml"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                setOrgChartData('org_chart_file', file || null);
                                                if (file) { setPreviewUrl(URL.createObjectURL(file)); } 
                                                else { setPreviewUrl(null); }
                                            }}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 transition-colors hover:file:bg-indigo-100"
                                        />
                                        {orgChartErrors.org_chart_file && <p className="mt-1 text-xs text-red-500">{orgChartErrors.org_chart_file}</p>}
                                        <p className="mt-2 text-xs text-gray-500">
                                            The file will be stored in <span className="font-semibold">public/storage/org_chart</span>.
                                        </p>
                                    </div>

                                    {orgChartData.org_chart_file && (
                                        <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-gray-700">
                                            <span className="font-semibold">Selected file:</span> {orgChartData.org_chart_file.name}
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={orgChartProcessing || !orgChartData.org_chart_file}
                                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {orgChartProcessing ? 'Uploading...' : normalizedOrgChartSvg ? 'Replace Org Chart' : 'Upload Org Chart'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* DIRECTORY */}
                    <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row">
                        <div>
                            <h3 className="mb-1 text-xl font-bold text-gray-900">The Cat Clinic People Directory</h3>
                            <p className="text-sm text-gray-500">Add members, assign departments, and manage them. <strong className="text-indigo-600 font-bold">Drag and Drop</strong> cards to permanently reorder their visual sequence.</p>
                        </div>
                        <button onClick={() => openModal()} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-indigo-500">
                            + Add member
                        </button>
                    </div>

                    <div className="space-y-5">
                        {Object.keys(groupedMembers).map((branchName) => {
                            const membersInBranch = groupedMembers[branchName];
                            const isOpen = !!openSections[branchName];

                            return (
                                <div key={branchName} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                    <button type="button" onClick={() => toggleSection(branchName)} className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-gray-50">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-800">{branchName}</h4>
                                            <p className="mt-1 text-sm text-gray-500">{membersInBranch.length} {membersInBranch.length === 1 ? 'member' : 'members'}</p>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                            <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-6-6a.75.75 0 111.06-1.06L12 14.69l5.47-5.47a.75.75 0 111.06 1.06l-6 6z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {isOpen && (
                                        <div className="border-t border-gray-200 px-6 py-6 bg-gray-50/50">
                                            {membersInBranch.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                                                    <h5 className="text-base font-medium text-gray-900">No members yet</h5>
                                                    <p className="mt-1 text-sm text-gray-500">Add a member to this department to get started.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                                    {membersInBranch.map((member) => (
                                                        <div 
                                                            key={member.id} 
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, member.id)}
                                                            onDragOver={(e) => handleDragOver(e, member.id)}
                                                            onDragLeave={handleDragLeave}
                                                            onDrop={(e) => handleDrop(e, member.id)}
                                                            onDragEnd={handleDragEnd}
                                                            className={`group relative flex flex-col items-center rounded-2xl border bg-white p-6 shadow-sm transition-all cursor-move
                                                                ${dragOverId === member.id ? 'border-indigo-500 scale-105 ring-4 ring-indigo-100 opacity-90' : 'border-gray-100 hover:border-indigo-300 hover:shadow-xl'}
                                                                ${draggedId === member.id ? 'opacity-40 scale-95 border-dashed border-indigo-400' : ''}`}
                                                        >
                                                            {/* Drag Handle Icon for UX hints */}
                                                            <div className="absolute left-4 top-4 text-gray-300 transition-colors group-hover:text-gray-500">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                                                                </svg>
                                                            </div>

                                                            {/* 3-Dot Actions Dropdown */}
                                                            <div className="absolute right-4 top-4 z-20">
                                                                <button
                                                                    onMouseDown={(e) => e.stopPropagation()} // Stop drag interaction
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveDropdown(activeDropdown === member.id ? null : member.id);
                                                                    }}
                                                                    className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                                                    </svg>
                                                                </button>

                                                                {/* Dropdown Menu Box */}
                                                                {activeDropdown === member.id && (
                                                                    <>
                                                                        {/* Invisible Overlay to Close Dropdown */}
                                                                        <div 
                                                                            className="fixed inset-0 z-10" 
                                                                            onMouseDown={(e) => { e.stopPropagation(); setActiveDropdown(null); }}
                                                                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}
                                                                        ></div>
                                                                        
                                                                        <div className="absolute right-0 top-full mt-1 w-40 z-20 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                                                            <div className="py-1">
                                                                                <button
                                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setActiveDropdown(null);
                                                                                        openModal(member);
                                                                                    }}
                                                                                    className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2.5 text-gray-500">
                                                                                        <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                                                                                    </svg>
                                                                                    Edit Info
                                                                                </button>
                                                                                <button
                                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setActiveDropdown(null);
                                                                                        deleteMemberAction(member.id);
                                                                                    }}
                                                                                    className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2.5">
                                                                                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                    Remove Member
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>

                                                            <div className="relative z-10 mb-4 h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md transition-colors group-hover:border-indigo-100">
                                                                {member.image_path ? (
                                                                    <img src={`/storage/${member.image_path}`} alt={member.name} className="h-full w-full object-cover pointer-events-none" />
                                                                ) : (
                                                                    <svg className="h-full w-full bg-gray-50 p-6 text-black pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                                    </svg>
                                                                )}
                                                            </div>

                                                            <div className="relative z-10 w-full text-center pointer-events-none">
                                                                <h4 className="px-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-900">{member.name}</h4>
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

            {/* MEMBER MODAL */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between border-b pb-4">
                        <h2 className="text-xl font-bold text-gray-900">{editingMember ? 'Edit Team Member' : 'Add New Member'}</h2>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {editingMember && editingMember.image_path && (
                            <div className="mb-3 flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-gray-50 p-3">
                                <span className="mb-2 text-xs font-semibold text-gray-500">Current Photo</span>
                                <img src={`/storage/${editingMember.image_path}`} alt="Current member" className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md" />
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm font-bold text-gray-700">Display Name</label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. Dr. Jane Doe" required />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label className="block text-sm font-bold text-gray-700">Department / Branch</label>
                                <button type="button" onClick={() => setIsBranchManagerOpen(true)} className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800">
                                    Manage
                                </button>
                            </div>
                            <select value={data.branch} onChange={(e) => setData('branch', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required>
                                {dynamicBranches.map((branch) => (
                                    <option key={branch} value={branch}>{branch}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label className="block text-sm font-bold text-gray-700">Position / Title</label>
                                <button type="button" onClick={() => setIsPositionManagerOpen(true)} className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800">
                                    Manage
                                </button>
                            </div>
                            <select value={data.position} onChange={(e) => setData('position', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required>
                                <option value="">Select position</option>
                                {selectedBranchPositions.map((position) => (
                                    <option key={position} value={position}>{position}</option>
                                ))}
                            </select>
                            {errors.position && <p className="mt-1 text-xs text-red-500">{errors.position}</p>}
                            <p className="mt-1 text-xs text-gray-500">Positions are limited to the roles available under the selected section.</p>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-bold text-gray-700">{editingMember ? 'Replace Photo (Optional)' : 'Upload Photo (Optional)'}</label>
                            <input type="file" onChange={(e) => setData('image', e.target.files[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 transition-colors hover:file:bg-indigo-100" accept="image/*" />
                            {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
                        </div>

                        <div className={`mt-8 flex gap-3 border-t pt-4 justify-end`}>
                            <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow transition-colors hover:bg-indigo-500 disabled:opacity-50">
                                {editingMember ? 'Save Changes' : 'Save Member'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>


            {/* ==========================================
                BRANCH MANAGER MODAL
                ========================================== */}
            <Modal show={isBranchManagerOpen} onClose={() => { setIsBranchManagerOpen(false); setNewItemName(''); }} maxWidth="md">
                <div className="p-6">
                    <div className="mb-4 flex items-center justify-between border-b pb-4">
                        <h2 className="text-xl font-bold text-gray-900">Manage Branches</h2>
                        <button onClick={() => setIsBranchManagerOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    
                    <div className="mb-4 flex gap-2">
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="New branch name..."
                            className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button onClick={addBranch} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500">Add</button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {dynamicBranches.map((branch) => (
                            <div key={branch} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 border border-gray-100">
                                <span className="text-sm font-medium text-gray-800">{branch}</span>
                                <div className="flex gap-3 text-xs">
                                    <button type="button" onClick={() => updateBranch(branch)} className="text-blue-600 hover:underline">Edit</button>
                                    <button type="button" onClick={() => deleteBranch(branch)} className="text-red-600 hover:underline">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* ==========================================
                POSITION MANAGER MODAL
                ========================================== */}
            <Modal show={isPositionManagerOpen} onClose={() => { setIsPositionManagerOpen(false); setNewItemName(''); }} maxWidth="md">
                <div className="p-6">
                    <div className="mb-4 flex items-center justify-between border-b pb-4">
                        <h2 className="text-xl font-bold text-gray-900">Manage Positions</h2>
                        <button onClick={() => setIsPositionManagerOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    <p className="mb-2 text-xs font-semibold text-gray-500">Currently managing positions for:</p>
                    <div className="mb-4 rounded-lg bg-indigo-50 p-3 text-sm font-bold text-indigo-700">
                        {data.branch || "Please select a branch in the main form first."}
                    </div>
                    
                    <div className="mb-4 flex gap-2">
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            disabled={!data.branch}
                            placeholder="New position title..."
                            className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                        <button onClick={() => addPosition(data.branch)} disabled={!data.branch} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50">Add</button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {(dynamicPositions[data.branch] || []).map((pos) => (
                            <div key={pos} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 border border-gray-100">
                                <span className="text-sm font-medium text-gray-800">{pos}</span>
                                <div className="flex gap-3 text-xs">
                                    <button type="button" onClick={() => updatePosition(data.branch, pos)} className="text-blue-600 hover:underline">Edit</button>
                                    <button type="button" onClick={() => deletePosition(data.branch, pos)} className="text-red-600 hover:underline">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

        </SidebarLayout>
    );
}