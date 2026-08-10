import { OrgSettings } from '../types';

export function setMetaTag(selector: string, attribute: 'content' | 'href', value: string) {
  let element = document.querySelector(selector) as HTMLElement | null;
  if (element) {
    element.setAttribute(attribute, value);
  } else {
    // Create element if it doesn't exist
    if (selector.startsWith('meta[')) {
      const meta = document.createElement('meta');
      const attrMatch = selector.match(/meta\[(property|name)="([^"]+)"\]/);
      if (attrMatch) {
        meta.setAttribute(attrMatch[1], attrMatch[2]);
        meta.setAttribute('content', value);
        document.head.appendChild(meta);
      }
    } else if (selector.startsWith('link[')) {
      const link = document.createElement('link');
      const relMatch = selector.match(/rel="([^"]+)"/);
      const idMatch = selector.match(/id="([^"]+)"/);
      if (relMatch) link.setAttribute('rel', relMatch[1]);
      if (idMatch) link.setAttribute('id', idMatch[1]);
      link.setAttribute('href', value);
      document.head.appendChild(link);
    }
  }
}

export function updateHeadMetadata(orgSettings: OrgSettings) {
  const defaultTitle = 'Khalifah Student Discipline Management System | มหาวิทยาลัยฟาฏอนี';
  const defaultLogo = 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80';
  
  const appTitle = orgSettings.appName || 'Khalifah System';
  const uniName = orgSettings.university || 'มหาวิทยาลัยฟาฏอนี';
  const fullTitle = `${appTitle} | ${uniName}`;

  const description = `ระบบบันทึกพฤติกรรม เช็คชื่อละหมาด วงฮาลาเกาะฮ์ และการพัฒนาคุณลักษณะนักศึกษา ${uniName} (${orgSettings.programName || 'โปรแกรมห้องเรียนคอลีฟะห์'})`;
  const logoUrl = (orgSettings.logoUrl && orgSettings.logoUrl.trim() !== '') ? orgSettings.logoUrl : defaultLogo;

  // 1. Browser Title
  document.title = fullTitle;

  // 2. Favicon & Apple Touch Icon (Browser Tab Icon)
  setMetaTag('link[id="app-favicon"]', 'href', logoUrl);
  setMetaTag('link[id="app-apple-icon"]', 'href', logoUrl);

  // 3. Open Graph Meta Tags (Social Media Shares - Facebook, LINE, Messenger)
  setMetaTag('meta[name="description"]', 'content', description);
  setMetaTag('meta[property="og:title"]', 'content', fullTitle);
  setMetaTag('meta[property="og:description"]', 'content', description);
  setMetaTag('meta[property="og:image"]', 'content', logoUrl);
  setMetaTag('meta[property="og:site_name"]', 'content', appTitle);

  // 4. Twitter Card Meta Tags
  setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'content', fullTitle);
  setMetaTag('meta[name="twitter:description"]', 'content', description);
  setMetaTag('meta[name="twitter:image"]', 'content', logoUrl);
}
