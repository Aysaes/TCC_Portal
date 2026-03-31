import TrackingStepper from '@/Components/TrackingStepper';
import { getPRPOLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function PurchaseOrdersIndex({ auth, purchaseOrders, currentView }) {
    const sidebarLinks = getPRPOLinks(auth);
    const { data: pos } = purchaseOrders;

    // Define Roles
    const userRole = auth.user.role?.name?.toLowerCase() || '';
    const isDCSO = ['director of corporate services and operations', 'admin'].includes(userRole);
    const isProcurement = ['procurement assist', 'procurement tl', 'admin'].includes(userRole);

    const [selectedPO, setSelectedPO] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 🟢 NEW: State to toggle between PO view and PR view inside the modal
    const [modalView, setModalView] = useState('PO'); // 'PO' or 'PR'

    const { data, setData, put, processing, reset } = useForm({
        delivery_date: '',
        payment_terms: '',
        ship_to: '',
        discount_total: 0,
        vat_rate: 12,
        status: 'drafted',
    });

    const [liveTotals, setLiveTotals] = useState({ net: 0, vat: 0, grand: 0 });

    useEffect(() => {
        if (selectedPO) {
            const gross = parseFloat(selectedPO.gross_amount) || 0;
            const discount = parseFloat(data.discount_total) || 0;
            const net = gross - discount;
            const vatRate = parseFloat(data.vat_rate) || 0;
            const vat = net * (vatRate / 100);
            
            setLiveTotals({
                net: net,
                vat: vat,
                grand: net + vat
            });
        }
    }, [data.discount_total, data.vat_rate, selectedPO]);

    const openModal = (po) => {
        setSelectedPO(po);
        setModalView('PO'); // Always open to the PO view first
        setData({
            delivery_date: po.delivery_date || '',
            payment_terms: po.payment_terms || '30 Days',
            ship_to: po.ship_to || 'Main Clinic',
            discount_total: po.discount_total || 0,
            vat_rate: 12, 
            status: po.status,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => { setSelectedPO(null); reset(); setModalView('PO'); }, 200);
    };

    const handleSave = (newStatus) => {
        router.put(route('prpo.purchase-orders.update', selectedPO.id), {
            ...data,
            status: newStatus
        }, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const formatCurrency = (amount) => {
        return `₱${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatStatus = (status) => {
        const statusMap = {
            'drafted': { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
            'pending_approval': { label: 'Pending DCSO Approval', color: 'bg-yellow-100 text-yellow-800' },
            'approved': { label: 'Approved', color: 'bg-green-100 text-green-800' },
            'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
        };
        const mapped = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
        return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${mapped.color}`}>{mapped.label}</span>;
    };

    return (
        <SidebarLayout activeModule="PR/PO Module" sidebarLinks={sidebarLinks}>
            <Head title="Purchase Orders" />

            <div className="mx-auto max-w-7xl py-6 relative">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Purchase Orders</h2>
                        <p className="mt-1 text-sm text-gray-500">Manage drafted POs, apply negotiated discounts, and finalize for delivery.</p>
                    </div>
                </div>

                {/* 🟢 NEW: Filter Tabs */}
                <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1 w-fit border border-gray-200">
                    <Link 
                        href={route('prpo.purchase-orders.index', { view: 'action_needed' })} 
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${currentView === 'action_needed' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    >
                        Action Needed
                        {currentView !== 'action_needed'}
                    </Link>

                    <Link 
                        href={route('prpo.purchase-orders.index', { view: 'all' })} 
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${currentView === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    >
                        All Purchase Orders
                    </Link>
                </div>

                {/* --- PO TABLE --- */}
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-gray-900">PO Number</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">Supplier</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">PO Date</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">Gross Amt</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">Grand Total</th>
                                <th className="px-6 py-3 font-semibold text-gray-900">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {pos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No Purchase Orders found.</td>
                                </tr>
                            ) : (
                                pos.map((po) => (
                                    <tr 
                                        key={po.id} 
                                        onClick={() => openModal(po)} 
                                        className="hover:bg-gray-50 transition cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-bold text-indigo-600">{po.po_number}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{po.supplier?.name || 'Unknown Supplier'}</td>
                                        <td className="px-6 py-4 text-gray-500">{po.po_date}</td>
                                        <td className="px-6 py-4 text-gray-500">{formatCurrency(po.gross_amount)}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(po.grand_total)}</td>
                                        <td className="px-6 py-4">{formatStatus(po.status)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- PO / PR DETAILS MODAL --- */}
                {isModalOpen && selectedPO && (
                    <div onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50 p-4 sm:p-0">
                        <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-6xl rounded-xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
                            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b px-6 py-4 shrink-0 bg-gray-50 rounded-t-xl">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        {modalView === 'PO' ? selectedPO.po_number : `Original PR #${selectedPO.purchase_request?.id}`}
                                        {modalView === 'PO' && formatStatus(selectedPO.status)}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {modalView === 'PO' 
                                            ? <>Supplier: <span className="font-semibold text-gray-700">{selectedPO.supplier?.name}</span></>
                                            : <>Prepared by {selectedPO.purchase_request?.user?.name} on {selectedPO.purchase_request?.date_prepared}</>
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* 🟢 NEW: The Toggle Button */}
                                    {selectedPO.purchase_request && (
                                        <button 
                                            onClick={() => setModalView(modalView === 'PO' ? 'PR' : 'PO')}
                                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100 transition-colors"
                                        >
                                            {modalView === 'PO' ? 'View Original PR ➔' : '← Back to PO'}
                                        </button>
                                    )}
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="overflow-y-auto px-6 py-6 flex-1 bg-white">
                                
                                {modalView === 'PO' ? (
                                    /* ---------------------------- */
                                    /* VIEW 1: PO DATA       */
                                    /* ---------------------------- */
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                                                <input 
                                                    type="date" 
                                                    disabled={selectedPO.status !== 'drafted'}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100" 
                                                    value={data.delivery_date} onChange={e => setData('delivery_date', e.target.value)} 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                                                <input 
                                                    type="text" 
                                                    disabled={selectedPO.status !== 'drafted'}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100" 
                                                    value={data.payment_terms} onChange={e => setData('payment_terms', e.target.value)} 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Ship To</label>
                                                <input 
                                                    type="text" 
                                                    disabled={selectedPO.status !== 'drafted'}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100" 
                                                    value={data.ship_to} onChange={e => setData('ship_to', e.target.value)} 
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col lg:flex-row gap-8">
                                            <div className="flex-1 overflow-x-auto rounded-lg border border-gray-200">
                                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="px-4 py-2 font-semibold text-left">Description</th>
                                                            <th className="px-4 py-2 font-semibold text-center w-20">Qty</th>
                                                            <th className="px-4 py-2 font-semibold text-right w-28">Unit Price</th>
                                                            <th className="px-4 py-2 font-semibold text-right w-32">Line Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        {selectedPO.items.map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="px-4 py-3 font-medium text-gray-900">{item.description}</td>
                                                                <td className="px-4 py-3 text-center">{item.qty} {item.unit}</td>
                                                                <td className="px-4 py-3 text-right">₱{item.unit_price}</td>
                                                                <td className="px-4 py-3 text-right font-medium">₱{item.net_payable}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="w-full lg:w-80 shrink-0 bg-gray-50 rounded-lg p-5 border border-gray-200 h-fit">
                                                <h4 className="font-bold text-gray-900 mb-4 border-b pb-2">Amount Summary</h4>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Gross Amount:</span>
                                                        <span className="font-medium">{formatCurrency(selectedPO.gross_amount)}</span>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center text-gray-600">
                                                        <span>Less: Discount</span>
                                                        <input 
                                                            type="number" 
                                                            disabled={selectedPO.status !== 'drafted'}
                                                            className="w-28 text-right rounded border-gray-300 shadow-sm py-1 px-2 text-sm disabled:bg-gray-100" 
                                                            value={data.discount_total} 
                                                            onChange={e => setData('discount_total', e.target.value)}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex justify-between text-gray-600 font-medium pt-2 border-t border-gray-200">
                                                        <span>Net of Discount:</span>
                                                        <span>{formatCurrency(liveTotals.net)}</span>
                                                    </div>

                                                    <div className="flex justify-between items-center text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <span>VAT Rate</span>
                                                            <input 
                                                                type="number" 
                                                                disabled={selectedPO.status !== 'drafted'}
                                                                className="w-16 rounded border-gray-300 shadow-sm py-0.5 px-1 text-xs text-center disabled:bg-gray-100" 
                                                                value={data.vat_rate} 
                                                                onChange={e => setData('vat_rate', e.target.value)}
                                                            />
                                                            <span>%</span>
                                                        </div>
                                                        <span>{formatCurrency(liveTotals.vat)}</span>
                                                    </div>

                                                    <div className="flex justify-between items-center text-indigo-900 font-black text-lg pt-4 border-t border-gray-300">
                                                        <span>GRAND TOTAL</span>
                                                        <span>{formatCurrency(liveTotals.grand)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* ---------------------------- */
                                    /* VIEW 2: PR DATA       */
                                    /* ---------------------------- */
                                    <div className="animate-in fade-in duration-300">
                                        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm">
                                            <div><span className="block font-semibold text-gray-900">Branch</span> {selectedPO.purchase_request?.branch}</div>
                                            <div><span className="block font-semibold text-gray-900">Department</span> {selectedPO.purchase_request?.department}</div>
                                            <div><span className="block font-semibold text-gray-900">Request Type</span> {selectedPO.purchase_request?.request_type || 'N/A'}</div>
                                            <div><span className="block font-semibold text-gray-900">Priority</span> {selectedPO.purchase_request?.priority || 'N/A'}</div>
                                            
                                            <div><span className="block font-semibold text-gray-900">Date Needed</span> <span className="text-red-600 font-bold">{selectedPO.purchase_request?.date_needed}</span></div>
                                            <div><span className="block font-semibold text-gray-900">Budget Status</span> {selectedPO.purchase_request?.budget_status || 'N/A'}</div>
                                            <div><span className="block font-semibold text-gray-900">Budget Ref.</span> {selectedPO.purchase_request?.budget_ref}</div>
                                            
                                            {selectedPO.purchase_request?.purpose_of_request && (
                                                <div className="col-span-2 sm:col-span-4 mt-2 pt-2 border-t border-gray-200">
                                                    <span className="block font-semibold text-gray-900">Purpose of Request</span>
                                                    <p className="text-gray-600 break-words break-all whitespace-pre-wrap">{selectedPO.purchase_request.purpose_of_request}</p>
                                                </div>
                                            )}
                                        </div>

                                        <h4 className="mb-2 font-bold text-gray-900 border-b pb-1">All Items Originally Requested</h4>
                                        <div className="overflow-x-auto rounded-lg border">
                                            <table className="min-w-full divide-y divide-gray-200 text-sm text-left table-fixed">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-4 py-2 font-semibold w-1/4">Product</th>
                                                        <th className="px-4 py-2 font-semibold w-1/3">Specs</th>
                                                        <th className="px-4 py-2 font-semibold w-16">Unit</th>
                                                        <th className="px-4 py-2 font-semibold text-center w-20">Qty Req.</th>
                                                        <th className="px-4 py-2 font-semibold w-32">Preferred Supplier</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {selectedPO.purchase_request?.items?.map((prItem, idx) => (
                                                        <tr key={prItem.id || idx}>
                                                            <td className="px-4 py-3 font-medium text-gray-900 truncate">
                                                                {prItem.product?.name || `Product ID: ${prItem.product_id}`}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-500 max-w-xs break-words break-all whitespace-normal">
                                                                {prItem.specifications || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-500">{prItem.unit || '-'}</td>
                                                            <td className="px-4 py-3 text-center font-bold">{prItem.qty_requested}</td>
                                                            <td className="px-4 py-3 text-gray-500 truncate">
                                                                {prItem.supplier?.name || '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 🟢 NEW: Dynamic Tracker Component */}
                             <div className="mb-8 px-4 sm:px-24">
                                 <TrackingStepper 
                                     currentStatus={modalView === 'PO' ? selectedPO.status : selectedPO.purchase_request?.status} 
                                     type={modalView === 'PO' ? 'PO' : 'PR'} 
                                 />
                             </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4 shrink-0 rounded-b-xl">
                                <button onClick={closeModal} className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2">
                                    Close Window
                                </button>
                                
                                {modalView === 'PO' && selectedPO.status === 'drafted' && isProcurement && (
                                    <>
                                        <button 
                                            onClick={() => handleSave('drafted')}
                                            disabled={processing}
                                            className="rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                                        >
                                            Save Draft
                                        </button>
                                        <button 
                                            onClick={() => handleSave('pending_approval')}
                                            disabled={processing}
                                            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                        >
                                            Submit for DCSO Approval
                                        </button>
                                    </>
                                )}

                                {modalView === 'PO' && selectedPO.status === 'pending_approval' && isDCSO && (
                                    <>
                                        <button 
                                            onClick={() => handleSave('drafted')}
                                            disabled={processing}
                                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                                        >
                                            Reject (Return to Draft)
                                        </button>
                                        <button 
                                            onClick={() => handleSave('approved')}
                                            disabled={processing}
                                            className="rounded-md bg-green-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                                        >
                                            Approve Purchase Order
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}