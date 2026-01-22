import { useEffect, useState } from 'react';

/**
 * Interface for the LivePerson Tag object.
 * Note: This is specific to the Agent Workspace Widget SDK.
 */
interface LpTag {
  agentSDK: {
    init: (config?: any) => void;
    bind: (
      key: string,
      callback: (data: any) => void,
      notifyWhenDone?: (err: any) => void
    ) => void;
    command: (
      cmdName: string,
      cmdData: any,
      callback?: (err: any) => void
    ) => void;
  };
}

declare global {
  interface Window {
    lpTag?: LpTag;
  }
}

/**
 * Hook to interact with the LivePerson Agent SDK.
 * 
 * @returns {Object} valid - boolean indicating if the SDK is available and initialized.
 * @returns {Object} sdk - direct access to the agentSDK object.
 */
export const useLPTag = () => {
  const [valid, setValid] = useState(false);

  useEffect(() => {
    // Check if running inside LivePerson environment
    if (typeof window !== 'undefined' && window.lpTag && window.lpTag.agentSDK) {
      try {
        window.lpTag.agentSDK.init();
        setValid(true);
        console.log('LivePerson Agent SDK initialized');
      } catch (error) {
        console.error('Failed to initialize LivePerson SDK:', error);
      }
    } else {
        // Development fallback or warning
        console.warn('LivePerson SDK not found (window.lpTag undefined). Implementation might be mocked.');
    }
  }, []);

  /**
   * Wrapper to bind to SDK events safely.
   * @param {string} key - The data key to bind to (e.g., 'visitorInfo').
   * @param {Function} callback - Function to handle the update.
   */
  const bindEntity = (key: string, callback: (data: any) => void) => {
    if (valid && window.lpTag) {
        window.lpTag.agentSDK.bind(key, callback);
    }
  };

  return {
    valid,
    bindEntity,
    sdk: typeof window !== 'undefined' ? window.lpTag?.agentSDK : null
  };
};
