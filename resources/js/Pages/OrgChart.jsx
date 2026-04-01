import SidebarLayout from '@/Layouts/SidebarLayout';
import { getDashboardLinks } from '@/Config/navigation';
import { Head } from '@inertiajs/react';
import { useRef, useState } from 'react';

/*
|--------------------------------------------------------------------------
| EMPLOYEE STRUCTURE
|--------------------------------------------------------------------------
*/

const EMPLOYEE_SECTIONS = [
    {
        name: 'Makati Branch Medical Operations Team',
        departments: [
            {
                title: 'Veterinarian Department',
                leadRoles: ['Veterinarian Assistant TL'],
                subRoles: ['Veterinarians'],
            },
            {
                title: 'Veterinary Technology Department',
                leadRoles: ['Vet Tech TL'],
                subRoles: ['Vet Tech'],
            },
            {
                title: 'Clinic Assistance Department',
                leadRoles: ['Clinic Assistant TL'],
                subRoles: ['Clinic Assistants'],
            },
        ],
    },
    {
        name: 'Alabang Branch Medical Operations Team',
        departments: [
            {
                title: 'Veterinarian Department',
                leadRoles: ['Veterinarian Assistant TL'],
                subRoles: ['Veterinarians'],
            },
            {
                title: 'Veterinary Technology Department',
                leadRoles: ['Vet Tech TL'],
                subRoles: ['Vet Tech'],
            },
            {
                title: 'Clinic Assistance Department',
                leadRoles: ['Clinic Assistant TL'],
                subRoles: ['Clinic Assistants'],
            },
        ],
    },
    {
        name: 'Greenhills Branch Medical Operations Team',
        departments: [
            {
                title: 'Veterinarian Department',
                leadRoles: ['Veterinarian Assistant TL'],
                subRoles: ['Veterinarians'],
            },
            {
                title: 'Veterinary Technology Department',
                leadRoles: ['Vet Tech TL'],
                subRoles: ['Vet Tech'],
            },
            {
                title: 'Clinic Assistance Department',
                leadRoles: ['Clinic Assistant TL'],
                subRoles: ['Clinic Assistants'],
            },
        ],
    },
    {
        name: 'Makati Branch Services Operations Team',
        departments: [
            {
                title: 'Reception Department',
                leadRoles: ['Reception TL'],
                subRoles: ['Receptionist'],
            },
            {
                title: 'Cashier Department',
                leadRoles: ['Cashier TL'],
                subRoles: ['Cashier Assistant'],
            },
            {
                title: 'Inventory Department',
                leadRoles: ['Inventory TL'],
                subRoles: ['Inventory Assistant'],
            },
            {
                title: 'Security Department',
                leadRoles: [],
                subRoles: ['Security Guard'],
            },
            {
                title: 'Transport Department',
                leadRoles: [],
                subRoles: ['Company Drivers'],
            },
        ],
    },
    {
        name: 'Alabang Branch Services Operations Team',
        departments: [
            {
                title: 'Reception Department',
                leadRoles: ['Reception TL'],
                subRoles: ['Receptionist'],
            },
            {
                title: 'Cashier Department',
                leadRoles: ['Cashier TL'],
                subRoles: ['Cashier Assistant'],
            },
            {
                title: 'Inventory Department',
                leadRoles: ['Inventory TL'],
                subRoles: ['Inventory Assistant'],
            },
            {
                title: 'Security Department',
                leadRoles: [],
                subRoles: ['Security Guard'],
            },
            {
                title: 'Transport Department',
                leadRoles: [],
                subRoles: ['Company Drivers'],
            },
        ],
    },
    {
        name: 'Greenhills Branch Services Operations Team',
        departments: [
            {
                title: 'Reception Department',
                leadRoles: ['Reception TL'],
                subRoles: ['Receptionist'],
            },
            {
                title: 'Cashier Department',
                leadRoles: ['Cashier TL'],
                subRoles: ['Cashier Assistant'],
            },
            {
                title: 'Inventory Department',
                leadRoles: ['Inventory TL'],
                subRoles: ['Inventory Assistant'],
            },
            {
                title: 'Security Department',
                leadRoles: [],
                subRoles: ['Security Guard'],
            },
            {
                title: 'Transport Department',
                leadRoles: [],
                subRoles: ['Company Drivers'],
            },
        ],
    },
    {
        name: 'Corporate Operations Team',
        departments: [
            {
                title: 'Human Resources Department',
                leadRoles: ['HR Business Partner', 'HR Consultant'],
                subRoles: ['HR Assistant'],
            },
            {
                title: 'Procurement Department',
                leadRoles: ['Procurement TL'],
                subRoles: ['Procurement Assistant'],
            },
            {
                title: 'Audit Department',
                leadRoles: ['Internal Auditor'],
                subRoles: ['Audit Assistant'],
            },
            {
                title: 'IT Department',
                leadRoles: ['IT TL'],
                subRoles: ['IT Associates'],
            },
            {
                title: 'Accounting Department',
                leadRoles: [],
                subRoles: ['Accounting Staff'],
            },
        ],
    },
];

