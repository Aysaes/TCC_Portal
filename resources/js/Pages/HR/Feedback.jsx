import React from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { getHRLinks } from '@/Config/navigation';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Feedback({ auth }) {
    // Note: Adjust the parameters here if your getHRLinks requires specific variables!
    const hrLinks = getHRLinks(auth?.user?.role?.name || 'Employee', auth);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: '',
        subject: '',
        message: '',
        is_anonymous: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('hr.feedback.store'), {
            preserveScroll: true,
            onSuccess: () => reset(), // Clears the form after success
        });
    };

    return (
        <SidebarLayout activeModule="HR MENU" sidebarLinks={hrLinks} header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Feedback Form</h2>}>
            <Head title="Feedback Form" />

            <div className="py-12 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Employee Feedback</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Share your recommendations, report issues, or provide general feedback to the HR department.
                    </p>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100 p-8">
                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* Type of Feedback */}
                        <div>
                            <InputLabel htmlFor="type" value="Feedback Type" />
                            <select
                                id="type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                required
                            >
                                <option value="" disabled>Select the type of feedback...</option>
                                <option value="Recommendation">💡 Recommendation / Idea</option>
                                <option value="Issue Report">⚠️ Issue Report / Complaint</option>
                                <option value="General">💬 General Feedback</option>
                            </select>
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        {/* Subject */}
                        <div>
                            <InputLabel htmlFor="subject" value="Subject" />
                            <TextInput
                                id="subject"
                                type="text"
                                className="mt-1 block w-full"
                                placeholder="Brief summary of your feedback"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                required
                            />
                            <InputError message={errors.subject} className="mt-2" />
                        </div>

                        {/* Message */}
                        <div>
                            <InputLabel htmlFor="message" value="Detailed Message" />
                            <textarea
                                id="message"
                                rows="6"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Please provide as much detail as possible..."
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                required
                            ></textarea>
                            <InputError message={errors.message} className="mt-2" />
                        </div>

                        {/* Anonymous Toggle */}
                        <div className="flex items-start bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex items-center h-5">
                                <input
                                    id="is_anonymous"
                                    type="checkbox"
                                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                                    checked={data.is_anonymous}
                                    onChange={(e) => setData('is_anonymous', e.target.checked)}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="is_anonymous" className="font-bold text-gray-900">Submit Anonymously</label>
                                <p className="text-gray-500">If checked, your name and email will be hidden from HR. We will not be able to reply to you directly regarding this submission.</p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                            <PrimaryButton disabled={processing} className="px-6 py-3">
                                Submit Feedback
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
}