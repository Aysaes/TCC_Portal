// Dashboard Links

export const getDashboardLinks = () => [
    {
        label: 'Announcements',
        href: route('dashboard'),
        active: route().current('dashboard'),
    },
    {
        label: 'Mission & Vision',
        href: route('dashboard.mission-vision'),
        active: route().current('dashboard.mission-vision'),
    },
    {
        label: 'Organizational Chart',
        href: '#',
        active: false,
    }
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
        active: route().current('admin.employees'), // dynamically checks the route!
    },
    {
        label: 'Announcements & Notices',
        href: '#',
        active: false,
    },
    {
        label: 'Company Content Management',
        href: route('admin.company-content.index'),
        active: route().current('admin.company-content.*'),
    },
    
    {
        label: 'System Logs & Security',
        href: '#',
        active: false,
    },
   


];