/*
|--------------------------------------------------------------------------
| EXECUTIVE / MANAGEMENT ORDER
|--------------------------------------------------------------------------
*/

const EXECOM_POSITIONS = [
    'Chairman',
    'President',
    'Director of Corporate & Services Operations',
    'Medical Director',
];

const MANCOMM_POSITIONS = [
    'Operations & Finance Coordination Lead',
    'Sales & Marketing Manager',
    'Operations Manager',
    'Store Manager',
    'HR Business Partner',
    'Internal Auditor',
    'Executive Assistant',
    'Chief Veterinarian',
    'Senior Veterinarian TL',
    'Junior Veterinarian TL',
];

/*
|--------------------------------------------------------------------------
| UI HELPERS
|--------------------------------------------------------------------------
*/

function scrollByAmount(ref, amount) {
    if (!ref.current) return;
    ref.current.scrollBy({ left: amount, behavior: 'smooth' });
}

function getTouchHandlers(ref) {
    let startX = 0;
    let scrollLeft = 0;
    let isDragging = false;

    return {
        onTouchStart: (e) => {
            if (!ref.current) return;
            isDragging = true;
            startX = e.touches[0].pageX - ref.current.offsetLeft;
            scrollLeft = ref.current.scrollLeft;
        },
        onTouchMove: (e) => {
            if (!isDragging || !ref.current) return;
            const x = e.touches[0].pageX - ref.current.offsetLeft;
            const walk = (x - startX) * 1.1;
            ref.current.scrollLeft = scrollLeft - walk;
        },
        onTouchEnd: () => {
            isDragging = false;
        },
    };
}

/*
|--------------------------------------------------------------------------
| CARD COMPONENTS
|--------------------------------------------------------------------------
*/

