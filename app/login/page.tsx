"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
         background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; min-height: 100vh; }
  .container { max-width: 400px; margin: 0 auto; padding: 48px 24px; text-align: center; }
  h1 { font-size: 28px; margin-bottom: 32px; }
  input { width: 100%; padding: 14px 16px; border: none; border-radius: 12px; 
          background: rgba(255,255,255,0.1); color: #fff; font-size: 16px; margin-bottom: 16px; }
  input::placeholder { color: #9ca3af; }
  input:focus { outline: 2px solid #00A699; background: rgba(255,255,255,0.15); }
  button { width: 100%; padding: 14px; border: none; border-radius: 12px; 
           background: #00A699; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer; }
  button:hover { background: #008f84; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
  .error { color: #f87171; background: rgba(248,113,113,0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px; }
  .link { color: #00A699; text-decoration: none; }
  .link:hover { text-decoration: underline; }
  p { margin-top: 24px; color: #9ca3af; }
  .loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; color: #9ca3af; }
`;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Password" required />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p>Don&apos;t have an account? <a href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="link">Sign Up</a></p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Suspense fallback={<div className="loading">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </>
  );
}
