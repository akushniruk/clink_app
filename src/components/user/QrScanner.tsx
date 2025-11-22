import { useEffect, useRef, useState } from 'preact/hooks';
import jsQR from 'jsqr';
import styles from './QrScanner.module.css';
import { isValidUserTag, isOwnUserTag, type QRValidationResult, extractTagFromUrl } from '../../utils/walletValidation';
import { useT } from '../../i18n';
import { useSnapshot } from 'valtio';
import UserTagStore from '../../store/UserTagStore';

// Check if we're in a secure context (HTTPS or localhost)
const isSecureContext = () => {
    return (
        window.isSecureContext ||
        location.protocol === 'https:' ||
        location.hostname === 'localhost' ||
        location.hostname === '192.168.1.83' ||
        location.hostname === '127.0.0.1'
    );
};

// Check if MediaDevices API is available
const hasMediaDevicesSupport = () => {
    return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
};

interface QrScannerProps {
    onScan: (data: string) => void;
    onError?: (error: Error) => void;
    onClose?: () => void;
    onManualEntry?: () => void; // Add manual entry callback
}

type CameraError =
    | 'no-secure-context'
    | 'no-media-devices'
    | 'no-camera'
    | 'permission-denied'
    | 'camera-in-use'
    | 'unknown-error';

