import { redirect } from 'next/navigation';

// Redirect to the static HTML file
export default function SupportPage() {
  redirect('/support.html');
}
