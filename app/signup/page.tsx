"use client";
import { useState } from "react";
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
`;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } }
      });
      if (error) throw error;
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="container">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display Name" required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)" required minLength={6} />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p>Already have an account? <a href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="link">Sign In</a></p>
      </div>
    </>
  );
}

