import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import FlashMessage from '@/Components/FlashMessage';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function SidebarLayout({ header, children, sidebarLinks = [], activeModule = 'Dashboard', headerClassName = '' }) {
    const user = usePage().props.auth.user;
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const currentModuleLabel =
        activeModule === 'Admin'
            ? 'Admin Module'
            : ['HR', 'HR MENU', 'HR ADMIN'].includes(activeModule)
              ? 'HR Module'
              : activeModule === 'Duty Meals'
                ? 'Duty Meal Module'
                : activeModule === 'Document Repository'
                  ? 'Admin Module'
                  : 'Select Module';
    const priorityLinkLabel =
        activeModule === 'HR'
            ? 'HR Admin Overview'
            : activeModule === 'HR MENU'
            ? 'HR Admin Overview'
            : activeModule === 'HR ADMIN'
              ? 'HR Module Overview'
              : null;
    const priorityLink = priorityLinkLabel
        ? sidebarLinks.find((link) => link.label === priorityLinkLabel)
        : null;
    const regularSidebarLinks = priorityLink
        ? sidebarLinks.filter((link) => link.label !== priorityLinkLabel)
        : sidebarLinks;
    const customDocumentCategoryIcon = (
        <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 12h10M7 17h6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">

            <FlashMessage/>
            
            {/* --- MOBILE SIDEBAR BACKDROP --- */}
            {isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black/50 sm:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* --- LEFT SIDEBAR (Dynamic Sub-Modules) --- */}
            <aside 
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out sm:translate-x-0 sm:static sm:inset-0 ${
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-20 items-center justify-center border-b border-gray-100 px-6">
                    <Link href={route('dashboard')} className="-ml-6 inline-flex items-center gap-0">
                        <ApplicationLogo className="block h-14 w-auto fill-current text-gray-800 sm:h-16" />
                        <span className="-ml-0.5 whitespace-nowrap text-lg font-semibold text-gray-800 sm:text-xl">The Cat Clinic</span>
                    </Link>
                </div>

                <div className="overflow-y-auto px-4 py-6 text-sm font-medium">
                    {/* Dashboard Button - only show on non-General modules */}
                    {activeModule !== 'General' && (
                        <div className="mb-4">
                            <Link
                                href={route('dashboard')}
                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-black hover:bg-gray-100 hover:text-black transition ease-in-out duration-150"
                            >
                                <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V9h6v12" />
                                </svg>
                                Dashboard
                            </Link>
                        </div>
                    )}

                    {/* Quick Links - only show on Dashboard */}
                    {activeModule === 'General' && (
                        <div className="mb-4">
                            <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Quick Links
                            </div>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href={route('staff.duty-meals.index')}
                                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    >
                                        <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5l7 7-7 7" />
                                        </svg>
                                        Duty Meal
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('admin.documents.index')}
                                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    >
                                        <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4h8" />
                                        </svg>
                                        Document Repository
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    )}

                    {priorityLink && (
                        <div className="mb-4">
                            <Link
                                href={priorityLink.href}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                                    priorityLink.active ? 'bg-gray-100 font-bold text-gray-900' : ''
                                }`}
                            >
                                <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>{priorityLink.label}</span>
                            </Link>
                        </div>
                    )}

                    <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {activeModule} Menu
                    </div>

                    <ul className="space-y-2">
                        {regularSidebarLinks.map((link, index) => {
                            const iconSvg = {
                                
                                Overview: (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V9h6v12" />
                                    </svg>
                                ),
                                Announcements: (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 8a3 3 0 00-6 0v7a3 3 0 006 0V8z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h1m14 0h1" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6" />
                                    </svg>
                                ),
                                'Mission & Vision': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3m-12 0H3m15.364-6.364l-2.121 2.121m-9.192 9.192l-2.121 2.121m0-12.727l2.121 2.121m9.192 9.192l2.121 2.121" />
                                    </svg>
                                ),
                                'Organizational Chart': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h8M8 12h8M8 18h8" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12" />
                                    </svg>
                                ),
                                'Duty Meals': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5l7 7-7 7" />
                                    </svg>
                                ),
                                'Duty Meal Overview': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5l7 7-7 7" />
                                    </svg>
                                ),
                                'Set Up Roster': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                ),
                                'Duty Meal Archive': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m4-4v4" />
                                    </svg>
                                ),
                                'Document Overview': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4h8" />
                                    </svg>
                                ),
                                'Admin Overview': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                ),
                                'Employee Management': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM16 16a5 5 0 10-10 0" />
                                    </svg>
                                ),
                                'Announcements & Notices': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 8a3 3 0 00-6 0v7a3 3 0 006 0V8z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h1m14 0h1" />
                                        <path strokeLineCap="round" strokeLinejoin="round" d="M9 17h6" />
                                    </svg>
                                ),
                                'Company Content Management': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4m0 0l-4-4m4 4H3" />
                                    </svg>
                                ),
                                'System Logs & Security': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v2h8z" />
                                    </svg>
                                ),
                                'HR Admin Overview': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                ),
                                'HR Module Overview': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h4v7H4v-7zM10 4h4v16h-4V4zM16 9h4v11h-4V9z" />
                                    </svg>
                                ),
                                'Manpower Request': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                ),
                                'Approval Board': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
                                    </svg>
                                ),
                                'Document Request': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 11h8M8 15h5" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
                                    </svg>
                                ),
                                'Pending Document Request': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 11h8M8 15h5" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
                                    </svg>
                                ),
                                'Feedback Form': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                'Feedback Form Submissions': (
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 13h5" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                                    </svg>
                                ),
                            };

                            return (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                                            link.active ? 'bg-gray-100 font-bold text-gray-900' : ''
                                        }`}
                                    >
                                        {link.icon === 'document-category'
                                            ? customDocumentCategoryIcon
                                            : (iconSvg[link.label] || <div className="h-4 w-4 rounded bg-gray-200" />)}
                                        <span>{link.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </aside>

            {/* --- MAIN CONTENT WRAPPER --- */}
            <div className="flex flex-1 flex-col overflow-hidden">
                
                {/* --- TOP NAVBAR (Main Modules & Profile) --- */}
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
                    
                    {/* Mobile Hamburger to open Sidebar */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none sm:hidden"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">

                        {/* NOTIFICATION DROPDOWN */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none"
                                    aria-label="Notifications"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0018 9.75V9a6 6 0 10-12 0v.75a8.967 8.967 0 00-2.312 6.022c1.733.64 3.563 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                    </svg>
                                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="right" width="80">
                                <div className="px-4 py-3">
                                    <div className="text-sm font-semibold text-gray-900">Notifications</div>
                                    <p className="mt-1 text-xs text-gray-500">No new notifications yet.</p>
                                </div>
                            </Dropdown.Content>
                        </Dropdown>

                        {/* THE MAIN MODULE SWITCHER */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                 <button className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none sm:px-4">
                                    {currentModuleLabel}
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                {/* Role-based Module Links */}
                                {(user.role?.name === 'admin') && (
                                    <Dropdown.Link href={route('admin.dashboard')}>
                                        Admin Module
                                    </Dropdown.Link>
                                )}
                                
                                    <Dropdown.Link href={route('hr.index')}>
                                    HR Module
                                    </Dropdown.Link>
                                
                                
                                    {(user.role?.name === 'admin') && (
                                        <Dropdown.Link href={route('prpo.products.index')}>
                                            PR/PO Module
                                        </Dropdown.Link>
)}
                                
                                    {['admin', 'duty meal custodian'].includes(user.role?.name) && (
                                        <Dropdown.Link href={route('admin.duty-meals.index')}>
                                            Duty Meal Module
                                        </Dropdown.Link>
                                    )}
                            </Dropdown.Content>
                        </Dropdown>

                        {/* PROFILE DROPDOWN */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none sm:px-4">
                                    {user.name}
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>

                    </div>
                </header>

                {/* --- PAGE HEADER & CONTENT --- */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
                    {header && (
                        <div className={`mb-3 rounded-lg bg-white p-4 shadow-sm sm:mb-6 ${headerClassName}`.trim()}>
                            {header}
                        </div>
                    )}
                    {children}
                </main>

            </div>
        </div>
    );
}
