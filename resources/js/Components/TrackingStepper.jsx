
export default function TrackingStepper({ currentStatus, type = 'PR' }) {
    // 1. Define the workflow steps
    const prWorkflow = [
        { key: 'pending_inventory_assistant', label: 'Inventory Assistant' },
        { key: 'pending_inventory_tl', label: 'Inventory TL' },
        { key: 'pending_procurement', label: 'Procurement Review' },
        { key: 'approved', label: 'Fully Approved' },
        { key: 'po_generated', label: 'PO Generated' }
    ];

    const poWorkflow = [
        { key: 'drafted', label: 'Procurement Draft' },
        { key: 'pending_approval', label: 'DCSO Approval' },
        { key: 'approved', label: 'PO Finalized' }
    ];

    const workflow = type === 'PR' ? prWorkflow : poWorkflow;
    
    // 2. Identify where we are in the workflow
    const isRejected = ['rejected', 'cancelled'].includes(currentStatus);
    const currentIndex = workflow.findIndex(step => step.key === currentStatus);

    return (
        <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase border-b pb-2 mb-3">
                {type === 'PR' ? 'Purchase Request Workflow' : 'Purchase Order Workflow'}
            </h4>
            
            <div className="flex flex-wrap gap-2 text-sm font-bold text-gray-500">
                {workflow.map((step, index) => {
                    // Default to gray (future step or cancelled)
                    let dotColor = 'bg-gray-300'; 
                    
                    if (!isRejected) {
                        if (index < currentIndex) {
                            // Past steps are solid green
                            dotColor = 'bg-green-500';
                        } else if (index === currentIndex) {
                            // If it's an end-state, make it solid green. Otherwise, pulsing amber.
                            if (['approved', 'po_generated'].includes(step.key)) {
                                dotColor = 'bg-green-500';
                            } else {
                                dotColor = 'bg-amber-400 animate-pulse';
                            }
                        }
                    }

                    return (
                        <span key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                            <span className={`h-3 w-3 rounded-full ${dotColor}`}></span> 
                            {step.label}
                        </span>
                    );
                })}

                {/* If the request was rejected/cancelled, append a red pill at the end */}
                {isRejected && (
                    <span className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200 text-red-700">
                        <span className="h-3 w-3 rounded-full bg-red-600 animate-pulse"></span> 
                        {type === 'PR' ? 'Rejected' : 'Cancelled'}
                    </span>
                )}
            </div>
        </div>
    );
}