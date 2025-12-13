import fs from 'fs';
import path from 'path';

export default function PrivacyPage() {
  const htmlPath = path.join(process.cwd(), 'privacy.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

