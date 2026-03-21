import SidebarLayout from '@/Layouts/SidebarLayout';
import { getDashboardLinks } from '@/Config/navigation';
import { Head, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useState } from 'react';

export default function Overview({ auth, announcements, contents }) {
    const dashboardLinks = getDashboardLinks();
    
    const announcementList = announcements.data || announcements || [];

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

    const openAnnouncementModal = (announcement) => {
        setSelectedAnnouncement(announcement);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedAnnouncement(null), 300);
    };

    const mission = contents.find(c => c.title && c.title.toLowerCase().includes('mission'));
    const vision = contents.find(c => c.title && c.title.toLowerCase().includes('vision'));

    return (
        <SidebarLayout
            activeModule="General"
            sidebarLinks={dashboardLinks}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Overview</h2>}
        >
            <Head title="Overview" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-12">
                    
                    {/* Welcome Banner */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-100">
                        <div className="p-6 text-gray-900">
                            Welcome back to The Cat Clinic Portal, <strong>{auth.user.name}</strong>!
                        </div>
                    </div>

                    {/* --- RECENT ANNOUNCEMENTS SECTION (MOVED TO TOP) --- */}
                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-lg font-bold text-gray-700 uppercase tracking-wide">Latest Announcements</h3>
                        </div>

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
                                            onClick={() => openAnnouncementModal(item)} 
                                            className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                                        >
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
                    </section>

                    {/* --- MISSION & VISION SECTION (MOVED TO BOTTOM) --- */}
                    <section>
                        <h3 className="mb-6 text-lg font-bold text-gray-700 uppercase tracking-wide">Company Direction</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {mission && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                    {mission.image_path && (
                                        <div className="h-64 w-full bg-gray-200">
                                            <img src={`/storage/${mission.image_path}`} alt="Mission" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="p-8">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mission</p>
                                        <h4 className="text-2xl font-extrabold text-gray-900 mb-4">{mission.title}</h4>
                                        <div className="prose text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                            {mission.content}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {vision && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                    {vision.image_path && (
                                        <div className="h-64 w-full bg-gray-200">
                                            <img src={`/storage/${vision.image_path}`} alt="Vision" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="p-8">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Vision</p>
                                        <h4 className="text-2xl font-extrabold text-gray-900 mb-4">{vision.title}</h4>
                                        <div className="prose text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                            {vision.content}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </section>

                </div>
            </div>

            {/* Announcement Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                {selectedAnnouncement && (
                    <div className="flex flex-col bg-white overflow-hidden max-h-[85vh]">
                        {selectedAnnouncement.image_path && (
                            <div className="relative w-full h-48 sm:h-64 shrink-0 bg-gray-100 border-b border-gray-200">
                                <img 
                                    src={`/storage/${selectedAnnouncement.image_path}`} 
                                    alt={selectedAnnouncement.title} 
                                    className="w-full h-full object-cover object-center" 
                                />
                            </div>
                        )}
                        <div className="p-6 sm:p-8 overflow-y-auto">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedAnnouncement.title}</h2>
                                    <p className="text-sm font-medium text-gray-500">
                                        Posted by {selectedAnnouncement.author} on {new Date(selectedAnnouncement.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="rounded-md border px-3 py-1 text-xs font-black uppercase tracking-wider shrink-0" style={getPastelStyle(selectedAnnouncement.priority_level?.color)}>
                                    {selectedAnnouncement.priority_level?.name || 'Notice'}
                                </span>
                            </div>
                            <hr className="my-6 border-gray-100" />
                            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {selectedAnnouncement.content}
                            </div>
                            <div className="mt-8 flex justify-end pt-4 bg-white sticky bottom-0">
                                <button onClick={closeModal} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
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