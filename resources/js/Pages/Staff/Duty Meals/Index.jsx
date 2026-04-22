import ConfirmModal from '@/Components/ConfirmModal';
import { getStaffDutyMealLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { formatAppDate } from '@/Utils/date';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const MealCard = ({ meal, selection, onSelectionChange }) => {
    const { system } = usePage().props;
    
    const isMakati = meal.branch_name?.toLowerCase().includes('makati');
    
    const isStrictlyLocked = meal.is_locked || meal.choice !== 'none';
    const currentChoice = isStrictlyLocked ? meal.choice : (selection?.choice || '');
    const currentSite = isStrictlyLocked ? (meal.site || '') : (selection?.site || '');
    const currentNote = isStrictlyLocked ? (meal.custom_request || '') : (selection?.custom_request || '');

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200/80 overflow-hidden flex flex-col relative group">
            {/* HEADER */}
            <div className="bg-gradient-to-b from-gray-50/80 to-white px-5 py-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg tracking-tight">
                        {formatAppDate(meal.duty_date, system?.timezone, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                    <div className="flex items-center mt-0.5 space-x-2">
                        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{meal.branch_name}</span>
                    </div>
                </div>
                
                {/* STATUS BADGE */}
                {meal.is_locked ? (
                    <span className="px-2.5 py-1 bg-red-50 text-red-700 text-[10px] font-bold rounded-md ring-1 ring-inset ring-red-600/10 uppercase tracking-wide">Locked</span>
                ) : meal.choice !== 'none' ? (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md ring-1 ring-inset ring-emerald-600/10 uppercase tracking-wide flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        Saved
                    </span>
                ) : (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md ring-1 ring-inset ring-amber-600/20 uppercase tracking-wide animate-pulse">Needs Action</span>
                )}
            </div>

            {/* BODY */}
            <div className="p-5 flex-grow flex flex-col gap-5">
                
                {/* MEAL SELECTIONS */}
                <div className="space-y-2.5">
                    <label className={`block w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        currentChoice === 'main' 
                        ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' 
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    } ${isStrictlyLocked ? 'opacity-75 cursor-not-allowed' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-grow">
                                {/* Custom Radio Button */}
                                <div className={`flex items-center justify-center w-5 h-5 rounded-full border flex-shrink-0 transition-colors ${currentChoice === 'main' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white'}`}>
                                    {currentChoice === 'main' && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <input
                                    type="radio"
                                    name={`choice-${meal.participant_id}`}
                                    value="main"
                                    className="hidden"
                                    checked={currentChoice === 'main'}
                                    onChange={(e) => onSelectionChange(meal.participant_id, 'choice', e.target.value)}
                                    disabled={isStrictlyLocked}
                                />
                                <div className="ml-3">
                                    <span className={`block text-xs font-bold uppercase tracking-wider mb-0.5 ${currentChoice === 'main' ? 'text-indigo-600' : 'text-gray-500'}`}>Main Meal</span>
                                    <span className="block text-sm font-medium text-gray-900">{meal.main_meal}</span>
                                </div>
                            </div>
                        </div>
                    </label>

                    {meal.alt_meal && (
                        <label className={`block w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                            currentChoice === 'alt' 
                            ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' 
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        } ${isStrictlyLocked ? 'opacity-75 cursor-not-allowed' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center flex-grow">
                                    {/* Custom Radio Button */}
                                    <div className={`flex items-center justify-center w-5 h-5 rounded-full border flex-shrink-0 transition-colors ${currentChoice === 'alt' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white'}`}>
                                        {currentChoice === 'alt' && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name={`choice-${meal.participant_id}`}
                                        value="alt"
                                        className="hidden"
                                        checked={currentChoice === 'alt'}
                                        onChange={(e) => onSelectionChange(meal.participant_id, 'choice', e.target.value)}
                                        disabled={isStrictlyLocked}
                                    />
                                    <div className="ml-3">
                                        <span className={`block text-xs font-bold uppercase tracking-wider mb-0.5 ${currentChoice === 'alt' ? 'text-indigo-600' : 'text-gray-500'}`}>Alternative Meal</span>
                                        <span className="block text-sm font-medium text-gray-900">{meal.alt_meal}</span>
                                    </div>
                                </div>
                            </div>
                        </label>
                    )}
                </div>

                {/* MAKATI SITE SELECTION (Segmented Control Style) */}
                {isMakati && (
                    <div>
                        <label className="flex items-center text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                            <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Location Site <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex p-1 bg-gray-100/80 rounded-lg border border-gray-200">
                            <label className={`flex-1 text-center py-2 px-3 rounded-md transition-all cursor-pointer text-sm font-semibold ${
                                currentSite === 'Back Office' 
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            } ${isStrictlyLocked ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                <input
                                    type="radio"
                                    name={`site-${meal.participant_id}`}
                                    value="Back Office"
                                    className="hidden"
                                    checked={currentSite === 'Back Office'}
                                    onChange={(e) => onSelectionChange(meal.participant_id, 'site', e.target.value)}
                                    disabled={isStrictlyLocked}
                                />
                                Back Office
                            </label>

                            <label className={`flex-1 text-center py-2 px-3 rounded-md transition-all cursor-pointer text-sm font-semibold ${
                                currentSite === 'Clinic' 
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            } ${isStrictlyLocked ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                <input
                                    type="radio"
                                    name={`site-${meal.participant_id}`}
                                    value="Clinic"
                                    className="hidden"
                                    checked={currentSite === 'Clinic'}
                                    onChange={(e) => onSelectionChange(meal.participant_id, 'site', e.target.value)}
                                    disabled={isStrictlyLocked}
                                />
                                Clinic
                            </label>
                        </div>
                    </div>
                )}

                {/* OPTIONAL REQUEST */}
                <div className="mt-auto pt-2 border-t border-gray-100">
                    <label className="flex items-center text-xs font-semibold text-gray-500 mb-2">
                        <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Optional Request / Add-ons
                    </label>
                    <input 
                        type="text" 
                        placeholder={isStrictlyLocked && !currentNote ? "No special requests made." : "e.g., 2 bananas, 2 eggs"}
                        className="w-full text-sm border-gray-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 transition-colors placeholder-gray-400"
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

    // 1. FILTER STATES
    const [statusFilter, setStatusFilter] = useState('Pending');
    const [monthFilter, setMonthFilter] = useState('');

    const availableMonths = useMemo(() => {
        const months = new Map();
        myDutyMeals.forEach(meal => {
            const mealDate = new Date(meal.duty_date);
            const day = mealDate.getDay();
            const monday = new Date(mealDate);
            monday.setDate(mealDate.getDate() - day + (day === 0 ? -6 : 1));

            const val = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}`;
            const label = monday.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!months.has(val)) months.set(val, label);
        });
        return Array.from(months.entries()).sort((a, b) => b[0].localeCompare(a[0])); 
    }, [myDutyMeals]);

    useEffect(() => {
        if (!monthFilter && availableMonths.length > 0) {
            const current = new Date();
            const currentVal = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
            
            if (availableMonths.some(([val]) => val === currentVal)) {
                setMonthFilter(currentVal);
            } else {
                setMonthFilter(availableMonths[0][0]);
            }
        }
    }, [availableMonths, monthFilter]);

    // 2. GROUP AND FILTER LOGIC
    const activeGroupedMeals = useMemo(() => {
        const groups = {};

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

        let entries = Object.entries(groups).map(([label, data]) => [label, data.meals, data.monday]);

        if (monthFilter && monthFilter !== 'All') {
            entries = entries.filter(([_, __, monday]) => {
                const groupMonthVal = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}`;
                return groupMonthVal === monthFilter;
            });
        }

        if (statusFilter !== 'All') {
            entries = entries.filter(([_, meals]) => {
                const pendingCount = meals.filter(m => !m.is_locked && m.choice === 'none').length;
                if (statusFilter === 'Pending') return pendingCount > 0;
                if (statusFilter === 'Completed') return pendingCount === 0;
                return true;
            });
        }

        return entries.sort((a, b) => a[2] - b[2]);
    }, [myDutyMeals, monthFilter, statusFilter]);

    // 3. PAGINATION & MASTER STATE
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [selections, setSelections] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (currentWeekIndex >= activeGroupedMeals.length) {
            setCurrentWeekIndex(Math.max(0, activeGroupedMeals.length - 1));
        }
    }, [activeGroupedMeals.length, currentWeekIndex, monthFilter, statusFilter]);

    useEffect(() => {
        const initialSelections = {};
        myDutyMeals.forEach(meal => {
            if (!meal.is_locked && meal.choice === 'none') {
                initialSelections[meal.participant_id] = {
                    participant_id: meal.participant_id,
                    choice: '',
                    site: '', // Added site initialization
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

    // 4. SUBMIT HANDLER
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
                
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Duty Meals</h2>
                        <p className="text-gray-500 mt-1">Select your meal preferences for your upcoming shifts.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
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

                        {(() => {
                            const currentGroup = activeGroupedMeals[currentWeekIndex];
                            if (!currentGroup) return null;
                            
                            const [weekLabel, mealsInWeek] = currentGroup;
                            
                            const pendingMealsInWeek = mealsInWeek.filter(m => !m.is_locked && m.choice === 'none');
                            const totalRequired = pendingMealsInWeek.length;
                            
                            // VALIDATION BEFORE SUBMIT (Ensuring Makati has Site selected)
                            const readyToSubmit = pendingMealsInWeek
                                .filter(m => {
                                    const s = selections[m.participant_id];
                                    if (!s || s.choice === '') return false;
                                    
                                    const isMakati = m.branch_name?.toLowerCase().includes('makati');
                                    if (isMakati && (!s.site || s.site === '')) return false; // Block if Makati and no site
                                    
                                    return true;
                                })
                                .map(m => selections[m.participant_id]);
                                
                            const currentSelected = readyToSubmit.length;
                            const isFullySelected = totalRequired > 0 && currentSelected === totalRequired;

                            return (
                                <div className="animate-fade-in-up">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
                                        <h3 className="text-xl font-bold text-gray-800">{weekLabel}</h3>
                                        
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