import SidebarLayout from '@/Layouts/SidebarLayout';
import { getDashboardLinks } from '@/Config/navigation';
import { Head, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal'; // NEW: Import the Modal component
import { useState } from 'react'; // NEW: Import useState for the modal toggle

export default function Dashboard({ auth, announcements }) {
    const dashboardLinks = getDashboardLinks();
    
    const announcementList = announcements.data || [];

    // NEW: State to track the modal visibility and the specific announcement selected
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    const getPastelStyle = (hexColor) => {
        const fallback = '#4F46E5'; 
        let hex = (hexColor || fallback).replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        
        const r = parseInt(hex.substring(0, 2), 16) || 79;
        const g = parseInt(hex.substring(2, 4), 16) || 70;
        const b = parseInt(hex.substring(4, 6), 16) || 229;

        return {
            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.25)`, 
            color: `#${hex}`,                                
            borderColor: `#${hex}`, 
        };
    };

    const renderPaginationLabel = (label) => {
        if (label.includes('Previous')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            );
        }
        if (label.includes('Next')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            );
        }
        return label;
    };

    // NEW: Helper function to handle opening the modal
    const openAnnouncementModal = (announcement) => {
        setSelectedAnnouncement(announcement);
        setIsModalOpen(true);
    };

    // NEW: Helper function to handle closing the modal
    const closeModal = () => {
        setIsModalOpen(false);
        // We delay clearing the selected data slightly so it doesn't vanish during the closing animation
        setTimeout(() => setSelectedAnnouncement(null), 300);
    };

    return (
        <SidebarLayout
            activeModule="General"
            sidebarLinks={dashboardLinks}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="mb-8 overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-100">
                        <div className="p-6 text-gray-900">
                            Welcome back to The Cat Clinic Portal, <strong>{auth.user.name}</strong>!
                        </div>
                    </div>

                    <h3 className="mb-4 text-lg font-bold text-gray-700">Recent Announcements</h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {announcementList.length === 0 ? (
                            <div className="col-span-full rounded-lg border border-gray-100 bg-white p-6 text-center text-gray-500 shadow-sm">
                                No announcements have been posted yet.
                            </div>
                        ) : (
                            announcementList.map((item) => {
                                const priorityName = item.priority_level?.name || 'Notice';
                                const badgeColor = item.priority_level?.color || '#4F46E5';

                                return (
                                    <div 
                                        key={item.id} 
                                        onClick={() => openAnnouncementModal(item)} // NEW: Trigger modal on click
                                        className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer" // NEW: Added cursor-pointer
                                    >
                                        
                                        {/* Priority Badge */}
                                        <div className="absolute right-3 top-3 z-20">
                                            <span 
                                                className="rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-sm"
                                                style={getPastelStyle(badgeColor)}
                                            >
                                                {priorityName}
                                            </span>
                                        </div>

                                        <div className="h-44 w-full shrink-0 bg-gray-200 relative">
                                            {item.image_path ? (
                                                <img src={`/storage/${item.image_path}`} alt={item.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-sm text-gray-400 font-medium italic">No Attachment</div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-14"></div>
                                        </div>
                                        
                                        <div className="flex flex-1 flex-col p-5">
                                            <h4 className="mb-1 pr-12 text-lg font-bold text-gray-900 leading-tight">{item.title}</h4>
                                            <p className="mb-3 text-[11px] font-medium text-gray-500 uppercase tracking-tighter">
                                                By {item.author} • {new Date(item.created_at).toLocaleDateString()}
                                            </p>

                                            {item.branches && item.branches.length > 0 && (
                                                <div className="mb-4 flex flex-wrap gap-1">
                                                    {item.branches.map(branch => (
                                                        <span key={branch.id} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[9px] font-bold text-indigo-700 border border-indigo-100">
                                                            {branch.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* NEW: Added line-clamp-3 so long content doesn't break the card size on the dashboard */}
                                            <p className="mb-4 flex-1 whitespace-pre-wrap text-sm text-gray-600 leading-relaxed italic border-l-2 border-gray-100 pl-3 line-clamp-3">
                                                {item.content}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination Section */}
                    {announcements.links && announcements.links.length > 3 && (
                        <div className="mt-12 flex justify-center">
                            <nav className="inline-flex items-center space-x-2 rounded-xl bg-white p-2 shadow-sm border border-gray-200">
                                {announcements.links.map((link, k) => {
                                    return link.url ? (
                                        <Link
                                            key={k}
                                            href={link.url}
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                                link.active 
                                                    ? 'bg-indigo-600 text-white shadow-md scale-105' 
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            } ${link.label.includes('Previous') || link.label.includes('Next') ? 'w-12 px-2' : ''}`}
                                        >
                                            {renderPaginationLabel(link.label)}
                                        </Link>
                                    ) : (
                                        <span
                                            key={k}
                                            className={`flex h-10 items-center justify-center rounded-lg px-2 text-sm font-bold text-gray-300 ${
                                                link.label.includes('Previous') || link.label.includes('Next') ? 'w-12' : 'w-10'
                                            }`}
                                        >
                                            {renderPaginationLabel(link.label)}
                                        </span>
                                    );
                                })}
                            </nav>
                        </div>
                    )}

                </div>
            </div>

{/* NEW: Modal Component to display the full announcement */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                {selectedAnnouncement && (
                    <div className="flex flex-col bg-white overflow-hidden max-h-[85vh]">
                        
                        {/* Modal Header/Image */}
                        {selectedAnnouncement.image_path && (
                            <div className="relative w-full h-48 sm:h-64 shrink-0 bg-gray-100 border-b border-gray-200">
                                <img 
                                    src={`/storage/${selectedAnnouncement.image_path}`} 
                                    alt={selectedAnnouncement.title} 
                                    className="w-full h-full object-cover object-center" 
                                />
                            </div>
                        )}

                        {/* Modal Body - Now with overflow-y-auto for scrolling! */}
                        <div className="p-6 sm:p-8 overflow-y-auto">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        {selectedAnnouncement.title}
                                    </h2>
                                    <p className="text-sm font-medium text-gray-500">
                                        Posted by {selectedAnnouncement.author} on {new Date(selectedAnnouncement.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                {/* Modal Priority Badge */}
                                <span 
                                    className="rounded-md border px-3 py-1 text-xs font-black uppercase tracking-wider shrink-0"
                                    style={getPastelStyle(selectedAnnouncement.priority_level?.color)}
                                >
                                    {selectedAnnouncement.priority_level?.name || 'Notice'}
                                </span>
                            </div>

                            {/* Modal Branches */}
                            {selectedAnnouncement.branches && selectedAnnouncement.branches.length > 0 && (
                                <div className="mb-6 flex flex-wrap gap-2">
                                    <span className="text-sm text-gray-500 font-semibold mr-1 flex items-center">Target Branches:</span>
                                    {selectedAnnouncement.branches.map(branch => (
                                        <span key={branch.id} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                                            {branch.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <hr className="my-6 border-gray-100" />

                            {/* Modal Content */}
                            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {selectedAnnouncement.content}
                            </div>

                            <div className="mt-8 flex justify-end pt-4 bg-white sticky bottom-0">
                                <button 
                                    onClick={closeModal}
                                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    Close Window
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

        </SidebarLayout>
    );
}