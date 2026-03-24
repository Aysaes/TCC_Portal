export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-lg font-medium text-gray-700 font-sans drop-shadow-md ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
