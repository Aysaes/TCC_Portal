import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
// Update this import path if your layout is located somewhere else!
import SidebarLayout from '@/Layouts/SidebarLayout';

export default function ApprovalsRequest({ auth, requests = [], userRole = '' }) {
    const [activeTab, setActiveTab] = useState('action-required');

    // --- ROLE CHECKS (Defensive lowercase matching) ---
    const role = String(userRole).toLowerCase();
    const isAdmin = role === 'admin';
    const isTeamLeader = role.includes('team leader');
    const isManager = ['chief vet', 'operations manager', 'clinic manager'].includes(role) || isAdmin;
    const isHR = role === 'hr manager' || isAdmin;
    const isDirector = role === 'director of corporate services and operations' || isAdmin;

    // --- ACTION HELPER ---
    const handleAction = (requestId, level, status) => {
        const actionWord = status === 'Approved' ? 'Approve' : 'Reject';
        if (!confirm(`Are you sure you want to ${actionWord} this request?`)) return;

        router.patch(route('hr.manpower-requests.update-status', requestId), {
            level: level,
            status: status
        }, { preserveScroll: true });
    };

    // --- FILTERING LOGIC FOR TABS ---
    const getFilteredRequests = () => {
        return requests.filter(req => {
            // 1. Completed Tab
            if (activeTab === 'completed') {
                return req.status === 'Approved' || req.status === 'Rejected';
            }

            // 2. Action Required Tab (Requests stuck waiting for THIS user)
            if (activeTab === 'action-required') {
                if (req.status !== 'Pending') return false;
                if (isManager && req.manager_approval_status === 'Pending') return true;
                if (isHR && req.manager_approval_status === 'Approved' && req.hr_approval_status === 'Pending') return true;
                if (isDirector && req.hr_approval_status === 'Approved' && req.director_approval_status === 'Pending') return true;
                return false;
            }

            // 3. In Progress Tab (Everything else that is pending)
            if (activeTab === 'in-progress') {
                if (req.status !== 'Pending') return false;
                // Exclude items that are currently needing *this* user's action
                const needsMyAction = 
                    (isManager && req.manager_approval_status === 'Pending') ||
                    (isHR && req.manager_approval_status === 'Approved' && req.hr_approval_status === 'Pending') ||
                    (isDirector && req.hr_approval_status === 'Approved' && req.director_approval_status === 'Pending');
                return !needsMyAction;
            }

            return true;
        });
    };

    const displayedRequests = getFilteredRequests();

    // --- VISUAL HELPERS ---
    const getStatusBadge = (status) => {
        if (status === 'Approved') return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-bold">Approved</span>;
        if (status === 'Rejected') return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-bold">Rejected</span>;
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-bold">Pending</span>;
    };

    const getStageDot = (status) => {
        if (status === 'Approved') return 'bg-green-500';
        if (status === 'Rejected') return 'bg-red-500';
        return 'bg-amber-400 animate-pulse';
    };

    return (
        <SidebarLayout user={auth.user} activeModule="HR">
            <Head title={isTeamLeader && !isAdmin ? "My Requests" : "Approval Board"} />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                {/* HEADER */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isTeamLeader && !isAdmin ? "My Manpower Requests" : "Manpower Approval Board"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">Track and manage clinic hiring requests.</p>
                    </div>
                    {(isTeamLeader || isHR || isAdmin) && (
                        <Link href={route('hr.manpower-requests.create')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-indigo-500">
                            + New Request
                        </Link>
                    )}
                </div>

                {/* TABS */}
                <div className="border-b border-gray-200 mb-6 flex gap-6">
                    {/* Hide 'Action Required' for Team Leaders since they only wait */}
                    {(!isTeamLeader || isAdmin) && (
                        <button 
                            onClick={() => setActiveTab('action-required')}
                            className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'action-required' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Action Required
                        </button>
                    )}
                    <button 
                        onClick={() => setActiveTab('in-progress')}
                        className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'in-progress' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        In Progress
                    </button>
                    <button 
                        onClick={() => setActiveTab('completed')}
                        className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'completed' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Completed / History
                    </button>
                </div>

                {/* DATA TABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Requester & Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Position Needed</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Master Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Approval Progress</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayedRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">
                                            No requests found in this category.
                                        </td>
                                    </tr>
                                ) : (
                                    displayedRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50">
                                            
                                            {/* Column 1: Requester */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{req.requester?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500 mt-1">{new Date(req.created_at).toLocaleDateString()}</div>
                                            </td>

                                            {/* Column 2: Position */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-indigo-700">{req.position?.name || 'N/A'}</div>
                                                <div className="text-xs text-gray-600 mt-1">{req.branch?.name} • {req.department?.name}</div>
                                                <div className="text-[10px] text-gray-400 uppercase mt-1">Headcount: {req.headcount}</div>
                                            </td>

                                            {/* Column 3: Master Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(req.status)}
                                            </td>

                                            {/* Column 4: The Progress / Action Buttons */}
                                            <td className="px-6 py-4 whitespace-nowrap flex flex-col items-end gap-2">
                                                
                                                {/* Visual Stage Tracker */}
                                                <div className="flex gap-4 text-xs font-medium text-gray-500 mb-2 border p-2 rounded-md bg-gray-50">
                                                    <span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${getStageDot(req.manager_approval_status)}`}></span> MGR</span>
                                                    <span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${getStageDot(req.hr_approval_status)}`}></span> HR</span>
                                                    <span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${getStageDot(req.director_approval_status)}`}></span> DIR</span>
                                                </div>

                                                {/* 🟢 ACTION BUTTONS (Only shows if they are on the Action Required tab and have authority) */}
                                                {activeTab === 'action-required' && req.status !== 'Rejected' && (
                                                    <div className="flex gap-2">
                                                        
                                                        {/* Manager Actions */}
                                                        {isManager && req.manager_approval_status === 'Pending' && (
                                                            <>
                                                                <button onClick={() => handleAction(req.id, 'manager', 'Rejected')} className="text-xs text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-md font-bold transition">Reject</button>
                                                                <button onClick={() => handleAction(req.id, 'manager', 'Approved')} className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md font-bold transition">Endorse (Mgr)</button>
                                                            </>
                                                        )}

                                                        {/* HR Actions */}
                                                        {isHR && req.manager_approval_status === 'Approved' && req.hr_approval_status === 'Pending' && (
                                                            <>
                                                                <button onClick={() => handleAction(req.id, 'hr', 'Rejected')} className="text-xs text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-md font-bold transition">Reject</button>
                                                                <button onClick={() => handleAction(req.id, 'hr', 'Approved')} className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md font-bold transition">Endorse (HR)</button>
                                                            </>
                                                        )}

                                                        {/* Director Actions */}
                                                        {isDirector && req.hr_approval_status === 'Approved' && req.director_approval_status === 'Pending' && (
                                                            <>
                                                                <button onClick={() => handleAction(req.id, 'director', 'Rejected')} className="text-xs text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-md font-bold transition">Reject</button>
                                                                <button onClick={() => handleAction(req.id, 'director', 'Approved')} className="text-xs text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md font-bold transition">Final Approve</button>
                                                            </>
                                                        )}

                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}