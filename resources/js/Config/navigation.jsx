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
        label: 'System Logs & Security',
        href: '#',
        active: false,
    },
];