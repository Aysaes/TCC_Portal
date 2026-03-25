import SidebarLayout from '@/Layouts/SidebarLayout';
import { getDashboardLinks } from '@/Config/navigation';
import { Head, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useState, useRef } from 'react';
import { formatAppDate } from '@/Utils/date';

export default function Overview({ auth, announcements, contents }) {
    const dashboardLinks = getDashboardLinks();
    const { system } = usePage().props;
    
    const announcementList = announcements.data || announcements || [];

    const chunkedAnnouncements = [];
    for (let i = 0; i < announcementList.length; i += 6) {
        chunkedAnnouncements.push(announcementList.slice(i, i + 6));
    }

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    // --- CAROUSEL AND PROGRESS BAR STATE ---
    const carouselRef = useRef(null);
    const [activeSlide, setActiveSlide] = useState(0);

    const handleScroll = (e) => {
        if (!carouselRef.current) return;
        const scrollPos = e.target.scrollLeft;
        const slideWidth = e.target.offsetWidth;
        const current = Math.round(scrollPos / slideWidth);
        if (current !== activeSlide) {
            setActiveSlide(current);
        }
    };

    const goToSlide = (index) => {
        if (carouselRef.current) {
            carouselRef.current.scrollTo({ left: index * carouselRef.current.offsetWidth, behavior: 'smooth' });
        }
    };

    // NEW: Updated to Loop Backwards
    const scrollLeft = () => {
        if (activeSlide === 0) {
            // If at the beginning, loop to the last page
            goToSlide(chunkedAnnouncements.length - 1);
        } else {
            goToSlide(activeSlide - 1);
        }
    };

    // NEW: Updated to Loop Forwards
    const scrollRight = () => {
        if (activeSlide === chunkedAnnouncements.length - 1) {
            // If at the end, loop back to the first page
            goToSlide(0);
        } else {
            goToSlide(activeSlide + 1);
        }
    };

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

            <style>{`
                .hide-scroll::-webkit-scrollbar { display: none; }
                .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-12">
                    
                    {/* Welcome Banner */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-100">
                        <div className="p-6 text-gray-900">
                            <span className="mr-2">🐾</span>Welcome to The Cat Clinic Purrtal, <strong>{auth.user.name}</strong>!
                        </div>
                    </div>

                    {/* --- RECENT ANNOUNCEMENTS SECTION --- */}
                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-lg font-bold text-gray-700 uppercase tracking-wide">Latest Announcements</h3>
                            <span className="text-xs text-gray-400 italic md:hidden">Swipe to see more &rarr;</span>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                            
                            {/* Left Arrow Button (NEW: Removed disabled state, always clickable) */}
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

                            {/* Carousel Container */}
                            <div 
                                ref={carouselRef} 
                                onScroll={handleScroll}
                                className="flex-1 flex overflow-x-auto snap-x snap-mandatory hide-scroll scroll-smooth pb-4 pt-2"
                            >
                                {chunkedAnnouncements.length === 0 ? (
                                    <div className="w-full rounded-lg border border-gray-100 bg-white p-6 text-center text-gray-500 shadow-sm">
                                        No announcements have been posted yet.
                                    </div>
                                ) : (
                                    chunkedAnnouncements.map((pageOfSix, pageIndex) => (
                                        
                                        <div key={pageIndex} className="w-full shrink-0 snap-center px-1">
                                            
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                                {pageOfSix.map((item) => {
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
                                                                    By {item.author} • {formatAppDate(item.created_at, system?.timezone)}
                                                                </p>
                                                                
                                                                <p className="mb-4 flex-1 whitespace-pre-wrap text-sm text-gray-600 leading-relaxed italic border-l-2 border-gray-100 pl-3 line-clamp-3">
                                                                    {item.content}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Right Arrow Button (NEW: Removed disabled state, always clickable) */}
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

                        {/* Progress Indicators (Dots/Bars) */}
                        {chunkedAnnouncements.length > 1 && (
                            <div className="flex justify-center items-center mt-4 mb-2 gap-2">
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
                    </section>

                    {/* --- MISSION & VISION SECTION --- */}
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
                                        Posted by {selectedAnnouncement.author} on {formatAppDate(selectedAnnouncement.created_at, system?.timezone)}
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
                            <div className="sticky bottom-0 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 pb-6 sm:px-8 sm:pb-8 pt-10 flex justify-end bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
                                <button 
                                    onClick={closeModal} 
                                    className="pointer-events-auto rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors shadow-sm"
                                >
                                    Close 
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </SidebarLayout>
    );
}
