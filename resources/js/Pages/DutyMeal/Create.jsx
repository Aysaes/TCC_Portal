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
    
    // --- FORM STATE ---
    const { data, setData, post, processing, errors } = useForm({
        branch_id: '',
        duty_date: '',
        main_meal: '',
        alt_meal: '',
        participants: [] 
    });

    // --- UI FILTERS ---
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const [filterPosition, setFilterPosition] = useState('');

    const availablePositions = (departmentFilter === 'All') 
        ? positions 
        : positions.filter(pos => String(pos.department_id) === String(departmentFilter));

    const tomorrow = new Date(`${system?.serverDate || '1970-01-01'}T00:00:00`);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    // --- LOOKUP HELPERS ---
    const getDepartmentName = (deptId) => {
        if (!deptId) return 'Unassigned';
        const found = departments.find(d => d.id == deptId); // Using == to avoid type mismatch
        return found ? found.name : 'Unassigned';
    };

    const getPositionName = (posId) => {
        if (!posId) return 'No Position';
        const found = positions.find(pos => pos.id == posId); // Using == to avoid type mismatch
        return found ? found.name : 'No Position';
    };

    // --- HANDLERS ---
    const toggleStaff = (employee) => {
        const isAlreadySelected = data.participants.some(p => p.id === employee.id);
        
        if (isAlreadySelected) {
            // Remove them
            setData('participants', data.participants.filter(p => p.id !== employee.id));
        } else {
            // Add them, default graveyard to false
            setData('participants', [...data.participants, { id: employee.id, name: employee.name, department: employee.department_id, position: employee.position_id,is_graveyard: false }]);
        }
    };

    const toggleGraveyard = (employeeId) => {
        setData('participants', data.participants.map(p => 
            p.id === employeeId ? { ...p, is_graveyard: !p.is_graveyard } : p
        ));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.duty-meals.store'));
    };

    // --- FILTER LOGIC ---
    const filteredEmployees = employees.filter(emp => {

        const selectedBranchId = Number(data.branch_id);
        
        const matchesBranch = 
            Number(emp.branch_id) === selectedBranchId || 
            (emp.assigned_branch_ids && emp.assigned_branch_ids.includes(selectedBranchId));

        const matchesDept = departmentFilter === 'All' || String(emp.department_id) === String(departmentFilter);

        const matchesPosition = filterPosition === '' || emp.position_id === parseInt(filterPosition);
        
        
        const name = emp.name ? emp.name.toLowerCase() : '';
        const search = searchQuery.trim().toLowerCase();
        const matchesSearch = name.includes(search);

        return matchesBranch && matchesDept && matchesSearch && matchesPosition;
    });

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
                        <select id="branch_id" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.branch_id} onChange={e => setData('branch_id', e.target.value)} required>
                            <option value="" disabled>Select a branch...</option>
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
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Employee Pool</h2>
                        
                        {/* Filters */}
                        <div className="flex gap-2 mb-4">
                            <TextInput placeholder="Search name..." className="w-full text-sm"
                                value={searchQuery} onChange={e => {setSearchQuery(e.target.value);
                                                                    setFilterPosition('');
                                }} />
                            <select className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
                                <option value="All">All Depts</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                            </select>

                            <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)}
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm">
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
                                    <thead className="bg-white sticky top-0">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Shift Type</th>
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
                                                <td className="px-5 py-3 whitespace-nowrap text-center">
                                                    <button type="button" onClick={() => toggleGraveyard(p.id)}
                                                        className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white transition-colors focus:outline-none 
                                                            ${p.is_graveyard ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                                                    >
                                                        {p.is_graveyard ? '🌙 Graveyard' : '☀️ Day Shift'}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                    <button type="button" onClick={() => toggleStaff(p)} className="text-red-600 hover:text-red-900">
                                                        Remove
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