export const QrScanner = ({ onScan, onError, onClose, onManualEntry }: QrScannerProps) => {
    const t = useT();
    const userTagState = useSnapshot(UserTagStore.state);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [decoded, setDecoded] = useState<string | null>(null);
    const rafId = useRef<number>();
    const [hasCamera, setHasCamera] = useState<boolean>(false);
    const [permission, setPermission] = useState<boolean>(false);
    const [cameraError, setCameraError] = useState<CameraError | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSettingUpCamera, setIsSettingUpCamera] = useState<boolean>(false);
    const streamRef = useRef<MediaStream | null>(null);
    const [qrValidationError, setQrValidationError] = useState<QRValidationResult | null>(null);
    const [showValidationError, setShowValidationError] = useState<boolean>(false);
    const [isScanning, setIsScanning] = useState<boolean>(false);

    // Helper to draw cyan outline once
    const drawOutline = (loc: any) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#00eaff';
        ctx.beginPath();
        ctx.moveTo(loc.topLeftCorner.x, loc.topLeftCorner.y);
        ctx.lineTo(loc.topRightCorner.x, loc.topRightCorner.y);
        ctx.lineTo(loc.bottomRightCorner.x, loc.bottomRightCorner.y);
        ctx.lineTo(loc.bottomLeftCorner.x, loc.bottomLeftCorner.y);
        ctx.closePath();
        ctx.stroke();
    };

    // Decode loop
    const tick = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const { videoWidth: w, videoHeight: h } = video;
        if (!w || !h) {
            // Add debugging for video dimensions
            if (video.readyState >= 2) {
                // HAVE_CURRENT_DATA
                console.log('Video ready but no dimensions:', {
                    videoWidth: w,
                    videoHeight: h,
                    readyState: video.readyState,
                    srcObject: !!video.srcObject,
                });
            }
            rafId.current = requestAnimationFrame(tick);
            return;
        }

        // Log successful video dimensions (only once)
        if (!video.dataset.dimensionsLogged) {
            console.log('Video dimensions detected:', { videoWidth: w, videoHeight: h });
            video.dataset.dimensionsLogged = 'true';
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h);
        const qr = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' });

        if (qr && !decoded) {
            setDecoded(qr.data);

            // Fast tag-only validation - direct tag check
            const scannedTag = extractTagFromUrl(qr.data) || qr.data;

            if (isValidUserTag(scannedTag)) {
                // Check if user is trying to pay themselves
                if (userTagState.userTag && isOwnUserTag(scannedTag, userTagState.userTag)) {
                    setQrValidationError({
                        isValid: false,
                        address: null,
                        userTag: scannedTag,
                        error: 'own_user_tag',
                    });
                    setShowValidationError(true);

                    // Auto-hide error after 3 seconds and reset scanning
                    setTimeout(() => {
                        setShowValidationError(false);
                        setQrValidationError(null);
                        setDecoded(null); // Allow scanning again
                    }, 3000);
                } else {
                    // Valid tag - proceed immediately
                    onScan(scannedTag);
                    drawOutline(qr.location);
                }
            } else {
                // Invalid QR code - show error
                setQrValidationError({
                    isValid: false,
                    address: null,
                    userTag: null,
                    error: 'invalid_qr',
                });
                setShowValidationError(true);

                // Auto-hide error after 3 seconds and reset scanning
                setTimeout(() => {
                    setShowValidationError(false);
                    setQrValidationError(null);
                    setDecoded(null); // Allow scanning again
                }, 3000);
            }
        }
        rafId.current = requestAnimationFrame(tick);
    };

    // Check device capabilities and secure context
    useEffect(() => {
        const checkCapabilities = async () => {
            setIsLoading(true);

            // Check secure context first
            if (!isSecureContext()) {
                setCameraError('no-secure-context');
                setIsLoading(false);
                onError?.(new Error('Camera access requires HTTPS or localhost'));
                return;
            }

            // Check MediaDevices API support
            if (!hasMediaDevicesSupport()) {
                setCameraError('no-media-devices');
                setIsLoading(false);
                onError?.(new Error('MediaDevices API not supported'));
                return;
            }

            try {
                // Check for available cameras
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter((device) => device.kind === 'videoinput');

                if (videoDevices.length === 0) {
                    setCameraError('no-camera');
                    setHasCamera(false);
                } else {
                    setHasCamera(true);
                }
            } catch (error) {
                console.error('Error checking for camera:', error);
                setCameraError('unknown-error');
                setHasCamera(false);
                onError?.(error as Error);
            } finally {
                setIsLoading(false);
            }
        };

        checkCapabilities();
    }, [onError]);

    // Camera setup / teardown
    useEffect(() => {
        if (!hasCamera || cameraError || streamRef.current || isSettingUpCamera) return; // Prevent multiple streams

        let isCancelled = false;
        let currentStream: MediaStream | null = null;

        const setupCamera = async () => {
            try {
                setIsSettingUpCamera(true);

                // Clean up any existing stream first
                if (streamRef.current) {
                    console.log('Stream already exists, skipping setup');
                    setIsSettingUpCamera(false);
                    return;
                }

                // Use simple, fast constraints
                let stream;
                try {
                    // Try rear camera first (most common for QR scanning)
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'environment' },
                        audio: false,
                    });
                } catch (error) {
                    // Fallback to any camera
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false,
                    });
                }

                // Check if cancelled before proceeding
                if (isCancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                currentStream = stream;
                streamRef.current = stream;

                setPermission(true);
                setCameraError(null);
                setIsSettingUpCamera(false);

                // Wait for video element if it's not ready yet
                if (!videoRef.current && !isCancelled) {
                    const checkVideoElement = () => {
                        if (videoRef.current && !isCancelled) {
                            setupVideoWithStream(videoRef.current, stream);
                        } else if (!isCancelled) {
                            setTimeout(checkVideoElement, 50);
                        }
                    };
                    setTimeout(checkVideoElement, 50);
                    return;
                }

                const video = videoRef.current;
                if (video && !isCancelled) {
                    setupVideoWithStream(video, stream);
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error('Error accessing camera:', error);

                    // Categorize camera errors for better user experience
                    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

                    if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
                        setCameraError('permission-denied');
                    } else if (errorMessage.includes('use') || errorMessage.includes('busy')) {
                        setCameraError('camera-in-use');
                    } else {
                        setCameraError('unknown-error');
                    }

                    setPermission(false);
                    setIsSettingUpCamera(false);
                    onError?.(error as Error);
                }
            }
        };

        // Helper function to set up video with stream
        const setupVideoWithStream = (video: HTMLVideoElement, stream: MediaStream) => {
            // Clean up existing event listeners
            video.onloadedmetadata = null;
            video.onloadeddata = null;
            video.oncanplay = null;
            video.onplaying = null;
            video.onerror = null;

            // Force video attributes for mobile compatibility
            video.setAttribute('playsinline', 'true');
            video.setAttribute('autoplay', 'true');
            video.setAttribute('muted', 'true');
            video.defaultMuted = true;
            video.muted = true;
            video.playsInline = true;

            // Set up essential event listeners only
            video.onloadedmetadata = () => {
                if (!isCancelled && video) {
                    video
                        .play()
                        .then(() => {
                            if (!isCancelled) {
                                rafId.current = requestAnimationFrame(tick);
                                setIsScanning(true); // Start scanning when video is ready
                            }
                        })
                        .catch(() => {
                            // Try immediate retry for suspended videos
                            setTimeout(() => {
                                if (!isCancelled && video.paused) {
                                    video.play().catch(console.error);
                                }
                            }, 100);
                        });
                }
            };

            video.onerror = () => {
                setCameraError('unknown-error');
                onError?.(new Error('Video playback failed'));
            };

            // Set stream and immediately try to load
            video.srcObject = stream;
            video.load(); // Force immediate load

            // Additional fallback for suspended videos
            setTimeout(() => {
                if (!isCancelled && video.readyState === 0) {
                    video.load();
                    // Try play if needed
                    if (video.paused) {
                        video.play().catch(() => {});
                    }
                }
            }, 200);
        };

        setupCamera();

        return () => {
            isCancelled = true;
            setIsSettingUpCamera(false);
            if (rafId.current) cancelAnimationFrame(rafId.current);
            if (currentStream) {
                currentStream.getTracks().forEach((t) => t.stop());
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
        };
    }, [hasCamera, cameraError]); // Removed onError to prevent re-runs

    // Separate effect to ensure video element is ready
    useEffect(() => {
        if (hasCamera && !cameraError && !streamRef.current && !isSettingUpCamera && videoRef.current) {
            console.log('🎬 Video element is ready, triggering camera setup...');
            // Trigger camera setup by temporarily changing a state
            const timer = setTimeout(() => {
                setIsSettingUpCamera(false); // This will trigger the camera setup useEffect
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [hasCamera, cameraError, isSettingUpCamera]);

    // Show loading state
    if (isLoading) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    <div className={styles.spinner}></div>
                    <p className={styles.errorTitle}>Initializing Camera</p>
                    <p className={styles.errorSubtitle}>Please wait while we access your camera...</p>
                </div>
            </div>
        );
    }

    // Enhanced error handling with specific error types
    if (cameraError || !hasCamera || !permission) {
        const getErrorContent = () => {
            switch (cameraError) {
                case 'no-secure-context':
                    return {
                        icon: (
                            <svg className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m0 0v1m0-1h1m-1 0h-1m-1-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2a1 1 0 01-1-1v-4z"
                                />
                            </svg>
                        ),
                        title: 'Secure Connection Required',
                        subtitle: 'Camera access requires HTTPS. Please use a secure connection.',
                    };
                case 'no-media-devices':
                    return {
                        icon: (
                            <svg className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        ),
                        title: 'Camera Not Supported',
                        subtitle: 'Your browser or device does not support camera access.',
                    };
                case 'permission-denied':
                    return {
                        icon: (
                            <svg className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        ),
                        title: 'Camera Permission Denied',
                        subtitle: 'Please allow camera access in your browser settings and refresh the page.',
                    };
                case 'camera-in-use':
                    return {
                        icon: (
                            <svg className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                        ),
                        title: 'Camera In Use',
                        subtitle: 'Camera is being used by another app. Please close other camera apps and try again.',
                    };
                case 'no-camera':
                default:
                    return {
                        icon: (
                            <svg className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        ),
                        title: 'No Camera Found',
                        subtitle: hasCamera
                            ? 'Camera access failed. Please try again.'
                            : 'No camera detected on this device.',
                    };
            }
        };

        const errorContent = getErrorContent();

        return (
            <div className={styles.errorContainer}>
                {/* Close button for error states */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-5 left-5 p-4 rounded-sm bg-[var(--color-shades-20)] backdrop-blur-sm z-20"
                    >
                        {cameraError === 'permission-denied' ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        )}
                    </button>
                )}

                <div className={styles.errorContent}>
                    {errorContent.icon}
                    <p className={styles.errorTitle}>{errorContent.title}</p>
                    <p className={styles.errorSubtitle}>{errorContent.subtitle}</p>

                    {/* Manual Entry Button for camera errors */}
                    {onManualEntry && (
                        <button
                            onClick={onManualEntry}
                            style={{
                                marginTop: '24px',
                                padding: '12px 24px',
                                backgroundColor: 'var(--color-cta)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                minWidth: '200px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-cta-1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-cta)';
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            {t('payment.qr.manualEntry')}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <video
                ref={videoRef}
                className={styles.feed}
                muted
                playsInline
                autoPlay
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: '#000',
                    // Ensure video is behind the overlay
                    position: 'relative',
                    zIndex: 1,
                }}
            />
            <canvas ref={canvasRef} className={styles.hidden} />

            {/* Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-5 left-5 p-4 rounded-sm bg-[var(--color-shades-20)] backdrop-blur-sm z-20"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            {/* Dark backdrop with scan area cutout */}
            <div className={styles.backdrop} style={{ zIndex: 10 }}>
                <div className={styles.scanArea}>
                    {/* Coloured corner overlay */}
                    <div className={styles.frame}>
                        <span className={`${styles.corner} ${styles.tl}`} />
                        <span className={`${styles.corner} ${styles.tr}`} />
                        <span className={`${styles.corner} ${styles.bl}`} />
                        <span className={`${styles.corner} ${styles.br}`} />
                    </div>
                </div>
            </div>

            {/* Bottom banner */}
            <div className={styles.banner} style={{ zIndex: 15 }}>
                <div className={styles.bannerContent}>
                    <h2>
                        {t('camera.scanTitle')} <span className={styles.accent}>{t('camera.scanSubtitle')}</span>
                    </h2>
                    {isScanning && !showValidationError ? (
                        <p className={styles.scanInstruction}>{t('payment.qr.scanInstruction')}</p>
                    ) : null}

                    {/* Manual Entry Button */}
                    {onManualEntry && (
                        <button
                            onClick={onManualEntry}
                            className={styles.manualEntryButton}
                            style={{
                                marginTop: '16px',
                                padding: '12px 24px',
                                backgroundColor: 'transparent',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '4px',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                width: '100%',
                                maxWidth: '280px',
                                margin: '16px auto 0',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            {t('payment.qr.manualEntry')}
                        </button>
                    )}
                </div>
            </div>

            {/* Scanning indicator */}
            {/* {isScanning && !showValidationError && (
                <div className={styles.scanIndicator} style={{ zIndex: 12 }}>
                    <div className={styles.scanLine}></div>
                </div>
            )} */}

            {/* QR Validation Error Overlay */}
            {showValidationError && qrValidationError && (
                <div className={styles.validationError} style={{ zIndex: 20 }}>
                    <div className={styles.errorCard}>
                        <div className={styles.errorIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div className={styles.errorContent}>
                            <h3 className={styles.errorTitle}>
                                {qrValidationError.error === 'own_user_tag' && t('payment.qr.ownUserTag')}
                                {qrValidationError.error === 'invalid_qr' && t('payment.qr.invalidQrCode')}
                            </h3>
                            <p className={styles.errorDescription}>
                                {qrValidationError.error === 'own_user_tag' && t('payment.qr.ownUserTagDescription')}
                                {qrValidationError.error === 'invalid_qr' && t('payment.qr.invalidQrCodeDescription')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