function MemberCard({ member }) {
    return (
        <div className="group relative flex w-full flex-col items-center rounded-3xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md min-h-[235px]">
            <div className="mb-4 h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100">
                {member?.image_path ? (
                    <img
                        src={`/storage/${member.image_path}`}
                        alt={member?.name || 'Member'}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        IMG
                    </div>
                )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
                <h4 className="line-clamp-2 text-xl font-semibold leading-7 text-gray-900">
                    {member?.name || 'No Name'}
                </h4>

                <p className="mt-2 min-h-[78px] line-clamp-3 text-base leading-6 text-gray-500">
                    {member?.position}
                </p>
            </div>
        </div>
    );
}

function SideCarousel({ title, children }) {
    const scrollRef = useRef(null);
    const touchHandlers = getTouchHandlers(scrollRef);

    return (
        <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <h5 className="mb-4 text-base font-semibold text-gray-800">{title}</h5>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => scrollByAmount(scrollRef, -320)}
                    className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-gray-300 bg-white p-2 shadow-sm lg:flex"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <div
                    ref={scrollRef}
                    className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-0 lg:px-10"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    {...touchHandlers}
                >
                    {children}
                </div>

                <button
                    type="button"
                    onClick={() => scrollByAmount(scrollRef, 320)}
                    className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-gray-300 bg-white p-2 shadow-sm lg:flex"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function OrgChart({ auth, members }) {
    const dashboardLinks = getDashboardLinks();
    const memberList = members || [];
    const [openSections, setOpenSections] = useState({});

    const toggleSection = (name) => {
        setOpenSections((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    const getMembersByBranchAndPosition = (branch, position) =>
        memberList.filter((m) => m.branch === branch && m.position === position);

    const getCardNodes = (branch, position) => {
        const matches = getMembersByBranchAndPosition(branch, position);
        if (!matches.length) return [];

        return matches.map((member) => (
            <MemberCard key={member.id} member={member} />
        ));
    };

    const renderDepartment = (sectionName, department) => {
        const leadCards = department.leadRoles
            .map((role) => getCardNodes(sectionName, role))
            .flat();

        const subCards = department.subRoles
            .map((role) => getCardNodes(sectionName, role))
            .flat();

        return (
            <SideCarousel title={department.title}>
                {leadCards.map((card, index) => (
                    <div
                        key={`${department.title}-lead-${index}`}
                        className="min-w-[300px] max-w-[300px] snap-start"
                    >
                        {card}
                    </div>
                ))}

                {subCards.length > 0 ? (
                    subCards.map((card, index) => (
                        <div
                            key={`${department.title}-sub-${index}`}
                            className="min-w-[300px] max-w-[300px] snap-start"
                        >
                            {card}
                        </div>
                    ))
                ) : (
                    <div className="min-w-[300px] max-w-[300px] snap-start rounded-3xl border border-gray-200 bg-white p-5 min-h-[235px] flex flex-col justify-center">
                        <h6 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                            {department.subRoles.join(', ')}
                        </h6>
                        <p className="text-sm text-gray-400">No employees assigned.</p>
                    </div>
                )}
            </SideCarousel>
        );
    };

    const executiveCommitteeCards = EXECOM_POSITIONS.flatMap((position) =>
        getCardNodes('ExeCom and ManComm', position)
    );

    const managementCommitteeCards = MANCOMM_POSITIONS.flatMap((position) =>
        getCardNodes('ExeCom and ManComm', position)
    );

    return (
        <SidebarLayout
            activeModule="General"
            sidebarLinks={dashboardLinks}
            header={<h2 className="text-xl font-semibold text-gray-800">Enployee Directory</h2>}
        >
            <Head title="Employee Directory" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-4 lg:px-8">
                    {/* PEOPLE SECTIONS */}
                    <div className="mb-12">
                        {/* EXECUTIVE COMMITTEE */}
                        {executiveCommitteeCards.length > 0 && (
                            <div className="mb-10">
                                <div className="mb-5 border-b border-gray-200 pb-3">
                                    <h4 className="text-xl font-semibold text-gray-800">Executive Committee</h4>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                                    {executiveCommitteeCards.map((card, index) => (
                                        <div key={`executive-committee-${index}`} className="w-full">
                                            {card}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* MANAGEMENT COMMITTEE */}
                        {managementCommitteeCards.length > 0 && (
                            <div>
                                <div className="mb-5 border-b border-gray-200 pb-3">
                                    <h4 className="text-xl font-semibold text-gray-800">Management Committee</h4>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                                    {managementCommitteeCards.map((card, index) => (
                                        <div key={`management-committee-${index}`} className="w-full">
                                            {card}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* EMPLOYEES */}
                    <div>
                        <h3 className="mb-5 text-2xl font-bold text-gray-900">Employees</h3>

                        {EMPLOYEE_SECTIONS.map((section) => (
                            <div
                                key={section.name}
                                className="mb-5 overflow-hidden rounded-xl border border-gray-200"
                            >
                                <button
                                    onClick={() => toggleSection(section.name)}
                                    className="w-full px-5 py-3 text-left text-base font-semibold text-gray-800 transition hover:bg-gray-50"
                                >
                                    {section.name}
                                </button>

                                {openSections[section.name] && (
                                    <div className="space-y-4 border-t border-gray-200 p-5">
                                        {section.departments.map((department) => (
                                            <div key={department.title}>
                                                {renderDepartment(section.name, department)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </SidebarLayout>
    );
}