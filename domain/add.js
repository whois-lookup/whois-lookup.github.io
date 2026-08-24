/**
 * WHOIS Lookup - Related Domains Auto-Injector
 * URL: https://whois-lookup.github.io/domain/add.js
 */
(function () {
    function initRelatedDomains() {
        // 1. استخراج النطاق الحالي من الصفحة أو الرابط
        var currentDomain = '';
        if (window.CURRENT_DOMAIN) {
            currentDomain = window.CURRENT_DOMAIN;
        } else {
            var fileName = window.location.pathname.split('/').pop() || '';
            if (fileName.endsWith('.html')) {
                var raw = fileName.replace('.html', '');
                var lastHyphen = raw.lastIndexOf('-');
                currentDomain = (lastHyphen !== -1)
                    ? raw.substring(0, lastHyphen) + '.' + raw.substring(lastHyphen + 1)
                    : raw;
            } else {
                var h1 = document.querySelector('h1');
                currentDomain = (h1 && h1.innerText.includes('.')) ? h1.innerText.trim().toLowerCase() : 'google.com';
            }
        }

        var stem = currentDomain.split('.')[0];

        // 2. البحث عن مكان الحقن (قبل الفوتر)
        var main = document.querySelector('main.container') || document.querySelector('main') || document.body;
        var footer = document.querySelector('footer');

        // منع التكرار إذا كان الصندوق موجوداً مسبقاً
        if (document.getElementById('injected-related-card')) return;

        // 3. إنشاء الصندوق بتنسيق CSS مدمج
        var card = document.createElement('div');
        card.id = 'injected-related-card';
        card.className = 'card';
        card.style.cssText = 'background:#ffffff; border:1px solid #cbd5e1; border-radius:12px; padding:1.25rem; margin-top:1.25rem; box-sizing:border-box; font-family:system-ui,-apple-system,sans-serif;';

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; border-bottom:1px solid #f1f5f9; padding-bottom:0.5rem;">
                <h3 style="font-size:1.05rem; font-weight:800; margin:0; color:#0f172a; display:flex; align-items:center; gap:0.5rem;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0052ff" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    Related Domain Names &amp; Extensions
                </h3>
                <span style="font-size:0.75rem; font-weight:700; color:#64748b; background:#f1f5f9; padding:0.2rem 0.5rem; border-radius:6px;">Live Index</span>
            </div>
            <div id="injected-related-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:0.75rem; margin-top:0.75rem;">
                <div style="grid-column:1/-1; text-align:center; padding:1rem; color:#64748b; font-size:0.85rem;">Discovering related domain registry files...</div>
            </div>
        `;

        if (footer && main.contains(footer)) {
            main.insertBefore(card, footer);
        } else {
            main.appendChild(card);
        }

        // 4. توليد النطاقات وعرضها
        loadAndRenderRelated(currentDomain, stem);
    }

    // جلب النطاقات المتوفرة فعلياً في مجلد domain مع بدائل TLD
    async function loadAndRenderRelated(currentDomain, stem) {
        var grid = document.getElementById('injected-related-grid');
        if (!grid) return;

        var domains = [];

        // أ) إضافة بدائل TLD لنفس الاسم
        var extensions = ['.com', '.org', '.net', '.io', '.ai', '.co', '.tech', '.app'];
        extensions.forEach(function (ext) {
            var alt = stem + ext;
            if (alt !== currentDomain && !domains.includes(alt)) {
                domains.push(alt);
            }
        });

        // ب) محاولة قراءة الملفات الحقيقية من مجلد domain عبر GitHub API
        try {
            var res = await fetch('https://api.github.com/repos/whois-lookup/whois-lookup.github.io/contents/domain');
            if (res.ok) {
                var files = await res.json();
                files.forEach(function (f) {
                    if (f.name.endsWith('.html') && f.name !== 'add.js') {
                        var raw = f.name.replace('.html', '');
                        var lastH = raw.lastIndexOf('-');
                        if (lastH !== -1) {
                            var d = raw.substring(0, lastH) + '.' + raw.substring(lastH + 1);
                            if (d !== currentDomain && !domains.includes(d)) {
                                domains.push(d);
                            }
                        }
                    }
                });
            }
        } catch (e) {}

        // خلط النطاقات واختيار 8 عشوائياً
        domains.sort(function () { return 0.5 - Math.random(); });
        var finalSelection = domains.slice(0, 8);

        // رسم البطاقات
        grid.innerHTML = finalSelection.map(function (d) {
            var slug = d.toLowerCase().replace(/\./g, '-') + '.html';
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

    // تشغيل السكربت بمجرد اكتمال قراءة الـ DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRelatedDomains);
    } else {
        initRelatedDomains();
    }
})();
