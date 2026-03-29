import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';

export default function CreatePR({ auth, suppliers, products }) {
    // Initialize the form with expanded header data and table columns
    const { data, setData, post, processing, errors } = useForm({
        branch: 'Makati Branch', 
        department: 'Inventory',
        date_prepared: new Date().toISOString().split('T')[0],
        date_needed: '',
        request_type: '',
        priority: '',
        budget_status: '',
        budget_ref: '',
        no_of_quotations: '',
        purpose_of_request: '',
        impact_if_not_procured: '',
        items: [
            { 
                product_id: '', 
                specifications: '', 
                unit: '', 
                qty_requested: '', 
                qty_on_hand: '', 
                reorder_level: '', 
                supplier_id: '', 
                est_unit_cost: '', 
                total_cost: 0 
            }
        ]
    });

    const addItemRow = () => {
        setData('items', [...data.items, { 
            product_id: '', specifications: '', unit: '', qty_requested: '', qty_on_hand: '', reorder_level: '', supplier_id: '', est_unit_cost: '', total_cost: 0 
        }]);
    };

    const removeItemRow = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        
        // Auto-calculate Total Cost if Qty or Unit Cost changes
        if (field === 'qty_requested' || field === 'est_unit_cost') {
            const qty = parseFloat(newItems[index]['qty_requested']) || 0;
            const cost = parseFloat(newItems[index]['est_unit_cost']) || 0;
            newItems[index]['total_cost'] = (qty * cost).toFixed(2);
        }

        // Optional: Auto-fill Supplier if a Product is chosen and it has a linked supplier
        if (field === 'product_id') {
             const selectedProduct = products.find(p => p.id.toString() === value.toString());
             if (selectedProduct && selectedProduct.supplier_id) {
                 newItems[index]['supplier_id'] = selectedProduct.supplier_id;
             }
        }
        
        setData('items', newItems);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('prpo.purchase-requests.store'));
    };

    return (
        <SidebarLayout activeModule="PR/PO Module">
            <Head title="Create Purchase Request" />

            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Purchase Requisition Form</h2>
                        <p className="mt-1 text-sm text-gray-500">Fill out the details below to submit a new PR.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    
                    {/* --- 1. PR HEADER DETAILS --- */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
                        <h3 className="text-base font-semibold leading-7 text-gray-900 mb-4 border-b pb-2">1. Requisition Details</h3>
                        
                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Branch</label>
                                <input type="text" value={data.branch} onChange={e => setData('branch', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                <input type="text" value={data.department} onChange={e => setData('department', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date Prepared</label>
                                <input type="date" value={data.date_prepared} onChange={e => setData('date_prepared', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" readOnly />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Request Type</label>
                                <select value={data.request_type} onChange={e => setData('request_type', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    <option value="">Select Type...</option>
                                    <option value="Capex">Capex</option>
                                    <option value="Opex">Opex</option>
                                    <option value="Inventory">Inventory</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Priority</label>
                                <select value={data.priority} onChange={e => setData('priority', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    <option value="">Select Priority...</option>
                                    <option value="Low">Low</option>
                                    <option value="Normal">Normal</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date Needed</label>
                                <input type="date" value={data.date_needed} onChange={e => setData('date_needed', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Budget Status</label>
                                <select value={data.budget_status} onChange={e => setData('budget_status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    <option value="">Select Status...</option>
                                    <option value="Budgeted">Budgeted</option>
                                    <option value="Unbudgeted">Unbudgeted</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Budget Ref. <span className="text-red-500">*</span></label>
                                <input type="text" value={data.budget_ref} onChange={e => setData('budget_ref', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Enter Ref..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">No. of Quotations <span className="text-red-500">*</span></label>
                                <input type="number" value={data.no_of_quotations} onChange={e => setData('no_of_quotations', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="0" />
                            </div>
                            
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Purpose of Request</label>
                                <textarea rows={2} value={data.purpose_of_request} onChange={e => setData('purpose_of_request', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Impact if Not Procured</label>
                                <textarea rows={2} value={data.impact_if_not_procured} onChange={e => setData('impact_if_not_procured', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* --- 2. DYNAMIC ITEM DETAILS TABLE --- */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-base font-semibold leading-7 text-gray-900">2. Item Details</h3>
                            <button type="button" onClick={addItemRow} className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition">
                                + Add Item
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-300 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900">Line</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 min-w-[200px]">Product / Item Code</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 min-w-[150px]">Specifications / Notes</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-20">Unit</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-24">Qty Req.</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-24">Qty Hand</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-24">Reorder</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 min-w-[150px]">Preferred Supplier</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-28">Est. Unit Cost</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-28">Total Cost</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {data.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="whitespace-nowrap px-2 py-2 text-center bg-gray-50">{index + 1}</td>
                                            <td className="whitespace-nowrap px-2 py-2">
                                                <select value={item.product_id} onChange={(e) => handleItemChange(index, 'product_id', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                                    <option value="">Select Product...</option>
                                                    {products.map(prod => (
                                                        <option key={prod.id} value={prod.id}>{prod.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2">
                                                <input type="text" value={item.specifications} onChange={(e) => handleItemChange(index, 'specifications', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2">
                                                <input type="text" value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2">
                                                <input type="number" min="0" value={item.qty_requested} onChange={(e) => handleItemChange(index, 'qty_requested', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2">
                                                <input type="number" min="0" value={item.qty_on_hand} onChange={(e) => handleItemChange(index, 'qty_on_hand', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2">
                                                <input type="number" min="0" value={item.reorder_level} onChange={(e) => handleItemChange(index, 'reorder_level', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2">
                                                <select value={item.supplier_id} onChange={(e) => handleItemChange(index, 'supplier_id', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                                    <option value="">Select Supplier...</option>
                                                    {suppliers.map(sup => (
                                                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2">
                                                <input type="number" min="0" step="0.01" value={item.est_unit_cost} onChange={(e) => handleItemChange(index, 'est_unit_cost', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2">
                                                <input type="number" value={item.total_cost} readOnly className="block w-full rounded-md border-gray-100 bg-gray-50 text-xs shadow-sm focus:ring-0" />
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-2 text-right">
                                                {data.items.length > 1 && (
                                                    <button type="button" onClick={() => removeItemRow(index)} className="text-red-500 hover:text-red-700 p-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-x-6 px-4 py-4 sm:px-8">
                        <button type="button" className="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
                        <button type="submit" disabled={processing} className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </SidebarLayout>
    );
}