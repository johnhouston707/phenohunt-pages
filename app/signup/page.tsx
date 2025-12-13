"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; 
    background-color: #000;
    color: #fff; 
    min-height: 100vh;
  }
  .container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    padding-top: 80px;
  }
  .card {
    width: 100%;
    max-width: 380px;
  }
  .logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }
  .logo {
    height: 120px;
    width: auto;
  }
  .subtitle {
    text-align: center;
    color: rgba(255,255,255,0.6);
    font-size: 15px;
    margin-bottom: 40px;
  }
  .field-group {
    margin-bottom: 16px;
  }
  .field-label {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
    margin-bottom: 6px;
    display: block;
  }
  .input {
    width: 100%;
    padding: 12px 14px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    color: #fff;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s ease;
  }
  .input::placeholder {
    color: rgba(255,255,255,0.35);
  }
  .input:focus {
    border-color: rgba(255,255,255,0.4);
  }
  .error {
    color: #FF453A;
    font-size: 13px;
    text-align: center;
    margin: 12px 0;
  }
  .primary-btn {
    width: 100%;
    padding: 14px 20px;
    background: #34C759;
    border: none;
    border-radius: 12px;
    color: #fff;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;
    margin-top: 8px;
    margin-bottom: 12px;
  }
  .primary-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  .primary-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .oauth-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
  }
  .apple-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 50px;
    padding: 0 20px;
    background: #fff;
    border: none;
    border-radius: 12px;
    color: #000;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }
  .apple-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  .apple-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .apple-icon {
    width: 18px;
    height: 22px;
  }
  .google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    height: 50px;
    padding: 0 20px;
    background: #fff;
    border: 1px solid #DADCE0;
    border-radius: 12px;
    color: #3C4043;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .google-btn:hover:not(:disabled) {
    background: #F8F9FA;
  }
  .google-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .google-icon {
    width: 20px;
    height: 20px;
  }
  .toggle-link {
    text-align: center;
    margin-top: 8px;
  }
  .toggle-link a {
    color: #007AFF;
    text-decoration: none;
    font-size: 13px;
  }
  .toggle-link a:hover {
    text-decoration: underline;
  }
  .spinner-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
  }
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: #34C759;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  const isFormValid = email.includes("@") && password.length >= 6 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError(null);
    setIsLoading(true);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) throw error;
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setError(null);
    setIsOAuthLoading(provider);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });
      
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to sign up with ${provider}`);
      setIsOAuthLoading(null);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="container">
        <div className="card">
          {/* Logo */}
          <div className="logo-container">
            <img src="/app-icon.png" alt="Phenohunt" className="logo" />
          </div>
          
          <p className="subtitle">Create your account</p>
          
          {/* Email Field */}
          <div className="field-group">
            <label className="field-label">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              className="input"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          
          {/* Password Field */}
          <div className="field-group">
            <label className="field-label">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" 
              className="input"
            />
          </div>
          
          {/* Confirm Password Field */}
          <div className="field-group">
            <label className="field-label">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password" 
              className="input"
            />
          </div>
          
          {error && <p className="error">{error}</p>}
          
          {/* Create Account Button */}
          <button 
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid || isOAuthLoading !== null}
            className="primary-btn"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
          
          {/* OAuth Buttons */}
          <div className="oauth-section">
            {/* Apple */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn("apple")}
              disabled={isOAuthLoading !== null || isLoading}
              className="apple-btn"
            >
              <svg className="apple-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              {isOAuthLoading === "apple" ? "Signing up..." : "Sign up with Apple"}
            </button>
            
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isOAuthLoading !== null || isLoading}
              className="google-btn"
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isOAuthLoading === "google" ? "Signing up..." : "Sign up with Google"}
            </button>
          </div>

          <div className="toggle-link">
            <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`}>
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      </>
    }>
      <SignupForm />
    </Suspense>
  );
}
