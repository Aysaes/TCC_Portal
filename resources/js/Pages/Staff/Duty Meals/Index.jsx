import ConfirmModal from '@/Components/ConfirmModal';
import { getStaffDutyMealLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { formatAppDate } from '@/Utils/date';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const MealCard = ({ meal, selection, onSelectionChange }) => {
    const { system } = usePage().props;
    
    const isStrictlyLocked = meal.is_locked || meal.choice !== 'none';
    const currentChoice = isStrictlyLocked ? meal.choice : (selection?.choice || '');
    const currentNote = isStrictlyLocked ? (meal.custom_request || '') : (selection?.custom_request || '');

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-900">
                        {formatAppDate(meal.duty_date, system?.timezone, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                    <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider">{meal.branch_name}</span>
                </div>
                
                {meal.is_locked ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">System Locked</span>
                ) : meal.choice !== 'none' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        Locked In
                    </span>
                ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full animate-pulse">Needs Action</span>
                )}
            </div>

            <div className="p-6 flex-grow flex flex-col gap-4">
                <label className={`w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    currentChoice === 'main' 
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                    : 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50'
                } ${isStrictlyLocked ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            name={`choice-${meal.participant_id}`}
                            value="main"
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 disabled:opacity-50"
                            checked={currentChoice === 'main'}
                            onChange={(e) => onSelectionChange(meal.participant_id, 'choice', e.target.value)}
                            disabled={isStrictlyLocked}
                        />
                        <div className="ml-3 flex-grow">
                            <span className="block font-bold text-gray-900">Main Meal</span>
                            <span className="block text-sm text-gray-600 mt-0.5">{meal.main_meal}</span>
                        </div>
                    </div>
                </label>

                {meal.alt_meal && (
                    <label className={`w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        currentChoice === 'alt' 
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                        : 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50'
                    } ${isStrictlyLocked ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name={`choice-${meal.participant_id}`}
                                value="alt"
                                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 disabled:opacity-50"
                                checked={currentChoice === 'alt'}
                                onChange={(e) => onSelectionChange(meal.participant_id, 'choice', e.target.value)}
                                disabled={isStrictlyLocked}
                            />
                            <div className="ml-3 flex-grow">
                                <span className="block font-bold text-gray-900">Alternative Meal</span>
                                <span className="block text-sm text-gray-600 mt-0.5">{meal.alt_meal}</span>
                            </div>
                        </div>
                    </label>
                )}

                <div className="mb-2 mt-auto">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Optional Request / Add-ons
                    </label>
                    <input 
                        type="text" 
                        placeholder={isStrictlyLocked && !currentNote ? "No special requests made." : "e.g., 2 bananas, no onions..."}
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                        value={currentNote}
                        onChange={(e) => onSelectionChange(meal.participant_id, 'custom_request', e.target.value)}
                        disabled={isStrictlyLocked}
                    />
                </div>
            </div>
        </div>
    );
};

