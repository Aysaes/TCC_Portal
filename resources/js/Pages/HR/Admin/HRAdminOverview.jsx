import SidebarLayout from '@/Layouts/SidebarLayout';
import { getHRAdminLinks } from '@/Config/navigation';
import { Head, router, usePage } from '@inertiajs/react';
import { formatAppDate } from '@/Utils/date';
import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function HRAdminOverview({ auth, requests }) {
    const hrLinks = getHRAdminLinks(auth);
    const { system } = usePage().props;

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
    const handleAction = (id, actionType) => {
        // If clicking reject, open the modal instead of submitting immediately
        if (actionType === 'reject') {
            setRejectingId(id);
            setRejectReason('');
            setIsRejectModalOpen(true);
            return;
        }

        // For Accept, keep the standard confirmation
        if (confirm('Are you sure you want to approve this request?')) {
            router.patch(route('hr.admin.update-status', id), { 
                action: actionType 
            }, { 
                preserveScroll: true 
            });
        }
    };

    // --- SUBMIT REJECTION ---
    const submitRejection = (e) => {
        e.preventDefault();
        router.patch(route('hr.admin.update-status', rejectingId), {
            action: 'reject',
            remarks: rejectReason // Send the reason to the backend
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsRejectModalOpen(false);
                setRejectingId(null);
                setRejectReason('');
            }
        });
    };

    // Helper to style the status badges perfectly
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending HR': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'General Accounting': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Released': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <SidebarLayout activeModule="HR ADMIN" sidebarLinks={hrLinks}>
            <Head title="HR Admin Overview" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Pending Document Requests</h1>
                        <p className="text-gray-500 text-sm mt-1">Review, approve, or reject employee document requests.</p>
                    </div>

                    {/* TABLE CONTAINER */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        {requestList.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No requests are currently in the system.
                            </div>
                        ) : (
                            /* MAX-H-[400px] + OVERFLOW creates the scrollbar effect */
                            <div className="overflow-x-auto overflow-y-auto max-h-[400px] relative w-full custom-scrollbar">
                                <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-600">
                                    {/* STICKY HEADER */}
                                    <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Requestor</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Document Type</th>
                                            <th className="px-6 py-4">Details / Reason</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {requestList.map((req) => (
                                            <tr 
                                                key={req.id} 
                                                onClick={() => openViewModal(req)}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-gray-900">{req.user?.name || 'Unknown User'}</div>
                                                    <div className="text-xs text-gray-500">{req.user?.email || ''}</div>
                                                </td>

                                                <td className="px-6 py-4 font-medium text-gray-500 whitespace-nowrap">
                                                    {formatAppDate(req.created_at, system?.timezone)}
                                                </td>

                                                <td className="px-6 py-4 font-bold text-indigo-900 whitespace-nowrap">
                                                    {req.type === 'COE' ? 'COE' : 'Form 2316'}
                                                </td>

                                                {/* FIX 1: Added max-w-xs to restrict width */}
                                                <td className="px-6 py-4">
                                                    {req.type === 'COE' ? (
                                                        <div className="max-w-xs">
                                                            <span className="font-semibold block text-gray-800">{req.reason}</span>
                                                            {/* Added break-all and line-clamp-2 */}
                                                            {req.specific_details && <span className="text-xs text-gray-500 break-all line-clamp-2">{req.specific_details}</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Standard Tax Form</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${getStatusStyle(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                </td>

                                                {/* Actions Column - stopPropagation prevents row click from firing */}
                                                <td 
                                                    className="px-6 py-4 text-right whitespace-nowrap"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {req.status === 'Pending HR' ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleAction(req.id, 'reject')}
                                                                className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAction(req.id, 'accept')}
                                                                className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-sm"
                                                            >
                                                                Accept
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Processed</span>
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
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Requestor</label>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {selectedRequest.user?.name || 'Unknown User'}
                                </p>
                                <p className="text-xs text-gray-500">{selectedRequest.user?.email || ''}</p>
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
                                    {formatAppDate(selectedRequest.created_at, system?.timezone)}
                                </p>
                            </div>

                            {selectedRequest.type === 'COE' && (
                                <>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedRequest.reason}</p>
                                    </div>
                                    
                                    {selectedRequest.specific_details && (
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Specific Details</label>
                                            {/* FIX 2: Added break-all to prevent modal stretching */}
                                            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap break-all">{selectedRequest.specific_details}</p>
                                        </div>
                                    )}
                                </>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Status</label>
                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold uppercase tracking-wide ${getStatusStyle(selectedRequest.status)}`}>
                                    {selectedRequest.status}
                                </span>
                            </div>

                            {/* --- THE REJECTION REMARKS SECTION --- */}
                            {selectedRequest.status === 'Rejected' && selectedRequest.remarks && (
                                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                    <label className="block text-xs font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Reason for Rejection
                                    </label>
                                    {/* Added break-all here too just to be safe! */}
                                    <p className="text-sm text-red-700 whitespace-pre-wrap leading-relaxed break-all">
                                        {/* Optional: Strip the "HR|" prefix if it exists so the Admin doesn't see their own tag */}
                                        {selectedRequest.remarks.startsWith('HR|') 
                                            ? selectedRequest.remarks.substring(3) 
                                            : selectedRequest.remarks}
                                    </p>
                                </div>
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

            {/* --- REJECTION REASON INPUT MODAL --- */}
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
                                Please provide a brief reason why this document request is being rejected.
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                rows="4"
                                placeholder="e.g., Missing requirements, incorrect form..."
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