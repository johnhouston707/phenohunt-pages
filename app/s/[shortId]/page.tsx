import fs from 'fs';
import path from 'path';

export default function ShortUrlPage() {
  const htmlPath = path.join(process.cwd(), 's.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

