import ConfirmModal from '@/Components/ConfirmModal';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { getDutyMealLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, dutymeals = [] }) {
    
    const dutyMealsLinks = getDutyMealLinks();

    // Global Confirm Modal
        const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, title: '', message: '', confirmText: '', confirmColor: '', onConfirm: () => {} 
    });
    
        const closeConfirmModal = () => setConfirmDialog({ ...confirmDialog, isOpen: false,});
        

    const [selectedRosterId, setSelectedRosterId] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null); // Tracks which settings cog is open

    // Derive the selected roster directly from the fresh props
    const selectedRoster = dutymeals.find(m => m.id === selectedRosterId);

    const closeModal = () => {
        setSelectedRosterId(null);
        setOpenDropdownId(null);
    };

    // --- ACTION HANDLERS ---
    const handleAction = (actionRoute, id) => {
        router.patch(route(actionRoute, id), {}, { preserveScroll: true });
        setOpenDropdownId(null); // Close dropdown after clicking
    };

   const handleRemove = (employeeName, participantId) => {
        setOpenDropdownId(null); // Close the settings dropdown first
        
        setConfirmDialog({
            isOpen: true,
            title: 'Remove Staff from Roster',
            message: `Are you sure you want to remove ${employeeName} from this duty meal? \n\nThis will delete their meal selection.`,
            confirmText: 'Remove from Roster',
            confirmColor: 'bg-red-600 hover:bg-red-500',
            onConfirm: () => {
                router.delete(route('admin.participants.remove', participantId), { 
                    preserveScroll: true,
                    onSuccess: () => closeConfirmModal(),
                });
            }
        });
    };

    return (
        <SidebarLayout activeModule="Duty Meals"
                        sidebarLinks={dutyMealsLinks}
                        header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Duty Meal Panel
                </h2>}>
            <Head title="Duty Meal Dashboard" />

            {/* HEADER SECTION (Unchanged) */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Duty Meal Rosters</h1>
                </div>
            </div>

            {/* TABLE SECTION (Unchanged) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {/* ... (Keep your existing main table header and body here) ... */}
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Make sure your rows trigger setSelectedRosterId(meal.id) now! */}
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dutymeals.map((meal) => (
                                <tr key={meal.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedRosterId(meal.id)}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(meal.duty_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meal.branch?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meal.participants_count} Staff</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* THE CHOICES MODAL */}
            <Modal show={!!selectedRoster} onClose={closeModal} maxWidth="2xl">
                {selectedRoster && (
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedRoster.branch?.name} - {new Date(selectedRoster.duty_date).toLocaleDateString()}
                            </h2>
                            {/* Added an X button for easier closing */}
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        {/* Display the Staff Choices */}
                        {/* 👇 Reduced max-h to 50vh and pb-24 so it doesn't stretch to the top/bottom borders */}
                        <div className="max-h-[50vh] overflow-y-auto overflow-x-visible pb-24 pr-2">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="text-left text-xs text-gray-500 uppercase">
                                        <th className="py-2">Staff Name</th>
                                        <th className="py-2">Shift</th>
                                        <th className="py-2">Choice</th>
                                        <th className="py-2 text-center">Status</th>
                                        <th className="py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {selectedRoster.participants.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="py-3 text-sm font-medium text-gray-900">{p.user?.name}</td>
                                            <td className="py-3">
                                                {p.is_graveyard ? <span className="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded">GY</span> : <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded">Day</span>}
                                            </td>
                                            <td className="py-3">
                                                {p.choice === 'none' ? (
                                                    <span className="text-gray-400 italic text-xs">Pending...</span>
                                                ) : (
                                                    <div>
                                                        <span className={`font-bold text-xs uppercase ${p.choice === 'main' ? 'text-indigo-600' : 'text-amber-600'}`}>
                                                            {p.choice}
                                                        </span>
                                                        
                                                        {p.custom_request && (
                                                            <div className="text-[10px] text-gray-500 italic mt-0.5 leading-tight">
                                                                Note: {p.custom_request}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            
                                            <td className="py-3 text-center">
                                                {p.is_delivered ? (
                                                    <span className="text-[10px] bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded-full font-bold">Delivered</span>
                                                ) : (
                                                    <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-1 rounded-full">Not Delivered</span>
                                                )}
                                            </td>

                                            <td className="py-3 text-right relative">
                                                <button 
                                                    onClick={() => setOpenDropdownId(openDropdownId === p.id ? null : p.id)}
                                                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>

                                                {openDropdownId === p.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1 text-left">
                                                        {p.choice === 'none' && (
                                                            <button 
                                                                onClick={() => handleAction('admin.participants.default-main', p.id)}
                                                                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 text-left"
                                                            >
                                                                Force 'Main Meal'
                                                            </button>
                                                        )}
                                                        
                                                        {/* 👇 Updated to explicitly say "Mark as Not Delivered" */}
                                                       {p.choice !== 'none' && (
                                                            <button 
                                                                onClick={() => handleAction('admin.participants.toggle-delivery', p.id)}
                                                                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 text-left"
                                                            >
                                                                {p.is_delivered ? 'Mark as Not Delivered' : 'Mark as Delivered'}
                                                            </button>
                                                        )}

                                                        <button 
                                                            onClick={(e) => {
                                                                 e.preventDefault();
                                                                 e.stopPropagation();
                                                                handleRemove(p.user?.name, p.id)}}
                                                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left border-t border-gray-100 mt-1"
                                                        >
                                                            Remove from Roster
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 pt-4 border-t flex justify-end">
                            <SecondaryButton onClick={closeModal}>Close Details</SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>

             {/* Global Confirmation Modal */}
                        <ConfirmModal 
                            show={confirmDialog.isOpen}
                            onClose={closeConfirmModal}
                            title={confirmDialog.title}
                            message={confirmDialog.message}
                            confirmText={confirmDialog.confirmText}
                            confirmColor={confirmDialog.confirmColor}
                            onConfirm={confirmDialog.onConfirm}
                        />
        </SidebarLayout>
    );
}