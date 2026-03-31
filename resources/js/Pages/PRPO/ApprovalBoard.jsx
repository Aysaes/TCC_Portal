import TrackingStepper from '@/Components/TrackingStepper';
import { getPRPOLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react'; // Removed useForm, kept router
import { useState } from 'react';

export default function ApprovalBoard({ auth, requests, currentView, isApprover, canSeeAll }) {
    const sidebarLinks = getPRPOLinks(auth);

    const userRole = auth.user.role?.name?.toLowerCase() || '';
    const canManagePO = ['procurement assist', 'procurement tl', 'director of corporate services and operations', 'admin'].includes(userRole);
    
    // Modal State
    const [selectedPR, setSelectedPR] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // SECURITY LOGIC: Role-based approval checking
   const canApprove = (pr) => {
        if (['approved', 'rejected'].includes(pr.status)) return false;
        if (['admin', 'director of corporate services and operations'].includes(userRole)) return true;
        
        if (pr.status === 'pending_inventory_assistant' && userRole === 'inventory assist') return true;
        if (pr.status === 'pending_inventory_tl' && userRole === 'inventory tl') return true;
        
        // 🟢 UPDATED: Both Procurement roles can approve here
        if (pr.status === 'pending_procurement' && ['procurement assist', 'procurement tl'].includes(userRole)) return true;
        
        return false;
    };

    const formatStatus = (status) => {
        const statusMap = {
            'pending_inventory_assistant': { label: 'Pending Inv. Assistant', color: 'bg-yellow-100 text-yellow-800' },
            'pending_inventory_tl': { label: 'Pending Inv. TL', color: 'bg-orange-100 text-orange-800' },
            'pending_procurement': { label: 'Pending Procurement', color: 'bg-blue-100 text-blue-800' },
            'approved': { label: 'Approved', color: 'bg-green-100 text-green-800' },
            'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800' },
            'po_generated': { label: 'PO Generated', color: 'bg-purple-100 text-purple-800' }
        };
        const mapped = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
        return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${mapped.color}`}>{mapped.label}</span>;
    };

    // ACTION FIX: Using router.patch directly to send the payload correctly
    const handleAction = (id, actionType) => {
        if (confirm(`Are you sure you want to ${actionType} this request?`)) {
            router.patch(route('prpo.purchase-requests.update-status', id), 
            { action: actionType }, // Payload data
            {
                preserveScroll: true,
                onSuccess: () => setIsModalOpen(false) 
            });
        }
    };

    const handleGeneratePO = (id) => {
        if (confirm('Are you sure you want to generate Purchase Orders for this approved request?')) {
            router.post(route('prpo.purchase-requests.generate-pos', id), {}, {
                preserveScroll: true,
                onSuccess: () => closeModal()
            });
        }
    };

    const openModal = (pr) => {
        setSelectedPR(pr);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedPR(null), 200); 
    };

    return (
        <SidebarLayout activeModule="PR/PO Module" sidebarLinks={sidebarLinks}>
            <Head title="Approval Board" />

            <div className="mx-auto max-w-7xl py-6 relative">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">PR Approval Board</h2>
                        <p className="mt-1 text-sm text-gray-500">Review and manage pending purchase requests.</p>
                    </div>
                </div>

                {/* 🟢 NEW: Filter Tabs */}
                <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1 w-fit border border-gray-200">
                    <Link 
                        href={route('prpo.approval-board', { view: 'my_requests' })} 
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${currentView === 'my_requests' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    >
                        My Requests
                    </Link>

                    {isApprover && (
                        <Link 
                            href={route('prpo.approval-board', { view: 'action_needed' })} 
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${currentView === 'action_needed' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                        >
                            Action Needed
                            {/* Optional: Add a red dot if you want to make it look urgent */}
                            {currentView !== 'action_needed'}
                        </Link>
                    )}

                    {canSeeAll && (
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
                                <th className="px-6 py-3 font-semibold text-gray-900">Date Needed</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">Items Count</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-3 font-semibold text-gray-900 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {requests.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No pending requests for your approval.</td>
                                </tr>
                            ) : (
                                requests.data.map((pr) => (
                                    <tr 
                                        key={pr.id} 
                                        onClick={() => openModal(pr)} 
                                        className="hover:bg-gray-50 transition cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-medium text-indigo-600 hover:text-indigo-900">#{pr.id} <br/><span className="text-xs text-gray-500">{pr.budget_ref}</span></td>
                                        <td className="px-6 py-4">{pr.user?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4">{pr.branch} <br/><span className="text-xs text-gray-500">{pr.department}</span></td>
                                        <td className="px-6 py-4">{pr.date_needed}</td>
                                        <td className="px-6 py-4 font-medium">{pr.items?.length || 0} Items</td>
                                        <td className="px-6 py-4">{formatStatus(pr.status)}</td>
                                        
                                        <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                                            {canApprove(pr) && (
                                                <>
                                                    <button 
                                                        onClick={() => handleAction(pr.id, 'approve')}
                                                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(pr.id, 'reject')}
                                                        className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
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
                            className="relative w-full max-w-5xl rounded-xl bg-white shadow-2xl transition-all"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b px-6 py-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Purchase Request #{selectedPR.id}</h3>
                                    <p className="text-sm text-gray-500">Prepared by {selectedPR.user?.name} on {selectedPR.date_prepared}</p>
                                </div>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body (RESTORED) */}
                            <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
                                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-lg bg-gray-50 p-4 text-sm">
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

                                <h4 className="mb-2 font-bold text-gray-900 border-b pb-1">Requested Items ({selectedPR.items.length})</h4>
                                <div className="overflow-x-auto rounded-lg border">
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
                            </div>

                            {/* 🟢 NEW: Tracker Component */}
                             <div className="mb-8 px-4 sm:px-12">
                                 <TrackingStepper currentStatus={selectedPR.status} type="PR" />
                             </div>

                            {/* Modal Footer (Actions) */}
                            <div className="flex items-center justify-end gap-3 rounded-b-xl border-t bg-gray-50 px-6 py-4">
                                <button onClick={closeModal} className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2">
                                    Close Window
                                </button>
                                
                                {canApprove(selectedPR) && (
                                    <>
                                        <button 
                                            onClick={() => handleAction(selectedPR.id, 'reject')}
                                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                                        >
                                            Reject Request
                                        </button>
                                        <button 
                                            onClick={() => handleAction(selectedPR.id, 'approve')}
                                            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                                        >
                                            Approve Request
                                        </button>
                                    </>
                                )}

                                {selectedPR.status === 'approved' && canManagePO && (
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
        </SidebarLayout>
    );
}