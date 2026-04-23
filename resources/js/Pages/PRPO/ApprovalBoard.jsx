import ConfirmModal from '@/Components/ConfirmModal';
import TrackingStepper from '@/Components/TrackingStepper';
import { getPRPOLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

// =====================================================================
// MINI TRACKING STEPPER (Delivery Style)
// =====================================================================
const TrackerLine = ({ pr }) => {
    const isPRRejected = pr.status === 'rejected';
    const isPRCancelled = pr.status === 'cancelled';
    const hasPOs = pr.purchase_orders && pr.purchase_orders.length > 0;

    let isFullyOrdered = false;
    let isPoProcessing = false;
    let hasPoCancelled = false;
    let poStatusMsg = "";

    if (hasPOs) {
        const statuses = pr.purchase_orders.map(po => po.status);

        if (statuses.includes('cancelled')) {
            hasPoCancelled = true;
            poStatusMsg = "Notice: A Purchase Order for this request was cancelled.";
        } else if (statuses.includes('drafted')) {
            isPoProcessing = true;
            poStatusMsg = "Purchase Order drafted. Procurement is finalizing the details.";
        } else if (statuses.includes('pending_approval')) {
            isPoProcessing = true;
            poStatusMsg = "Purchase Order submitted. Pending final approval from DCSO.";
        } else if (statuses.every(s => s === 'approved')) {
            isFullyOrdered = true;
            poStatusMsg = `Purchase Order approved! Items have been officially ordered. Estimated delivery: ${pr.date_needed || 'TBD'}`;
        } else {
            isPoProcessing = true;
            poStatusMsg = "Purchase Order is currently being processed.";
        }
    }

    const isHalted = isPRRejected || isPRCancelled || hasPoCancelled;
    const step1 = true; 
    const step2 = ['pending_ops_manager', 'approved', 'po_generated'].includes(pr.status);
    const step3 = ['approved', 'po_generated'].includes(pr.status);
    const step4 = pr.status === 'po_generated' || hasPOs;

    const getStepClass = (isComplete, isCurrent) => {
        if (isHalted) return 'bg-red-500 ring-red-100';
        if (isComplete) return 'bg-indigo-600 ring-indigo-100';
        if (isCurrent) return 'bg-white border-2 border-indigo-600 ring-indigo-50';
        return 'bg-gray-200';
    };

    const getLineClass = (isActive) => {
        if (isHalted) return 'border-red-500';
        return isActive ? 'border-indigo-600' : 'border-gray-200';
    };

    const step4Label = isFullyOrdered ? "Ordered" : "PO Processing";

    return (
        <div className="mt-6 mb-2 px-4 sm:px-8">
            <div className="relative flex items-center justify-between w-full">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 flex">
                    <div className={`h-full w-1/3 border-t-2 ${getLineClass(step2)} transition-colors duration-500`}></div>
                    <div className={`h-full w-1/3 border-t-2 ${getLineClass(step3)} transition-colors duration-500`}></div>
                    <div className={`h-full w-1/3 border-t-2 ${getLineClass(step4)} transition-colors duration-500`}></div>
                </div>

                <div className="relative flex flex-col items-center group">
                    <div className={`w-4 h-4 rounded-full ring-4 z-10 ${getStepClass(step1, !step2)}`}></div>
                    <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap">Submitted</span>
                </div>
                <div className="relative flex flex-col items-center group">
                    <div className={`w-4 h-4 rounded-full ring-4 z-10 ${getStepClass(step2, step2 && !step3)}`}></div>
                    <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap">Reviewed</span>
                </div>
                <div className="relative flex flex-col items-center group">
                    <div className={`w-4 h-4 rounded-full ring-4 z-10 ${getStepClass(step3, step3 && !step4)}`}></div>
                    <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap">Approved</span>
                </div>
                <div className="relative flex flex-col items-center group">
                    <div className={`w-4 h-4 rounded-full ring-4 z-10 ${getStepClass(isFullyOrdered, step4 && !isFullyOrdered)}`}></div>
                    <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap">{step4Label}</span>
                </div>
            </div>
            
            <div className="mt-8 text-center text-xs font-medium">
                {isHalted ? (
                    <span className="text-red-600">{hasPoCancelled ? poStatusMsg : `This request was ${pr.status}. Please check with your manager.`}</span>
                ) : hasPOs ? (
                    <span className={isFullyOrdered ? "text-green-600" : "text-amber-600"}>{poStatusMsg}</span>
                ) : step4 ? (
                    <span className="text-amber-600">Procurement is currently drafting the Purchase Order(s).</span>
                ) : step3 ? (
                    <span className="text-indigo-600">Approved by Operations Manager. Waiting for Procurement to generate the order.</span>
                ) : step2 ? (
                    <span className="text-blue-600">Reviewed by Inventory Team Lead. Waiting for Final Approval.</span>
                ) : (
                    <span className="text-gray-500">Submitted to the Inventory Team Lead for initial review.</span>
                )}
            </div>
        </div>
    );
};

// =====================================================================
// MAIN PAGE COMPONENT
// =====================================================================
export default function ApprovalBoard({ auth, requests, currentView, userBranches = [] }) {
    const sidebarLinks = getPRPOLinks(auth);

    const userRole = auth.user.role?.name?.toLowerCase().trim() || '';
    const canManagePO = ['procurement assist', 'procurement tl', 'director of corporate services and operations', 'admin'].includes(userRole);
    const isInvTL = userRole.includes('inventory tl') || userRole === 'admin';
    const isOpsManager = userRole.includes('operations') || userRole.includes('operations manager') || userRole === 'admin';

    const requestList = Array.isArray(requests?.data) ? requests.data : (Array.isArray(requests) ? requests : []);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterBranch, setFilterBranch] = useState('');
    const [filterPriority, setFilterPriority] = useState('');

    const uniqueBranches = useMemo(() => [...new Set(requestList.map(req => req.branch).filter(Boolean))].sort(), [requestList]);
    const uniquePriorities = useMemo(() => [...new Set(requestList.map(req => req.priority).filter(Boolean))].sort(), [requestList]);

    const filteredRequests = useMemo(() => {
        return requestList.filter(req => {
            const searchLower = searchQuery.toLowerCase().trim();
            const prId = (req.pr_number || '').toLowerCase();
            const preparedBy = (req.user?.name || '').toLowerCase();
            const matchesSearch = !searchLower || prId.includes(searchLower) || preparedBy.includes(searchLower);
            const matchesBranch = !filterBranch || req.branch === filterBranch;
            const matchesPriority = !filterPriority || req.priority === filterPriority;
            return matchesSearch && matchesBranch && matchesPriority;
        });
    }, [requestList, searchQuery, filterBranch, filterPriority]);

    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', confirmText: '', confirmColor: '', onConfirm: () => {} });
    const closeConfirmModal = () => setConfirmDialog({ ...confirmDialog, isOpen: false });
    
    // Modal States
    const [selectedPR, setSelectedPR] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 🟢 EDIT PR MODAL STATE (For Inv TL)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { data: editData, setData: setEditData, put: submitEditPR, processing: isEditing } = useForm({
        purpose_of_request: '',
        impact_if_not_procured: '',
        items: []
    });

    // 🟢 DYNAMIC ACTION MODAL STATE (Handles Returns & Rejects)
    const [actionModal, setActionModal] = useState({ isOpen: false, prId: null, actionType: '', reason: '' });

    const openActionModal = (id, type) => {
        setActionModal({ isOpen: true, prId: id, actionType: type, reason: '' });
    };

    const closeActionModal = () => {
        setActionModal({ isOpen: false, prId: null, actionType: '', reason: '' });
    };

    const submitActionModal = () => {
        router.patch(route('prpo.purchase-requests.update-status', actionModal.prId), 
        { action: actionModal.actionType, rejection_reason: actionModal.reason }, 
        {
            preserveScroll: true,
            onSuccess: () => { 
                closeActionModal(); 
                closeModal(); 
            } 
        });
    };

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
        // Intercept reject and return to open the Action Modal
        if (actionType === 'reject' || actionType === 'return_to_inv_tl') {
            openActionModal(id, actionType);
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
                    onSuccess: () => { closeConfirmModal(); closeModal(); } 
                });
            }
        });
    };

    const handleGeneratePO = (id) => {
        setConfirmDialog({
            isOpen: true, title: 'Generate Purchase Orders',
            message: 'Are you sure you want to generate Purchase Orders for this approved request? This action cannot be undone.',
            confirmText: 'Generate PO(s)', confirmColor: 'bg-indigo-600 hover:bg-indigo-500',
            onConfirm: () => {
                router.post(route('prpo.purchase-requests.generate-pos', id), {}, { preserveScroll: true, onSuccess: () => { closeConfirmModal(); closeModal(); }});
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

    // 🟢 OPEN EDIT MODAL
    const openEditModal = () => {
        setEditData({
            purpose_of_request: selectedPR.purpose_of_request || '',
            impact_if_not_procured: selectedPR.impact_if_not_procured || '',
            items: selectedPR.items.map(item => ({ ...item })) // Deep copy items
        });
        setIsModalOpen(false);
        setTimeout(() => setIsEditModalOpen(true), 200);
    };

    // 🟢 HANDLE EDITING ITEMS IN MODAL
    const handleEditItemChange = (index, field, value) => {
        const newItems = [...editData.items];
        newItems[index][field] = value;

        if (field === 'qty_requested' || field === 'est_unit_cost') {
            const qty = parseFloat(newItems[index].qty_requested) || 0;
            const cost = parseFloat(newItems[index].est_unit_cost) || 0;
            newItems[index].total_cost = qty * cost;
        }

        setEditData('items', newItems);
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        submitEditPR(route('prpo.purchase-requests.update', selectedPR.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedPR(null);
            }
        });
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
                    <Link href={route('prpo.approval-board', { view: 'my_requests' })} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${currentView === 'my_requests' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}>My Requests</Link>

                    {!userRole.includes('inventory assist') && (
                        <>
                            <Link href={route('prpo.approval-board', { view: 'action_needed' })} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${currentView === 'action_needed' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}>Approvals {currentView !== 'action_needed'}</Link>
                            <Link href={route('prpo.approval-board', { view: 'finished' })} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${currentView === 'finished' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}>Finished Requests</Link>
                        </>
                    )}

                    {(userRole.includes('admin') || userRole.includes('director') || userRole.includes('audit')) && (
                        <Link href={route('prpo.approval-board', { view: 'all' })} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${currentView === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}>All Active PRs</Link>
                    )}
                </div>

                <div className="mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Search Request</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input type="text" placeholder="PR ID or Prepared By..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Branch</label>
                            <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors">
                                <option value="">All Branches</option>
                                {uniqueBranches.map((branch, idx) => <option key={idx} value={branch}>{branch}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
                            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors">
                                <option value="">All Priorities</option>
                                {uniquePriorities.map((priority, idx) => <option key={idx} value={priority}>{priority}</option>)}
                            </select>
                        </div>
                    </div>

                    {(searchQuery || filterBranch || filterPriority) && (
                        <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
                            <button onClick={() => { setSearchQuery(''); setFilterBranch(''); setFilterPriority(''); }} className="text-sm text-gray-500 hover:text-gray-800 font-semibold bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors">
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

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
                                <th className="px-6 py-3 font-semibold text-gray-900"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">No requests found for this view.</td>
                                </tr>
                            ) : (
                                filteredRequests.map((pr) => (
                                    <tr key={pr.pr_number} onClick={() => openModal(pr)} className="hover:bg-gray-50 transition cursor-pointer">
                                        <td className="px-6 py-4 font-medium text-indigo-600 hover:text-indigo-900">{pr.pr_number}</td>
                                        <td className="px-6 py-4">{pr.user?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4">{pr.branch} <br/><span className="text-xs text-gray-500">{pr.department}</span></td>
                                        
                                        <td className="px-6 py-4">
                                            {pr.priority ? (
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${
                                                    pr.priority === 'High' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                    pr.priority === 'Normal' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                                                }`}>{pr.priority}</span>
                                            ) : <span className="text-gray-400 text-xs italic">N/A</span>}
                                        </td>

                                        <td className="px-6 py-4">{pr.date_needed}</td>
                                        <td className="px-6 py-4 font-medium">{pr.items?.length || 0} Items</td>
                                        <td className="px-6 py-4">{formatStatus(pr.status)}</td>
                                        
                                        <td className="whitespace-nowrap px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                {canApprove(pr) && currentView === 'action_needed' && (
                                                    <>
                                                        <button onClick={() => handleAction(pr.id, 'approve')} title="Approve Request" className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 transition-colors hover:bg-green-100 hover:text-green-800">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                                            Approve
                                                        </button>
                                                        
                                                        {pr.status === 'pending_ops_manager' && (
                                                            <button onClick={() => openActionModal(pr.id, 'return_to_inv_tl')} title="Return to Inv TL" className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 transition-colors hover:bg-orange-100 hover:text-orange-800">
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                                                                Return
                                                            </button>
                                                        )}

                                                        <button onClick={() => handleAction(pr.id, 'reject')} title="Reject Request" className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-100 hover:text-red-800">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {pr.status === 'approved' && canManagePO && currentView === 'action_needed' && (
                                                    <button onClick={() => handleGeneratePO(pr.id)} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none transition-all">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                        Generate PO(s)
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- READ-ONLY VIEW MODAL --- */}
                {isModalOpen && selectedPR && (
                    <div onClick={closeModal} className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50 p-4 sm:p-0">
                        <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-5xl rounded-xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedPR.pr_number}</h3>
                                    <p className="text-sm text-gray-500">Prepared by {selectedPR.user?.name} on {selectedPR.date_prepared}</p>
                                </div>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="overflow-y-auto px-6 py-4 flex-grow">
                                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-lg bg-gray-50 p-4 text-sm border border-gray-100">
                                    <div><span className="block font-semibold text-gray-900">CC</span> {selectedPR.cc_user?.name || 'N/A'}</div>
                                    <div><span className="block font-semibold text-gray-900">Branch</span> {selectedPR.branch}</div>
                                    <div><span className="block font-semibold text-gray-900">Department</span> {selectedPR.department}</div>
                                    <div><span className="block font-semibold text-gray-900">Request Type</span> {selectedPR.request_type || 'N/A'}</div>
                                    <div><span className="block font-semibold text-gray-900">Priority</span> {selectedPR.priority || 'N/A'}</div>
                                    <div><span className="block font-semibold text-gray-900">Date Needed</span> <span className="text-red-600 font-bold">{selectedPR.date_needed}</span></div>
                                    <div><span className="block font-semibold text-gray-900">Budget Status</span> {selectedPR.budget_status || 'N/A'}</div>
                                    <div><span className="block font-semibold text-gray-900">Status</span> {formatStatus(selectedPR.status)}</div>

                                    {selectedPR.purpose_of_request && (
                                        <div className="col-span-2 sm:col-span-4 mt-2">
                                            <span className="block font-semibold text-gray-900">Purpose of Request</span>
                                            <p className="text-gray-600 break-words break-all whitespace-pre-wrap">{selectedPR.purpose_of_request}</p>
                                        </div>
                                    )}
                                </div>

                                {selectedPR.status === 'rejected' && selectedPR.rejection_reason && (
                                    <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-100">
                                        <span className="block font-bold text-red-800 text-sm mb-1">Reason for Rejection:</span>
                                        <p className="text-red-700 text-sm whitespace-pre-wrap">{selectedPR.rejection_reason}</p>
                                    </div>
                                )}
                                
                                {selectedPR.status === 'pending_inv_tl' && selectedPR.rejection_reason && (
                                    <div className="mb-6 rounded-lg bg-orange-50 p-4 border border-orange-200">
                                        <span className="block font-bold text-orange-800 text-sm mb-1 flex items-center gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            Returned by Operations Manager
                                        </span>
                                        <p className="text-orange-700 text-sm whitespace-pre-wrap font-medium">"{selectedPR.rejection_reason}"</p>
                                        <p className="text-orange-600 text-xs mt-2 italic">Please edit the request below and re-approve when ready.</p>
                                    </div>
                                )}

                                <h4 className="mb-2 font-bold text-gray-900 border-b pb-1">Requested Items</h4>
                                <div className="overflow-x-auto rounded-lg border mb-6">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm text-left table-fixed">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold w-1/4">Product</th>
                                                <th className="px-4 py-2 font-semibold w-1/3">Specs</th>
                                                <th className="px-4 py-2 font-semibold text-center w-20">Qty Req.</th>
                                                <th className="px-4 py-2 font-semibold w-32">Supplier</th>
                                                <th className="px-4 py-2 font-semibold text-right w-24">Est. Cost</th>
                                                <th className="px-4 py-2 font-semibold text-right w-24">Total Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {selectedPR.items.map((item, idx) => (
                                                <tr key={item.id || idx}>
                                                    <td className="px-4 py-3 font-medium text-gray-900 truncate" title={item.product?.name}>{item.product?.name}</td>
                                                    <td className="px-4 py-3 text-gray-500 max-w-xs break-words">{item.specifications || '-'}</td>
                                                    <td className="px-4 py-3 text-center font-bold">{item.qty_requested} {item.unit}</td>
                                                    <td className="px-4 py-3 text-gray-500 truncate">{item.supplier?.name || '-'}</td>
                                                    <td className="px-4 py-3 text-right">₱{Number(item.est_unit_cost).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-indigo-700">₱{Number(item.total_cost).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-4 sm:px-12"><TrackingStepper currentStatus={selectedPR.status} type="PR" /></div>
                            </div>

                            <div className="flex items-center justify-end gap-3 rounded-b-xl border-t bg-gray-50 px-6 py-4 shrink-0">
                                <button onClick={closeModal} className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100">Close Window</button>
                                
                                {/* 🟢 NEW: Edit Button for Inv TL */}
                                {isInvTL && selectedPR.status === 'pending_inv_tl' && currentView === 'action_needed' && (
                                    <button onClick={openEditModal} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                                        Edit Request
                                    </button>
                                )}

                                {canApprove(selectedPR) && currentView === 'action_needed' && (
                                    <>
                                        {selectedPR.status === 'pending_ops_manager' && (
                                            <button onClick={() => openActionModal(selectedPR.id, 'return_to_inv_tl')} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-400 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                                                Return to Inv TL
                                            </button>
                                        )}
                                        <button onClick={() => handleAction(selectedPR.id, 'reject')} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            Reject Request
                                        </button>
                                        <button onClick={() => handleAction(selectedPR.id, 'approve')} className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-colors">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                            Approve Request
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 🟢 FULL EDIT PR MODAL (For Inv TL) */}
                {isEditModalOpen && selectedPR && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-70 p-4 sm:p-0">
                        <div className="relative w-full max-w-6xl rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between border-b px-6 py-4 shrink-0 bg-blue-50 rounded-t-2xl">
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                                        Edit Purchase Request: {selectedPR.pr_number}
                                    </h3>
                                    <p className="text-sm text-blue-700 mt-1">Make necessary adjustments before approving.</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-blue-400 hover:text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <form onSubmit={handleSaveEdit} className="overflow-y-auto flex-grow flex flex-col">
                                <div className="px-6 py-6 flex-grow">
                                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Purpose of Request</label>
                                            <textarea value={editData.purpose_of_request} onChange={(e) => setEditData('purpose_of_request', e.target.value)} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Impact if not Procured</label>
                                            <textarea value={editData.impact_if_not_procured} onChange={(e) => setEditData('impact_if_not_procured', e.target.value)} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                                        </div>
                                    </div>

                                    <h4 className="mb-2 font-bold text-gray-900 border-b pb-1">Editable Items</h4>
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm text-left table-fixed">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 font-semibold w-1/4">Product</th>
                                                    <th className="px-4 py-2 font-semibold w-1/3">Specifications / Notes</th>
                                                    <th className="px-4 py-2 font-semibold text-center w-24">Qty Req.</th>
                                                    <th className="px-4 py-2 font-semibold text-right w-28">Est Unit Cost</th>
                                                    <th className="px-4 py-2 font-semibold text-right w-32">Total Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {editData.items.map((item, idx) => (
                                                    <tr key={item.id || idx}>
                                                        <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50">{item.product?.name || `ID: ${item.product_id}`}</td>
                                                        <td className="px-4 py-3">
                                                            <input type="text" value={item.specifications || ''} onChange={(e) => handleEditItemChange(idx, 'specifications', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1">
                                                                <input type="number" min="0" step="any" value={item.qty_requested} onChange={(e) => handleEditItemChange(idx, 'qty_requested', e.target.value)} className="block w-16 text-center rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-bold" required />
                                                                <span className="text-xs text-gray-500">{item.unit}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="relative rounded-md shadow-sm">
                                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2"><span className="text-gray-400 text-xs">₱</span></div>
                                                                <input type="number" min="0" step="any" value={item.est_unit_cost} onChange={(e) => handleEditItemChange(idx, 'est_unit_cost', e.target.value)} className="block w-full pl-6 rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-right" />
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-indigo-700 bg-indigo-50/30">
                                                            ₱{Number(item.total_cost).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3 shrink-0 rounded-b-2xl">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 shadow-sm transition">Cancel Edit</button>
                                    <button type="submit" disabled={isEditing} className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-blue-500 transition disabled:opacity-50">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>

            {/* 🟢 DYNAMIC ACTION MODAL (Replaces Reject Modal) */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className={`px-6 py-4 border-b border-gray-200 ${actionModal.actionType === 'reject' ? 'bg-red-50' : 'bg-orange-50'}`}>
                            <h3 className={`text-lg font-bold ${actionModal.actionType === 'reject' ? 'text-red-900' : 'text-orange-900'}`}>
                                {actionModal.actionType === 'reject' ? 'Reject Purchase Request' : 'Return Request to Inventory TL'}
                            </h3>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {actionModal.actionType === 'reject' ? 'Please provide a reason for rejection:' : 'Please provide notes/corrections for the Inventory TL:'}
                            </label>
                            <textarea
                                className={`w-full border-gray-300 rounded-md shadow-sm sm:text-sm ${actionModal.actionType === 'reject' ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-orange-500 focus:border-orange-500'}`}
                                rows="4"
                                value={actionModal.reason}
                                onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                                placeholder={actionModal.actionType === 'reject' ? "Explain why this request is being rejected..." : "Explain what needs to be fixed..."}
                                autoFocus
                            ></textarea>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button onClick={closeActionModal} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100">
                                Cancel
                            </button>
                            <button 
                                onClick={submitActionModal} 
                                className={`px-6 py-2 text-sm font-bold text-white rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${actionModal.actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`} 
                                disabled={!actionModal.reason.trim()}
                            >
                                {actionModal.actionType === 'reject' ? 'Submit Rejection' : 'Confirm Return'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal show={confirmDialog.isOpen} onClose={closeConfirmModal} title={confirmDialog.title} message={confirmDialog.message} confirmText={confirmDialog.confirmText} confirmColor={confirmDialog.confirmColor} onConfirm={confirmDialog.onConfirm} />
        </SidebarLayout>
    );
}