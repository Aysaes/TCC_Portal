import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { getHRLinks } from '@/Config/navigation';

export default function AccountingApprovals({ auth, requests }) {

    const currentRole = auth.user?.role?.name || 'Guest';
    const HRLinks = getHRLinks(currentRole, auth);
    
    const requestList = requests || [];

    // --- TAB FILTERING LOGIC ---
    const [filter, setFilter] = useState('All');

    const tabs = [
        { name: 'All Requests', value: 'All' },
        { name: 'Pending', value: 'Pending' }, // "Pending" maps to "General Accounting"
        { name: 'Released', value: 'Released' },
        { name: 'Rejected', value: 'Rejected' },
    ];

    // Calculate counts for the badges
    const counts = {
        All: requestList.length,
        Pending: requestList.filter(r => r.status === 'General Accounting').length,
        Released: requestList.filter(r => r.status === 'Released').length,
        Rejected: requestList.filter(r => r.status === 'Rejected').length,
    };

    // Filter the table data based on the selected tab
    const filteredRequests = requestList.filter(req => {
        if (filter === 'All') return true;
        if (filter === 'Pending') return req.status === 'General Accounting';
        if (filter === 'Released') return req.status === 'Released';
        if (filter === 'Rejected') return req.status === 'Rejected';
        return true;
    });

    // --- ACTION HANDLER ---
    const handleAction = (id, actionStatus) => {
        if (confirm(`Are you sure you want to mark this request as ${actionStatus}?`)) {
            router.patch(route('hr.accounting.update', id), {
                status: actionStatus
            }, {
                preserveScroll: true
            });
        }
    };

    return (
        <SidebarLayout
            activeModule="HR"
            sidebarLinks={HRLinks}
        >
            <Head title="Accounting Approvals" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Header Section */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">General Accounting Approvals</h3>
                        <p className="text-gray-600">Review and process Form 2316 requests forwarded by HR.</p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {tabs.map((tab) => {
                                const isActive = filter === tab.value;
                                return (
                                    <button
                                        key={tab.name}
                                        onClick={() => setFilter(tab.value)}
                                        className={`
                                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                                            ${isActive 
                                                ? 'border-indigo-500 text-indigo-600' 
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                        `}
                                    >
                                        {tab.name}
                                        <span className={`
                                            rounded-full px-2.5 py-0.5 text-xs font-medium
                                            ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900'}
                                        `}>
                                            {counts[tab.value]}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Pending Requests Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        
                        {filteredRequests.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No requests found for the selected filter.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Date Requested</th>
                                            <th className="px-6 py-4">Employee Name</th>
                                            <th className="px-6 py-4">Document Type</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                    {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    {req.name || 'Unknown Employee'}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-indigo-900">
                                                    Form 2316
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide
                                                        ${req.status === 'General Accounting' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                                                        ${req.status === 'Released' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
                                                        ${req.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                                    `}>
                                                        {req.status === 'General Accounting' ? 'Pending' : req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    {req.status === 'General Accounting' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleAction(req.id, 'Released')}
                                                                className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm"
                                                            >
                                                                Release
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(req.id, 'Rejected')}
                                                                className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition-colors shadow-sm"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic font-medium">Processed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </SidebarLayout>
    );
}