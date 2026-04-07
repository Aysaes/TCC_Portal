import { getAdminLinks } from "@/Config/navigation";
import React, { useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Pagination from '@/Components/Pagination';

export default function SystemLogsIndex({ auth, logs, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [moduleFilter, setModuleFilter] = useState(filters.module || '');
    const [actionFilter, setActionFilter] = useState(filters.action || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [startDate, setStartDate] = useState(filters.start_date ? isoToMMDDYYYY(filters.start_date) : '');
    const [endDate, setEndDate] = useState(filters.end_date ? isoToMMDDYYYY(filters.end_date) : '');

    const startDatePickerRef = useRef(null);
    const endDatePickerRef = useRef(null);

    // --- DATE HELPERS ---
    function formatDateInput(value) {
        const digits = value.replace(/\D/g, '').slice(0, 8);

        if (digits.length <= 2) return digits;
        if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }

    function isoToMMDDYYYY(iso) {
        if (!iso) return '';
        const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) return '';
        const [, yyyy, mm, dd] = match;
        return `${mm}/${dd}/${yyyy}`;
    }

    function mmddyyyyToISO(value) {
        const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!match) return '';

        const [, mm, dd, yyyy] = match;
        const month = Number(mm);
        const day = Number(dd);
        const year = Number(yyyy);

        if (
            Number.isNaN(month) ||
            Number.isNaN(day) ||
            Number.isNaN(year) ||
            month < 1 ||
            month > 12 ||
            day < 1 ||
            day > 31
        ) {
            return '';
        }

        return `${yyyy}-${mm}-${dd}`;
    }

    function openNativePicker(ref) {
        if (!ref?.current) return;

        if (typeof ref.current.showPicker === 'function') {
            ref.current.showPicker();
        } else {
            ref.current.focus();
            ref.current.click();
        }
    }

    const handleFilter = (e) => {
        e.preventDefault();

        router.get(
            route('admin.logs.index'),
            {
                search,
                module: moduleFilter,
                action: actionFilter,
                status: statusFilter,
                start_date: mmddyyyyToISO(startDate),
                end_date: mmddyyyyToISO(endDate),
            },
            { preserveState: true }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setModuleFilter('');
        setActionFilter('');
        setStatusFilter('');
        setStartDate('');
        setEndDate('');
        router.get(route('admin.logs.index'));
    };

    const getStatusBadge = (status) => {
        const styles = {
            success: 'bg-green-100 text-green-800 border-green-200',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            danger: 'bg-red-100 text-red-800 border-red-200 font-bold animate-pulse',
        };

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.success}`}>
                {(status || 'success').toUpperCase()}
            </span>
        );
    };

    return (
        <SidebarLayout
            activeModule="Admin"
            sidebarLinks={getAdminLinks()}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">System Logs & Security</h2>}
        >
            <Head title="System Logs" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                
                {/* Filters */}
                <form onSubmit={handleFilter} className="flex flex-col gap-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search logs or users..."
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {/* MODULES */}
                        <select
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full"
                            value={moduleFilter}
                            onChange={(e) => setModuleFilter(e.target.value)}
                        >
                            <option value="">All Modules</option>
                            <option value="Auth">Authentication</option>
                            <option value="User Management">User Management</option>
                            <option value="Org Chart">Org Chart</option>
                            <option value="Announcements">Announcements</option>
                            <option value="Company Content">Company Content</option>
                        </select>

                        {/* ACTIONS (FIXED EXACT MATCHES) */}
                        <select
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full"
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                        >
                            <option value="">All Actions</option>
                            <option value="Login">Login</option>
                            <option value="Failed Login">Failed Login</option>
                            <option value="Logout">Logout</option>
                            <option value="Update">Update</option>
                            <option value="Delete">Delete</option>
                            <option value="Create">Create</option>
                        </select>

                        {/* STATUS FILTER */}
                        <select
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                            <option value="danger">Danger</option>
                        </select>

                        {/* START DATE */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Start Date (MM/DD/YYYY)"
                                className="border-gray-300 rounded-md w-full pr-10"
                                value={startDate}
                                onChange={(e) => setStartDate(formatDateInput(e.target.value))}
                            />
                            <input
                                ref={startDatePickerRef}
                                type="date"
                                value={mmddyyyyToISO(startDate)}
                                onChange={(e) => setStartDate(isoToMMDDYYYY(e.target.value))}
                                className="absolute opacity-0 w-0 h-full"
                            />
                            <button type="button" onClick={() => openNativePicker(startDatePickerRef)} className="absolute right-2 top-2">
                                📅
                            </button>
                        </div>

                        {/* END DATE */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="End Date (MM/DD/YYYY)"
                                className="border-gray-300 rounded-md w-full pr-10"
                                value={endDate}
                                onChange={(e) => setEndDate(formatDateInput(e.target.value))}
                            />
                            <input
                                ref={endDatePickerRef}
                                type="date"
                                value={mmddyyyyToISO(endDate)}
                                onChange={(e) => setEndDate(isoToMMDDYYYY(e.target.value))}
                                className="absolute opacity-0 w-0 h-full"
                            />
                            <button type="button" onClick={() => openNativePicker(endDatePickerRef)} className="absolute right-2 top-2">
                                📅
                            </button>
                        </div>

                    </div>

                    <div className="flex gap-2">
                        <button className="bg-slate-800 text-white px-4 py-2 rounded-md">
                            Filter
                        </button>
                        <button type="button" onClick={clearFilters} className="bg-gray-200 px-4 py-2 rounded-md">
                            Clear
                        </button>
                    </div>
                </form>

                {/* TABLE */}
                <div className="overflow-auto border rounded-lg">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Module & Action</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Security</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {logs.data.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4">
                                        {new Date(log.created_at).toLocaleString('en-US')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.user ? log.user.name : 'System'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.module} <br />
                                        <span className="text-xs text-gray-500">{log.action}</span>
                                    </td>
                                    <td className="px-6 py-4">{log.description}</td>
                                    <td className="px-6 py-4">IP: {log.ip_address}</td>
                                    <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination links={logs.links} />
            </div>
        </SidebarLayout>
    );
}