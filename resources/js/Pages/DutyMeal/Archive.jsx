import ConfirmModal from '@/Components/ConfirmModal';
import DangerButton from '@/Components/DangerButton';
import { getDutyMealLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { formatAppDate } from '@/Utils/date';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Archive({ auth, archivedMealsByWeek, availableDates, currentFilter }) {
    const dutyMealsLinks = getDutyMealLinks(auth);
    const { system } = usePage().props;
    
    // Global Confirm Modal State
    const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, title: '', message: '', onConfirm: () => {} 
    });
    const closeConfirmModal = () => setConfirmDialog({ ...confirmDialog, isOpen: false });

    // Handle Month/Year Filter Change
    const handleFilterChange = (e) => {
        const [year, month] = e.target.value.split('-');
        router.get(route('admin.duty-meals.archive'), { year, month }, { preserveState: true });
    };

    // --- DELETION HANDLERS ---
    // 1. Delete Single Roster
    const handleDeleteRoster = (id, dateStr) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Roster',
            message: `Are you sure you want to permanently delete the roster for ${dateStr}?`,
            onConfirm: () => {
                router.delete(route('admin.duty-meals.destroy', id), { onSuccess: closeConfirmModal });
            }
        });
    };

    // 2. Delete Entire Week
    const handleDeleteWeek = (weekName, mealsInWeek) => {
        const ids = mealsInWeek.map(m => m.id);
        setConfirmDialog({
            isOpen: true,
            title: `Delete ${weekName}`,
            message: `Are you sure you want to delete all ${ids.length} rosters in ${weekName}?`,
            onConfirm: () => {
                router.post(route('admin.duty-meals.bulk-delete'), { ids }, { onSuccess: closeConfirmModal });
            }
        });
    };

    // 3. Delete Entire Month
    const handleDeleteMonth = () => {
        // Flatten all weeks into one array of IDs
        const allIds = Object.values(archivedMealsByWeek).flat().map(m => m.id);
        if (allIds.length === 0) return;

        setConfirmDialog({
            isOpen: true,
            title: 'Delete Entire Month',
            message: `WARNING: You are about to permanently delete all ${allIds.length} rosters for this month. This cannot be undone.`,
            onConfirm: () => {
                router.post(route('admin.duty-meals.bulk-delete'), { ids: allIds }, { onSuccess: closeConfirmModal });
            }
        });
    };

    return (
        <SidebarLayout activeModule="Duty Meals" sidebarLinks={dutyMealsLinks} header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Archive Panel</h2>}>
            <Head title="Duty Meal Archive" />

            {/* HEADER & FILTERS */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Archived Rosters</h1>
                
                <div className="flex items-center gap-4">
                    <select 
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={`${currentFilter.year}-${currentFilter.month}`}
                        onChange={handleFilterChange}
                    >
                        {availableDates.length === 0 && <option value={`${currentFilter.year}-${currentFilter.month}`}>No Archives Found</option>}
                        {availableDates.map(date => {
                            const label = formatAppDate(`${date.year}-${String(date.month).padStart(2, '0')}-01`, system?.timezone, { month: 'long', year: 'numeric' });
                            return <option key={`${date.year}-${date.month}`} value={`${date.year}-${date.month}`}>{label}</option>;
                        })}
                    </select>

                    {auth.user.role_id === 1 && Object.keys(archivedMealsByWeek).length > 0 && (
                        <DangerButton onClick={handleDeleteMonth}>
                            Delete Entire Month
                        </DangerButton>
                    )}
                </div>
            </div>

            {/* WEEKLY GROUPING DISPLAY */}
            {Object.keys(archivedMealsByWeek).length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-100 p-8 text-center text-gray-500">
                    No archived rosters found for this month.
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(archivedMealsByWeek).map(([weekName, meals]) => (
                        <div key={weekName} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{weekName}</h3>
                                {auth.user.role_id === 1 && (
                                    <button onClick={() => handleDeleteWeek(weekName, meals)} className="text-xs text-red-600 hover:text-red-800 font-medium">
                                        Delete Week
                                    </button>
                                )}
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {meals.map((meal) => (
                                        <tr key={meal.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatAppDate(meal.duty_date, system?.timezone, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meal.branch?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meal.participants_count} Staff</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {auth.user.role_id === 1 && (
                                                    <button onClick={() => handleDeleteRoster(meal.id, formatAppDate(meal.duty_date, system?.timezone))} className="text-red-600 hover:text-red-900">
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}

            {/* GLOBAL CONFIRM MODAL */}
            <ConfirmModal 
                show={confirmDialog.isOpen}
                onClose={closeConfirmModal}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText="Permanently Delete"
                confirmColor="bg-red-600 hover:bg-red-700"
                onConfirm={confirmDialog.onConfirm}
            />
        </SidebarLayout>
    );
}
