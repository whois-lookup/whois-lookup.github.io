import os

with open('template.html', 'r', encoding='utf-8') as f:
    template = f.read()

if not os.path.exists('domains.txt'):
    print("domains.txt not found!")
    exit()

with open('domains.txt', 'r', encoding='utf-8') as f:
    domains = [line.strip().lower() for line in f if line.strip()]

for domain in domains:
    # 1. ضبط الـ Title ليناسب السيو (أقل من 60 حرفاً)
    title = f"{domain} WHOIS Lookup & DNS Records [Full Audit]"
    
    # 2. ضبط الـ Meta Description (بين 140 و 155 حرفاً)
    desc = f"Get live {domain} WHOIS data, active DNS lookup, and domain review. Check hosting provider, nameservers, SPF email security, and SSL health status."

    # استبدال المتغيرات في القالب
    page_html = template.replace('{{DOMAIN}}', domain)
    page_html = page_html.replace('{{TITLE}}', title)
    page_html = page_html.replace('{{DESCRIPTION}}', desc)

    # حفظ الصفحة في المسار المطلوب /domain/domain-name/index.html
    folder_path = os.path.join('domain', domain)
    os.makedirs(folder_path, exist_ok=True)
    
    with open(os.path.join(folder_path, 'index.html'), 'w', encoding='utf-8') as out:
        out.write(page_html)

print(f"Successfully generated {len(domains)} static domain pages!")
