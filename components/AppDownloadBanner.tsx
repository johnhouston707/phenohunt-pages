"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";

const APP_STORE_URL = "https://apps.apple.com/us/app/phenohunt/id6754624180";
const BANNER_HEIGHT = 61; // px

function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

// Context to share banner state
const BannerContext = createContext({ showBanner: false });
export const useBanner = () => useContext(BannerContext);

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isIOS()) return;
    const wasDismissed = sessionStorage.getItem('app-banner-dismissed');
    if (wasDismissed) return;
    setShowBanner(true);
  }, []);

  return (
    <BannerContext.Provider value={{ showBanner }}>
      <div style={{ paddingTop: showBanner ? BANNER_HEIGHT : 0 }}>
        {children}
      </div>
    </BannerContext.Provider>
  );
}

export default function AppDownloadBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only show on iOS devices
    if (!isIOS()) return;
    
    // Check if user dismissed the banner this session
    const wasDismissed = sessionStorage.getItem('app-banner-dismissed');
    if (wasDismissed) return;
    
    setShow(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem('app-banner-dismissed', 'true');
    window.dispatchEvent(new Event('banner-dismissed'));
  };

  const handleOpenApp = () => {
    // Try to open via custom URL scheme first
    // Extract the path to construct phenohunt:// URL
    // e.g., /tester/TSTR-ABCD1234 -> phenohunt://tester/TSTR-ABCD1234
    const customSchemeUrl = `phenohunt:/${pathname}`;
    
    // Record the time before attempting to open
    const startTime = Date.now();
    
    // Create a hidden iframe to attempt opening the custom URL scheme
    // This avoids the "Cannot Open Page" error that direct navigation causes
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = customSchemeUrl;
    document.body.appendChild(iframe);
    
    // After a short delay, check if we're still here
    // If the app opened, the page will be in the background
    // If not, redirect to App Store
    setTimeout(() => {
      document.body.removeChild(iframe);
      
      // If more than 1.5 seconds passed and we're still on the page,
      // the app probably isn't installed
      if (document.visibilityState !== 'hidden') {
        window.location.href = APP_STORE_URL;
      }
    }, 1500);
    
    // Also listen for visibility change - if page becomes hidden, app opened
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // App opened successfully, clean up
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up listener after timeout regardless
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, 2000);
  };

  if (!show || dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(90deg, #1C1C1E 0%, #2C2C2E 100%)',
      borderBottom: '1px solid #38383A',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      zIndex: 1000,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      height: BANNER_HEIGHT,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <img 
          src="/app-icon.png" 
          alt="Phenohunt" 
          style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Phenohunt</div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>Open in the app</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleOpenApp}
          style={{
            background: '#00A699',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            fontWeight: 600,
            fontSize: 13,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          Open
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6b7280',
            fontSize: 20,
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
