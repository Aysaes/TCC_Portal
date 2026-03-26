import Modal from '@/Components/Modal';
import { getHRLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const COE_REASONS = [
    "Motor Loan",
    "Bank Loan",
    "Housing Loan",
    "Visa Application",
    "Travel",
    "Others"
];

export default function StaffOverview({ auth, requests }) {

    const currentRole = auth.user?.role?.name || 'Guest';
    const HRLinks = getHRLinks(currentRole, auth);
    
    const requestList = requests || [];

    // --- STATE FOR REQUEST MODAL (CREATE) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        type: '2316',
        name: auth.user.name,
        reason: '',
        specific_details: '',
    });

    // --- STATE FOR VIEW DETAILS MODAL ---
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // --- MODAL HANDLERS ---
    const openModal = (requestType) => {
        reset();
        setData((prevData) => ({
            ...prevData,
            type: requestType,
            name: auth.user.name, 
            reason: requestType === 'COE' ? COE_REASONS[0] : '',
        }));
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => reset(), 300);
    };

    const openViewModal = (req) => {
        setSelectedRequest(req);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setTimeout(() => setSelectedRequest(null), 300);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('hr.store'), {
            onSuccess: () => closeModal(),
        });
    };

    // Helper function for labels
    const getDetailsLabel = (reason) => {
        switch (reason) {
            case 'Visa Application': return 'Specify Country / Passport No.';
            case 'Travel': return 'Specify Leave Dates';
            case 'Others': return 'Please Specify';
            default: return 'Additional Details (Optional)';
        }
    };

    // Helper to style the status badges perfectly
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending HR': 
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'General Accounting': 
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Released': 
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Rejected': 
                return 'bg-red-100 text-red-800 border-red-200';
            default: 
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <SidebarLayout activeModule="HR" sidebarLinks={HRLinks}>
            <Head title="HR Overview" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Header Section */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Document Requests</h3>
                        <p className="text-gray-600">Request your official company documents and track their approval status.</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {/* 2316 Button */}
                        <div 
                            onClick={() => openModal('2316')}
                            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg border border-gray-100 hover:border-indigo-300"
                        >
                            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-indigo-50 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <h4 className="relative z-10 text-xl font-bold text-gray-900 mb-2">Request Form 2316</h4>
                            <p className="relative z-10 text-sm text-gray-500">Your Certificate of Compensation Payment / Tax Withheld.</p>
                        </div>

                        {/* COE Button */}
                        <div 
                            onClick={() => openModal('COE')}
                            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg border border-gray-100 hover:border-emerald-300"
                        >
                            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-emerald-50 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
                                </svg>
                            </div>
                            <h4 className="relative z-10 text-xl font-bold text-gray-900 mb-2">Request COE</h4>
                            <p className="relative z-10 text-sm text-gray-500">Certificate of Employment for loans, travel, or visa applications.</p>
                        </div>
                    </div>

                    {/* Tracking Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">My Requests Tracker</h3>
                        </div>
                        
                        {requestList.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                You have not made any document requests yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-white border-b border-gray-100 text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Date Requested</th>
                                            <th className="px-6 py-4">Document Type</th>
                                            <th className="px-6 py-4">Details / Reason</th>
                                            <th className="px-6 py-4 text-right">Current Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {requestList.map((req) => (
                                            {/* UPDATED: Added onClick and cursor-pointer to the row */},
                                            <tr 
                                                key={req.id} 
                                                onClick={() => openViewModal(req)}
                                                className="hover:bg-gray-100 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                    {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-indigo-900 group-hover:text-indigo-600 transition-colors">
                                                    {req.type === 'COE' ? 'Certificate of Employment' : 'Form 2316'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {req.type === 'COE' ? (
                                                        <div>
                                                            <span className="font-semibold block">{req.reason}</span>
                                                            {req.specific_details && <span className="text-xs text-gray-500">{req.specific_details}</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Standard Request</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${getStatusStyle(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                    <span className="ml-3 text-gray-300 group-hover:text-gray-500 transition-colors">
                                                        &rarr;
                                                    </span>
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

            {/* --- CREATE REQUEST MODAL --- */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between border-b pb-4 mb-5">
                        <h2 className="text-xl font-bold text-gray-900">
                            Request {data.type === 'COE' ? 'Certificate of Employment' : 'Form 2316'}
                        </h2>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <form onSubmit={submit} className="space-y-5">
                        {data.type === '2316' && (
                            <div className="bg-indigo-50 text-indigo-800 text-sm p-4 rounded-lg border border-indigo-100 mb-4">
                                <span className="font-bold block mb-1">Standard Processing Flow:</span>
                                1. Pending HR &rarr; 2. General Accounting &rarr; 3. Released
                            </div>
                        )}

                        {data.type === 'COE' && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Employee Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50"
                                        readOnly 
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Reason for COE</label>
                                    <select
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    >
                                        {COE_REASONS.map((reason) => (
                                            <option key={reason} value={reason}>{reason}</option>
                                        ))}
                                    </select>
                                    {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        {getDetailsLabel(data.reason)}
                                        {!['Visa Application', 'Travel', 'Others'].includes(data.reason) && <span className="text-gray-400 font-normal ml-1">(Optional)</span>}
                                    </label>
                                    <textarea
                                        value={data.specific_details}
                                        onChange={(e) => setData('specific_details', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder={`e.g. ${getDetailsLabel(data.reason)}`}
                                        required={['Visa Application', 'Travel', 'Others'].includes(data.reason)}
                                        rows="4"
                                    />
                                    {errors.specific_details && <p className="mt-1 text-xs text-red-500">{errors.specific_details}</p>}
                                </div>
                            </>
                        )}

                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* --- NEW: VIEW DETAILS MODAL --- */}
            <Modal show={isViewModalOpen} onClose={closeViewModal} maxWidth="md">
                {selectedRequest && (
                    <div className="p-6">
                        <div className="flex items-center justify-between border-b pb-4 mb-5">
                            <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                            <button onClick={closeViewModal} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
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

                            {selectedRequest.type === 'COE' && (
                                <>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedRequest.reason}</p>
                                    </div>
                                    
                                    {selectedRequest.specific_details && (
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Specific Details</label>
                                            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.specific_details}</p>
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
                                    <p className="text-sm text-red-700 whitespace-pre-wrap leading-relaxed">{selectedRequest.remarks}</p>
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
        </SidebarLayout>
    );
}