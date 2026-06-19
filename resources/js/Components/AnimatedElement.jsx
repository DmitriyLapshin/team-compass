import React, { useEffect, useState, useRef } from 'react';

export default function AnimatedElement({ 
    children, 
    delay = 0, 
    type = 'fade', 
    className = '' 
}) {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px',
            }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, [delay]);

    const getAnimationClasses = () => {
        if (!isVisible) {
            switch (type) {
                case 'fade':
                    return 'opacity-0';
                case 'slide-up':
                    return 'opacity-0 translate-y-8';
                case 'slide-down':
                    return 'opacity-0 -translate-y-8';
                case 'slide-left':
                    return 'opacity-0 translate-x-8';
                case 'slide-right':
                    return 'opacity-0 -translate-x-8';
                case 'scale':
                    return 'opacity-0 scale-95';
                default:
                    return 'opacity-0';
            }
        }

        switch (type) {
            case 'fade':
                return 'opacity-100';
            case 'slide-up':
                return 'opacity-100 translate-y-0';
            case 'slide-down':
                return 'opacity-100 -translate-y-0';
            case 'slide-left':
                return 'opacity-100 translate-x-0';
            case 'slide-right':
                return 'opacity-100 -translate-x-0';
            case 'scale':
                return 'opacity-100 scale-100';
            default:
                return 'opacity-100';
        }
    };

    return (
        <div
            ref={elementRef}
            className={`transition-all duration-700 ease-out ${getAnimationClasses()} ${className}`}
            style={{
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
