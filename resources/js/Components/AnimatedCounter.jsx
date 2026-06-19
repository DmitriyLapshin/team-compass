import React, { useEffect, useState, useRef } from 'react';

export default function AnimatedCounter({ 
    value, 
    duration = 1000, 
    prefix = '', 
    suffix = '',
    className = ''
}) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const start = 0;
        const end = typeof value === 'number' ? value : parseFloat(value) || 0;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function для плавности
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;
            
            setCount(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animate();
    }, [isVisible, value, duration]);

    // Форматирование числа
    const formatValue = (num) => {
        if (Number.isInteger(num)) {
            return num.toString();
        }
        return num.toFixed(1);
    };

    return (
        <span ref={elementRef} className={className}>
            {prefix}
            {formatValue(count)}
            {suffix}
        </span>
    );
}
