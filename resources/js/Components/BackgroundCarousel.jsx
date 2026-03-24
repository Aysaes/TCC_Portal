import { useState, useEffect } from 'react';
import GHImage from '@/Assets/GH.jpg';
import ALBImage from '@/Assets/ALB.jpg';
import MKTImage from '@/Assets/MKT.jpg';

export default function BackgroundCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        GHImage,
        ALBImage,
        MKTImage,
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <img
                        src={slide}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </>
    );
}
