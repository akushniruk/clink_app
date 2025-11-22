import { type ComponentType } from 'preact';
import { lazy, Suspense } from 'preact/compat';
import { createElement } from 'preact';

// Lazy loading wrapper with error boundary
export function createLazyComponent<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>,
): ComponentType<any> {
    const LazyComponent = lazy(factory);

    return function LazyWrapper(props: any) {
        return createElement(
            Suspense,
            { fallback: createElement('div', { class: 'loading-spinner' }, 'Loading...') },
            createElement(LazyComponent, props),
        );
    };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {},
): IntersectionObserver {
    const defaultOptions = {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
    };

    return new IntersectionObserver(callback, defaultOptions);
}

// Lazy image loading utility
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                img.src = src;
                img.onload = () => {
                    img.classList.add('loaded');
                };
                observer.unobserve(img);
            }
        });
    });

    observer.observe(img);
}
