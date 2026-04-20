import SidebarLayout from '@/Layouts/SidebarLayout';
import { getDashboardLinks } from '@/Config/navigation';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

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
                title: 'Veterinary Technician Department',
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
                title: 'Veterinary Technician Department',
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
                title: 'Veterinary Technician Department',
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
| ORG CHART VIEWER (FULLY UPDATED FOR MOBILE AND DESKTOP)
|--------------------------------------------------------------------------
*/
function OrgChartMapViewer({ svgPath }) {
    const containerRef = useRef(null);
    const imageRef = useRef(null);

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [isImageReady, setIsImageReady] = useState(false);
    
    // Notifications for user interaction instructions
    const [showCtrlMessage, setShowCtrlMessage] = useState(false);
    const [showTouchMessage, setShowTouchMessage] = useState(false);
    const ctrlMessageTimeout = useRef(null);
    const touchMessageTimeout = useRef(null);

    const fitViewRef = useRef({ scale: 1, x: 0, y: 0 });

    // References for mouse/touch tracking without causing re-renders
    const dragRef = useRef({ isDragging: false, lastX: 0, lastY: 0 });
    const touchRef = useRef({ lastX: 0, lastY: 0, lastDistance: 0 });

    const MIN_SCALE = 0.2;
    const MAX_SCALE = 4;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const applyFitToScreen = () => {
        const container = containerRef.current;
        if (!container || !imageSize.width || !imageSize.height) return;

        const horizontalPadding = 8;
        const verticalPadding = 8;

        const availableWidth = Math.max(container.clientWidth - horizontalPadding * 2, 1);
        const availableHeight = Math.max(container.clientHeight - verticalPadding * 2, 1);

        const widthScale = availableWidth / imageSize.width;
        const heightScale = availableHeight / imageSize.height;

        const fitScale = Math.min(widthScale, heightScale) * 0.98;

        const x = Math.max((container.clientWidth - imageSize.width * fitScale) / 2, 0);
        const y = Math.max((container.clientHeight - imageSize.height * fitScale) / 2, 0);

        fitViewRef.current = { scale: fitScale, x, y };
        setScale(fitScale);
        setPosition({ x, y });
    };

    const resetView = () => {
        const { scale: fitScale, x, y } = fitViewRef.current;
        setScale(fitScale);
        setPosition({ x, y });
    };

    // Safely calculates zoom based on previous state to prevent stale closures
    const zoomAtPoint = (clientX, clientY, deltaScale) => {
        const container = containerRef.current;
        if (!container || !isImageReady) return;

        const rect = container.getBoundingClientRect();
        
        setScale(prevScale => {
            const nextScale = clamp(prevScale * deltaScale, MIN_SCALE, MAX_SCALE);
            if (nextScale === prevScale) return prevScale;

            setPosition(prevPos => {
                const offsetX = clientX - rect.left;
                const offsetY = clientY - rect.top;

                const worldX = (offsetX - prevPos.x) / prevScale;
                const worldY = (offsetY - prevPos.y) / prevScale;

                const nextX = offsetX - worldX * nextScale;
                const nextY = offsetY - worldY * nextScale;

                return { x: nextX, y: nextY };
            });
            
            return nextScale;
        });
    };

    // --- NON-PASSIVE EVENT PREVENTION ---
    // This strictly stops the browser from scrolling the page ONLY when we want it to.
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleNativeEvents = (e) => {
            if (e.type === 'wheel') {
                if (e.ctrlKey || e.metaKey) e.preventDefault(); // Stop page scroll to allow zoom
            } else if (e.type === 'touchmove') {
                if (e.touches.length >= 2) e.preventDefault(); // Stop page scroll to allow 2-finger pan/zoom
            }
        };

        container.addEventListener('wheel', handleNativeEvents, { passive: false });
        container.addEventListener('touchmove', handleNativeEvents, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleNativeEvents);
            container.removeEventListener('touchmove', handleNativeEvents);
        };
    }, []);

    // --- DESKTOP WHEEL HANDLER ---
    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
            zoomAtPoint(e.clientX, e.clientY, zoomFactor);
            setShowCtrlMessage(false);
        } else {
            // Show helper message if they scroll without Ctrl
            setShowCtrlMessage(true);
            if (ctrlMessageTimeout.current) clearTimeout(ctrlMessageTimeout.current);
            ctrlMessageTimeout.current = setTimeout(() => setShowCtrlMessage(false), 2000);
        }
    };

    // --- DESKTOP MOUSE PANNING ---
    const handleMouseDown = (e) => {
        if (!isImageReady) return;
        e.preventDefault();
        setIsDragging(true);
        dragRef.current.isDragging = true;
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
    };

    const handleMouseMove = (e) => {
        if (!dragRef.current.isDragging) return;
        
        const dx = e.clientX - dragRef.current.lastX;
        const dy = e.clientY - dragRef.current.lastY;
        
        setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        dragRef.current.isDragging = false;
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        dragRef.current.isDragging = false;
    };

    // --- MOBILE TOUCH PAN & ZOOM ---
    const handleTouchStart = (e) => {
        if (!isImageReady) return;
        
        if (e.touches.length === 2) {
            // Setup 2-finger pan and zoom
            touchRef.current.lastX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            touchRef.current.lastY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            touchRef.current.lastDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            setShowTouchMessage(false);
        } else if (e.touches.length === 1) {
            // Show helper message if they use 1 finger (1 finger just scrolls the page)
            setShowTouchMessage(true);
            if (touchMessageTimeout.current) clearTimeout(touchMessageTimeout.current);
            touchMessageTimeout.current = setTimeout(() => setShowTouchMessage(false), 2000);
        }
    };

    const handleTouchMove = (e) => {
        if (!isImageReady) return;
        
        if (e.touches.length === 2) {
            const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );

            // Handle Panning
            const dx = currentX - touchRef.current.lastX;
            const dy = currentY - touchRef.current.lastY;
            if (dx !== 0 || dy !== 0) {
                setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            }

            // Handle Zooming
            if (touchRef.current.lastDistance > 0) {
                const deltaScale = currentDistance / touchRef.current.lastDistance;
                if (Math.abs(deltaScale - 1) > 0.01) {
                    zoomAtPoint(currentX, currentY, deltaScale);
                }
            }

            touchRef.current.lastX = currentX;
            touchRef.current.lastY = currentY;
            touchRef.current.lastDistance = currentDistance;
        }
    };

    const handleTouchEnd = (e) => {
        if (e.touches.length < 2) {
            touchRef.current.lastDistance = 0;
        }
    };

    // --- BUTTON CONTROLS ---
    const zoomIn = () => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.15);
    };

    const zoomOut = () => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, 0.87);
    };

    // --- GLOBAL CLEANUP ---
    useEffect(() => {
        const handleWindowMouseUp = () => {
            setIsDragging(false);
            dragRef.current.isDragging = false;
        };
        window.addEventListener('mouseup', handleWindowMouseUp);
        return () => window.removeEventListener('mouseup', handleWindowMouseUp);
    }, []);

    useEffect(() => {
        if (!isImageReady) return;

        applyFitToScreen();

        const container = containerRef.current;
        if (!container || typeof ResizeObserver === 'undefined') return;

        const observer = new ResizeObserver(() => applyFitToScreen());
        observer.observe(container);

        return () => observer.disconnect();
    }, [isImageReady, imageSize.width, imageSize.height]);

    const handleImageLoad = () => {
        const img = imageRef.current;
        if (!img) return;

        setImageSize({
            width: img.naturalWidth || img.width || 0,
            height: img.naturalHeight || img.height || 0,
        });
        setIsImageReady(true);
    };

    return (
        <div className="mb-12 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Organizational Chart</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Hold <kbd className="rounded border border-gray-300 bg-gray-100 px-1 font-sans text-xs font-semibold text-gray-600 shadow-sm">Ctrl</kbd> to zoom on desktop, or pinch with two fingers on mobile.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={zoomOut}
                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        −
                    </button>
                    <button
                        type="button"
                        onClick={zoomIn}
                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        +
                    </button>
                    <button
                        type="button"
                        onClick={resetView}
                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="relative">
                {/* Helper messages overlay */}
                {(showCtrlMessage || showTouchMessage) && (
                    <div className="pointer-events-none absolute left-1/2 top-4 z-50 -translate-x-1/2 transform rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white shadow-md transition-opacity duration-300">
                        {showCtrlMessage ? 'Use Ctrl + Scroll to zoom' : 'Use two fingers to pan or zoom'}
                    </div>
                )}

                <div
                    ref={containerRef}
                    className={`relative h-[420px] overflow-hidden bg-gray-50 md:h-[560px] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onWheel={handleWheel}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    {svgPath ? (
                        <div
                            className="absolute left-0 top-0 will-change-transform"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                transformOrigin: '0 0',
                            }}
                        >
                            <img
                                ref={imageRef}
                                src={svgPath}
                                alt="Organizational Chart"
                                draggable={false}
                                onLoad={handleImageLoad}
                                className="block max-w-none select-none"
                            />
                        </div>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <p className="text-gray-500 font-medium">No organizational chart has been uploaded yet.</p>
                        </div>
                    )}

                    <div className="pointer-events-none absolute bottom-4 right-4 rounded-xl bg-white/90 px-3 py-2 text-xs font-medium text-gray-600 shadow-sm border border-gray-200">
                        Zoom: {Math.round(scale * 100)}%
                    </div>
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function OrgChart({ auth, members, orgChartSvg = null }) {
    const dashboardLinks = getDashboardLinks();
    const memberList = members || [];
    const [openSections, setOpenSections] = useState({});

    const normalizedOrgChartSvg =
        orgChartSvg && orgChartSvg.startsWith('/')
            ? orgChartSvg
            : orgChartSvg
            ? `/${orgChartSvg}`
            : null;

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
            header={<h2 className="text-xl font-semibold text-gray-800">Employee Directory</h2>}
        >
            <Head title="Employee Directory" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-4 lg:px-8">
                    <OrgChartMapViewer svgPath={normalizedOrgChartSvg} />

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