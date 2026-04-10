import os
import bs4

d = r'D:\新建文件夹\stitch_duplicate_of'
out = []
for fld in os.listdir(d):
    path = os.path.join(d, fld)
    if os.path.isdir(path):
        html_file = os.path.join(path, 'code.html')
        img_file = os.path.join(path, 'screen.png')
        title = 'No Title'
        if os.path.exists(html_file):
            try:
                with open(html_file, encoding='utf-8') as f:
                    soup = bs4.BeautifulSoup(f.read(), 'html.parser')
                    if soup.title and soup.title.string:
                        title = soup.title.string.strip()
                    elif soup.find('h1'):
                        title = soup.find('h1').text.strip()
            except Exception:
                pass
        
        img_uri = img_file.replace('\\', '/')
        out.append(f'- **{fld}**: {title} (![img](file:///{img_uri}))')

with open(r'd:\learn\个人发展\学业发展\毕设\系统\pet-shop-wechat\pages-map.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
