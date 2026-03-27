const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const buildDate = (value) => {
    if (!value) {
        return null;
    }

    if (DATE_ONLY_PATTERN.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    }

    return new Date(value);
};

export const formatAppDate = (
    value,
    timezone = 'Asia/Manila',
    options = { month: 'short', day: 'numeric', year: 'numeric' },
) => {
    const date = buildDate(value);

    if (!date || Number.isNaN(date.getTime())) {
        return '';
    }

    const formatterTimezone = DATE_ONLY_PATTERN.test(value) ? 'UTC' : timezone;

    return new Intl.DateTimeFormat('en-US', {
        timeZone: formatterTimezone,
        ...options,
    }).format(date);
};
