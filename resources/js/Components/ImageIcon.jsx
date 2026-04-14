
export default function ImageIcon({ src, alt, className = '' }) {
    return(
        <img
            src={src}
            alt={alt}
            className={className}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = '@/Assets/tcc_logo.png';
            }}
        >
        </img>
    );
}
    