"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AppDownloadBanner from "@/components/AppDownloadBanner";

const APP_STORE_URL = "https://apps.apple.com/us/app/phenohunt/id6754624180";

// Check if running on iOS
function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
    background: #000; 
    color: #fff; 
    min-height: 100vh; 
  }
  .container { 
    max-width: 500px; 
    margin: 0 auto; 
    padding: 48px 24px; 
    text-align: center; 
  }
  .logo-container {
    margin-bottom: 32px;
  }
  .logo-icon {
    width: 96px;
    height: 96px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 24px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
  }
  h1 { 
    font-size: 28px; 
    font-weight: 700;
    margin-bottom: 12px; 
  }
  .subtitle {
    color: #9ca3af;
    font-size: 16px;
    margin-bottom: 32px;
  }
  .invite-box {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
  }
  .invite-text {
    font-size: 18px;
    line-height: 1.5;
    margin-bottom: 8px;
  }
  .invite-subtext {
    color: #9ca3af;
    font-size: 14px;
  }
  .button-primary {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #fff;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    max-width: 280px;
    margin-bottom: 16px;
    text-decoration: none;
    display: inline-block;
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
  .button-primary:hover {
    transform: scale(1.02);
  }
  .button-primary:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
  .open-app-text {
    color: #6b7280;
    font-size: 14px;
  }
  .loading { 
    text-align: center; 
    padding: 48px; 
    color: #9ca3af; 
  }
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: #10b981;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default function InvitePage() {
  const params = useParams();
  const inviteToken = params.token as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isOnIOS, setIsOnIOS] = useState(false);

  useEffect(() => {
    const onIOS = isIOS();
    setIsOnIOS(onIOS);
    
    if (onIOS) {
      // Try to open the app with the invite URL
      const appUrl = `phenohunt://invite/${inviteToken}`;
      
      // Set a timeout to redirect to App Store if app doesn't open
      const timeout = setTimeout(() => {
        window.location.href = APP_STORE_URL;
      }, 1500);
      
      // Try to open the app
      window.location.href = appUrl;
      
      // If the page is still visible after a short delay, the app didn't open
      const visibilityHandler = () => {
        if (document.hidden) {
          // App opened, clear the timeout
          clearTimeout(timeout);
        }
      };
      
      document.addEventListener("visibilitychange", visibilityHandler);
      
      return () => {
        clearTimeout(timeout);
        document.removeEventListener("visibilitychange", visibilityHandler);
      };
    } else {
      // Not on iOS, show the download page
      setIsLoading(false);
    }
  }, [inviteToken]);

  if (isLoading && isOnIOS) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="container">
          <div className="spinner"></div>
          <p style={{ color: '#9ca3af' }}>Opening Phenohunt...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="container">
        <div className="logo-container">
          <div className="logo-icon">🌱</div>
        </div>
        
        <h1>You&apos;ve been invited!</h1>
        <p className="subtitle">Someone invited you to collaborate on a Phenohunt</p>
        
        <div className="invite-box">
          <p className="invite-text">
            Open this link in the Phenohunt app to accept the invitation.
          </p>
          <p className="invite-subtext">
            You&apos;ll need a Phenohunt account to collaborate.
          </p>
        </div>
        
        {isOnIOS ? (
          <>
            <a href={APP_STORE_URL} className="button-primary">
              Get Phenohunt on the App Store
            </a>
            <p className="open-app-text">
              Already have Phenohunt?{" "}
              <a 
                href={`phenohunt://invite/${inviteToken}`} 
                style={{ color: '#10b981', textDecoration: 'none' }}
              >
                Open in app
              </a>
            </p>
          </>
        ) : (
          <>
            <a href={APP_STORE_URL} className="button-primary">
              Download Phenohunt for iOS
            </a>
            <p className="open-app-text">
              Phenohunt is currently available for iPhone and iPad.
            </p>
          </>
        )}
      </div>
      
      <AppDownloadBanner />
    </>
  );
}

