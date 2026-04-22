import { getPRPOLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

// =====================================================================
// CUSTOM SEARCHABLE DROPDOWN COMPONENT
// =====================================================================
const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.id) === String(value));

    // Keep the input text in sync with the selected option when closed
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm(selectedOption ? selectedOption.name : '');
        }
    }, [isOpen, selectedOption]);

    // Handle clicking outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm(selectedOption ? selectedOption.name : ''); 
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedOption]);

    // Filter options based on user typing
    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                type="text"
                className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder={placeholder}
                value={isOpen ? searchTerm : (selectedOption ? selectedOption.name : '')}
                onChange={(e) => {
                    const newVal = e.target.value;
                    setSearchTerm(newVal);
                    setIsOpen(true);
                    
                    // ✨ FIX: If the user alters the text, clear the underlying locked value! ✨
                    if (selectedOption && newVal !== selectedOption.name) {
                        onChange('');
                    }
                }}
                onFocus={() => {
                    setIsOpen(true);
                    setSearchTerm(selectedOption ? selectedOption.name : '');
                }}
            />
            
            {isOpen && (
                <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black ring-opacity-5">
                    {filteredOptions.length === 0 ? (
                        <li className="px-3 py-2 text-gray-500">No results found</li>
                    ) : (
                        filteredOptions.map(opt => (
                            <li
                                key={opt.id}
                                className="cursor-pointer px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors truncate"
                                // ✨ FIX: Use onMouseDown so it fires before the input loses focus ✨
                                onMouseDown={(e) => {
                                    e.preventDefault(); 
                                    onChange(opt.id);
                                    setIsOpen(false);
                                    setSearchTerm(opt.name);
                                }}
                            >
                                {opt.name}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

// =====================================================================
// CUSTOM SEARCHABLE DROPDOWN COMPONENT
// =====================================================================
const CCMultiSelect  = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.id) === String(value));

    // 🟢 Bulletproof Sync: Whenever the parent value officially changes, lock the text
    useEffect(() => {
        if (selectedOption) {
            setSearchTerm(selectedOption.name);
        } else {
            setSearchTerm('');
        }
    }, [value, selectedOption]);

    // Handle clicking outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                // Revert to the selected option if they clicked away without picking
                setSearchTerm(selectedOption ? selectedOption.name : ''); 
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedOption]);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                type="text"
                className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder={placeholder}
                value={searchTerm} // 🟢 Now strictly controlled by local state
                onChange={(e) => {
                    const newVal = e.target.value;
                    setSearchTerm(newVal);
                    setIsOpen(true);
                    
                    // If the user alters the text, clear the underlying locked value!
                    if (selectedOption && newVal !== selectedOption.name) {
                        onChange('');
                    }
                }}
                onFocus={() => {
                    setIsOpen(true);
                    setSearchTerm(selectedOption ? selectedOption.name : '');
                }}
            />
            
            {isOpen && (
                <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black ring-opacity-5">
                    {filteredOptions.length === 0 ? (
                        <li className="px-3 py-2 text-gray-500">No results found</li>
                    ) : (
                        filteredOptions.map(opt => (
                            <li
                                key={opt.id}
                                className="cursor-pointer px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors truncate"
                                onMouseDown={(e) => {
                                    e.preventDefault(); 
                                    setSearchTerm(opt.name); // 🟢 1. Lock text instantly
                                    onChange(opt.id);        // 🟢 2. Send to Inertia
                                    setIsOpen(false);        // 🟢 3. Close menu
                                }}
                            >
                                {opt.name}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

// =====================================================================
// MAIN PAGE COMPONENT
// =====================================================================
export default function CreatePR({ auth, suppliers, products, branches = [], departments = [],  userBranches = [], employees = []}) {
    const today = new Date().toISOString().split('T')[0];

    const userRole = auth.user.role?.name?.toLowerCase() || '';

    const isUnrestricted = userRole === 'admin' || userRole.includes('director') || userRole.includes('procurement');
    const isAssistant = userRole.includes('assistant');
  
   const availableBranches = isUnrestricted 
        ? branches 
        : branches.filter(b => userBranches.includes(b.name));

    const { data, setData, post, processing, errors } = useForm({
        branch: '', 
        department: '', 
        date_prepared: today,
        date_needed: '',
        request_type: '',
        priority: '',
        budget_status: '',
        budget_ref: '',
        no_of_quotations: '',
        purpose_of_request: '',
        impact_if_not_procured: '',
        cc_user_id: '',
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
        ],
    });

    const branchEmployees = employees.filter(emp => {
        if (!data.branch) return false;
        // Check if the employee's branch list includes the selected branch
        return emp.branches?.some(b => b.name === data.branch);
    });

    useEffect(() => {
        if (!isUnrestricted && availableBranches.length === 1 && !data.branch) {
            setData('branch', availableBranches[0].name);
        }
    }, [availableBranches, isUnrestricted]);

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

        // 🟢 1. Product Change Logic
        if (field === 'product_id') {
            // Find the selected product safely
            const selectedProduct = products.find(p => String(p.id) === String(value));
            
            if (selectedProduct) {
                // ✨ RESTORED: Auto-fill the Supplier!
                newItems[index].supplier_id = selectedProduct.supplier_id || '';

                // ✨ Auto-fill Unit and Price
                newItems[index].unit = selectedProduct.unit || '';
                newItems[index].est_unit_cost = selectedProduct.price || 0; 
                
                // ✨ Calculate initial Total Cost based on current qty
                const qty = parseFloat(newItems[index].qty_requested) || 0;
                newItems[index].total_cost = qty * parseFloat(newItems[index].est_unit_cost);
            } else {
                // If they wipe the search box, clear the row data
                newItems[index].supplier_id = '';
                newItems[index].unit = '';
                newItems[index].est_unit_cost = 0;
                newItems[index].total_cost = 0;
            }
        }

        // 🟢 2. Quantity Change Logic (Dynamic Math)
        if (field === 'qty_requested') {
            const qty = parseFloat(value) || 0;
            const cost = parseFloat(newItems[index].est_unit_cost) || 0;
            newItems[index].total_cost = qty * cost;
        }

        setData('items', newItems); 
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('prpo.purchase-requests.store'));
    };

    const sidebarLinks = getPRPOLinks(auth);

    return (
        <SidebarLayout activeModule="PR/PO Module" sidebarLinks={sidebarLinks}>
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
                                <label className="block text-sm font-medium text-gray-700">Branch <span className="text-red-500">*</span></label>
                                <select 
                                    value={data.branch} 
                                    onChange={e => setData('branch', e.target.value)} 
                                    disabled={!isUnrestricted && availableBranches.length === 1} // 🟢 UPDATED
                                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${!isUnrestricted && availableBranches.length === 1 ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''} ${errors.branch ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`} 
                                    required
                                >
                                    <option value="" disabled>Select Branch...</option>
                                    {availableBranches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                                </select>
                                
                                {!isUnrestricted && availableBranches.length === 1 && (
                                    <p className="mt-1 text-xs text-indigo-500">Locked to your assigned branch.</p>
                                )}
                                {!isUnrestricted && availableBranches.length > 1 && (
                                    <p className="mt-1 text-xs text-indigo-500">Please select from your assigned branches.</p>
                                )}
                                {errors.branch && <p className="mt-2 text-sm text-red-600">{errors.branch}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
                                <select value={data.department} onChange={e => setData('department', e.target.value)} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.department ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`} required>
                                    <option value="" disabled>Select Department...</option>
                                    {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                                {errors.department && <p className="mt-2 text-sm text-red-600">{errors.department}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date Prepared</label>
                                <input type="date" value={data.date_prepared} onChange={e => setData('date_prepared', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" readOnly />
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
                                    {/* REMOVED URGENT OPTION HERE */}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date Needed</label>
                                <input type="date" value={data.date_needed} onChange={e => setData('date_needed', e.target.value)} min={today} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.date_needed ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`} />
                                {errors.date_needed && <p className="mt-2 text-sm text-red-600">{errors.date_needed}</p>}
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
                                <label className="block text-sm font-medium text-gray-700">Budget Ref.</label>
                                <input type="text" value={data.budget_ref} onChange={e => setData('budget_ref', e.target.value)} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.budget_ref ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`} placeholder="Enter Ref..." />
                                {errors.budget_ref && <p className="mt-2 text-sm text-red-600">{errors.budget_ref}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">No. of Quotations <span className="text-red-500">*</span></label>
                                <input type="number" value={data.no_of_quotations} onChange={e => setData('no_of_quotations', e.target.value)} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.no_of_quotations ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`} placeholder="0" />
                                {errors.no_of_quotations && <p className="mt-2 text-sm text-red-600">{errors.no_of_quotations}</p>}
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

                    <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CC (Carbon Copy)
                                </label>
                                <CCMultiSelect 
                                    options={branchEmployees}
                                    value={data.cc_user_id}
                                    onChange={(val) => setData('cc_user_id', val)}
                                    placeholder={!data.branch ? "Select a branch first..." : "Search employee..."}
                                />
                                {errors.cc_user_id && <p className="mt-2 text-sm text-red-600">{errors.cc_user_id}</p>}
                                <p className="mt-1 text-xs text-gray-500">
                                    This user will receive notifications when the status of this PR changes.
                                </p>
                    </div>

                    {/* --- 2. DYNAMIC ITEM DETAILS TABLE --- */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-base font-semibold leading-7 text-gray-900">2. Item Details</h3>
                            <button type="button" onClick={addItemRow} className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition">
                                + Add Item
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto overflow-y-auto max-h-[50vh] min-h-[350px] rounded-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-300 text-sm mb-48">
                                <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm ring-1 ring-gray-200">
                                    <tr>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900">Line</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 min-w-[220px]">Product / Item Code</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 min-w-[150px]">Specifications / Notes</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-20">Unit</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-24">Qty Req.</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-24">Qty Hand</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-24">Reorder</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 min-w-[200px]">Preferred Supplier</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-28">Unit Cost</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-28">Total Cost</th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {data.items.map((item, index) => {
                                        
                                        // DYNAMIC FILTERING LOGIC
                                        const availableProducts = item.supplier_id 
                                            ? products.filter(p => String(p.supplier_id) === String(item.supplier_id))
                                            : products;

                                        const availableSuppliers = item.product_id
                                            ? suppliers.filter(s => {
                                                const linkedProduct = products.find(p => String(p.id) === String(item.product_id));
                                                return linkedProduct && String(linkedProduct.supplier_id) === String(s.id);
                                              })
                                            : suppliers;

                                        return (
                                            <tr key={index}>
                                                <td className="whitespace-nowrap px-2 py-2 text-center bg-gray-50">{index + 1}</td>
                                                
                                                <td className="whitespace-nowrap px-2 py-2">
                                                    <SearchableDropdown 
                                                        options={availableProducts}
                                                        value={item.product_id}
                                                        onChange={(val) => handleItemChange(index, 'product_id', val)}
                                                        placeholder="Search Product..."
                                                    />
                                                </td>

                                                <td className="whitespace-nowrap px-2 py-2">
                                                    <input type="text" value={item.specifications} onChange={(e) => handleItemChange(index, 'specifications', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2">
                                                    <input type="text" value={item.unit} readOnly placeholder="Auto"className="block w-full rounded-md border-gray-200 bg-gray-100 text-gray-500 text-xs shadow-sm cursor-not-allowed focus:ring-0"/>
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2">
                                                    <input type="number" min="0" value={item.qty_requested} onChange={(e) => handleItemChange(index, 'qty_requested', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required/>
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2">
                                                    <input type="number" min="0" value={item.qty_on_hand} onChange={(e) => handleItemChange(index, 'qty_on_hand', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2">
                                                    <input type="number" min="0" value={item.reorder_level} onChange={(e) => handleItemChange(index, 'reorder_level', e.target.value)} className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                                                </td>
                                                
                                                <td className="whitespace-nowrap px-2 py-2">
                                                    <SearchableDropdown 
                                                        options={availableSuppliers}
                                                        value={item.supplier_id}
                                                        onChange={(val) => handleItemChange(index, 'supplier_id', val)}
                                                        placeholder="Search Supplier..."
                                                    />
                                                </td>

                                                <td className="whitespace-nowrap px-2 py-2">
                                                    <div className="relative rounded-md shadow-sm">
                                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                                            <span className="text-gray-400 text-xs">₱</span>
                                                        </div>
                                                            <input type="number" value={item.est_unit_cost} readOnly placeholder="0.00" className="block w-full rounded-md border-gray-200 bg-gray-100 text-gray-500 pl-6 text-xs shadow-sm cursor-not-allowed focus:ring-0"/>
                                                        </div>
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2">
                                                    <div className="relative rounded-md shadow-sm">
                                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                                            <span className="text-indigo-400 font-bold text-xs">₱</span>
                                                        </div>
                                                            <input type="number" value={item.total_cost} readOnly className="block w-full rounded-md border-indigo-100 bg-indigo-50 text-indigo-700 font-bold pl-6 text-xs shadow-sm cursor-not-allowed focus:ring-0" />
                                                        </div>
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
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-x-6 px-4 py-4 sm:px-8">
                        <button type="button" onClick={() => window.history.back()} className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700">Cancel</button>
                        <button type="submit" disabled={processing} className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </SidebarLayout>
    );
}