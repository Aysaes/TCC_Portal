import ConfirmModal from '@/Components/ConfirmModal';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { getDutyMealLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { formatAppDate } from '@/Utils/date';

export default function Index({ auth, dutymeals = [], employees = [], departments = [], positions = [], branches = [] }) {
    
    const dutyMealsLinks = getDutyMealLinks();
    const { system } = usePage().props;

    const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);

    const [overviewBranch, setOverviewBranch] = useState('All');

    const [dateFilterType, setDateFilterType] = useState('this_month'); 
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Global Confirm Modal
        const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, title: '', message: '', confirmText: '', confirmColor: '', onConfirm: () => {} 
    });
    
        const closeConfirmModal = () => setConfirmDialog({ ...confirmDialog, isOpen: false,});
        

    const [selectedRosterId, setSelectedRosterId] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null); // Tracks which settings cog is open

    // Derive the selected roster directly from the fresh props
    const selectedRoster = dutymeals.find(m => String(m.id) === String(selectedRosterId));

    const closeModal = () => {
        if (isPoolModalOpen) return; 
        
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

    const [poolSearch, setPoolSearch] = useState('');
    const [poolDept, setPoolDept] = useState('All');
    const [poolPos, setPoolPos] = useState('');

    const availablePoolPositions = (poolDept === 'All') 
        ? positions 
        : positions.filter(pos => String(pos.department_id) === String(poolDept));

        const filteredPoolEmployees = employees.filter(emp => {
        
        if (selectedRoster?.participants.some(p => p.user?.id === emp.id)) return false;

        
        const matchesSearch = emp.name.toLowerCase().includes(poolSearch.toLowerCase());
        const matchesDept = poolDept === 'All' || String(emp.department_id) === String(poolDept);
        const matchesPos = poolPos === '' || String(emp.position_id) === String(poolPos);

        return matchesSearch && matchesDept && matchesPos;
    });

   const handleEmergencyAdd = (employeeId) => {
        if (!selectedRoster || !selectedRoster.id) {
            console.error("CRASH PREVENTED: selectedRoster is missing!", selectedRoster);
            alert("Error: No roster selected. Please close the modal and select the duty meal again.");
            return;
        }

        if (!employeeId) {
            console.error("CRASH PREVENTED: employeeId is missing!");
            return;
        }

        router.post(route('admin.duty-meals.add-participant', selectedRoster.id), {
            user_id: employeeId
        }, {
            preserveScroll: true,
            preserveState: true, 
            onSuccess: () => {
                setPoolSearch(''); 
               
            },
        });
    };

   const filteredDutyMeals = useMemo(() => {
        let filtered = dutymeals;

        // A. Filter by Branch
        if (overviewBranch !== 'All') {
            filtered = filtered.filter(m => String(m.branch_id) === String(overviewBranch));
        }

        // B. Setup Date Math Helpers
        const today = new Date(`${system?.serverDate || '1970-01-01'}T00:00:00`);
        today.setHours(0, 0, 0, 0);

        const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1; 
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // C. Filter by Date
        filtered = filtered.filter(m => {
            const mealDate = new Date(m.duty_date);
            mealDate.setHours(0, 0, 0, 0);

            if (dateFilterType === 'today') {
                return mealDate.getTime() === today.getTime();
            }
            if (dateFilterType === 'this_week') {
                return mealDate >= startOfWeek && mealDate <= endOfWeek;
            }
            if (dateFilterType === 'this_month') {
                return mealDate.getMonth() === today.getMonth() && mealDate.getFullYear() === today.getFullYear();
            }
            if (dateFilterType === 'custom') {
                const start = customStartDate ? new Date(customStartDate).setHours(0,0,0,0) : -Infinity;
                const end = customEndDate ? new Date(customEndDate).setHours(0,0,0,0) : Infinity;
                return mealDate.getTime() >= start && mealDate.getTime() <= end;
            }
            
            return true;
        });

        return filtered;
    }, [dutymeals, overviewBranch, dateFilterType, customStartDate, customEndDate, system?.serverDate]);

    // 👇 2. STATS CRUNCHER: Calculate the numbers based ONLY on the filtered list above!
    const stats = useMemo(() => {
        let totalMeals = 0;
        let totalMain = 0;
        let totalAlt = 0;
        let totalSpecial = 0;

        filteredDutyMeals.forEach(meal => {
            meal.participants.forEach(p => {
                totalMeals++;
                if (p.choice === 'main') totalMain++;
                if (p.choice === 'alt') totalAlt++;
                if (p.custom_request && p.custom_request.trim() !== '') totalSpecial++;
            });
        });

        return { totalMeals, totalMain, totalAlt, totalSpecial };
    }, [filteredDutyMeals]); // This watches the block above it

    return (
        <SidebarLayout activeModule="Duty Meals"
                        sidebarLinks={dutyMealsLinks}
                        header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Duty Meal Panel
                </h2>}>
            <Head title="Duty Meal Dashboard" />

            {/* --- OVERVIEW DASHBOARD --- */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Overview Statistics</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* 👇 The Date Quick-Filter Dropdown */}
                        <select
                            value={dateFilterType}
                            onChange={(e) => {
                                setDateFilterType(e.target.value);
                                setCustomStartDate(''); // Reset custom dates when switching modes
                                setCustomEndDate('');
                            }}
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-medium text-gray-700 bg-white"
                        >
                            <option value="today">Today</option>
                            <option value="this_week">This Week</option>
                            <option value="this_month">This Month</option>
                            <option value="all">All Active</option>
                            <option value="custom">Custom Range...</option>
                        </select>

                        {/* 👇 Show Date Pickers ONLY if "Custom Range" is selected */}
                        {dateFilterType === 'custom' && (
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-md border border-gray-200">
                                <input 
                                    type="date" 
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="text-sm border-gray-300 rounded-md shadow-sm py-1.5 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <span className="text-xs text-gray-500 font-medium">to</span>
                                <input 
                                    type="date" 
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="text-sm border-gray-300 rounded-md shadow-sm py-1.5 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        )}

                        {/* Your Existing Branch Filter */}
                        {branches.length > 1 && (
                            <select
                                value={overviewBranch}
                                onChange={(e) => setOverviewBranch(e.target.value)}
                                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-medium text-gray-700 bg-white"
                            >
                                <option value="All">All Branches</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Meals */}
                    <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm flex items-center">
                        <div className="mr-4 rounded-full bg-blue-50 p-3 text-black">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Participants</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalMeals}</p>
                        </div>
                    </div>

                    {/* Card 2: Main Meals */}
                    <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm flex items-center">
                        <div className="mr-4 rounded-full bg-indigo-50 p-3 text-black">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Main Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalMain}</p>
                        </div>
                    </div>

                    {/* Card 3: Alt Meals */}
                    <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm flex items-center">
                        <div className="mr-4 rounded-full bg-amber-50 p-3 text-black">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Alt Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalAlt}</p>
                        </div>
                    </div>

                    {/* Card 4: Special Requests */}
                    <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm flex items-center">
                        <div className="mr-4 rounded-full bg-rose-50 p-3 text-black">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Special Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalSpecial}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* HEADER SECTION (Unchanged) */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">Duty Meal Rosters</h2>
                </div>
            </div>

            {/* TABLE SECTION*/}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                   
                    <table className="min-w-full divide-y divide-gray-200">
                        
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDutyMeals.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">
                                        No duty meals found for this branch.
                                    </td>
                                </tr>
                            ) : (
                                filteredDutyMeals.map((meal) => (
                                    <tr key={meal.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedRosterId(meal.id)}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatAppDate(meal.duty_date, system?.timezone)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meal.branch?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meal.participants_count} Staff</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* THE CHOICES MODAL */}
            <Modal show={!!selectedRoster} onClose={closeModal} maxWidth="2xl">
                {selectedRoster && (
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    {selectedRoster.branch?.name} - {formatAppDate(selectedRoster.duty_date, system?.timezone)}
                                    
                                    
                                    {selectedRoster.is_locked && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <svg className="mr-1 h-3 w-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                            Locked
                                        </span>
                                    )}
                                </h2>
                            {/* Added an X button for easier closing */}
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        {/* Display the Staff Choices */}
                   
                        <div className="max-h-[50vh] overflow-y-auto overflow-x-visible pb-24 pr-2">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="text-left text-xs text-gray-500 uppercase">
                                        <th className="py-2">Staff Name</th>
                                        <th className="py-2">Shift</th>
                                        <th className="py-2">Choice</th>
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

                                            <td className="py-3 text-right relative">
                                                {!selectedRoster.is_locked && (
                                                <button 
                                                    onClick={() => setOpenDropdownId(openDropdownId === p.id ? null : p.id)}
                                                    className="rounded-full p-1 text-black transition-colors hover:bg-gray-100 hover:text-black"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                                )}
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
                                                        <button 
                                                            onClick={(e) => {
                                                                 e.preventDefault();
                                                                 e.stopPropagation();
                                                                handleRemove(p.user?.name, p.id)}}
                                                            className="w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 text-left border-t border-gray-100 mt-1 rounded-md transition"
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
                        {!selectedRoster.is_locked && (
                        <div className="mt-6 border-t pt-4 flex justify-end">
                            <PrimaryButton onClick={() => setIsPoolModalOpen(true)}>
                                + Add Staff from Pool
                            </PrimaryButton>
                        </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* --- THE NEW EMPLOYEE POOL MODAL --- */}
            <Modal show={isPoolModalOpen} onClose={() => setIsPoolModalOpen(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Add Staff to Roster</h2>
                        <button onClick={() => setIsPoolModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <TextInput 
                            placeholder="Search name..." 
                            className="w-full sm:w-1/3 text-sm"
                            value={poolSearch} 
                            onChange={e => setPoolSearch(e.target.value)} 
                        />
                        <select 
                            className="w-full sm:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            value={poolDept} 
                            onChange={e => { setPoolDept(e.target.value); setPoolPos(''); }}
                        >
                            <option value="All">All Depts</option>
                            {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                        </select>
                        <select 
                            className="w-full sm:w-1/3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm disabled:bg-gray-100"
                            value={poolPos} 
                            onChange={e => setPoolPos(e.target.value)}
                            disabled={poolDept !== 'All' && availablePoolPositions.length === 0}
                        >
                            <option value="">All Positions</option>
                            {availablePoolPositions.map(pos => <option key={pos.id} value={pos.id}>{pos.name}</option>)}
                        </select>
                    </div>

                    {/* Scrollable Results List */}
                    <div className="bg-white border border-gray-200 rounded-md h-72 overflow-y-auto">
                        {filteredPoolEmployees.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center">
                                <svg className="h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                No available employees match your search.
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {filteredPoolEmployees.map(emp => (
                                    <li key={emp.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {emp.department?.name || 'Unassigned'} 
                                                <span className="mx-1 text-gray-300">•</span> 
                                                {emp.position?.name || 'No Position'}
                                            </p>
                                        </div>
                                        <SecondaryButton 
                                            onClick={() => handleEmergencyAdd(emp.id)}
                                            className="text-xs"
                                        >
                                            + Add
                                        </SecondaryButton>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
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
