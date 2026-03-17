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
        label: 'System Logs & Security',
        href: '#',
        active: false,
    },
   
   

];

 // Document Repository Links

 export const getDocumentRepoLinks = () => [
    {
        label: 'Handbooks',
        href: '#',
        active: false,
    },
    {
        label: 'Memos',
        href: '#',
        active: false,
    },
    {
        label: 'Manuals',
        href: '#',
        active: false,
    },

 ];