export default function Index({ auth, myDutyMeals = [] }) {
    const DutyMealLinks = getStaffDutyMealLinks();

    // 🟢 1. FILTER STATES
    const [statusFilter, setStatusFilter] = useState('Pending');
    const [monthFilter, setMonthFilter] = useState('');

    // Dynamically generate the Month Dropdown options based on the data we have
    const availableMonths = useMemo(() => {
        const months = new Map();
        myDutyMeals.forEach(meal => {
            // Find the Monday of this meal's week to group it properly
            const mealDate = new Date(meal.duty_date);
            const day = mealDate.getDay();
            const monday = new Date(mealDate);
            monday.setDate(mealDate.getDate() - day + (day === 0 ? -6 : 1));

            const val = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}`;
            const label = monday.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!months.has(val)) months.set(val, label);
        });
        // Sort newest months first
        return Array.from(months.entries()).sort((a, b) => b[0].localeCompare(a[0])); 
    }, [myDutyMeals]);

    // Auto-select the most relevant month on initial load
    useEffect(() => {
        if (!monthFilter && availableMonths.length > 0) {
            const current = new Date();
            const currentVal = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
            
            if (availableMonths.some(([val]) => val === currentVal)) {
                setMonthFilter(currentVal);
            } else {
                setMonthFilter(availableMonths[0][0]); // Default to newest available
            }
        }
    }, [availableMonths, monthFilter]);

    // 🟢 2. GROUP AND FILTER LOGIC
    const activeGroupedMeals = useMemo(() => {
        const groups = {};

        // Step A: Group all meals by their Week's Monday
        myDutyMeals.forEach(meal => {
            const mealDate = new Date(meal.duty_date);
            const day = mealDate.getDay();
            const monday = new Date(mealDate);
            monday.setDate(mealDate.getDate() - day + (day === 0 ? -6 : 1));

            const weekLabel = `Week of ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

            if (!groups[weekLabel]) {
                groups[weekLabel] = { monday: monday, meals: [] };
            }
            groups[weekLabel].meals.push(meal);
        });

        // Convert to array format: [ [weekLabel, mealsArray, mondayDate], ... ]
        let entries = Object.entries(groups).map(([label, data]) => [label, data.meals, data.monday]);

        // Step B: Filter by Month
        if (monthFilter && monthFilter !== 'All') {
            entries = entries.filter(([_, __, monday]) => {
                const groupMonthVal = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}`;
                return groupMonthVal === monthFilter;
            });
        }

        // Step C: Filter by Status
        if (statusFilter !== 'All') {
            entries = entries.filter(([_, meals]) => {
                const pendingCount = meals.filter(m => !m.is_locked && m.choice === 'none').length;
                if (statusFilter === 'Pending') return pendingCount > 0;
                if (statusFilter === 'Completed') return pendingCount === 0;
                return true;
            });
        }

        // Sort chronologically (FIFO Flow)
        return entries.sort((a, b) => a[2] - b[2]);
    }, [myDutyMeals, monthFilter, statusFilter]);

    // 🟢 3. PAGINATION & MASTER STATE
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [selections, setSelections] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Reset pagination when filters change or lists shrink
    useEffect(() => {
        if (currentWeekIndex >= activeGroupedMeals.length) {
            setCurrentWeekIndex(Math.max(0, activeGroupedMeals.length - 1));
        }
    }, [activeGroupedMeals.length, currentWeekIndex, monthFilter, statusFilter]);

    // Track pending selections in the state
    useEffect(() => {
        const initialSelections = {};
        myDutyMeals.forEach(meal => {
            if (!meal.is_locked && meal.choice === 'none') {
                initialSelections[meal.participant_id] = {
                    participant_id: meal.participant_id,
                    choice: '',
                    custom_request: ''
                };
            }
        });
        setSelections(initialSelections);
    }, [myDutyMeals]);

    const handleSelectionChange = (participantId, field, value) => {
        setSelections(prev => ({
            ...prev,
            [participantId]: { ...prev[participantId], [field]: value }
        }));
    };

    // 🟢 4. SUBMIT HANDLER
    const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, title: '', message: '', confirmText: '', confirmColor: '', onConfirm: () => {} 
    });
    const closeConfirmModal = () => setConfirmDialog({ ...confirmDialog, isOpen: false });

    const handleBulkLockIn = (weekSelectionsToSubmit, weekLabel) => {
        setConfirmDialog({
            isOpen: true,
            title: `Lock In ${weekLabel}`,
            message: `Are you sure you want to lock in your ${weekSelectionsToSubmit.length} meal choices for this week? You will not be able to change them after this.`,
            confirmText: 'Lock In My Meals',
            confirmColor: 'bg-indigo-600 hover:bg-indigo-700',
            onConfirm: () => {
                setIsProcessing(true);
                router.post(route('staff.duty-meals.bulk-lock-in'), {
                    selections: weekSelectionsToSubmit
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        closeConfirmModal();
                        setIsProcessing(false);
                        setCurrentWeekIndex(0); 
                    },
                    onError: () => setIsProcessing(false)
                });
            }
        });
    };

    return (
        <SidebarLayout 
            user={auth.user}
            activeModule='Duty Meals'
            sidebarLinks={DutyMealLinks}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Duty Meal Panel</h2>}
        >
            <Head title="My Duty Meals" />

            <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* 🟢 NEW: Filter Header Layout */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Duty Meals</h2>
                        <p className="text-gray-500 mt-1">Select your meal preferences for your upcoming shifts.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Month Filter */}
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-medium text-gray-700"
                        >
                            <option value="All">All Months</option>
                            {availableMonths.map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                        
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-medium text-gray-700"
                        >
                            <option value="Pending">Pending Action</option>
                            <option value="Completed">Completed Weeks</option>
                            <option value="All">All Statuses</option>
                        </select>
                    </div>
                </div>

                {/* Empty State / Caught Up State */}
                {activeGroupedMeals.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
                        <div className={`rounded-full p-4 mb-4 ${statusFilter === 'Pending' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {statusFilter === 'Pending' ? (
                                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {statusFilter === 'Pending' ? "You're all caught up!" : "No meals found"}
                        </h3>
                        <p className="text-gray-500 mt-1">
                            {statusFilter === 'Pending' 
                                ? "No pending duty meals require your action right now." 
                                : "No rosters match your current filter settings."}
                        </p>
                    </div>
                ) : (
                    <div className="mb-12">
                        
                        {/* The Navigation Bar */}
                        {activeGroupedMeals.length > 1 && (
                            <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                <button
                                    onClick={() => setCurrentWeekIndex(prev => prev - 1)}
                                    disabled={currentWeekIndex === 0}
                                    className={`px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors ${
                                        currentWeekIndex === 0 
                                        ? 'text-gray-400 bg-gray-50 cursor-not-allowed' 
                                        : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                                    }`}
                                >
                                    &larr; Previous
                                </button>
                                
                                <span className="text-sm font-medium text-gray-500">
                                    Week <span className="text-gray-900 font-bold">{currentWeekIndex + 1}</span> of {activeGroupedMeals.length}
                                </span>
                                
                                <button
                                    onClick={() => setCurrentWeekIndex(prev => prev + 1)}
                                    disabled={currentWeekIndex === activeGroupedMeals.length - 1}
                                    className={`px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors ${
                                        currentWeekIndex === activeGroupedMeals.length - 1 
                                        ? 'text-gray-400 bg-gray-50 cursor-not-allowed' 
                                        : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                                    }`}
                                >
                                    Next &rarr;
                                </button>
                            </div>
                        )}

                        {/* The Rendered Current Week */}
                        {(() => {
                            // Safely extract the data, avoiding crashes if filters change rapidly
                            const currentGroup = activeGroupedMeals[currentWeekIndex];
                            if (!currentGroup) return null;
                            
                            const [weekLabel, mealsInWeek] = currentGroup;
                            
                            const pendingMealsInWeek = mealsInWeek.filter(m => !m.is_locked && m.choice === 'none');
                            const totalRequired = pendingMealsInWeek.length;
                            
                            const readyToSubmit = pendingMealsInWeek
                                .map(m => selections[m.participant_id])
                                .filter(s => s && s.choice !== '');
                                
                            const currentSelected = readyToSubmit.length;
                            const isFullySelected = totalRequired > 0 && currentSelected === totalRequired;

                            return (
                                <div className="animate-fade-in-up">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
                                        <h3 className="text-xl font-bold text-gray-800">{weekLabel}</h3>
                                        
                                        {/* Only show lock-in button if there are meals that NEED locking */}
                                        {totalRequired > 0 && (
                                            <button
                                                onClick={() => handleBulkLockIn(readyToSubmit, weekLabel)}
                                                disabled={isProcessing || !isFullySelected}
                                                className={`inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg font-bold text-xs text-white uppercase tracking-widest shadow-sm transition ease-in-out duration-150 ${
                                                    (isProcessing || !isFullySelected) 
                                                    ? 'bg-gray-400 cursor-not-allowed' 
                                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                                                }`}
                                            >
                                                {isProcessing 
                                                    ? 'Processing...' 
                                                    : isFullySelected 
                                                        ? 'Lock In Week' 
                                                        : `Select ${totalRequired - currentSelected} more`
                                                }
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {mealsInWeek.map((meal) => (
                                            <MealCard 
                                                key={meal.participant_id} 
                                                meal={meal} 
                                                selection={selections[meal.participant_id]}
                                                onSelectionChange={handleSelectionChange}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

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