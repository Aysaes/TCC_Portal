import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import FlashMessage from '@/Components/FlashMessage';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function SidebarLayout({ header, children, sidebarLinks = [], activeModule = 'Dashboard' }) {
    const user = usePage().props.auth.user;
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
                <div className="flex h-16 items-center justify-center border-b border-gray-100 px-6">
                    <Link href={route('dashboard')}>
                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                    </Link>
                </div>

                <div className="overflow-y-auto px-4 py-6 text-sm font-medium">
                    <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {activeModule} Menu
                    </div>
                    
                    {/* Render the dynamic links passed into this layout */}
                    <ul className="space-y-2">
                        {sidebarLinks.map((link, index) => (
                            <li key={index}>
                                <Link
                                    href={link.href}
                                    className={`flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                                        link.active ? 'bg-gray-100 font-bold text-gray-900' : ''
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
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

                    <div className="flex flex-1 items-center justify-end space-x-4">

                        <Link 
                            href='#' 
                            className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none transition ease-in-out duration-150"
                        >
                           <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12c0-1.657 2.015-3 4.5-3S14 10.343 14 12m0 0c0-1.657 2.015-3 4.5-3S23 10.343 23 12"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20m-18 0c0 3.314 4.03 6 9 6s9-2.686 9-6M1 8l5 3.5" /></svg>
                            Duty Meal
                        </Link>
                        
                        {/* --- DOCUMENT REPOSITORY BUTTON --- */}
                        <Link 
                            href={route('admin.documents.index')} 
                            className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none transition ease-in-out duration-150"
                        >
                            <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Document Repository
                        </Link>

                        {/* THE MAIN MODULE SWITCHER */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none">
                                    Switch Module
                                    <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
                                
                                    <Dropdown.Link href="#">
                                        HR Module
                                    </Dropdown.Link>
                                
                                
                                    <Dropdown.Link href="#">
                                        Inventory Module
                                    </Dropdown.Link>
                                
                                
                                    <Dropdown.Link href="#">
                                        Procurement Module
                                    </Dropdown.Link>

                                    <Dropdown.Link href="#">
                                        Duty Meal Module
                                    </Dropdown.Link>
                                
                            </Dropdown.Content>
                        </Dropdown>

                        {/* PROFILE DROPDOWN */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none">
                                    {user.name}
                                    <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
                        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                            {header}
                        </div>
                    )}
                    {children}
                </main>

            </div>
        </div>
    );
}