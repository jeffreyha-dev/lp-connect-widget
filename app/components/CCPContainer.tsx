"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
    const { valid: lpValid } = useLPTag(); // Hook to ensure we are connected to LP (optional dependency)

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
                    {!isPopupOpen && (
                        <button
                            onClick={openCCPPopup}
                            className="px-2 py-1 text-[10px] font-semibold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded border border-blue-500/50 transition-colors"
                            title="Open CCP in popup for voice calls"
                        >
                            🎤 Voice Mode
                        </button>
                    )}
                    <div className={`w-2 h-2 rounded-full ${isInitializing ? 'bg-yellow-400 animate-pulse' : isPopupOpen ? 'bg-green-400 animate-pulse' : 'bg-green-400'}`} />
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
