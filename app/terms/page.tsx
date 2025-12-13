import fs from 'fs';
import path from 'path';

export default function TermsPage() {
  const htmlPath = path.join(process.cwd(), 'terms.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

