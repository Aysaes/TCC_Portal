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
            active: activeCategory === cat.name,
            icon: 'document-category',
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
    
    // DEFENSIVE STRIPPING: Force string, lowercase it, and trim hidden spaces
    const normalizedRole = String(UserRole).toLowerCase().trim();

    // 🟢 FIX 1: Add 'hrbp' to the isHRAdmin check so they can see HR Admin Overview
    const isHRAdmin = normalizedRole === 'admin' || normalizedRole === 'hr' || normalizedRole === 'hrbp' || userPosition === 'human resources';
    
    // 🟢 FIX 2: Add 'hrbp' to isAccounting check so they can see Form 2316 Approvals
    const isAccounting = normalizedRole === 'general accounting' || normalizedRole === 'accounting' || normalizedRole === 'hrbp';

    // 1. Base links
    const links = [
        {   
            label: 'Document Requests', 
            href: route('hr.index'), 
            active: route().current('hr.index') 
        },
        // --- General Accounting Link for Form 2316 ---
        ...(isAccounting || normalizedRole === 'admin' ? [
            { 
                label: 'Form 2316 Approvals', 
                href: route('hr.accounting.index'), 
                active: route().current('hr.accounting.index') 
            }
        ] : []),
        // --- HR Admin Overview ---
        ...(isHRAdmin ? [
            { 
                label: 'HR Admin Overview', 
                href: route('hr.admin.index'), 
                active: route().current('hr.admin.index') 
            }
        ] : []),
    ];

    // 3. 🟢 THE FIXED MATH 🟢
    const isAdmin = normalizedRole === 'admin';
    const isHR = normalizedRole === 'hr';
    const isHRBP = normalizedRole === 'hrbp';
    
    // FIX 1: Use .includes() on the string so it catches "vet tech tl", "it tl", etc.
    const isRequesterOnly = normalizedRole.includes('tl') || normalizedRole === 'marketing manager';
    
    const isApprover = [
        'director of corporate services and operations', 
        'chief vet', 
        'operations manager', 
    ].includes(normalizedRole);

    // 4. Push the links based on the math
    
    // FIX 2: Create Link is visible to Everyone EXCEPT regular HR
    if (isAdmin || isHRBP || isRequesterOnly || isApprover) {
        links.push({
            label: 'Manpower Request Form',
            href: route('hr.manpower-requests.create'),
            active: route().current('hr.manpower-requests.create'),
        });
    }

    // Dashboard Link: Visible to Everyone (HR gets "Approval Board", TLs get "My Requests")
    if (isAdmin || isHR || isHRBP || isRequesterOnly || isApprover) {
        links.push({
            label: (isRequesterOnly && !isAdmin) ? 'My Requests' : 'Approval Board',
            href: route('hr.manpower-requests.index'),
            active: route().current('hr.manpower-requests.index'),
        });
    }

    // 5. Final link (Visible to everyone)
    links.push({ 
        label: 'Feedback Form', 
        href: route('hr.feedback.create'), 
        active: route().current('hr.feedback.create') 
    });
    
    return links;
};

export const getHRAdminLinks = (auth) => {
    return [
        { 
            label: 'HR Module Overview', 
            href: route('hr.index'),
            active: route().current('hr.index') 
        },
        { label: 'Pending Document Requests',
            href: route('hr.admin.index'),
            active: route().current('hr.admin.index') 
        },
        { label: 'Feedback Form Submissions', 
            href: route('hr.feedback.index'),
            active: route().current('hr.feedback.index')
        }
    ];
};

export const getPRPOLinks = (auth) => {
    return [
        { 
            label: 'Products Masterlist', 
            href: route('prpo.products.index'),
            active: route().current('prpo.products.index') 
        },
        { 
            label: 'PR/PO Request',
            href: route('prpo.purchase-requests.create'), // Updated!
            active: route().current('prpo.purchase-requests.create'), 
        },
        {
            label: 'Approval Board',
            href: route('prpo.approval-board'),
            active: route().current('prpo.approval-board'),
        },
        {
            label: 'PO Generation',
            href: route('prpo.purchase-orders.index'),
            active: route().current('prpo.purchase-orders.index'),
        }
    ];
};