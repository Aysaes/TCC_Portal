import ConfirmModal from '@/Components/ConfirmModal';
import TrackingStepper from '@/Components/TrackingStepper';
import { getPRPOLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ApprovalBoard({ auth, requests, currentView, userBranches = [] }) {
    const sidebarLinks = getPRPOLinks(auth);

    const userRole = auth.user.role?.name?.toLowerCase().trim() || '';
    const canManagePO = ['procurement assist', 'procurement tl', 'director of corporate services and operations', 'admin'].includes(userRole);

    const isInvTL = userRole.includes('inventory tl') || userRole === 'admin';
    const isOpsManager = userRole.includes('operations') || userRole.includes('operations manager') || userRole === 'admin';

    // Global Confirm Modal State
    const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, title: '', message: '', confirmText: '', confirmColor: '', onConfirm: () => {} 
    });
    
    const closeConfirmModal = () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
    };
    
    // Details Modal State
    const [selectedPR, setSelectedPR] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🟢 REJECTION MODAL STATE
    const [rejectModal, setRejectModal] = useState({ isOpen: false, prId: null, reason: '' });

    const openRejectModal = (id) => {
        setRejectModal({ isOpen: true, prId: id, reason: '' });
    };

    const closeRejectModal = () => {
        setRejectModal({ isOpen: false, prId: null, reason: '' });
    };

    const submitRejection = () => {
        router.patch(route('prpo.purchase-requests.update-status', rejectModal.prId), 
        { action: 'reject', rejection_reason: rejectModal.reason }, 
        {
            preserveScroll: true,
            onSuccess: () => { 
                closeRejectModal(); 
                closeModal(); 
            } 
        });
    };

    // SECURITY LOGIC: Role-based approval checking
    const canApprove = (pr) => {
        if (!pr) return false;
        const hasBranchAccess = userRole === 'admin' || userBranches.includes(pr.branch);
        if (pr.status === 'pending_inv_tl' && isInvTL && hasBranchAccess) return true;
        if (pr.status === 'pending_ops_manager' && isOpsManager && hasBranchAccess) return true;
        return false;
    };

    const formatStatus = (status) => {
        const statusMap = {
            'pending_inv_tl': { label: 'Pending Inv. TL', color: 'bg-yellow-100 text-yellow-800' },
            'pending_ops_manager': { label: 'Pending Ops. Manager', color: 'bg-orange-100 text-orange-800' },
            'approved': { label: 'PO Ready', color: 'bg-indigo-100 text-indigo-800' },
            'po_generated': { label: 'PO Generated', color: 'bg-teal-100 text-teal-800' }, 
            'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800' },
            'cancelled': { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' } 
        };
        const mapped = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
        return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${mapped.color}`}>{mapped.label}</span>;
    };

    const handleAction = (id, actionType) => {
        // If action is reject, intercept and open the custom reject modal!
        if (actionType === 'reject') {
            openRejectModal(id);
            return;
        }

        const isApprove = actionType === 'approve';
        const isCancel = actionType === 'cancel';
        
        let title = isApprove ? 'Approve' : 'Cancel';
        let confirmColor = isApprove ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 hover:bg-gray-500';

        setConfirmDialog({
            isOpen: true,
            title: `${title} Request`,
            message: isCancel ? 'Are you sure you want to cancel this purchase request?' : `Are you sure you want to ${actionType} this purchase request?`,
            confirmText: title,
            confirmColor: confirmColor,
            onConfirm: () => {
                router.patch(route('prpo.purchase-requests.update-status', id), 
                { action: actionType }, 
                {
                    preserveScroll: true,
                    onSuccess: () => { 
                        closeConfirmModal(); 
                        closeModal(); 
                    } 
                });
            }
        });
    };

    const handleGeneratePO = (id) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Generate Purchase Orders',
            message: 'Are you sure you want to generate Purchase Orders for this approved request? This action cannot be undone.',
            confirmText: 'Generate PO(s)',
            confirmColor: 'bg-indigo-600 hover:bg-indigo-500',
            onConfirm: () => {
                router.post(route('prpo.purchase-requests.generate-pos', id), {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        closeConfirmModal();
                        closeModal();
                    }
                });
            }
        });
    };

    const openModal = (pr) => {
        setSelectedPR(pr);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedPR(null), 200); 
    };

    const getHeaderContent = () => {
        switch(currentView) {
            case 'my_requests': return { title: 'My Purchase Requests', desc: 'Track the status of PRs you have submitted.' };
            case 'action_needed': return { title: 'Pending Approvals', desc: 'Review and manage purchase requests awaiting your action.' };
            case 'finished': return { title: 'Finished Requests', desc: 'History of purchase requests you have already processed.' };
            case 'all': return { title: 'All Active PRs', desc: 'Overview of all purchase requests in the system.' };
            default: return { title: 'My Purchase Requests', desc: 'Track the status of PRs you have submitted.' };
        }
    };
    const headerContent = getHeaderContent();

    return (
        <SidebarLayout activeModule="PR/PO Module" sidebarLinks={sidebarLinks}>
            <Head title={headerContent.title} />

            <div className="mx-auto max-w-7xl py-6 relative">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{headerContent.title}</h2>
                        <p className="mt-1 text-sm text-gray-500">{headerContent.desc}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1 w-fit border border-gray-200">
                    <Link 
                        href={route('prpo.approval-board', { view: 'my_requests' })} 
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${currentView === 'my_requests' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    >
                        My Requests
                    </Link>

                    {!userRole.includes('inventory assist') && (
                        <>
                            <Link 
                                href={route('prpo.approval-board', { view: 'action_needed' })} 
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${currentView === 'action_needed' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                            >
                                Approvals {currentView !== 'action_needed'}
                            </Link>

                            <Link 
                                href={route('prpo.approval-board', { view: 'finished' })} 
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${currentView === 'finished' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                            >
                                Finished Requests
                            </Link>
                        </>
                    )}

                    {(userRole.includes('admin') || userRole.includes('director')) && (
                        <Link 
                            href={route('prpo.approval-board', { view: 'all' })} 
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${currentView === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                        >
                            All Active PRs
                        </Link>
                    )}
                </div>

                {/* --- MAIN TABLE --- */}
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-gray-900">PR ID / Ref</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">Prepared By</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">Branch & Dept</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">Priority</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">Date Needed</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">Items Count</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-3 font-semibold text-gray-900"></th> {/* Actions Column */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {requests.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">No requests found for this view.</td>
                                </tr>
                            ) : (
                                requests.data.map((pr) => (
                                    <tr 
                                        key={pr.pr_number} 
                                        onClick={() => openModal(pr)} 
                                        className="hover:bg-gray-50 transition cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-medium text-indigo-600 hover:text-indigo-900">{pr.pr_number}</td>
                                        <td className="px-6 py-4">{pr.user?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4">{pr.branch} <br/><span className="text-xs text-gray-500">{pr.department}</span></td>
                                        
                                        <td className="px-6 py-4">
                                            {pr.priority ? (
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${
                                                    pr.priority === 'High' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                    pr.priority === 'Normal' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                                                    'bg-gray-50 text-gray-600 ring-gray-500/10'
                                                }`}>
                                                    {pr.priority}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">N/A</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">{pr.date_needed}</td>
                                        <td className="px-6 py-4 font-medium">{pr.items?.length || 0} Items</td>
                                        <td className="px-6 py-4">{formatStatus(pr.status)}</td>
                                        
                                        {/* 🟢 NEW ACTION BUTTONS COLUMN */}
                                        <td className="whitespace-nowrap px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                {canApprove(pr) && currentView === 'action_needed' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleAction(pr.id, 'approve')}
                                                            title="Approve Request"
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 transition-colors hover:bg-green-100 hover:text-green-800"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                            </svg>
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(pr.id, 'reject')}
                                                            title="Reject Request"
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-100 hover:text-red-800"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- DETAILS MODAL --- */}
                {isModalOpen && selectedPR && (
                    <div 
                        onClick={closeModal}
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50 p-4 sm:p-0"
                    >
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-5xl rounded-xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedPR.pr_number}</h3>
                                    <p className="text-sm text-gray-500">Prepared by {selectedPR.user?.name} on {selectedPR.date_prepared}</p>
                                </div>
                                
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="overflow-y-auto px-6 py-4 flex-grow">
                                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-lg bg-gray-50 p-4 text-sm">
                                    <div><span className="block font-semibold text-gray-900">CC</span> {selectedPR.cc_user?.name || 'N/A'}</div>
                                    <div><span className="block font-semibold text-gray-900">Branch</span> {selectedPR.branch}</div>
                                    <div><span className="block font-semibold text-gray-900">Department</span> {selectedPR.department}</div>
                                    <div><span className="block font-semibold text-gray-900">Request Type</span> {selectedPR.request_type || 'N/A'}</div>
                                    
                                    <div><span className="block font-semibold text-gray-900">Priority</span> {selectedPR.priority || 'N/A'}</div>
                                    
                                    <div><span className="block font-semibold text-gray-900">Date Needed</span> <span className="text-red-600 font-bold">{selectedPR.date_needed}</span></div>
                                    <div><span className="block font-semibold text-gray-900">Budget Status</span> {selectedPR.budget_status || 'N/A'}</div>
                                    <div><span className="block font-semibold text-gray-900">Budget Ref.</span> {selectedPR.budget_ref}</div>
                                    <div><span className="block font-semibold text-gray-900">Status</span> {formatStatus(selectedPR.status)}</div>

                                    {selectedPR.purpose_of_request && (
                                        <div className="col-span-2 sm:col-span-4 mt-2">
                                            <span className="block font-semibold text-gray-900">Purpose of Request</span>
                                            <p className="text-gray-600 break-words break-all whitespace-pre-wrap">{selectedPR.purpose_of_request}</p>
                                        </div>
                                    )}
                                </div>

                                {/* REJECTION REASON DISPLAY */}
                                {selectedPR.status === 'rejected' && selectedPR.rejection_reason && (
                                    <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-100">
                                        <span className="block font-bold text-red-800 text-sm mb-1">Reason for Rejection:</span>
                                        <p className="text-red-700 text-sm whitespace-pre-wrap">{selectedPR.rejection_reason}</p>
                                    </div>
                                )}

                                <h4 className="mb-2 font-bold text-gray-900 border-b pb-1">Requested Items ({selectedPR.items.length})</h4>
                                <div className="overflow-x-auto rounded-lg border mb-6">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm text-left table-fixed">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold w-1/4">Product</th>
                                                <th className="px-4 py-2 font-semibold w-1/3">Specs</th>
                                                <th className="px-4 py-2 font-semibold w-16">Unit</th>
                                                <th className="px-4 py-2 font-semibold text-center w-20">Qty Req.</th>
                                                <th className="px-4 py-2 font-semibold text-center w-20">On Hand</th>
                                                <th className="px-4 py-2 font-semibold w-32">Supplier</th>
                                                <th className="px-4 py-2 font-semibold text-right w-24">Total Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {selectedPR.items.map((item, idx) => (
                                                <tr key={item.id || idx}>
                                                    <td className="px-4 py-3 font-medium text-gray-900 truncate" title={item.product?.name || `Product ID: ${item.product_id}`}>
                                                        {item.product?.name || `Product ID: ${item.product_id}`}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 max-w-xs break-words break-all whitespace-normal">
                                                        {item.specifications || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">{item.unit || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-bold">{item.qty_requested}</td>
                                                    <td className="px-4 py-3 text-center text-gray-500">{item.qty_on_hand}</td>
                                                    <td className="px-4 py-3 text-gray-500 truncate" title={item.supplier?.name || '-'}>
                                                        {item.supplier?.name || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium">₱{Number(item.total_cost).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 font-bold">
                                            <tr>
                                                <td colSpan="6" className="px-4 py-3 text-right">Grand Total:</td>
                                                <td className="px-4 py-3 text-right text-indigo-700">
                                                    ₱{selectedPR.items.reduce((sum, item) => sum + Number(item.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Tracker Component */}
                                <div className="px-4 sm:px-12">
                                    <TrackingStepper currentStatus={selectedPR.status} type="PR" />
                                </div>
                            </div>

                            {/* Modal Footer (Actions) */}
                            <div className="flex items-center justify-end gap-3 rounded-b-xl border-t bg-gray-50 px-6 py-4 shrink-0">

                                {currentView === 'my_requests' && ['pending_inv_tl', 'pending_ops_manager', 'approved'].includes(selectedPR.status) && (
                                    <button 
                                        onClick={() => handleAction(selectedPR.id, 'cancel')}
                                        className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 transition-colors"
                                    >
                                        Cancel Request
                                    </button>
                                )}

                                <button onClick={closeModal} className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100">
                                    Close Window
                                </button>
                                
                                {canApprove(selectedPR) && currentView === 'action_needed' && (
                                    <>
                                        <button 
                                            onClick={() => handleAction(selectedPR.id, 'reject')}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Reject Request
                                        </button>
                                        <button 
                                            onClick={() => handleAction(selectedPR.id, 'approve')}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-colors"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                            Approve Request
                                        </button>
                                    </>
                                )}

                                {selectedPR.status === 'approved' && canManagePO && currentView === 'action_needed' && (
                                    <button 
                                        onClick={() => handleGeneratePO(selectedPR.id)}
                                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        Generate PO(s)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* NEW REJECTION MODAL */}
            {rejectModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                            <h3 className="text-lg font-bold text-red-900">Reject Purchase Request</h3>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Please provide a reason for rejection:</label>
                            <textarea
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                rows="4"
                                value={rejectModal.reason}
                                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                                placeholder="Explain why this request is being rejected..."
                                autoFocus
                            ></textarea>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button onClick={closeRejectModal} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100">
                                Cancel
                            </button>
                            <button 
                                onClick={submitRejection} 
                                className="px-6 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                                disabled={!rejectModal.reason.trim()}
                            >
                                Submit Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

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