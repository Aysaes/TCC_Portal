import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ConfirmModal({ 
    show = false, 
    onClose, 
    onConfirm, 
    title = 'Confirm Action', 
    message = 'Are you sure you want to proceed?', 
    confirmText = 'Confirm', 
    confirmColor = 'bg-red-600 hover:bg-red-500 focus:bg-red-500 active:bg-red-700' 
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {title}
                </h2>

                <p className="mt-4 text-sm text-gray-600 whitespace-pre-line">
                    {message}
                </p>
                
                <div className="mt-6 flex justify-end gap-2">
                    
                    {/* Cancel Button */}
                    <SecondaryButton 
                        className="px-4 py-2 text-sm font-medium rounded-md"
                        onClick={onClose}
                    >
                        Close
                    </SecondaryButton>

                    {/* Confirm Button (FIXED SIZE) */}
                    <PrimaryButton 
                        className={`px-4 py-2 text-sm font-semibold rounded-md ${confirmColor}`} 
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </PrimaryButton>

                </div>
            </div>
        </Modal>
    );
}