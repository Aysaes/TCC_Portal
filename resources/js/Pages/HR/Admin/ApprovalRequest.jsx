import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { formatAppDate } from '@/Utils/date';

export default function ApprovalsRequest({ auth, requests = [], userRole = '' }) {
    const { system } = usePage().props;
    // 1. DEFINE ROLES FIRST
    const exactUserRole = userRole; 
    const roleLower = String(userRole).toLowerCase();
    const isAdmin = roleLower === 'admin';
    const isTeamLeader = roleLower.includes('tl');

    // 2. DYNAMIC DEFAULT TAB
    // If they are a TL, open 'in-progress' by default. Otherwise, open 'action-required'.
    const [activeTab, setActiveTab] = useState(
        (isTeamLeader && !isAdmin) ? 'in-progress' : 'action-required'
    );
    // --- NEW SIMPLIFIED ACTION HELPER ---
    // Notice we no longer need to pass the 'level', just the status!
    const handleAction = (requestId, status) => {
        const actionWord = status === 'Approved' ? 'Approve' : 'Reject';
        if (!confirm(`Are you sure you want to ${actionWord} this request?`)) return;

        router.patch(route('hr.manpower-requests.update-status', requestId), {
            status: status
        }, { preserveScroll: true });
    };

    // --- DYNAMIC FILTERING LOGIC ---
    const getFilteredRequests = () => {
        return requests.filter(req => {
            if (activeTab === 'completed') {
                return req.status === 'Approved' || req.status === 'Rejected';
            }

            // Figure out whose turn it is right now
            const currentApproverNeeded = req.workflow_path ? req.workflow_path[req.current_step] : null;
            const isMyTurn = currentApproverNeeded === exactUserRole || isAdmin;

            if (activeTab === 'action-required') {
                return req.status === 'Pending' && isMyTurn;
            }

            if (activeTab === 'in-progress') {
                return req.status === 'Pending' && !isMyTurn;
            }

            return true;
        });
    };

    const displayedRequests = getFilteredRequests();

    // --- VISUAL HELPERS ---
    const getStatusBadge = (status) => {
        if (status === 'Approved') return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-bold shadow-sm border border-green-200">Fully Approved</span>;
        if (status === 'Rejected') return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-bold shadow-sm border border-red-200">Rejected</span>;
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-bold shadow-sm border border-amber-200">In Progress</span>;
    };

    return (
        <SidebarLayout user={auth.user} activeModule="HR">
            <Head title={isTeamLeader && !isAdmin ? "My Requests" : "Approval Board"} />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isTeamLeader && !isAdmin ? "My Manpower Requests" : "Manpower Approval Board"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">Track and manage clinic hiring workflow.</p>
                    </div>
                    <Link href={route('hr.manpower-requests.create')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-indigo-500">
                        + New Request
                    </Link>
                </div>

                {/* TABS */}
                <div className="border-b border-gray-200 mb-6 flex gap-6">
                    {(!isTeamLeader || isAdmin) && (
                        <button onClick={() => setActiveTab('action-required')} className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'action-required' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Action Required
                        </button>
                    )}
                    <button onClick={() => setActiveTab('in-progress')} className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'in-progress' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        In Progress
                    </button>
                    <button onClick={() => setActiveTab('completed')} className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'completed' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        Completed / History
                    </button>
                </div>

                {/* DATA TABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Requester</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Position Needed</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Master Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Workflow Progress</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayedRequests.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">No requests found in this category.</td></tr>
                                ) : (
                                    displayedRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50">
                                            
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{req.requester?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500 mt-1">{formatAppDate(req.created_at, system?.timezone)}</div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-indigo-700">{req.position?.name || 'N/A'}</div>
                                                <div className="text-xs text-gray-600 mt-1">{req.department?.name}</div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(req.status)}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap flex flex-col items-end gap-3">
                                                
                                                {/* 🟢 DYNAMIC STAGE TRACKER 🟢 */}
                                                <div className="flex flex-wrap justify-end gap-2 text-[10px] font-bold text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 max-w-sm">
                                                    {req.workflow_path && req.workflow_path.map((roleName, index) => {
                                                        
                                                        // Calculate dot colors based on current step
                                                        let dotColor = 'bg-gray-300'; // Default future step
                                                        if (req.status === 'Rejected' && index === req.current_step) dotColor = 'bg-red-500';
                                                        else if (index < req.current_step || req.status === 'Approved') dotColor = 'bg-green-500';
                                                        else if (index === req.current_step && req.status === 'Pending') dotColor = 'bg-amber-400 animate-pulse';

                                                        // Abbreviate the long Director title to save screen space
                                                        const displayName = roleName === 'Director of Corporate Services and Operations' ? 'DCSO' : roleName;

                                                        return (
                                                            <span key={index} className="flex items-center gap-1.5">
                                                                <span className={`h-2 w-2 rounded-full ${dotColor}`}></span> 
                                                                {displayName}
                                                                {index < req.workflow_path.length - 1 && <span className="text-gray-300 ml-1">→</span>}
                                                            </span>
                                                        );
                                                    })}
                                                </div>

                                                {/* 🟢 ACTION BUTTONS 🟢 */}
                                                {activeTab === 'action-required' && req.status !== 'Rejected' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleAction(req.id, 'Rejected')} className="text-xs text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-md font-bold transition">Reject</button>
                                                        <button onClick={() => handleAction(req.id, 'Approved')} className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md font-bold transition">Endorse</button>
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
