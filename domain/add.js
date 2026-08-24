/**
 * WHOIS Lookup - Related Domains Auto-Injector
 * File: add.js
 */
(function () {
    // 1. استخراج النطاق الحالي من الصفحة أو الرابط
    function getCurrentDomain() {
        if (window.CURRENT_DOMAIN) return window.CURRENT_DOMAIN;
        
        // استخراج من الرابط مثل /domain/163-com.html
        var path = window.location.pathname.split('/').pop() || '';
        if (path.endsWith('.html')) {
            var raw = path.replace('.html', '');
            var lastHyphen = raw.lastIndexOf('-');
            if (lastHyphen !== -1) {
                return raw.substring(0, lastHyphen) + '.' + raw.substring(lastHyphen + 1);
            }
        }
        
        // استخراج احتياطي من عنوان H1
        var h1 = document.querySelector('h1');
        if (h1 && h1.innerText.includes('.')) {
            return h1.innerText.trim().toLowerCase();
        }

        return 'google.com';
    }

    // 2. تحويل اسم النطاق إلى رابط ملف HTML (مثال: 163.com -> 163-com.html)
    function domainToSlug(domain) {
        return domain.toLowerCase().replace(/\./g, '-') + '.html';
    }

    // 3. توليد واجهة النطاقات ذات الصلة وحقنها في الصفحة
    async function injectRelatedDomains() {
        var currentDomain = getCurrentDomain();
        var stem = currentDomain.split('.')[0];
        var mainContainer = document.querySelector('main.container') || document.querySelector('main') || document.body;

        // إنشاء الصندوق
        var relatedCard = document.createElement('div');
        relatedCard.className = 'card related-domains-card';
        relatedCard.style.cssText = 'background:#ffffff; border:1px solid #cbd5e1; border-radius:12px; padding:1.25rem; margin-top:1.25rem;';

        relatedCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                <h3 style="font-size:1.05rem; font-weight:800; margin:0; color:#0f172a; display:flex; align-items:center; gap:0.5rem;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0052ff" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    Related Domain Names &amp; Extensions
                </h3>
                <span style="font-size:0.75rem; font-weight:700; color:#64748b; background:#f1f5f9; padding:0.2rem 0.5rem; border-radius:6px;">Live Registry Index</span>
            </div>
            <div id="related-grid-box" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:0.75rem;">
                <div style="grid-column:1/-1; text-align:center; padding:1rem; color:#64748b; font-size:0.85rem;">Discovering related domain assets...</div>
            </div>
        `;

        // إدراج الصندوق قبل الفوتر أو في نهاية المحتوى
        var footer = document.querySelector('footer');
        if (footer) {
            mainContainer.insertBefore(relatedCard, footer);
        } else {
            mainContainer.appendChild(relatedCard);
        }

        // جلب النطاقات الحقيقية والبديلة
        var relatedList = await getRelatedList(currentDomain, stem);
        renderRelatedItems(relatedList);
    }

    // 4. دمج النطاقات من مجلد domain مع نطاقات TLD بديلة
    async function getRelatedList(currentDomain, stem) {
        var domains = [];

        // أ) إضافة بدائل TLD لنفس الاسم (مثل .org, .net, .io, .ai)
        var tlds = ['.com', '.org', '.net', '.io', '.ai', '.co', '.tech', '.app'];
        tlds.forEach(function (ext) {
            var alt = stem + ext;
            if (alt !== currentDomain && !domains.includes(alt)) {
                domains.push(alt);
            }
        });

        // ب) محاولة قراءة ملفات حقيقية من الكاش أو مجلد domain
        try {
            var cached = localStorage.getItem('cached_domain_files');
            if (cached) {
                var files = JSON.parse(cached);
                files.forEach(function (f) {
                    var cleanName = f.replace('.html', '');
                    var lastH = cleanName.lastIndexOf('-');
                    if (lastH !== -1) {
                        var d = cleanName.substring(0, lastH) + '.' + cleanName.substring(lastH + 1);
                        if (d !== currentDomain && !domains.includes(d)) {
                            domains.push(d);
                        }
                    }
                });
            }
        } catch (e) {}

        // خلط النطاقات واختيار 8 نطاقات مميزة
        domains.sort(function () { return 0.5 - Math.random(); });
        return domains.slice(0, 8);
    }

    // 5. عرض النطاقات داخل الصندوق بتصميم أنيق
    function renderRelatedItems(list) {
        var grid = document.getElementById('related-grid-box');
        if (!grid) return;

        grid.innerHTML = list.map(function (d) {
            var slug = domainToSlug(d);
            return `
                <a href="/domain/${slug}" style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0.85rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:700; font-size:0.85rem; transition:all 0.2s;" onmouseover="this.style.borderColor='#0052ff';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.transform='none'">
                    <div style="display:flex; align-items:center; gap:0.5rem; overflow:hidden;">
                        <img src="https://www.google.com/s2/favicons?domain=${d}&sz=32" alt="${d}" width="18" height="18" style="border-radius:4px;" loading="lazy" />
                        <span style="white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${d}</span>
                    </div>
                    <span style="color:#0052ff; font-size:0.8rem; margin-left:4px;">&rarr;</span>
                </a>
            `;
        }).join('');
    }

    // تشغيل السكربت تلقائياً بعد اكتمال تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectRelatedDomains);
    } else {
        injectRelatedDomains();
    }
})();
