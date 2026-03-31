import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    // If there are 3 or fewer links (Previous, Page 1, Next), don't show pagination
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-wrap mt-4 -mb-1">
            {links.map((link, key) => (
                link.url === null ? (
                    <div
                        key={key}
                        className="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-gray-400 bg-gray-50 border border-gray-200 rounded-md select-none"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={key}
                        className={`mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded-md hover:bg-gray-50 focus:border-indigo-500 focus:text-indigo-500 transition duration-150 ease-in-out ${
                            link.active 
                                ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700' 
                                : 'bg-white text-gray-700 border-gray-300'
                        }`}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            ))}
        </div>
    );
}