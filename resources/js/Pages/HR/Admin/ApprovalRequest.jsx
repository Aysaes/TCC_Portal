import { getHRLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

import ConfirmModal from '@/Components/ConfirmModal';


export default function ApprovalRequest({ auth, requests = [], userRole = '' }) {

    // Global Confirm Modal
    const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, title: '', message: '', confirmText: '', confirmColor: '', onConfirm: () => {} 
    });
    
    // --- STATE MANAGEMENT ---
    const exactUserRole = userRole; 
    // 1. Force lowercase and remove any hidden spaces
    const roleLower = String(userRole).toLowerCase().trim();
    
    const isAdmin = roleLower === 'admin';
    
    // 2. 🟢 BULLETPROOF REQUESTER CHECK 🟢
    // Checks for "tl", "team leader", and "marketing manager"
    const isRequesterOnly = roleLower.includes('tl') || 
                            roleLower.includes('team leader') || 
                            roleLower === 'marketing manager';

    const hrLinks = getHRLinks(auth.user.role?.name || 'Employee', auth);
    
    // 3. Set the default tab correctly
    const [activeTab, setActiveTab] = useState((isRequesterOnly && !isAdmin) ? 'in-progress' : 'action-required');
    
    // Modal State
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // --- NEW SIMPLIFIED ACTION HELPER ---

    // STEP 1: Intercept the button click and open the custom modal
   const confirmAction = (requestId, status) => {
        const isApprove = status === 'Approved';
        const actionWord = isApprove ? 'Endorse' : 'Reject';
        
        setConfirmDialog({
            isOpen: true,
            title: `${actionWord} Request`,
            message: `Are you sure you want to ${actionWord.toLowerCase()} this manpower request?`,
            confirmText: actionWord,
            confirmColor: isApprove ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-500',
            onConfirm: () => {
                // Execute the actual network request when they click "Confirm"
                router.patch(route('hr.manpower-requests.update-status', requestId), {
                    status: status
                }, { 
                    preserveScroll: true,
                    onSuccess: () => {
                        closeConfirmModal();
                        closeModal(); // Also closes the details modal if it happens to be open
                    }
                });
            }
        });
    };

    // Helper to close the confirm modal without doing anything
    const closeConfirmModal = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
};

    const openModal = (req) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedRequest(null), 200); // Clear data after animation
    };

    // --- FILTERING LOGIC ---
    const getFilteredRequests = () => {
        return requests.filter(req => {
            if (activeTab === 'completed') return req.status === 'Approved' || req.status === 'Rejected';
            
            const currentApproverNeeded = req.workflow_path ? req.workflow_path[req.current_step] : null;
            const isMyTurn = currentApproverNeeded === exactUserRole || isAdmin;

            if (activeTab === 'action-required') return req.status === 'Pending' && isMyTurn;
            if (activeTab === 'in-progress') return req.status === 'Pending' && !isMyTurn;
            return true;
        });
    };

    const displayedRequests = getFilteredRequests();

    // --- VISUAL HELPERS ---
    const getStatusBadge = (status) => {
        if (status === 'Approved') return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-bold border border-green-200">Fully Approved</span>;
        if (status === 'Rejected') return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-bold border border-red-200">Rejected</span>;
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-bold border border-amber-200">In Progress</span>;
    };

    return (
        <SidebarLayout user={auth.user} activeModule="HR MENU" sidebarLinks={hrLinks}>
            <Head title={isRequesterOnly && !isAdmin ? "My Requests" : "Approval Board"} />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
                
                {/* HEADER */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{isRequesterOnly && !isAdmin ? "My Manpower Requests" : "Manpower Approval Board"}</h2>
                        <p className="mt-1 text-sm text-gray-500">Track and manage clinic hiring workflow.</p>
                    </div>
                    <Link href={route('hr.manpower-requests.create')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-indigo-500">
                        + New Request
                    </Link>
                </div>

                {/* TABS */}
                <div className="border-b border-gray-200 mb-6 flex gap-6">
                    {(!isRequesterOnly || isAdmin) && (
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
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Requester</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Position Needed</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Master Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Workflow Actions</th>
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

                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-indigo-700">{req.position?.name || 'N/A'}</div>
                                                <div className="text-xs text-gray-600 mt-1">{req.department?.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(req.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap flex justify-end gap-2">
                                                
                                                {/* 🟢 VIEW BUTTON 🟢 */}
                                                <button onClick={() => openModal(req)} className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md font-bold transition">
                                                    View Details
                                                </button>

                                                {/* QUICK ACTIONS */}
                                                {activeTab === 'action-required' && req.status !== 'Rejected' && (
                                                    <>
                                                        <button onClick={() => confirmAction(req.id, 'Rejected')} className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md font-bold transition">Reject</button>

                                                        <button onClick={() => confirmAction(req.id, 'Approved')} className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md font-bold transition">Endorse</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 🟢 THE DETAILS MODAL 🟢 */}
                {isModalOpen && selectedRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/60 backdrop-blur-sm p-4 sm:p-0">
                        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
                            
                            {/* Modal Header */}
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Request Details: {selectedRequest.position?.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Submitted by {selectedRequest.requester?.name} on {new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                                </div>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                                
                                {/* Status & Budget Strip */}
                                <div className="flex flex-wrap gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <div><span className="text-xs text-indigo-400 uppercase font-bold block">Status</span> {getStatusBadge(selectedRequest.status)}</div>
                                    <div><span className="text-xs text-indigo-400 uppercase font-bold block">Headcount</span> <span className="font-bold text-indigo-900">{selectedRequest.headcount}</span></div>
                                    <div><span className="text-xs text-indigo-400 uppercase font-bold block">Target Date</span> <span className="font-bold text-indigo-900">{new Date(selectedRequest.date_needed).toLocaleDateString()}</span></div>
                                    <div><span className="text-xs text-indigo-400 uppercase font-bold block">Budgeted?</span> 
                                        {selectedRequest.is_budgeted ? <span className="text-green-700 font-bold text-sm">Yes (Plantilla)</span> : <span className="text-red-600 font-bold text-sm">No (Unbudgeted)</span>}
                                    </div>
                                </div>

                                {/* Placement Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase border-b pb-2 mb-3">Placement Info</h4>
                                        <p className="text-sm mb-2"><span className="font-semibold text-gray-700">Branch:</span> {selectedRequest.branch?.name}</p>
                                        <p className="text-sm mb-2"><span className="font-semibold text-gray-700">Department:</span> {selectedRequest.department?.name}</p>
                                        <p className="text-sm mb-2"><span className="font-semibold text-gray-700">Type:</span> {selectedRequest.employment_status}</p>
                                        {selectedRequest.employment_status === 'Reliever' && <p className="text-sm mb-2 text-amber-600"><span className="font-semibold">Reliever Info:</span> {selectedRequest.reliever_info}</p>}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase border-b pb-2 mb-3">Position Context</h4>
                                        <p className="text-sm mb-2"><span className="font-semibold text-gray-700">New Position?</span> {selectedRequest.is_new_position ? 'Yes' : 'No'}</p>
                                        <p className="text-sm mb-2"><span className="font-semibold text-gray-700">Replacement?</span> {selectedRequest.is_replacement ? `Yes (${selectedRequest.replaced_employee_name})` : 'No'}</p>
                                    </div>
                                </div>

                                {/* Purpose & Skills */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase border-b pb-2 mb-3">Justification & Requirements</h4>
                                    
                                    {!selectedRequest.is_budgeted && (
                                        <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                                            <span className="font-bold text-red-800 text-sm block mb-1">Unbudgeted Justification:</span>
                                            <p className="text-sm text-red-700">{selectedRequest.unbudgeted_purpose}</p>
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <span className="font-semibold text-gray-700 text-sm block">General Purpose:</span>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">{selectedRequest.purpose}</p>
                                    </div>
                                    
                                    {selectedRequest.is_new_position === 1 && (
                                        <div className="mb-4">
                                            <span className="font-semibold text-gray-700 text-sm block">Job Description:</span>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1 whitespace-pre-wrap">{selectedRequest.job_description}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <p className="text-sm"><span className="font-semibold text-gray-700 block">Education:</span> {selectedRequest.educational_background}</p>
                                        <p className="text-sm"><span className="font-semibold text-gray-700 block">Experience:</span> {selectedRequest.years_experience}</p>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <span className="font-semibold text-gray-700 text-sm block">Required Skills:</span>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1 whitespace-pre-wrap">{selectedRequest.skills_required}</p>
                                    </div>
                                </div>
                                
                                {/* Visual Workflow Tracker inside Modal */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase border-b pb-2 mb-3">Approval Workflow</h4>
                                    <div className="flex flex-wrap gap-2 text-sm font-bold text-gray-500">
                                        {selectedRequest.workflow_path && selectedRequest.workflow_path.map((roleName, index) => {
                                            let dotColor = 'bg-gray-300'; 
                                            if (selectedRequest.status === 'Rejected' && index === selectedRequest.current_step) dotColor = 'bg-red-500';
                                            else if (index < selectedRequest.current_step || selectedRequest.status === 'Approved') dotColor = 'bg-green-500';
                                            else if (index === selectedRequest.current_step && selectedRequest.status === 'Pending') dotColor = 'bg-amber-400 animate-pulse';

                                            return (
                                                <span key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                                    <span className={`h-3 w-3 rounded-full ${dotColor}`}></span> 
                                                    {roleName}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>

                            {/* Modal Footer / Action Buttons */}
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
                                <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition">
                                    Close
                                </button>
                                
                                {/* Show Action buttons if it is currently this user's turn */}
                                {activeTab === 'action-required' && selectedRequest.status === 'Pending' && (
                                    <>
                                        <button onClick={() => confirmAction(selectedRequest.id, 'Rejected')} className="px-4 py-2 text-sm font-bold text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition">
                                             Reject Request
                                        </button>
                                        <button onClick={() => confirmAction(selectedRequest.id, 'Approved')} className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition">
                                            Endorse Request
                                        </button>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                )}
            </div>

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
