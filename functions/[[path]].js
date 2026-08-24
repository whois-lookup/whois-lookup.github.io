export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // 1. استخراج اسم النطاق من الرابط مثل: /domain/google.com أو ?domain=google.com
  let domain = url.searchParams.get('domain') || url.searchParams.get('q');
  
  if (!domain) {
    const parts = url.pathname.split('/').filter(Boolean);
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'domain' && parts[i + 1]) {
        domain = parts[i + 1];
        break;
      }
      if (parts[i].includes('.') && !parts[i].endsWith('.html') && !parts[i].endsWith('.js') && !parts[i].endsWith('.css') && !parts[i].endsWith('.ico')) {
        domain = parts[i];
        break;
      }
    }
  }

  // 2. جلب صفحة الـ HTML الأساسية
  const response = await next();

  // إذا كانت الصفحة الرئيسية (بدون نطاق)، أرجع الصفحة الأصلية
  if (!domain) return response;

  domain = domain.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split('?')[0];
  const tld = domain.split('.').pop().toUpperCase();

  // 🎯 3. صياغة العنوان والوصف الحقيقيين في السيرفر (Server-Side)
  const dynamicTitle = `${domain} WHOIS Lookup, DNS Records & Expiration Date`;
  const dynamicDesc = `Detailed WHOIS lookup report for ${domain} (.${tld}). Check registration dates, server IP routing, nameservers, SSL security, and estimated valuation.`;
  const canonicalUrl = `${url.origin}/domain/${domain}`;

  // ⚡ 4. حقن التاجات في الـ HTML الخام قبل إرسالها لأداة الفحص أو روبوت جوجل
  return new HTMLRewriter()
    .on('title', {
      element(e) { e.setInnerContent(dynamicTitle); }
    })
    .on('meta[name="description"]', {
      element(e) { e.setAttribute('content', dynamicDesc); }
    })
    .on('meta[property="og:title"]', {
      element(e) { e.setAttribute('content', dynamicTitle); }
    })
    .on('meta[property="og:description"]', {
      element(e) { e.setAttribute('content', dynamicDesc); }
    })
    .on('meta[property="og:url"]', {
      element(e) { e.setAttribute('content', canonicalUrl); }
    })
    .on('meta[name="twitter:title"]', {
      element(e) { e.setAttribute('content', dynamicTitle); }
    })
    .on('meta[name="twitter:description"]', {
      element(e) { e.setAttribute('content', dynamicDesc); }
    })
    .on('link[rel="canonical"]', {
      element(e) { e.setAttribute('href', canonicalUrl); }
    })
    .transform(response);
}
