import fs from 'fs';
import path from 'path';

export default function PhenoPage() {
  const htmlPath = path.join(process.cwd(), 'p.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

