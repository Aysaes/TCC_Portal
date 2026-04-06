import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { getDutyMealLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function CreateDutyMeal({ auth, employees = [], branches = [], departments = [], positions = [] }) {

    const dutyMealsLinks = getDutyMealLinks();
    const { system } = usePage().props;
    
    // --- SMART DEFAULT BRANCH LOGIC ---
    // If the user's primary branch exists in the dropdown, select it. 
    // Otherwise, pick the first available branch. If no branches, leave blank.
    const defaultBranch = branches.length > 0 
        ? (branches.find(b => b.id === auth?.user?.branch_id)?.id || branches[0].id) 
        : '';

    // --- FORM STATE ---
    const { data, setData, post, processing, errors } = useForm({
        branch_id: defaultBranch,
        duty_date: '',
        main_meal: '',
        alt_meal: '',
        participants: [] 
    });

    // --- UI FILTERS & STATES ---
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPosition, setFilterPosition] = useState('');
    
    const [editingShiftId, setEditingShiftId] = useState(null);

    const availablePositions = (departmentFilter === 'All') 
        ? positions 
        : positions.filter(pos => String(pos.department_id) === String(departmentFilter));

    const tomorrow = new Date(`${system?.serverDate || '1970-01-01'}T00:00:00`);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    // --- LOOKUP HELPERS ---
    const getDepartmentName = (deptId) => {
        if (!deptId) return 'Unassigned';
        const found = departments.find(d => d.id == deptId);
        return found ? found.name : 'Unassigned';
    };

    const getPositionName = (posId) => {
        if (!posId) return 'No Position';
        const found = positions.find(pos => pos.id == posId);
        return found ? found.name : 'No Position';
    };

    // --- FILTER LOGIC ---
    const filteredEmployees = employees.filter(emp => {
        const selectedBranchId = Number(data.branch_id);
        const matchesBranch = Number(emp.branch_id) === selectedBranchId || 
            (emp.assigned_branch_ids && emp.assigned_branch_ids.includes(selectedBranchId));
        const matchesDept = departmentFilter === 'All' || String(emp.department_id) === String(departmentFilter);
        const matchesPosition = filterPosition === '' || emp.position_id === parseInt(filterPosition);
        
        const name = emp.name ? emp.name.toLowerCase() : '';
        const search = searchQuery.trim().toLowerCase();
        const matchesSearch = name.includes(search);

        return matchesBranch && matchesDept && matchesSearch && matchesPosition;
    });

    // --- HANDLERS ---
    const toggleStaff = (employee) => {
        const isAlreadySelected = data.participants.some(p => p.id === employee.id);
        
        if (isAlreadySelected) {
            setData('participants', data.participants.filter(p => p.id !== employee.id));
        } else {
            setData('participants', [...data.participants, { 
                id: employee.id, 
                name: employee.name, 
                department: employee.department_id, 
                position: employee.position_id,
                shift_type: 'day' // Default shift
            }]);
        }
    };

    const changeShiftType = (employeeId, newShift) => {
        setData('participants', data.participants.map(p => 
            p.id === employeeId ? { ...p, shift_type: newShift } : p
        ));
    };

    // Select All logic
    const selectAllFiltered = () => {
        const currentIds = new Set(data.participants.map(p => p.id));
        const newParticipants = [...data.participants];
        
        filteredEmployees.forEach(emp => {
            if (!currentIds.has(emp.id)) {
                newParticipants.push({
                    id: emp.id, 
                    name: emp.name, 
                    department: emp.department_id, 
                    position: emp.position_id, 
                    shift_type: 'day'
                });
            }
        });
        setData('participants', newParticipants);
    };

    // Deselect All logic
    const deselectAllFiltered = () => {
        const filteredIds = new Set(filteredEmployees.map(emp => emp.id));
        setData('participants', data.participants.filter(p => !filteredIds.has(p.id)));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.duty-meals.store'));
    };

    // Check if all currently visible employees are already selected
    const allFilteredSelected = filteredEmployees.length > 0 && 
        filteredEmployees.every(emp => data.participants.some(p => p.id === emp.id));


    return (
        <SidebarLayout activeModule="Duty Meals"
                        sidebarLinks={dutyMealsLinks}
                        header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Duty Meal Panel
                </h2>}
                >
            <Head title="Setup Duty Roster" />

            <form onSubmit={submit}>
                {/* HEADER */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Setup Duty Roster</h1>
                        <p className="text-sm text-gray-500 mt-1">Select staff and set the meal options for the shift.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={route('admin.duty-meals.index')}>
                            <SecondaryButton type="button">Cancel</SecondaryButton>
                        </Link>
                        <PrimaryButton disabled={processing || data.participants.length === 0}>
                            Save Schedule ({data.participants.length} Staff)
                        </PrimaryButton>
                    </div>
                </div>

                {/* TOP CONFIGURATION CARD */}
                <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <InputLabel htmlFor="duty_date" value="Duty Date" />
                        <TextInput id="duty_date" type="date" className="mt-1 block w-full" 
                            value={data.duty_date} onChange={e => setData('duty_date', e.target.value)} min={minDate} required />
                        <InputError message={errors.duty_date} className="mt-2" />
                    </div>
                    
                    <div>
                        <InputLabel htmlFor="branch_id" value="Branch" />
                        <select 
                            id="branch_id" 
                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 
                                ${branches.length <= 1 ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'border-gray-300'}`}
                            value={data.branch_id} 
                            onChange={e => setData('branch_id', e.target.value)} 
                            disabled={branches.length <= 1}
                            required
                        >
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <InputError message={errors.branch_id} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="main_meal" value="Main Meal Option" />
                        <TextInput id="main_meal" placeholder="e.g. Chicken Adobo" className="mt-1 block w-full" 
                            value={data.main_meal} onChange={e => setData('main_meal', e.target.value)} required />
                        <InputError message={errors.main_meal} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="alt_meal" value="Alternative Meal Option" />
                        <TextInput id="alt_meal" placeholder="e.g. Tofu Stir-fry (Vegan)" className="mt-1 block w-full" 
                            value={data.alt_meal} onChange={e => setData('alt_meal', e.target.value)} required />
                        <InputError message={errors.alt_meal} className="mt-2" />
                    </div>
                </div>

                {/* SPLIT SCREEN WORKSPACE */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT SIDE: Employee Pool (5 columns) */}
                    <div className="lg:col-span-5 bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col h-[600px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Employee Pool</h2>
                            <div className="flex gap-2 text-sm">
                                <button 
                                    type="button" 
                                    onClick={allFilteredSelected ? deselectAllFiltered : selectAllFiltered} 
                                    className={`inline-flex items-center px-2.5 py-1.5 border shadow-sm text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                                        ${allFilteredSelected 
                                            ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500' 
                                            : 'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:ring-indigo-500'}`}
                                >
                                    {allFilteredSelected ? (
                                        <>
                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            Deselect All
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            Select All
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        {/* Filters */}
                        <div className="flex gap-2 mb-4 w-full">
                            <TextInput placeholder="Search name..." className="flex-1 text-sm min-w-[100px]"
                                value={searchQuery} onChange={e => {
                                    setSearchQuery(e.target.value);
                                    setFilterPosition('');
                                }} />
                            <select className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm min-w-[100px]"
                                value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
                                <option value="All">All Depts</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                            </select>

                            <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)}
                            className="flex-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm min-w-[100px]">
                                <option value="">All Positions</option>
                                {availablePositions.map((pos) => (<option key={pos.id} value={pos.id}>{pos.name}</option>))}
                            </select>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                            {filteredEmployees.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No employees found.</p>
                            ) : (
                                filteredEmployees.map((emp) => {
                                    const isSelected = data.participants.some(p => p.id === emp.id);
                                    return (
                                        <div key={emp.id} onClick={() => toggleStaff(emp)}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition select-none
                                                ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'}`}
                                        >
                                            <div>
                                                <p className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                                                    {emp.name}
                                                </p>
                                                <p className={`text-xs ${isSelected ? 'text-indigo-600' : 'text-gray-500'} mt-0.5`}>
                                                    {getDepartmentName(emp.department_id)} 
                                                    <span className="mx-1 text-gray-300">•</span> 
                                                    {getPositionName(emp.position_id)}
                                                </p>
                                            </div>
                                            {isSelected ? (
                                                <svg className="h-5 w-5 text-black" fill="currentColor" viewBox="0 0 20 20">
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

                    {/* RIGHT SIDE: Selected Staff Draft Table (7 columns) */}
                    <div className="lg:col-span-7 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                        <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Selected for Duty ({data.participants.length})</h2>
                            <InputError message={errors.participants} className="mt-1" />
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            {data.participants.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <svg className="mb-3 h-12 w-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <p>Select staff from the left to add them to the roster.</p>
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
                                        {data.participants.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {getDepartmentName(p.department)} 
                                                        <span className="mx-1 text-gray-300">•</span> 
                                                        {getPositionName(p.position)}
                                                    </div>
                                                </td>
                                                
                                                {/* Inline Editable Badges matching the 1st image */}
                                                <td 
                                                    className="px-5 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => setEditingShiftId(p.id)}
                                                >
                                                    {editingShiftId === p.id ? (
                                                        <div className="relative inline-block">
                                                            <select 
                                                                autoFocus
                                                                value={p.shift_type || 'day'}
                                                                onChange={(e) => {
                                                                    changeShiftType(p.id, e.target.value);
                                                                    setEditingShiftId(null);
                                                                }}
                                                                onBlur={() => setEditingShiftId(null)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className={`appearance-none inline-flex items-center py-0.5 pl-1.5 sm:pl-2 pr-5 sm:pr-6 text-[9px] sm:text-[10px] font-medium rounded border shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-0 cursor-pointer transition-colors
                                                                    ${!p.shift_type ? 'bg-gray-100 text-gray-800 border-gray-300 focus:ring-gray-400' :
                                                                    p.shift_type === 'graveyard' ? 'bg-indigo-100 text-indigo-800 border-indigo-200 focus:ring-indigo-400' : 
                                                                    p.shift_type === 'straight' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 focus:ring-emerald-400' : 
                                                                    'bg-amber-100 text-amber-800 border-amber-200 focus:ring-amber-400'}`}
                                                            >
                                                                <option value="day">☀️ Day Shift</option>
                                                                <option value="straight">⏱️ Straight</option>
                                                                <option value="graveyard">🌙 Graveyard</option>
                                                            </select>
                                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-current opacity-60">
                                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div title="Click to edit shift">
                                                            {p.shift_type === 'graveyard' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">🌙 Graveyard</span>}
                                                            {p.shift_type === 'straight' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">⏱️ Straight</span>}
                                                            {(p.shift_type === 'day' || !p.shift_type) && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">☀️ Day Shift</span>}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Cleaned up action row with icon */}
                                                <td className="px-5 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => toggleStaff(p)} 
                                                        className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none"
                                                        title="Remove from Roster"
                                                    >
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
            </form>
        </SidebarLayout>
    );
}