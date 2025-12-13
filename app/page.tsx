import { redirect } from 'next/navigation';

// Home page redirects to support
export default function Home() {
  redirect('/support');
}

