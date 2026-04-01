import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function PrintablePR({ pr }) {
    
    // Auto-trigger the print dialog when the page loads
    useEffect(() => {
        // A slight delay ensures fonts and logos are fully loaded
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const formatCurrency = (amount) => {
        return `₱${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="min-h-screen bg-gray-200 py-8 print:py-0 print:bg-white font-sans text-gray-900">
            <Head title={`Purchase Request #${pr.id}`} />

            {/* ACTION BUTTONS (Hidden when printing) */}
            <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center print:hidden px-4">
                <button 
                    onClick={() => window.close()} 
                    className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2"
                >
                    <span>←</span> Back to Board
                </button>
                <button 
                    onClick={() => window.print()} 
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md font-bold shadow-sm hover:bg-indigo-500"
                >
                    Save as PDF / Print
                </button>
            </div>

            {/* THE A4 DOCUMENT */}
            <div className="max-w-4xl mx-auto bg-white p-10 sm:p-16 shadow-xl print:shadow-none print:p-0 border border-gray-300 print:border-none aspect-[1/1.414] w-full relative">
                
                {/* Header Section */}
                <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16">
                            <ApplicationLogo className="w-full h-full text-indigo-900" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-wider text-gray-900">The Cat Clinic</h1>
                            <p className="text-sm text-gray-600">Purchase Request Document</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold text-gray-300 mb-1">{pr.pr_number}</h2>
                        <p className="text-sm font-semibold">Date Prepared: <span className="font-normal">{pr.date_prepared}</span></p>
                        <p className="text-sm font-semibold">Date Needed: <span className="font-normal text-red-600">{pr.date_needed}</span></p>
                    </div>
                </div>

                {/* Request Details Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Prepared By</p>
                        <p className="font-semibold text-base">{pr.user?.name}</p>
                        <p className="text-gray-600">{pr.department} - {pr.branch}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Budget Information</p>
                        <p className="font-semibold">Ref: <span className="font-normal">{pr.budget_ref}</span></p>
                        <p className="font-semibold">Status: <span className="font-normal">{pr.budget_status || 'N/A'}</span></p>
                    </div>
                    
                    {pr.purpose_of_request && (
                        <div className="col-span-2 mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md">
                            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Purpose of Request</p>
                            <p className="text-gray-800 italic">{pr.purpose_of_request}</p>
                        </div>
                    )}
                </div>

                {/* Items Table */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-1">Requested Items</h3>
                <table className="w-full text-sm text-left mb-8 border-collapse">
                    <thead className="bg-gray-100 border-y border-gray-300">
                        <tr>
                            <th className="py-2 px-3 font-bold text-gray-800 w-12 text-center">#</th>
                            <th className="py-2 px-3 font-bold text-gray-800">Description & Specs</th>
                            <th className="py-2 px-3 font-bold text-gray-800 text-center w-24">Qty</th>
                            <th className="py-2 px-3 font-bold text-gray-800 text-right w-32">Est. Unit Cost</th>
                            <th className="py-2 px-3 font-bold text-gray-800 text-right w-32">Total Cost</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {pr.items.map((item, index) => (
                            <tr key={item.id}>
                                <td className="py-3 px-3 text-center text-gray-500">{index + 1}</td>
                                <td className="py-3 px-3">
                                    <p className="font-bold text-gray-900">{item.product?.name || `Product ID: ${item.product_id}`}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.specifications}</p>
                                    {item.supplier?.name && <p className="text-xs text-indigo-600 mt-1">Pref. Supplier: {item.supplier.name}</p>}
                                </td>
                                <td className="py-3 px-3 text-center font-semibold">{item.qty_requested} <span className="text-xs text-gray-500">{item.unit}</span></td>
                                <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(item.est_unit_cost)}</td>
                                <td className="py-3 px-3 text-right font-bold text-gray-900">{formatCurrency(item.total_cost)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t-2 border-gray-800">
                        <tr>
                            <td colSpan="4" className="py-3 px-3 text-right font-bold uppercase text-gray-700">Estimated Grand Total:</td>
                            <td className="py-3 px-3 text-right font-black text-lg text-gray-900">
                                {formatCurrency(pr.items.reduce((sum, item) => sum + Number(item.total_cost), 0))}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Signatures Section */}
                <div className="absolute bottom-16 left-10 right-10">
                    <div className="grid grid-cols-3 gap-8">
                        <div>
                            <div className="border-b border-gray-400 h-10 mb-2"></div>
                            <p className="text-xs font-bold text-gray-800 uppercase text-center">Requested By</p>
                            <p className="text-xs text-center text-gray-500">{pr.user?.name}</p>
                        </div>
                        <div>
                            <div className="border-b border-gray-400 h-10 mb-2"></div>
                            <p className="text-xs font-bold text-gray-800 uppercase text-center">Noted By</p>
                            <p className="text-xs text-center text-gray-500">Department Head / TL</p>
                        </div>
                        <div>
                            <div className="border-b border-gray-400 h-10 mb-2"></div>
                            <p className="text-xs font-bold text-gray-800 uppercase text-center">Approved By</p>
                            <p className="text-xs text-center text-gray-500">Procurement / DCSO</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}