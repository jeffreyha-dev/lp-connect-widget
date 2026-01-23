import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CCPContainerProps {
    instanceUrl: string;
    region: string;
}

/**
 * A simplified container for the Amazon Connect Contact Control Panel (CCP).
 * Removes all previous custom features (LP SDK, phone identification, logging)
 * to focus purely on the CCP integration.
 */
const CCPContainer: React.FC<CCPContainerProps> = ({ instanceUrl, region }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current || initializedRef.current) return;
        initializedRef.current = true;

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/amazon-connect-streams@2.22.0/release/connect-streams-min.js';
        script.async = true;
        script.onload = () => {
            try {
                // @ts-ignore
                window.connect.core.initCCP(containerRef.current!, {
                    ccpUrl: instanceUrl,
                    loginPopup: true,
                    loginPopupAutoClose: true,
                    region: region,
                    softphone: { allowFramedSoftphone: true },
                    pageOptions: { enableAudioDeviceSettings: true }
                });
                // Short delay to ensure iframe is rendering before removing loader
                setTimeout(() => setIsInitializing(false), 1500);
            } catch (err) {
                console.error('CCP initialization failed:', err);
                setIsInitializing(false);
            }
        };
        document.head.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [instanceUrl, region]);

    return (
        <div className="relative w-full h-full bg-slate-900 flex flex-col overflow-hidden">
            {/* CCP Area */}
            <div ref={containerRef} className="flex-1 w-full bg-transparent" />

            {/* Loading Overlay */}
            {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm z-50">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <span className="text-[10px] text-blue-200/50 uppercase tracking-[0.2em] font-bold">
                            Initializing CCP
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CCPContainer;
