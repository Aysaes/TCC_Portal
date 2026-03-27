import React, { useState } from 'react'; 
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { getHRAdminLinks } from '@/Config/navigation';
import Modal from '@/Components/Modal'; 

export default function FeedbackSubmissions({ auth, submissions }) {
    const adminSidebarLinks = getHRAdminLinks(auth);
    
    // --- STATE FOR THE MODAL ---
    const [viewingFeedback, setViewingFeedback] = useState(null);

    const getTypeColor = (type) => {
        switch (String(type).toLowerCase()) {
            case 'recommendation': return 'bg-emerald-100 text-emerald-800';
            case 'issue report': return 'bg-red-100 text-red-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <SidebarLayout activeModule="HR ADMIN" sidebarLinks={adminSidebarLinks}>
            <Head title="Feedback Submissions" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Feedback Submissions</h1>
                            <p className="text-gray-500 text-sm mt-1">Review and manage feedback submitted by employees.</p>
                        </div>
                        {/* THE SEARCH AND FILTER DROPDOWN HAVE BEEN COMPLETELY REMOVED FROM HERE */}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        {/* THE SCROLLBAR FIX: max-h-[400px] and overflow-y-auto */}
                        <div className="overflow-x-auto overflow-y-auto max-h-[400px] relative w-full custom-scrollbar">
                            <table className="min-w-full divide-y divide-gray-200">
                                {/* STICKY HEADER: Added sticky, top-0, and z-10 */}
                                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions?.data?.length > 0 ? (
                                        submissions.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.created_at_display}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(item.type)}`}>
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                    {item.subject}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.user?.name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button 
                                                        onClick={() => setViewingFeedback(item)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-bold transition-colors"
                                                    >
                                                        Read Feedback
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                No feedback submissions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* ==========================================
                FEEDBACK VIEWER MODAL
            ========================================== */}
            <Modal show={!!viewingFeedback} onClose={() => setViewingFeedback(null)} maxWidth="2xl">
                {viewingFeedback && (
                    <div className="p-6 max-h-[85vh] overflow-y-auto flex flex-col">
                        
                        <div className="flex justify-between items-start mb-4 border-b pb-4 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{viewingFeedback.subject}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Submitted by <span className="font-semibold text-gray-700">{viewingFeedback.user?.name || 'Unknown'}</span> on {viewingFeedback.created_at_display}
                                </p>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getTypeColor(viewingFeedback.type)}`}>
                                {viewingFeedback.type}
                            </span>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 whitespace-pre-wrap text-sm leading-relaxed mb-6 shrink-0">
                            {viewingFeedback.message}
                        </div>

                        {viewingFeedback.image_path && (
                            <div className="mb-6 shrink-0">
                                <h3 className="text-sm font-bold text-gray-700 mb-2">Attached Image:</h3>
                                <div className="relative w-full h-64 md:h-80 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                                    <img 
                                        src={`/storage/${viewingFeedback.image_path}`} 
                                        alt="Feedback Attachment" 
                                        className="absolute inset-0 w-full h-full object-contain p-2"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t mt-auto shrink-0">
                            <button 
                                onClick={() => setViewingFeedback(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-bold rounded hover:bg-gray-300 transition-colors"
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