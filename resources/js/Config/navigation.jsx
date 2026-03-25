// Dashboard Links

export const getDashboardLinks = () => [

    {
        label: 'Overview',
        href: route('dashboard'), // Overview gets the main dashboard route now
        active: route().current('dashboard'),
    },
    {
        label: 'Announcements',
        href: route('dashboard.announcements'), // Announcements gets its own new route
        active: route().current('dashboard.announcements'),
    },
    {
        label: 'Mission & Vision',
        href: route('dashboard.mission-vision'),
        active: route().current('dashboard.mission-vision'),
    },
    {
        label: 'Organizational Chart', 
        href: route('dashboard.org-chart'), 
        active: route().current('dashboard.org-chart')
    },

];


// Admin Module Links

export const getAdminLinks = () => [
    {
        label: 'Admin Overview',
        href: route('admin.dashboard'),
        active: route().current('admin.dashboard'),
    },
    {
        label: 'Employee Management',
        href: route('admin.employees'),
        active: route().current('admin.employees'),
    },
    {
        label: 'Announcements & Notices',
        href: route('admin.announcements.index'),
        active: route().current('admin.announcements.*'),
    },
    {
        label: 'Company Content Management',
        href: route('admin.company-content.index'),
        active: route().current('admin.company-content.*'),
    },
    { 
        label: 'Organizational Chart', 
        href: route('admin.org-chart.index'), 
        active: route().current('admin.org-chart.index') 
    },
    {
        label: 'System Logs & Security',
        href: '#',
        active: false,
    },
   
   

];

 // Document Repository Links


export const getDocumentSidebarLinks = (categories = [], activeCategory = 'Overview') => {
    return [
        {
            label: 'Document Overview',
            href: route('admin.documents.index'),
            active: activeCategory === 'Overview'
        },

        ...categories.map(cat => ({
            label: cat.name,
            href: route('admin.documents.index', { category: cat.name }),
            active: activeCategory === cat.name
        }))
    ];
};

// Duty Meal Module Links

export const getDutyMealLinks = () => [
    {
        label: 'Set Up Roster',
        href: route('admin.duty-meals.create'),
        active: route().current('admin.duty-meals.create'),
    },
    {
        label: 'Duty Meal Overview',
        href: route('admin.duty-meals.index'),
        active: route().current('admin.duty-meals.index'),
    },
    {
        label: 'Duty Meal Archive',
        href: route('admin.duty-meals.archive'),
        active:  route().current('admin.duty-meals.archive'),
    },
];

export const getStaffDutyMealLinks = () => [
    {
        label: 'Duty Meals',
        href: route('staff.duty-meals.index'),
        active: route().current('staff.duty-meals.index'),
    },
];

export const getHRLinks = (UserRole = 'Employee', auth) => {
    
    const userRole = (auth?.user?.role?.name || '').toLowerCase();
    const userPosition = (auth?.user?.position?.name || '').toLowerCase();

    // Kurudapya merge
    const isHRAdmin = userRole === 'admin' || userRole === 'hr' || userPosition === 'human resources';

    // 1. Base links
    const links = [
        { label: 'Overview', href: route('hr.index'), active: route().current('hr.index') },
        ...(isHRAdmin ? [
            { 
                label: 'HR Admin Overview', 
                href: route('hr.admin.index'), 
                active: route().current('hr.admin.index') 
            }
        ] : []),
    ];

    // 2. DEFENSIVE STRIPPING: Force string, lowercase it, and trim hidden spaces
    const normalizedRole = String(UserRole).toLowerCase().trim();

    // 3. The Math
    const isTeamLeader = normalizedRole.includes('tl');
    const isAdminOrHR = normalizedRole === 'admin' || normalizedRole === 'hr';
    const isApprover = [
        'director of corporate services and operations', 
        'chief vet', 
        'operations manager', 
    ].includes(normalizedRole);

    // 4. Push the links based on the math
    if (isTeamLeader || isAdminOrHR || isApprover) {
        links.push({
            label: 'Manpower Request',
            href: route('hr.manpower-requests.create'),
            active: route().current('hr.manpower-requests.create'),
        });
    }

    if (isTeamLeader || isAdminOrHR || isApprover) {
        links.push({
            label: isTeamLeader && !isAdminOrHR ? 'My Requests' : 'Approval Board',
            href: route('hr.manpower-requests.index'),
            active: route().current('hr.manpower-requests.index'),
        });
    }

    // 5. Final link
    links.push({ label: 'Feedback Form', href: '#', active: false });

    return links;
};
