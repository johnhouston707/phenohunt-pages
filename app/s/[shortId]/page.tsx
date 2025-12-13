"use client";
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ShortUrlPage() {
  const params = useParams();
  const shortId = params.shortId as string;
  
  useEffect(() => {
    // Redirect to the static HTML with the path preserved
    window.location.href = `/s.html`;
  }, [shortId]);
  
  return <div style={{ background: '#1a1a2e', minHeight: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
}
