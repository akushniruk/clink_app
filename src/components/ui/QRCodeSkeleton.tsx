import Skeleton from 'react-loading-skeleton';

export function QRCodeSkeleton() {
    return (
        <div className="flex flex-col items-center relative">
            <div className="bg-[var(--color-shades-10)] p-4 rounded-2xl shadow-lg border-2 border-[var(--color-shades-20)]">
                <Skeleton
                    height={216}
                    width={216}
                    baseColor="var(--color-shades-20)"
                    highlightColor="var(--color-shades-30)"
                />
            </div>
            <div className="absolute bottom-[60px]">
                <Skeleton
                    height={12}
                    width={80}
                    baseColor="var(--color-shades-20)"
                    highlightColor="var(--color-shades-30)"
                />
            </div>
            <div className="text-center mt-2 px-4 pb-8 h-[45px]">
                <Skeleton
                    height={14}
                    width={200}
                    baseColor="var(--color-shades-20)"
                    highlightColor="var(--color-shades-30)"
                    count={1}
                />
            </div>
        </div>
    );
}
