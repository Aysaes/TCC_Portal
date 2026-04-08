import { getStaffDutyMealLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { formatAppDate } from '@/Utils/date';

const MealCard = ({ meal }) => {
    const { system } = usePage().props;
    // 👇 RESTORED INTEGRITY LOGIC: 
    // It is locked IF the server says it's past 6AM, OR if they already submitted a choice!
    const isStrictlyLocked = meal.is_locked || meal.choice !== 'none';

    // Initialize the form with what is in the database
    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        choice: meal.choice === 'none' ? '' : meal.choice,
        custom_request: meal.custom_request || '',
    });

    const submit = (e) => {
        e.preventDefault();
        
        // Safety check: Prevent submission if it's already locked
        if (isStrictlyLocked) return;

        // 👇 Fixed the route name to match the controller we built earlier
        patch(route('staff.duty-meals.lock-in', meal.participant_id), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
            
            {/* Card Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-900">
                        {formatAppDate(meal.duty_date, system?.timezone, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                    <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider">{meal.branch_name}</span>
                </div>
                
                {/* Status Badges */}
                {meal.is_locked ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">System Locked</span>
                ) : meal.choice !== 'none' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Choice Locked</span>
                ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full animate-pulse">Needs Action</span>
                )}
            </div>

            {/* Card Body (The Radio Choices) */}
            <div className="p-6 flex-grow flex flex-col gap-4">
                
                {/* Main Meal Option */}
                <label className={`w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    data.choice === 'main' 
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                    : 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50'
                } ${isStrictlyLocked ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            name={`choice-${meal.participant_id}`}
                            value="main"
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 disabled:opacity-50"
                            checked={data.choice === 'main'}
                            onChange={(e) => setData('choice', e.target.value)}
                            disabled={isStrictlyLocked}
                        />
                        <div className="ml-3 flex-grow">
                            <span className="block font-bold text-gray-900">Main Meal</span>
                            <span className="block text-sm text-gray-600 mt-0.5">{meal.main_meal}</span>
                        </div>
                    </div>
                </label>

                {/* Alternative Meal Option */}
                {meal.alt_meal && (
                    <label className={`w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        data.choice === 'alt' 
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                        : 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50'
                    } ${isStrictlyLocked ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name={`choice-${meal.participant_id}`}
                                value="alt"
                                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 disabled:opacity-50"
                                checked={data.choice === 'alt'}
                                onChange={(e) => setData('choice', e.target.value)}
                                disabled={isStrictlyLocked}
                            />
                            <div className="ml-3 flex-grow">
                                <span className="block font-bold text-gray-900">Alternative Meal</span>
                                <span className="block text-sm text-gray-600 mt-0.5">{meal.alt_meal}</span>
                            </div>
                        </div>
                    </label>
                )}

                {/* Optional Request Input */}
                <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Optional Request / Add-ons
                    </label>
                    <input 
                        type="text" 
                        placeholder={isStrictlyLocked && !meal.custom_request ? "No special requests made." : "e.g., 2 bananas, no onions..."}
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                        value={data.custom_request}
                        onChange={(e) => setData('custom_request', e.target.value)}
                        disabled={isStrictlyLocked}
                    />
                </div>
            </div>

            {/* THE EXPLICIT LOCK-IN BUTTON */}
            <div className="bg-gray-50 border-t border-gray-100 p-4 flex items-center justify-between mt-auto">
                <div>
                    {(recentlySuccessful || meal.choice !== 'none') && (
                        <span className="text-sm font-medium text-green-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            Successfully Locked In
                        </span>
                    )}
                </div>
                
                {/* Hide the button completely if they are already locked in to keep the UI clean */}
                {!isStrictlyLocked && (
                    <button
                        type="submit"
                        disabled={processing || !data.choice}
                        className={`inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 transition ease-in-out duration-150 ${
                            (processing || !data.choice) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {processing ? 'Saving...' : 'Lock-In Choice'}
                    </button>
                )}
            </div>
        </form>
    );
};

// 👇 1. Added the Filter Function
/**
 * Filters an array of meal objects, removing any that occurred before today.
 */
const filterUpcomingMeals = (meals) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for accurate "day" comparison

    return meals.filter((meal) => {
        // Use your database's duty_date property
        const shiftDate = new Date(meal.duty_date); 
        shiftDate.setHours(0, 0, 0, 0);

        // Keep the item if its timestamp is greater than or equal to today's
        return shiftDate.getTime() >= today.getTime();
    });
};

// 👇 2. Your Main Page Layout
export default function Index({ auth, myDutyMeals = [] }) {
    const DutyMealLinks = getStaffDutyMealLinks();

    // Apply the filter to ensure past meals are ignored
    const upcomingMeals = filterUpcomingMeals(myDutyMeals);

    return (
        <SidebarLayout 
            user={auth.user}
            activeModule='Duty Meals'
            sidebarLinks={DutyMealLinks}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Duty Meal Panel</h2>}
        >
            <Head title="My Duty Meals" />

            <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">My Duty Meals</h2>
                    <p className="text-gray-500 mt-1">Select your meal preferences for your upcoming shifts.</p>
                </div>

                {/* 👇 Swapped myDutyMeals with our new upcomingMeals array */}
                {upcomingMeals.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                        You have no upcoming duty meals assigned right now.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 👇 Mapping over the filtered list */}
                        {upcomingMeals.map((meal) => (
                            <MealCard key={meal.participant_id} meal={meal} />
                        ))}
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}