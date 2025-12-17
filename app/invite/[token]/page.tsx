"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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
    margin-bottom: 24px;
  }
  .logo-icon {
    width: 96px;
    height: 96px;
    border-radius: 24px;
    margin: 0 auto;
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
    background: #000;
    color: #fff;
    border: 1px solid #fff;
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
  .button-secondary {
    background: transparent;
    color: #9ca3af;
    border: 1px solid rgba(255,255,255,0.2);
    padding: 14px 28px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    max-width: 280px;
    margin-bottom: 16px;
    text-decoration: none;
    display: inline-block;
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
  .button-secondary:hover {
    transform: scale(1.02);
    border-color: rgba(255,255,255,0.4);
  }
  .open-app-text {
    color: #6b7280;
    font-size: 14px;
    margin-top: 24px;
  }
`;

export default function InvitePage() {
  const params = useParams();
  const inviteToken = params.token as string;
  const [isOnIOS, setIsOnIOS] = useState(false);

  useEffect(() => {
    setIsOnIOS(isIOS());
  }, []);

  // The Universal Link URL - this is what should open in the app
  const universalLink = `https://app.phenohunt.com/invite/${inviteToken}`;
  
  // Custom URL scheme as fallback
  const customSchemeUrl = `phenohunt://invite/${inviteToken}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="container">
        <div className="logo-container">
          <img 
            src="https://app.phenohunt.com/app-icon.png" 
            alt="Phenohunt" 
            className="logo-icon"
          />
        </div>
        
        <h1>You&apos;ve been invited!</h1>
        <p className="subtitle">Someone invited you to collaborate on a Phenohunt</p>
        
        <div className="invite-box">
          <p className="invite-text">
            Tap the button below to accept this invitation in the Phenohunt app.
          </p>
          <p className="invite-subtext">
            You&apos;ll need a Phenohunt account to collaborate.
          </p>
        </div>
        
        {isOnIOS ? (
          <>
            <a href={customSchemeUrl} className="button-primary">
              Open in Phenohunt
            </a>
            <br />
            <a href={APP_STORE_URL} className="button-secondary">
              Get the App
            </a>
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
    </>
  );
}
