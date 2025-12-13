import fs from 'fs';
import path from 'path';

export default function SupportPage() {
  // Read the original HTML file and render it
  const htmlPath = path.join(process.cwd(), 'support.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

