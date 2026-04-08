import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { getDutyMealLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';

export default function CreateDutyMeal({ auth, employees = [], branches = [], departments = [], positions = [] }) {
    const dutyMealsLinks = getDutyMealLinks();
    const { system } = usePage().props;
    
    // --- SMART DEFAULT BRANCH LOGIC ---
    const defaultBranch = branches.length > 0 
        ? (branches.find(b => b.id === auth?.user?.branch_id)?.id || branches[0].id) 
        : '';

    // --- NEW: WEEKLY FORM STATE ---
    const { data, setData, post, processing, errors } = useForm({
        branch_id: defaultBranch,
        week_start: '', 
        schedule: [] // Will hold 7 objects (Mon-Sun)
    });

    // --- UI FILTERS & STATES ---
    const [activeTab, setActiveTab] = useState(0); // 0 = Monday, 6 = Sunday
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPosition, setFilterPosition] = useState('');
    const [editingShiftId, setEditingShiftId] = useState(null);

    const availablePositions = (departmentFilter === 'All') 
        ? positions 
        : positions.filter(pos => String(pos.department_id) === String(departmentFilter));

    // Disable past dates
    const tomorrow = new Date(`${system?.serverDate || '1970-01-01'}T00:00:00`);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    // --- WEEK GENERATOR HELPER ---
    // Takes any date, finds its Monday, and builds an empty 7-day array
    const generateWeekSchedule = (selectedDateStr) => {
        if (!selectedDateStr) return [];
        
        const selected = new Date(selectedDateStr);
        const day = selected.getDay();
        // Shift to Monday (0 is Sunday, so if 0, go back 6 days, else go back day-1)
        const diff = selected.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(selected.setDate(diff));

        const newSchedule = [];
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(monday);
            currentDate.setDate(monday.getDate() + i);
            
            newSchedule.push({
                date: currentDate.toISOString().split('T')[0],
                dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue, etc.
                main_meal: '',
                alt_meal: '',
                participants: []
            });
        }
        return newSchedule;
    };

    // When the user picks a date, generate the week!
    const handleWeekChange = (e) => {
        const dateVal = e.target.value;
        const newSched = generateWeekSchedule(dateVal);
        setData({
            ...data,
            week_start: newSched[0]?.date || '', // Set week_start to the Monday
            schedule: newSched
        });
        setActiveTab(0); // Reset UI to Monday tab
    };

    // --- DAY SPECIFIC HELPERS ---
    const activeDay = data.schedule[activeTab];
    const hasSelectedWeek = data.schedule.length === 7;

    const handleMealChange = (field, value) => {
        if (!hasSelectedWeek) return;
        const newSchedule = [...data.schedule];
        newSchedule[activeTab] = { ...newSchedule[activeTab], [field]: value };
        setData('schedule', newSchedule);
    };

    // --- LOOKUP HELPERS ---
    const getDepartmentName = (deptId) => {
        if (!deptId) return 'Unassigned';
        const found = departments.find(d => String(d.id) === String(deptId));
        return found ? found.name : 'Unassigned';
    };

    const getPositionName = (posId) => {
        if (!posId) return 'No Position';
        const found = positions.find(pos => String(pos.id) === String(posId));
        return found ? found.name : 'No Position';
    };

    // --- FILTER LOGIC ---
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const selectedBranchId = Number(data.branch_id);
            const matchesBranch = Number(emp.branch_id) === selectedBranchId || 
                (emp.assigned_branch_ids && emp.assigned_branch_ids.includes(selectedBranchId));
            const matchesDept = departmentFilter === 'All' || String(emp.department_id) === String(departmentFilter);
            const matchesPosition = filterPosition === '' || String(emp.position_id) === String(filterPosition);
            
            const name = emp.name ? emp.name.toLowerCase() : '';
            const search = searchQuery.trim().toLowerCase();
            const matchesSearch = name.includes(search);

            return matchesBranch && matchesDept && matchesSearch && matchesPosition;
        });
    }, [employees, data.branch_id, departmentFilter, filterPosition, searchQuery]);

    // --- STAFF TOGGLE HANDLERS (Now specific to activeTab) ---
    const toggleStaff = (employee) => {
        if (!hasSelectedWeek) return alert('Please select a week start date first.');
        
        const isAlreadySelected = activeDay.participants.some(p => p.id === employee.id);
        let newParticipants;
        
        if (isAlreadySelected) {
            newParticipants = activeDay.participants.filter(p => p.id !== employee.id);
        } else {
            newParticipants = [...activeDay.participants, { 
                id: employee.id, 
                name: employee.name, 
                department: employee.department_id, 
                position: employee.position_id,
                shift_type: 'day' 
            }];
        }

        const newSchedule = [...data.schedule];
        newSchedule[activeTab] = { ...activeDay, participants: newParticipants };
        setData('schedule', newSchedule);
    };

    const changeShiftType = (employeeId, newShift) => {
        const newParticipants = activeDay.participants.map(p => 
            p.id === employeeId ? { ...p, shift_type: newShift } : p
        );
        const newSchedule = [...data.schedule];
        newSchedule[activeTab] = { ...activeDay, participants: newParticipants };
        setData('schedule', newSchedule);
    };

    const selectAllFiltered = () => {
        if (!hasSelectedWeek) return;
        const currentIds = new Set(activeDay.participants.map(p => p.id));
        const newParticipants = [...activeDay.participants];
        
        filteredEmployees.forEach(emp => {
            if (!currentIds.has(emp.id)) {
                newParticipants.push({
                    id: emp.id, name: emp.name, department: emp.department_id, 
                    position: emp.position_id, shift_type: 'day'
                });
            }
        });
        
        const newSchedule = [...data.schedule];
        newSchedule[activeTab] = { ...activeDay, participants: newParticipants };
        setData('schedule', newSchedule);
    };

    const deselectAllFiltered = () => {
        if (!hasSelectedWeek) return;
        const filteredIds = new Set(filteredEmployees.map(emp => emp.id));
        const newParticipants = activeDay.participants.filter(p => !filteredIds.has(p.id));
        
        const newSchedule = [...data.schedule];
        newSchedule[activeTab] = { ...activeDay, participants: newParticipants };
        setData('schedule', newSchedule);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.duty-meals.store'));
    };

    const allFilteredSelected = hasSelectedWeek && filteredEmployees.length > 0 && 
        filteredEmployees.every(emp => activeDay.participants.some(p => p.id === emp.id));

    // Count total staff scheduled across the whole week for the submit button
    const totalWeeklyStaff = data.schedule.reduce((total, day) => total + day.participants.length, 0);

    return (
        <SidebarLayout activeModule="Duty Meals" sidebarLinks={dutyMealsLinks}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Duty Meal Panel</h2>}>
            <Head title="Setup Weekly Roster" />

            <form onSubmit={submit}>
                {/* HEADER */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Setup Weekly Roster</h1>
                        <p className="text-sm text-gray-500 mt-1">Select a week, define meals, and assign staff per day.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={route('admin.duty-meals.index')}>
                            <SecondaryButton type="button">Cancel</SecondaryButton>
                        </Link>
                        <PrimaryButton disabled={processing || !hasSelectedWeek || totalWeeklyStaff === 0}>
                            Publish Week ({totalWeeklyStaff} Shifts)
                        </PrimaryButton>
                    </div>
                </div>

                {/* TOP CONFIGURATION: WEEK & BRANCH */}
                <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-1/3">
                        <InputLabel htmlFor="week_picker" value="Select Week (Pick any day)" />
                        <TextInput id="week_picker" type="date" className="mt-1 block w-full" 
                            onChange={handleWeekChange} min={minDate} required />
                        <InputError message={errors.week_start} className="mt-2" />
                    </div>
                    
                    <div className="w-full sm:w-1/3">
                        <InputLabel htmlFor="branch_id" value="Select Branch" />
                        <select id="branch_id" 
                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 
                                ${branches.length <= 1 ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'border-gray-300'}`}
                            value={data.branch_id} 
                            onChange={e => setData('branch_id', e.target.value)} 
                            disabled={branches.length <= 1} required>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <InputError message={errors.branch_id} className="mt-2" />
                    </div>
                </div>

                {/* THE WEEKLY WORKSPACE - ONLY SHOWS IF A WEEK IS SELECTED */}
                {hasSelectedWeek ? (
                    <>
                        {/* 7-DAY TABS */}
                        <div className="mb-4 overflow-x-auto">
                            <div className="flex border-b border-gray-200 min-w-max">
                                {data.schedule.map((day, index) => (
                                    <button
                                        key={day.date} type="button"
                                        onClick={() => setActiveTab(index)}
                                        className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors focus:outline-none flex flex-col items-center border-b-2
                                            ${activeTab === index 
                                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        <span className="uppercase text-xs tracking-wider mb-1">{day.dayName}</span>
                                        <span className="font-bold">{day.date.split('-').slice(1).join('/')}</span>
                                        
                                        {/* Little badge showing staff count for this day */}
                                        <span className={`mt-1.5 text-[10px] px-2 py-0.5 rounded-full ${day.participants.length > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-400'}`}>
                                            {day.participants.length} staff
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ACTIVE DAY MEAL SETTINGS */}
                        <div className="mb-6 bg-white p-5 rounded-b-lg rounded-tr-lg shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                            {/* Decorative indicator showing which day is being edited */}
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                Editing: {activeDay.dayName}
                            </div>
                            
                            <div>
                                <InputLabel value={`${activeDay.dayName} Main Meal`} />
                                <TextInput placeholder="e.g. Chicken Adobo" className="mt-1 block w-full" 
                                    value={activeDay.main_meal} onChange={e => handleMealChange('main_meal', e.target.value)} />
                                <InputError message={errors[`schedule.${activeTab}.main_meal`]} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value={`${activeDay.dayName} Alternative Meal (Optional)`} />
                                <TextInput placeholder="e.g. Tofu Stir-fry (Vegan)" className="mt-1 block w-full" 
                                    value={activeDay.alt_meal} onChange={e => handleMealChange('alt_meal', e.target.value)} />
                            </div>
                        </div>

                        {/* SPLIT SCREEN STAFF SELECTION FOR ACTIVE DAY */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* LEFT SIDE: Employee Pool */}
                            <div className="lg:col-span-5 bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col h-[600px]">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-medium text-gray-900">Add to {activeDay.dayName}</h2>
                                    <div className="flex gap-2 text-sm">
                                        <button type="button" onClick={allFilteredSelected ? deselectAllFiltered : selectAllFiltered} 
                                            className={`inline-flex items-center px-2.5 py-1.5 border shadow-sm text-xs font-medium rounded focus:outline-none transition-colors
                                                ${allFilteredSelected ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' : 'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'}`}
                                        >
                                            {allFilteredSelected ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Filters */}
                                <div className="flex gap-2 mb-4 w-full">
                                    <TextInput placeholder="Search name..." className="flex-1 text-sm min-w-[100px]"
                                        value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setFilterPosition(''); }} />
                                    <select className="flex-1 rounded-md border-gray-300 shadow-sm text-sm"
                                        value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
                                        <option value="All">All Depts</option>
                                        {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                                    </select>
                                    <select className="flex-1 rounded-md border-gray-300 shadow-sm text-sm"
                                        value={filterPosition} onChange={e => setFilterPosition(e.target.value)}>
                                        <option value="">All Positions</option>
                                        {availablePositions.map(pos => <option key={pos.id} value={pos.id}>{pos.name}</option>)}
                                    </select>
                                </div>

                                {/* List */}
                                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                                    {filteredEmployees.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">No employees found.</p>
                                    ) : (
                                        filteredEmployees.map(emp => {
                                            const isSelected = activeDay.participants.some(p => p.id === emp.id);
                                            return (
                                                <div key={emp.id} onClick={() => toggleStaff(emp)}
                                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition select-none
                                                        ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-gray-200 hover:border-indigo-300'}`}
                                                >
                                                    <div>
                                                        <p className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>{emp.name}</p>
                                                        <p className={`text-xs ${isSelected ? 'text-indigo-600' : 'text-gray-500'} mt-0.5`}>
                                                            {getDepartmentName(emp.department_id)} <span className="mx-1 text-gray-300">•</span> {getPositionName(emp.position_id)}
                                                        </p>
                                                    </div>
                                                    {isSelected ? (
                                                        <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <div className="h-5 w-5 rounded border border-gray-300"></div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* RIGHT SIDE: Selected Staff for Active Day */}
                            <div className="lg:col-span-7 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                                <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">{activeDay.dayName} Staff ({activeDay.participants.length})</h2>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto">
                                    {activeDay.participants.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <p>No staff selected for {activeDay.dayName}.</p>
                                            <p className="text-xs mt-2 italic">If left empty, {activeDay.dayName} will be skipped.</p>
                                        </div>
                                    ) : (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-white sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                                                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {activeDay.participants.map(p => (
                                                    <tr key={p.id} className="hover:bg-gray-50">
                                                        <td className="px-5 py-3 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {getDepartmentName(p.department)} <span className="mx-1 text-gray-300">•</span> {getPositionName(p.position)}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
                                                            onClick={() => setEditingShiftId(p.id)}>
                                                            {editingShiftId === p.id ? (
                                                                <select autoFocus value={p.shift_type}
                                                                    onChange={e => { changeShiftType(p.id, e.target.value); setEditingShiftId(null); }}
                                                                    onBlur={() => setEditingShiftId(null)}
                                                                    className="py-1 px-2 text-xs rounded border border-indigo-300 outline-none ring-1 ring-indigo-500">
                                                                    <option value="day">☀️ Day Shift</option>
                                                                    <option value="straight">⏱️ Straight</option>
                                                                    <option value="graveyard">🌙 Graveyard</option>
                                                                </select>
                                                            ) : (
                                                                <div title="Click to edit shift">
                                                                    {p.shift_type === 'graveyard' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800">🌙 Graveyard</span>}
                                                                    {p.shift_type === 'straight' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">⏱️ Straight</span>}
                                                                    {p.shift_type === 'day' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">☀️ Day Shift</span>}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                            <button type="button" onClick={() => toggleStaff(p)} 
                                                                className="rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Remove from Roster">
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // HERO PROMPT IF NO WEEK SELECTED
                    <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Week Selected</h3>
                        <p className="mt-1 text-sm text-gray-500">Please select a starting date at the top to build your weekly roster.</p>
                    </div>
                )}
            </form>
        </SidebarLayout>
    );
}