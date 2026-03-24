import SidebarLayout from '@/Layouts/SidebarLayout';
import { getHRLinks } from '@/Config/navigation';
import { Head, router } from '@inertiajs/react';

export default function HRAdminOverview({ auth, requests }) {
    // Bring in the dynamically generated HR links, passing 'auth' to prevent errors!
    const hrLinks = getHRLinks(auth);

    const requestList = requests || [];

    // Function to handle Accept or Reject
    const handleAction = (id, actionType) => {
        let confirmMessage = actionType === 'accept' 
            ? 'Are you sure you want to approve this request?' 
            : 'Are you sure you want to REJECT this request?';

        if (confirm(confirmMessage)) {
            router.patch(route('hr.admin.update-status', id), { action: actionType }, { preserveScroll: true });
        }
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
        <SidebarLayout
            activeModule="HR MENU"
            sidebarLinks={hrLinks}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">HR Admin Control Panel</h2>}
        >
            <Head title="HR Admin Overview" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Pending Document Requests</h3>
                        <p className="text-gray-600">Review, approve, or reject employee document requests.</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {requestList.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No requests are currently in the system.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Requestor</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Document Type</th>
                                            <th className="px-6 py-4">Details / Reason</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {requestList.map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                
                                                {/* Requestor Column */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-gray-900">{req.user?.name || 'Unknown User'}</div>
                                                    <div className="text-xs text-gray-500">{req.user?.email || ''}</div>
                                                </td>

                                                {/* Date Column */}
                                                <td className="px-6 py-4 font-medium text-gray-500 whitespace-nowrap">
                                                    {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>

                                                {/* Type Column */}
                                                <td className="px-6 py-4 font-bold text-indigo-900 whitespace-nowrap">
                                                    {req.type === 'COE' ? 'COE' : 'Form 2316'}
                                                </td>

                                                {/* Details Column */}
                                                <td className="px-6 py-4">
                                                    {req.type === 'COE' ? (
                                                        <div>
                                                            <span className="font-semibold block text-gray-800">{req.reason}</span>
                                                            {req.specific_details && <span className="text-xs text-gray-500 line-clamp-1">{req.specific_details}</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Standard Tax Form</span>
                                                    )}
                                                </td>

                                                {/* Status Column */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${getStatusStyle(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                </td>

                                                {/* Actions Column (Accept / Reject) */}
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
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
        </SidebarLayout>
    );
}