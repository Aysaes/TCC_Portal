import { getStaffDutyMealLinks } from '@/Config/navigation';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, myDutyMeals = [] }) {
    
    const DutyMealLinks = getStaffDutyMealLinks();
    const [notes, setNotes] = useState({});
    
    // Submits the choice to the backend without reloading the page
    const handleChoice = (participantId, choice) => {
        router.patch(route('staff.duty-meals.choice', participantId), { 
            choice: choice,
            custom_request: notes[participantId] || null 
        }, {
            preserveScroll: true
        });
    };

    return (
        <SidebarLayout user={auth.user}
                       activeModule='Duty Meals'
                       sidebarLinks={DutyMealLinks}
                       header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Duty Meal Panel
                </h2>}
        >
            <Head title="My Duty Meals" />

            <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">My Duty Meals</h2>
                    <p className="text-gray-500 mt-1">Select your meal preferences for your upcoming shifts.</p>
                </div>

                {myDutyMeals.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                        You have no assigned duty meals right now.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* 👇 Notice the curly brace here. This lets us declare variables before returning JSX */}
                        {myDutyMeals.map((meal) => {
                            
                            // 👇 Declared at the very top of the loop, so the whole card can see it!
                            const isLockedIn = meal.is_locked || meal.choice !== 'none';

                            return (
                                <div key={meal.participant_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                    
                                    {/* Card Header */}
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-900">
                                                {new Date(meal.duty_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                            </h3>
                                            <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider">{meal.branch_name}</span>
                                        </div>
                                        
                                        {/* Status Badges */}
                                        {meal.is_locked ? (
                                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Locked</span>
                                        ) : meal.is_delivered ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Delivered</span>
                                        ) : meal.choice === 'none' ? (
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full animate-pulse">Needs Action</span>
                                        ) : null}
                                    </div>

                                    {/* Card Body (The Choices) */}
                                    <div className="p-6 flex-grow flex flex-col gap-4">
                                        {/* Main Meal Button */}
                                        <button 
                                            onClick={() => handleChoice(meal.participant_id, 'main')}
                                            disabled={isLockedIn}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                meal.choice === 'main' 
                                                ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                                                : 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50'
                                            } ${isLockedIn ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900">Main Meal</span>
                                                {meal.choice === 'main' && <span className="text-indigo-600 font-bold">✓ Locked In</span>}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{meal.main_meal}</p>
                                        </button>

                                        {/* Alternative Meal Button */}
                                        {meal.alt_meal && (
                                            <button 
                                                onClick={() => handleChoice(meal.participant_id, 'alt')}
                                                disabled={isLockedIn}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                    meal.choice === 'alt' 
                                                    ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                                                    : 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50'
                                                } ${isLockedIn ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-900">Alternative Meal</span>
                                                    {meal.choice === 'alt' && <span className="text-indigo-600 font-bold">✓ Locked In</span>}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{meal.alt_meal}</p>
                                            </button>
                                        )}

                                         {/* Optional Request Input */}
                                        <div className="mb-2">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Optional Request / Add-ons
                                            </label>
                                            {isLockedIn ? (
                                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100 italic">
                                                    {meal.custom_request ? `"${meal.custom_request}"` : "No special requests."}
                                                </div>
                                            ) : (
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g., 2 bananas, no onions, extra rice..."
                                                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    value={notes[meal.participant_id] || ''}
                                                    onChange={(e) => setNotes({...notes, [meal.participant_id]: e.target.value})}
                                                />
                                            )}
                                        </div>
                                        
                                        {/* Small helper text at the bottom */}
                                        {meal.choice !== 'none' && !meal.is_locked && (
                                            <p className="text-xs text-center text-gray-500 mt-2">
                                                Your choice has been submitted to the custodian.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}