"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLPTag } from '../hooks/useLPTag';

interface CCPContainerProps {
    instanceUrl: string; // The Amazon Connect instance URL (e.g., https://my-instance.my.connect.aws/ccp-v2/)
    region: string;      // AWS Region (e.g., us-west-2)
}

/**
 * Container component that embeds the Amazon Connect CCP (Contact Control Panel).
 * It uses the 'amazon-connect-streams' library to inject the CCP iframe.
 * 
 * Styles:
 * - Glassmorphism container
 * - Full height for sidebar usage
 */
const CCPContainer: React.FC<CCPContainerProps> = ({ instanceUrl, region }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const { valid: lpValid } = useLPTag(); // Hook to ensure we are connected to LP (optional dependency)

    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current || initializedRef.current) return;

        initializedRef.current = true;

        // Load the amazon-connect-streams library via script tag (like the working test page)
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/amazon-connect-streams@2.22.0/release/connect-streams-min.js';
        script.async = true;

        script.onload = () => {
            console.log('Amazon Connect Streams library loaded');

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
                <div className={`w-2 h-2 rounded-full ${isInitializing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
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
