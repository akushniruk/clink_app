export const Background = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden h-screen">
            <div className="absolute inset-0 bg-black" />
            <div
                className="absolute inset-0 rounded-full w-[576px] h-[576px] bg-cta left-1/2 -translate-x-1/2 translate-y-[150%]"
                style={{
                    zIndex: 1,
                    filter: 'blur(255px)',
                    WebkitFilter: 'blur(255px)',
                    backdropFilter: 'blur(255px)',
                }}
            />
        </div>
    );
};
