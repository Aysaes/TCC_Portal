import { getAdminLinks } from "@/Config/navigation";
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout'; // Adjust path if needed
import Pagination from '@/Components/Pagination'; // Assuming you have a pagination component

export default function SystemLogsIndex({ auth, logs, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [moduleFilter, setModuleFilter] = useState(filters.module || '');
    const [actionFilter, setActionFilter] = useState(filters.action || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.logs.index'), { search, module: moduleFilter, action: actionFilter }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch(''); setModuleFilter(''); setActionFilter('');
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
                {status.toUpperCase()}
            </span>
        );
    };

    return (
        <SidebarLayout activeModule="Admin" sidebarLinks={getAdminLinks()} header={<h2 className="text-xl font-semibold leading-tight text-gray-800">System Logs & Security</h2>}>
            <Head title="System Logs" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                {/* Filters */}
                <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input 
                        type="text" 
                        placeholder="Search logs or users..." 
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm flex-1"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select 
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={moduleFilter}
                        onChange={(e) => setModuleFilter(e.target.value)}
                    >
                        <option value="">All Modules</option>
                        <option value="Auth">Authentication</option>
                        <option value="Employee Management">Employee Management</option>
                        <option value="Announcements">Announcements</option>
                        <option value="Company Content">Company Content</option>
                    </select>
                    <select 
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                    >
                        <option value="">All Actions</option>
                        <option value="Login">Login</option>
                        <option value="Failed Login">Failed Login</option>
                        <option value="Create">Create</option>
                        <option value="Update">Update</option>
                        <option value="Delete">Delete</option>
                    </select>
                    <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md transition duration-150">
                        Filter
                    </button>
                    <button type="button" onClick={clearFilters} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition duration-150">
                        Clear
                    </button>
                </form>

                {/* Data Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Module & Action</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Security Detail</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {logs.data.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        {log.user ? log.user.name : 'System / Guest'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-gray-800">{log.module}</div>
                                        <div className="text-xs text-gray-500">{log.action}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={log.description}>
                                        {log.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                        <div>IP: {log.ip_address || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(log.status)}
                                    </td>
                                </tr>
                            ))}
                            {logs.data.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-6">
                   {/* Replace with your standard Pagination component */}
                   <Pagination links={logs.links} /> 
                </div>
            </div>
        </SidebarLayout>
    );
}