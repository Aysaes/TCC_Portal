import React from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { getHRLinks } from '@/Config/navigation';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Feedback({ auth }) {
    const hrLinks = getHRLinks(auth?.user?.role?.name || 'Employee', auth);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: '',
        subject: '',
        message: '',
        image: null, // NEW: Added image to the form state
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('hr.feedback.store'), {
            preserveScroll: true,
            // We use forceFormData because we are sending an actual file (multipart/form-data)
            forceFormData: true, 
            onSuccess: () => reset(), 
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

                        {/* NEW: Optional Image Upload */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <InputLabel htmlFor="image" value="Attach an Image (Optional)" className="font-bold mb-1" />
                            <p className="text-xs text-gray-500 mb-3">Include a screenshot or photo to provide more context (JPG, PNG - Max 5MB).</p>
                            <input 
                                type="file" 
                                id="image" 
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors" 
                                accept="image/*"
                                onChange={(e) => setData('image', e.target.files[0])} 
                            />
                            <InputError message={errors.image} className="mt-2" />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end pt-4 border-t border-gray-100 mt-8">
                            <PrimaryButton disabled={processing} className="px-6 py-3 shadow-sm">
                                Submit Feedback
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
}