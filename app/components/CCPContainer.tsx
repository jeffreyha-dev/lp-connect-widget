import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Copy, Check } from 'lucide-react';
import { useLPTag } from '../hooks/useLPTag';



interface CCPContainerProps {
    instanceUrl: string; // The Amazon Connect instance URL (e.g., https://my-instance.my.connect.aws/ccp-v2/)
    region: string;      // AWS Region (e.g., us-west-2)
    onModeChange?: (mode: 'embedded' | 'popup') => void; // Callback when mode changes
}

/**
 * Container component that embeds the Amazon Connect CCP (Contact Control Panel).
 * It uses the 'amazon-connect-streams' library to inject the CCP iframe.
 * 
 * Styles:
 * - Glassmorphism container
 * - Full height for sidebar usage
 */
const CCPContainer: React.FC<CCPContainerProps> = ({ instanceUrl, region, onModeChange }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);
    const popupWindowRef = useRef<Window | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [micPermissionStatus, setMicPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
    const [mode, setMode] = useState<'embedded' | 'popup'>('embedded');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState<string>('+1 (555) 012-3456'); // Mock number for MVP
    const [isCopied, setIsCopied] = useState(false);
    const [phoneDetected, setPhoneDetected] = useState(false); // Track if we found a real number
    const { valid: lpValid, sdk } = useLPTag();

    // Hook to ensure we are connected to LP (optional dependency)

    // Function to open CCP in popup window
    const openCCPPopup = () => {
        if (popupWindowRef.current && !popupWindowRef.current.closed) {
            popupWindowRef.current.focus();
            return;
        }

        const width = 500;
        const height = 700;
        const left = window.screen.width - width - 50;
        const top = 50;

        const popup = window.open(
            instanceUrl,
            'AmazonConnectCCP',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=yes`
        );

        if (popup) {
            popupWindowRef.current = popup;
            setIsPopupOpen(true);
            setMode('popup');
            onModeChange?.('popup');

            // Monitor popup window
            const checkPopup = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkPopup);
                    setIsPopupOpen(false);
                    setMode('embedded');
                    onModeChange?.('embedded');
                    popupWindowRef.current = null;
                }
            }, 1000);
        } else {
            alert('Popup blocked! Please allow popups for this site to use voice calling.');
        }
    };

    // Cleanup popup on unmount
    useEffect(() => {
        return () => {
            if (popupWindowRef.current && !popupWindowRef.current.closed) {
                popupWindowRef.current.close();
            }
        };
    }, []);

    // Level 1: Fetch phone number from LivePerson visitorInfo
    useEffect(() => {
        if (!lpValid || !sdk) return;

        try {
            // @ts-ignore - LP SDK types
            sdk.get('visitorInfo', (data: any) => {
                console.log('📞 [Level 1] visitorInfo data:', data);

                // Try multiple possible phone number fields
                const phoneCandidate =
                    data?.phone ||
                    data?.phoneNumber ||
                    data?.cellPhoneNumber ||
                    data?.mobilePhone ||
                    data?.personalInfo?.phone;

                if (phoneCandidate) {
                    console.log('✅ [Level 1] Found phone in visitorInfo:', phoneCandidate);
                    setPhoneNumber(formatToE164(phoneCandidate));
                } else {
                    console.log('⚠️ [Level 1] No phone found in visitorInfo, keeping mock number');
                }
            });
        } catch (err) {
            console.error('❌ [Level 1] Failed to fetch visitorInfo:', err);
        }
    }, [lpValid, sdk]);

    // Level 2: Fetch phone number from LivePerson chatInfo (Pre-Chat Survey)
    useEffect(() => {
        if (!lpValid || !sdk || phoneDetected) return; // Skip if already found

        try {
            // @ts-ignore - LP SDK types
            sdk.get('chatInfo', (data: any) => {
                console.log('📞 [Level 2] chatInfo data:', data);

                // Check for phone in survey responses or custom variables
                const phoneCandidate =
                    data?.phone ||
                    data?.phoneNumber ||
                    data?.rtSessionId?.phone ||
                    data?.surveyQuestions?.find((q: any) =>
                        q.question?.toLowerCase().includes('phone') ||
                        q.question?.toLowerCase().includes('number')
                    )?.answer;

                if (phoneCandidate) {
                    console.log('✅ [Level 2] Found phone in chatInfo:', phoneCandidate);
                    setPhoneNumber(formatToE164(phoneCandidate));
                    setPhoneDetected(true);
                } else {
                    console.log('⚠️ [Level 2] No phone found in chatInfo, will try Level 3');
                }
            });
        } catch (err) {
            console.error('❌ [Level 2] Failed to fetch chatInfo:', err);
        }
    }, [lpValid, sdk, phoneDetected]);

    // Level 3: Scan transcript for phone numbers using regex
    useEffect(() => {
        if (!lpValid || !sdk || phoneDetected) return; // Skip if already found

        try {
            // Enhanced phone number regex pattern (matches international formats)
            // Matches: +6581578063, (555) 123-4567, 555-123-4567, +1 555 123 4567, etc.
            const phoneRegex = /(\+?\d{1,3}[-\.\s]?)?\(?\d{3,4}\)?[-\.\s]?\d{3,4}[-\.\s]?\d{4}/g;

            // @ts-ignore - LP SDK types
            sdk.bind('line', (line: any) => {
                if (phoneDetected) return; // Stop if we already found one

                console.log('📞 [Level 3] Scanning transcript lines:', lines);

                // Scan all lines for phone numbers
                for (const line of lines) {
                    const text = line.text || '';
                    const matches = text.match(phoneRegex);

                    if (matches && matches.length > 0) {
                        const foundNumber = matches[0];
                        console.log('✅ [Level 3] Found phone in transcript:', foundNumber);
                        setPhoneNumber(formatToE164(foundNumber));
                        setPhoneDetected(true);
                        break;
                    }
                }
            });
        } catch (err) {
            console.error('❌ [Level 3] Failed to bind to transcript:', err);
        }
    }, [lpValid, sdk, phoneDetected]);


    // Helper to format numbers to E.164
    const formatToE164 = (input: string): string => {
        const trimmed = input.trim();
        // If it's already in E.164 format (starts with +), just strip invalid chars but keep +
        if (trimmed.startsWith('+')) {
            const clean = trimmed.replace(/[^0-9+]/g, '');
            return clean;
        }

        // If it's a standard number, strip non-digits
        const clean = trimmed.replace(/\D/g, '');

        // Custom logic for North American numbers (common use case)
        if (clean.length === 10) {
            return `+1${clean}`;
        } else if (clean.length === 11 && clean.startsWith('1')) {
            return `+${clean}`;
        }

        // Default: just prepend +
        return `+${clean}`;
    };

    const handleBlur = () => {
        if (!phoneNumber) return;
        setPhoneNumber(formatToE164(phoneNumber));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    const handleCopy = async () => {
        if (!phoneNumber) return;

        // Format before copying to ensure valid E.164 context
        const formattedNumber = formatToE164(phoneNumber);

        try {
            await navigator.clipboard.writeText(formattedNumber);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);

            // Also update the display to show what was copied
            setPhoneNumber(formattedNumber);
        } catch (err) {
            console.warn('Clipboard API failed (expected in iframes), attempting fallback...');
            // Fallback for restricted iframes
            try {
                const textArea = document.createElement("textarea");
                textArea.value = formattedNumber;
                textArea.style.position = "fixed";  // Avoid scrolling to bottom
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                    setPhoneNumber(formattedNumber);
                } else {
                    console.error('Fallback copy failed.');
                }
            } catch (fallbackErr) {
                console.error('Fallback copy execution failed:', fallbackErr);
            }
        }
    };

    useEffect(() => {


        if (typeof window === 'undefined' || !containerRef.current || initializedRef.current) return;

        initializedRef.current = true;

        // Load the amazon-connect-streams library via script tag (like the working test page)
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/amazon-connect-streams@2.22.0/release/connect-streams-min.js';
        script.async = true;

        script.onload = async () => {
            console.log('Amazon Connect Streams library loaded');

            // Request microphone access before CCP initialization
            const requestMicrophoneAccess = async () => {
                try {
                    console.log('Requesting microphone access...');
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });
                    console.log('✅ Microphone access granted');
                    setMicPermissionStatus('granted');
                    // Keep stream alive briefly to maintain permission, then stop
                    setTimeout(() => {
                        stream.getTracks().forEach(track => track.stop());
                    }, 1000);
                    return true;
                } catch (err: any) {
                    console.error('❌ Microphone access denied:', err);
                    setMicPermissionStatus('denied');

                    // Provide specific error guidance
                    if (err.name === 'NotAllowedError') {
                        console.warn('⚠️ Browser blocked microphone access. This is likely due to:');
                        console.warn('  1. Running in nested iframe (LivePerson widget)');
                        console.warn('  2. Missing iframe allow attribute from parent');
                        console.warn('  3. User denied permission');
                    } else if (err.name === 'NotFoundError') {
                        console.warn('⚠️ No microphone device found');
                    } else if (err.name === 'NotReadableError') {
                        console.warn('⚠️ Microphone is already in use by another application');
                    }
                    return false;
                }
            };

            // Attempt to get microphone permission first
            const micGranted = await requestMicrophoneAccess();
            if (!micGranted) {
                console.warn('⚠️ Microphone not granted - CCP voice features may not work');
                console.warn('📋 Next steps:');
                console.warn('  1. Contact LivePerson support to add iframe allow="microphone" attribute');
                console.warn('  2. Ensure you\'re accessing via HTTPS (required for microphone API)');
                console.warn('  3. Check browser permissions in Settings');
            }

            // Initialize CCP after library loads
            try {
                // @ts-ignore
                window.connect.core.initCCP(containerRef.current!, {
                    ccpUrl: instanceUrl,
                    loginPopup: true,
                    loginPopupAutoClose: true,
                    loginOptions: {
                        autoClose: true,
                        height: 600,
                        width: 400,
                        top: 0,
                        left: 0
                    },
                    region: region,
                    softphone: {
                        allowFramedSoftphone: true,
                        disableRingtone: false,
                        allowFramedVideoCall: true,
                        allowEarlyGum: true
                    },
                    pageOptions: {
                        enableAudioDeviceSettings: true,
                        enableVideoDeviceSettings: true,
                        enablePhoneTypeSettings: true
                    },
                    ccpAckTimeout: 5000,
                    ccpSynTimeout: 3000,
                    ccpLoadTimeout: 10000
                });

                setTimeout(() => {
                    setIsInitializing(false);
                }, 2000);
            } catch (err) {
                console.error('Failed to initialize CCP:', err);
                setIsInitializing(false);
            }
        };

        script.onerror = () => {
            console.error('Failed to load Amazon Connect Streams library');
            setIsInitializing(false);
        };

        document.head.appendChild(script);

        // Cleanup
        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };

    }, [instanceUrl, region]);

    return (
        <div className="relative w-full h-screen bg-slate-900/50 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                <h2 className="text-sm font-medium text-white/90 tracking-wide font-inter">
                    Amazon Connect
                </h2>
                <div className="flex items-center gap-3">
                    {/* Click-to-Call Button (MVP) */}
                    {/* Click-to-Call Control Group */}
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-1.5 py-1">
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="bg-transparent border-none text-white text-xs w-28 px-1 focus:outline-none font-medium placeholder-white/20"
                            placeholder="Enter Number"
                        />
                        <button
                            onClick={handleCopy}
                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors group"
                            title="Copy to clipboard"
                        >
                            {isCopied ? (
                                <Check className="w-3 h-3 text-green-400" />
                            ) : (
                                <Copy className="w-3 h-3 text-white/60 group-hover:text-white" />
                            )}
                        </button>
                    </div>

                    {!isPopupOpen && (
                        <div className={`w-2 h-2 rounded-full ${isInitializing ? 'bg-yellow-400 animate-pulse' : isPopupOpen ? 'bg-green-400 animate-pulse' : 'bg-green-400'}`} />
                    )}
                </div>
            </div>

            {/* CCP Iframe Container */}
            <div
                ref={containerRef}
                className="flex-1 w-full h-full bg-transparent"
                style={{ minHeight: '600px' }} // Ensure minimum height for CCP
            />

            {/* Loading Overlay */}
            {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50">
                    <div className="flex flex-col items-center space-y-3">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        <span className="text-xs text-blue-200/80 font-inter">Loading Softphone...</span>
                    </div>
                </div>
            )}

            {/* Microphone Status Indicator */}
            {micPermissionStatus === 'denied' && !isPopupOpen && (
                <div className="absolute top-16 left-0 right-0 mx-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
                    <div className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                            <h4 className="text-xs font-semibold text-red-300 mb-1">Microphone Blocked</h4>
                            <p className="text-[10px] text-red-200/80 leading-relaxed">
                                Voice calls won't work in embedded mode due to browser security restrictions.
                            </p>
                            <button
                                onClick={openCCPPopup}
                                className="mt-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-semibold rounded transition-colors"
                            >
                                🎤 Open in Popup for Voice Calls
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup Mode Indicator */}
            {isPopupOpen && (
                <div className="absolute top-16 left-0 right-0 mx-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg backdrop-blur-sm">
                    <div className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <h4 className="text-xs font-semibold text-green-300 mb-1">CCP Running in Popup</h4>
                            <p className="text-[10px] text-green-200/80 leading-relaxed">
                                Voice calls are enabled. Check the popup window to manage calls.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Troubleshooting Help */}
            <div className="absolute bottom-2 left-0 right-0 text-center">
                <p className="text-[10px] text-white/30 hover:text-white/60 transition-colors">
                    Issues? <a href={instanceUrl} target="_blank" rel="noopener noreferrer" className="underline">Open Native CCP</a> to check connection.
                </p>
            </div>
        </div>
    );
};

export default CCPContainer;
