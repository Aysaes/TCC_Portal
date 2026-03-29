import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { getHRLinks } from '@/Config/navigation';
import Modal from '@/Components/Modal';

export default function AccountingApprovals({ auth, requests }) {

    const currentRole = auth.user?.role?.name || 'Guest';
    const HRLinks = getHRLinks(currentRole, auth);
    
    // We now just use the raw request list since tabs are removed
    const requestList = requests || [];

    // --- VIEW DETAILS MODAL STATE ---
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const openViewModal = (req) => {
        setSelectedRequest(req);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setTimeout(() => setSelectedRequest(null), 300);
    };

    // --- REJECTION MODAL STATE ---
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // --- ACTION HANDLER ---
    const handleAction = (id, actionStatus) => {
        if (actionStatus === 'Rejected') {
            setRejectingId(id);
            setRejectReason('');
            setIsRejectModalOpen(true);
            return;
        }

        if (confirm(`Are you sure you want to mark this request as ${actionStatus}?`)) {
            router.patch(route('hr.accounting.update', id), {
                status: actionStatus
            }, {
                preserveScroll: true
            });
        }
    };

    // --- SUBMIT REJECTION ---
    const submitRejection = (e) => {
        e.preventDefault();
        router.patch(route('hr.accounting.update', rejectingId), {
            status: 'Rejected',
            remarks: rejectReason 
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsRejectModalOpen(false);
                setRejectingId(null);
                setRejectReason('');
            }
        });
    };

    return (
        <SidebarLayout activeModule="HR" sidebarLinks={HRLinks}>
            <Head title="Accounting Approvals" />

            {/* Changed py-12 to py-8 to give a little more vertical room and prevent outer scrolling */}
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Header Section */}
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">General Accounting Approvals</h3>
                            <p className="text-gray-600 text-sm">Review and process Form 2316 requests forwarded by HR.</p>
                        </div>
                    </div>

                    {/* Requests Table Container */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        {requestList.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No requests found.
                            </div>
                        ) : (
                            /* THE SCROLLBAR FIX: max-h-[400px] and custom-scrollbar applied here */
                            <div className="overflow-x-auto overflow-y-auto max-h-[400px] relative w-full custom-scrollbar">
                                <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-600">
                                    {/* STICKY HEADER */}
                                    <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px] font-bold shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4">Date Requested</th>
                                            <th className="px-6 py-4">Employee Name</th>
                                            <th className="px-6 py-4">Document Type</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {/* Now mapping over requestList instead of filteredRequests */}
                                        {requestList.map((req) => (
                                            <tr 
                                                key={req.id} 
                                                onClick={() => openViewModal(req)}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors group"
                                            >
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
                                                
                                                {/* ACTIONS COLUMN - stopPropagation prevents row click from firing */}
                                                <td 
                                                    className="px-6 py-4 text-right whitespace-nowrap"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
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

            {/* --- VIEW DETAILS MODAL --- */}
            <Modal show={isViewModalOpen} onClose={closeViewModal} maxWidth="md">
                {selectedRequest && (
                    <div className="p-6 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-4 mb-5">
                            <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                            <button onClick={closeViewModal} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Employee Name</label>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {selectedRequest.user?.name || selectedRequest.name || 'Unknown Employee'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Document Type</label>
                                <p className="mt-1 text-sm font-semibold text-indigo-900">
                                    {selectedRequest.type === 'COE' ? 'Certificate of Employment' : 'Form 2316'}
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Date Requested</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {new Date(selectedRequest.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Status</label>
                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold uppercase tracking-wide
                                    ${selectedRequest.status === 'General Accounting' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                                    ${selectedRequest.status === 'Released' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
                                    ${selectedRequest.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                `}>
                                    {selectedRequest.status === 'General Accounting' ? 'Pending' : selectedRequest.status}
                                </span>
                            </div>

                            {/* --- THE REJECTION REMARKS SECTION (WITH PREFIX PARSING & BREAK-ALL) --- */}
                            {selectedRequest.status === 'Rejected' && selectedRequest.remarks && (
                                (() => {
                                    let rejector = 'Admin';
                                    let cleanRemarks = selectedRequest.remarks || '';

                                    // Parse the prefix
                                    if (cleanRemarks.startsWith('HR|')) {
                                        rejector = 'HR ADMIN';
                                        cleanRemarks = cleanRemarks.substring(3);
                                    } else if (cleanRemarks.startsWith('ACCOUNTING|')) {
                                        rejector = 'GENERAL ACCOUNTING';
                                        cleanRemarks = cleanRemarks.substring(11);
                                    }

                                    return (
                                        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                            <label className="block text-xs font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Reason for Rejection (By {rejector})
                                            </label>
                                            {/* ADDED break-all to fix the overflow */}
                                            <p className="text-sm text-red-700 whitespace-pre-wrap leading-relaxed break-all">
                                                {cleanRemarks || 'No specific reason was provided.'}
                                            </p>
                                        </div>
                                    );
                                })()
                            )}

                        </div>

                        <div className="mt-8 flex justify-end pt-4 border-t">
                            <button
                                onClick={closeViewModal}
                                className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Rejection Reason Modal */}
            <Modal show={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} maxWidth="md">
                <div className="p-6 max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b pb-4 mb-5">
                        <h2 className="text-xl font-bold text-gray-900">Reason for Rejection</h2>
                        <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <form onSubmit={submitRejection}>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Please provide a brief reason why this Form 2316 request is being rejected.
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                rows="4"
                                placeholder="e.g., Incomplete details, invalid clearance status..."
                                required
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setIsRejectModalOpen(false)}
                                className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-md bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-500 transition-colors"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </SidebarLayout>
    );
}