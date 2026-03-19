import { getDutyMealLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';

export default function Index({ auth, dutymeals = [] }) {

    const dutyMealsLinks = getDutyMealLinks();

    return (
        <SidebarLayout activeModule="Duty Meals"
                        sidebarLinks={dutyMealsLinks}
                        header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Duty Meal Panel
                </h2>
            }
                        >
            <Head title="Duty Meal Dashboard" />

            {/* HEADER SECTION */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Duty Meal Rosters</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage and view all scheduled duty meals across clinic branches.
                    </p>
                </div>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {dutymeals.length === 0 ? (
                    // Empty State: What shows up when there are no schedules yet
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="h-14 w-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No rosters created</h3>
                        <p className="mt-1 text-sm text-gray-500 max-w-sm">
                            Get started by setting up the first duty meal schedule for the staff.
                        </p>
                    </div>
                ) : (
                    // The Data Table
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal Options</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Count</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dutymeals.map((meal) => (
                                    <tr key={meal.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {/* Formats the date to look like: "Mon, Mar 20, 2026" */}
                                            {new Date(meal.duty_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {meal.branch?.name || 'Unknown Branch'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div><span className="font-medium text-gray-700">M:</span> {meal.main_meal}</div>
                                            <div className="mt-1"><span className="font-medium text-gray-700">A:</span> {meal.alt_meal}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            {/* This uses the 'withCount' data we set up in the Controller */}
                                            <span className="font-semibold text-gray-900">{meal.participants_count}</span> staff on duty
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {meal.is_locked ? (
                                                <span className="text-red-600 flex justify-end items-center gap-1 text-xs">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                    Locked
                                                </span>
                                            ) : (
                                                <span className="text-emerald-600 flex justify-end items-center gap-1 text-xs">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                                    Accepting Choices
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}