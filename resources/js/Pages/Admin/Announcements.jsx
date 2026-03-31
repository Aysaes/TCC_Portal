import ConfirmModal from '@/Components/ConfirmModal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { getAdminLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { formatAppDate } from '@/Utils/date';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';

export default function Announcements({ auth, announcements = [], branches = [], priorities = [] }) {
    const adminLinks = getAdminLinks();
    const { system } = usePage().props;

    // --- FILTER STATES ---
    const [titleSearch, setTitleSearch] = useState('');
    const [selectedPriorityId, setSelectedPriorityId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // --- SAFE COLOR CONVERTER ---
    const normalizeHexColor = (hexColor) => {
        const fallback = '#4F46E5';
        let hex = (hexColor || fallback).replace('#', '');

        if (hex.length === 3) {
            hex = hex.split('').map((c) => c + c).join('');
        }

        if (hex.length !== 6) {
            hex = fallback.replace('#', '');
        }

        return `#${hex}`;
    };

    const getPastelStyle = (hexColor) => {
        const normalized = normalizeHexColor(hexColor);
        const hex = normalized.replace('#', '');
        
        const r = parseInt(hex.substring(0, 2), 16) || 79;
        const g = parseInt(hex.substring(2, 4), 16) || 70;
        const b = parseInt(hex.substring(4, 6), 16) || 229;

        return {
            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
            color: normalized,
            borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`
        };
    };

    const getGlassStyle = (hexColor) => {
        const normalized = normalizeHexColor(hexColor);
        const hex = normalized.replace('#', '');

        const r = parseInt(hex.substring(0, 2), 16) || 79;
        const g = parseInt(hex.substring(2, 4), 16) || 70;
        const b = parseInt(hex.substring(4, 6), 16) || 229;

        return {
            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.18)`,
            color: normalized,
            borderColor: `rgba(${r}, ${g}, ${b}, 0.28)`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
        };
    };

    const getSolidBadgeStyle = (hexColor) => {
        const normalized = normalizeHexColor(hexColor);

        return {
            backgroundColor: normalized,
            color: '#ffffff',
            borderColor: normalized,
        };
    };

    // --- FILTERED ANNOUNCEMENTS ---
    const filteredAnnouncements = useMemo(() => {
        const source = Array.isArray(announcements) ? announcements : [];

        return source.filter((item) => {
            const matchesTitle =
                !titleSearch ||
                (item.title || '')
                    .toLowerCase()
                    .includes(titleSearch.toLowerCase().trim());

            const matchesPriority =
                !selectedPriorityId ||
                String(item.priority_level_id) === String(selectedPriorityId);

            let matchesDate = true;

            if (startDate || endDate) {
                const createdAt = item.created_at ? new Date(item.created_at) : null;

                if (!createdAt || Number.isNaN(createdAt.getTime())) {
                    matchesDate = false;
                } else {
                    const itemDate = new Date(createdAt);
                    itemDate.setHours(0, 0, 0, 0);

                    if (startDate) {
                        const start = new Date(startDate);
                        start.setHours(0, 0, 0, 0);
                        if (itemDate < start) matchesDate = false;
                    }

                    if (endDate) {
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        if (createdAt > end) matchesDate = false;
                    }
                }
            }

            return matchesTitle && matchesPriority && matchesDate;
        });
    }, [announcements, titleSearch, selectedPriorityId, startDate, endDate]);

    // --- MANUAL CAROUSEL PAGINATION ---
    const cardsPerPage = 6;
    const chunkedAnnouncements = [];
    for (let i = 0; i < filteredAnnouncements.length; i += cardsPerPage) {
        chunkedAnnouncements.push(filteredAnnouncements.slice(i, i + cardsPerPage));
    }

    const carouselRef = useRef(null);
    const [activeSlide, setActiveSlide] = useState(0);

    const getCarouselMetrics = () => {
        if (!carouselRef.current) return null;

        const firstPage = carouselRef.current.querySelector('[data-carousel-page="true"]');
        if (!firstPage) return null;

        const pageWidth = firstPage.getBoundingClientRect().width;
        const styles = window.getComputedStyle(carouselRef.current);
        const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;

        return {
            pageWidth,
            gap,
            fullStep: pageWidth + gap,
        };
    };

    const handleScroll = () => {
        const metrics = getCarouselMetrics();
        if (!metrics || !carouselRef.current) return;

        const current = Math.round(carouselRef.current.scrollLeft / metrics.fullStep);
        const safeIndex = Math.max(0, Math.min(current, chunkedAnnouncements.length - 1));
        setActiveSlide(safeIndex);
    };

    const goToSlide = (index) => {
        if (!carouselRef.current) return;

        const metrics = getCarouselMetrics();
        if (!metrics) return;

        const safeIndex = Math.max(0, Math.min(index, chunkedAnnouncements.length - 1));

        carouselRef.current.scrollTo({
            left: safeIndex * metrics.fullStep,
            behavior: 'smooth',
        });

        setActiveSlide(safeIndex);
    };

    const scrollLeft = () => {
        goToSlide(activeSlide === 0 ? chunkedAnnouncements.length - 1 : activeSlide - 1);
    };

    const scrollRight = () => {
        goToSlide(
            activeSlide === chunkedAnnouncements.length - 1 ? 0 : activeSlide + 1
        );
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
    const {
        data: priorityData,
        setData: setPriorityData,
        post: postPriority,
        processing: priorityProcessing,
        reset: resetPriority,
        clearErrors: clearPriorityErrors
    } = useForm({
        name: '',
        color: '#4F46E5'
    });

    const closePriorityModal = () => {
        setIsPriorityModalOpen(false);
        resetPriority();
        clearPriorityErrors();
    };

    const submitPriority = (e) => {
        e.preventDefault();
        postPriority(route('admin.announcements.priority.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closePriorityModal();
                setAddData({ ...addData, priority: priorityData.name, priority_color: priorityData.color });
            }
        });
    };

    // --- ADD LOGIC ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const {
        data: addData,
        setData: setAddData,
        post: postData,
        processing: addProcessing,
        errors: addErrors,
        clearErrors: clearAddErrors,
        reset: resetAdd
    } = useForm({
        title: '',
        author: '',
        content: '',
        priority_level_id: '',
        branch_ids: [],
        image: null,
        attachment: null,
    });

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        clearAddErrors();
        resetAdd();
    };

    const submitAdd = (e) => {
        e.preventDefault();
        postData(route('admin.announcements.store'), {
            preserveScroll: true,
            onSuccess: () => closeAddModal()
        });
    };

    // --- EDIT LOGIC ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const {
        data: editData,
        setData: setEditData,
        post: updateData,
        processing: editProcessing,
        errors: editErrors,
        clearErrors: clearEditErrors,
        reset: resetEdit
    } = useForm({
        _method: 'put',
        title: '',
        author: '',
        content: '',
        priority_level_id: '',
        branch_ids: [],
        image: null,
        attachment: null,
    });

    const openEditModal = (item) => {
        setEditingId(item.id);
        setEditData({
            _method: 'put',
            title: item.title,
            author: item.author,
            content: item.content,
            priority_level_id: item.priority_level_id || '',
            branch_ids: item.branches.map(b => b.id),
            image: null,
            attachment: null,
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
        updateData(route('admin.announcements.update', editingId), {
            preserveScroll: true,
            onSuccess: () => closeEditModal()
        });
    };

    return (
        <SidebarLayout
            activeModule="Admin"
            sidebarLinks={adminLinks}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Announcements</h2>}
        >
            <Head title="Announcements & Notices" />

            <style>{`
                .hide-scroll::-webkit-scrollbar {
                    display: none;
                }

                .hide-scroll {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .smooth-snap {
                    scroll-snap-type: x mandatory;
                    -webkit-overflow-scrolling: touch;
                    overscroll-behavior-x: contain;
                }

                .announcement-card .announcement-badge {
                    background: var(--badge-solid-bg);
                    color: var(--badge-solid-text);
                    border-color: var(--badge-solid-border);
                    backdrop-filter: none;
                    -webkit-backdrop-filter: none;
                }

                .announcement-card:hover .announcement-badge {
                    background: var(--badge-glass-bg);
                    color: var(--badge-glass-text);
                    border-color: var(--badge-glass-border);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                }
            `}</style>

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-gray-600">Broadcast notices and updates to specific clinic branches.</p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-gray-700"
                        >
                            + Post Announcement
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <InputLabel htmlFor="filter_title" value="Search Title" />
                                <TextInput
                                    id="filter_title"
                                    className="mt-1 block w-full"
                                    value={titleSearch}
                                    onChange={(e) => setTitleSearch(e.target.value)}
                                    placeholder="Search by title..."
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="filter_priority" value="Priority Level" />
                                <select
                                    id="filter_priority"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={selectedPriorityId}
                                    onChange={(e) => setSelectedPriorityId(e.target.value)}
                                >
                                    <option value="">All Priorities</option>
                                    {priorities.map((priority) => (
                                        <option key={priority.id} value={priority.id}>
                                            {priority.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="filter_start_date" value="Start Date" />
                                <input
                                    id="filter_start_date"
                                    type="date"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="filter_end_date" value="End Date" />
                                <input
                                    id="filter_end_date"
                                    type="date"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <SecondaryButton
                                onClick={() => {
                                    setTitleSearch('');
                                    setSelectedPriorityId('');
                                    setStartDate('');
                                    setEndDate('');
                                    goToSlide(0);
                                }}
                            >
                                Reset Filters
                            </SecondaryButton>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">
                            Showing {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Manual Carousel */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {chunkedAnnouncements.length > 1 && (
                            <button
                                onClick={scrollLeft}
                                className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-black shadow-sm transition-all focus:outline-none hover:scale-105 hover:shadow-md lg:flex"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                        )}

                        <div
                            ref={carouselRef}
                            onScroll={handleScroll}
                            className="hide-scroll smooth-snap flex w-full flex-1 gap-6 overflow-x-auto overflow-y-visible scroll-smooth bg-transparent px-0 py-1"
                        >
                            {chunkedAnnouncements.length === 0 ? (
                                <div className="w-full rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm border border-gray-100">
                                    No announcements found.
                                </div>
                            ) : (
                                chunkedAnnouncements.map((pageItems, pageIndex) => (
                                    <div
                                        key={pageIndex}
                                        data-carousel-page="true"
                                        className="w-full shrink-0 snap-start border-0 bg-transparent shadow-none"
                                    >
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                            {pageItems.map((item) => {
                                                const priorityName = item.priority_level?.name || 'Notice';
                                                const badgeColor = item.priority_level?.color || '#4F46E5';
                                                const solidBadgeStyle = getSolidBadgeStyle(badgeColor);
                                                const glassBadgeStyle = getGlassStyle(badgeColor);

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="announcement-card relative flex h-[430px] flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                                                        style={{
                                                            '--badge-solid-bg': solidBadgeStyle.backgroundColor,
                                                            '--badge-solid-text': solidBadgeStyle.color,
                                                            '--badge-solid-border': solidBadgeStyle.borderColor,
                                                            '--badge-glass-bg': glassBadgeStyle.backgroundColor,
                                                            '--badge-glass-text': glassBadgeStyle.color,
                                                            '--badge-glass-border': glassBadgeStyle.borderColor,
                                                        }}
                                                    >
                                                        {/* Priority Badge */}
                                                        <div className="absolute top-3 right-3 z-10">
                                                            <span
                                                                className="announcement-badge rounded px-2 py-1 text-xs font-bold uppercase shadow-sm border transition-all duration-200"
                                                            >
                                                                {priorityName}
                                                            </span>
                                                        </div>

                                                        {/* Image Placeholder */}
                                                        <div className="h-40 w-full border-b border-gray-100 bg-gray-100">
                                                            {item.image_path ? (
                                                                <img
                                                                    src={`/storage/${item.image_path}`}
                                                                    alt={item.title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                                                    No Cover Photo
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-1 flex-col p-5">
                                                            <h3 className="pr-16 text-lg font-bold text-gray-900">{item.title}</h3>
                                                            <p className="mb-3 text-xs text-gray-500">
                                                                By {item.author} • {formatAppDate(item.created_at, system?.timezone)}
                                                            </p>
                                                            
                                                            {/* Branch Tags */}
                                                            <div className="mb-4 flex flex-wrap gap-1">
                                                                {item.branches.map(branch => (
                                                                    <span
                                                                        key={branch.id}
                                                                        className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600"
                                                                    >
                                                                        {branch.name}
                                                                    </span>
                                                                ))}
                                                            </div>

                                                            <p className="mb-4 flex-1 whitespace-pre-line text-sm text-gray-600 line-clamp-3">
                                                                {item.content}
                                                            </p>
                                                            
                                                            {/* Attachment Download Button */}
                                                            {item.attachment_path && (
                                                                <div className="mb-4">
                                                                    <a 
                                                                        href={`/storage/${item.attachment_path}`} 
                                                                        target="_blank" 
                                                                        rel="noreferrer"
                                                                        className="inline-flex items-center gap-2 rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-100"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                                                        </svg>
                                                                        Download Attachment
                                                                    </a>
                                                                </div>
                                                            )}

                                                            {/* Footer Actions */}
                                                            <div className="mt-auto flex justify-end gap-3 border-t border-gray-100 pt-3">
                                                                <button
                                                                    onClick={() => openEditModal(item)}
                                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => confirmDelete(item)}
                                                                    className="text-sm font-medium text-red-600 hover:text-red-800"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ); 
                                            })}

                                            {pageItems.length < cardsPerPage &&
                                                Array.from({ length: cardsPerPage - pageItems.length }).map((_, idx) => (
                                                    <div
                                                        key={`placeholder-${pageIndex}-${idx}`}
                                                        className="hidden h-[430px] rounded-lg border border-transparent bg-transparent lg:block"
                                                        aria-hidden="true"
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {chunkedAnnouncements.length > 1 && (
                            <button
                                onClick={scrollRight}
                                className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-black shadow-sm transition-all focus:outline-none hover:scale-105 hover:shadow-md lg:flex"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Pagination Dots */}
                    {chunkedAnnouncements.length > 1 && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                            {chunkedAnnouncements.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => goToSlide(idx)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                        activeSlide === idx
                                            ? 'w-8 bg-indigo-600 shadow-sm'
                                            : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    aria-label={`Go to page ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- ADD MODAL --- */}
            <Modal show={isAddModalOpen} onClose={closeAddModal} maxWidth="2xl">
                <form onSubmit={submitAdd} className="p-6">
                    <h2 className="mb-6 text-lg font-medium text-gray-900">Post New Announcement</h2>
                    
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="add_title" value="Title" />
                            <TextInput
                                id="add_title"
                                className="mt-1 block w-full"
                                value={addData.title}
                                onChange={(e) => setAddData('title', e.target.value)}
                                required
                            />
                            <InputError message={addErrors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="add_author" value="Author (Posted By)" />
                            <TextInput
                                id="add_author"
                                className="mt-1 block w-full"
                                value={addData.author}
                                onChange={(e) => setAddData('author', e.target.value)}
                                placeholder="e.g. HR Dept or Dr. Smith"
                                required
                            />
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
                            <div className="mt-2 flex flex-wrap gap-4 rounded-md border bg-gray-50 p-3">
                                {branches.map(branch => (
                                    <label key={branch.id} className="flex cursor-pointer items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                            checked={addData.branch_ids.includes(branch.id)}
                                            onChange={() => handleBranchToggle(branch.id, addData.branch_ids, setAddData)}
                                        />
                                        <span className="text-sm text-gray-700">{branch.name}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={addErrors.branch_ids} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="add_content" value="Announcement Details" />
                            <textarea
                                id="add_content"
                                rows="4"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={addData.content}
                                onChange={(e) => setAddData('content', e.target.value)}
                                required
                            />
                            <InputError message={addErrors.content} className="mt-2" />
                        </div>

                        <div className="md:col-span-1">
                            <InputLabel value="Cover Photo (Image)" />
                            <input
                                type="file"
                                accept="image/*"
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-700 hover:file:bg-indigo-100"
                                onChange={(e) => setAddData('image', e.target.files[0])}
                            />
                            <InputError message={addErrors.image} className="mt-2" />
                        </div>

                        <div className="md:col-span-1">
                            <InputLabel value="File Attachment (PDF, Excel, Word)" />
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-green-700 hover:file:bg-green-100"
                                onChange={(e) => setAddData('attachment', e.target.files[0])}
                            />
                            <InputError message={addErrors.attachment} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeAddModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={addProcessing}>
                            Post Announcement
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* --- EDIT MODAL --- */}
            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="2xl">
                <form onSubmit={submitEdit} className="p-6">
                    <h2 className="mb-6 text-lg font-medium text-gray-900">Edit Announcement</h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="edit_title" value="Title" />
                            <TextInput
                                id="edit_title"
                                className="mt-1 block w-full"
                                value={editData.title}
                                onChange={(e) => setEditData('title', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_author" value="Author" />
                            <TextInput
                                id="edit_author"
                                className="mt-1 block w-full"
                                value={editData.author}
                                onChange={(e) => setEditData('author', e.target.value)}
                                required
                            />
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
                            <div className="mt-2 flex flex-wrap gap-4 rounded-md border bg-gray-50 p-3">
                                {branches.map(branch => (
                                    <label key={branch.id} className="flex cursor-pointer items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                            checked={editData.branch_ids.includes(branch.id)}
                                            onChange={() => handleBranchToggle(branch.id, editData.branch_ids, setEditData)}
                                        />
                                        <span className="text-sm text-gray-700">{branch.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="edit_content" value="Announcement Details" />
                            <textarea
                                id="edit_content"
                                rows="4"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={editData.content}
                                onChange={(e) => setEditData('content', e.target.value)}
                                required
                            />
                        </div>

                        <div className="md:col-span-1">
                            <InputLabel value="Cover Photo (Image)" />
                            <input
                                type="file"
                                accept="image/*"
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-700 hover:file:bg-indigo-100"
                                onChange={(e) => setEditData('image', e.target.files[0])}
                            />
                            <InputError message={addErrors.image} className="mt-2" />
                        </div>

                        <div className="md:col-span-1">
                            <InputLabel value="File Attachment (PDF, Excel, Word)" />
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-green-700 hover:file:bg-green-100"
                                onChange={(e) => setEditData('attachment', e.target.files[0])}
                            />
                            <InputError message={addErrors.attachment} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeEditModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={editProcessing}>
                            Update Announcement
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* --- ADD NEW PRIORITY MODAL --- */}
            <Modal show={isPriorityModalOpen} onClose={closePriorityModal} maxWidth="sm">
                <form onSubmit={submitPriority} className="p-6">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">Add Custom Priority</h2>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="new_priority_name" value="Priority Name (e.g. Holiday)" />
                            <TextInput
                                id="new_priority_name"
                                className="mt-1 block w-full"
                                value={priorityData.name}
                                onChange={(e) => setPriorityData('name', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="new_priority_color" value="Badge Color" />
                            <input
                                id="new_priority_color"
                                type="color"
                                className="mt-1 block h-10 w-full cursor-pointer rounded-md border-gray-300 p-1 shadow-sm"
                                value={priorityData.color}
                                onChange={(e) => setPriorityData('color', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closePriorityModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={priorityProcessing}>
                            Save Priority
                        </PrimaryButton>
                    </div>
                </form>
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