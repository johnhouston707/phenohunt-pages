import fs from 'fs';
import path from 'path';

export default function SetupPage() {
  const htmlPath = path.join(process.cwd(), 'setup.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

