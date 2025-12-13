"use client";

import { useState, useEffect, createContext, useContext } from "react";

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
    // Since we can't reliably detect if app is installed from browser,
    // and universal links don't work when clicking from within Safari,
    // just go directly to the App Store. Users with the app can scan
    // the QR code again to open it properly.
    window.location.href = APP_STORE_URL;
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
          <div style={{ color: '#9ca3af', fontSize: 12 }}>Get the full experience</div>
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
          Get the App
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
