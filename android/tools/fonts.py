# Tải phông chữ của game (Baloo 2, Nunito) về nằm sẵn trong app để không cần mạng.
# Chạy lúc build trên GitHub Actions: python3 android/tools/fonts.py android/app/src/main/assets/www
# Lỗi mạng thì bỏ qua: app vẫn chạy với phông của máy.
import os, re, sys, urllib.request

WWW = sys.argv[1]
UA = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36'
KEEP = {'vietnamese', 'latin', 'latin-ext'}
LINK = re.compile(r'<link rel="stylesheet" href="(https://fonts\.googleapis\.com/css2[^"]+)">')


def get(url):
    req = urllib.request.Request(url.replace('&amp;', '&'), headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def main():
    idx = os.path.join(WWW, 'index.html')
    html = open(idx, encoding='utf8').read()
    m = LINK.search(html)
    if not m:
        print('fonts: không thấy link phông, bỏ qua'); return
    try:
        css = get(m.group(1)).decode('utf8')
        outdir = os.path.join(WWW, 'fonts'); os.makedirs(outdir, exist_ok=True)
        kept, n = [], 0
        for subset, block in re.findall(r'/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{[^}]*\})', css):
            u = re.search(r'url\((https://fonts\.gstatic\.com/[^)]+)\)', block)
            if subset not in KEEP or not u:
                continue
            name = f'f{n:02d}.woff2'; n += 1
            open(os.path.join(outdir, name), 'wb').write(get(u.group(1)))
            kept.append(block.replace(u.group(1), 'fonts/' + name))
        if not n:
            raise RuntimeError('không có phông nào')
        html = html.replace(m.group(0), '<style>\n' + '\n'.join(kept) + '\n</style>')
        open(idx, 'w', encoding='utf8').write(html)
        print(f'fonts: đã gói {n} file phông')
    except Exception as e:
        print('::warning::Không tải được phông chữ, app dùng phông của máy:', e)


if __name__ == '__main__':
    main()
