import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html') and f != 'index.html']

for html_file in html_files:
    basename = os.path.splitext(html_file)[0]
    
    with open(html_file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    changed = False
    
    # 1. Update CSS
    style_pattern = re.compile(r'<style[^>]*>(.*?)</style>', re.DOTALL)
    style_match = style_pattern.search(html)
    has_inline_style = bool(style_match)
    
    if has_inline_style:
        css_content = style_match.group(1).strip()
        if css_content:
            with open(f'css/{basename}.css', 'w', encoding='utf-8') as f:
                f.write(css_content)
        html = style_pattern.sub('', html)
        changed = True

    # Update style.css to shared.css
    if 'css/style.css' in html:
        html = html.replace('css/style.css', 'css/shared.css')
        changed = True
        
        # Add specific css link
        if has_inline_style or basename in ['projects', 'o_cos']:
            html = html.replace('<link rel="stylesheet" href="css/shared.css">', 
                              f'<link rel="stylesheet" href="css/shared.css">\n    <link rel="stylesheet" href="css/{basename}.css">')

    # 2. Update JS
    needs_specific_js = False
    js_content = ""
    
    uses_ocos = '<script src="js/o_cos.js"></script>' in html
    if uses_ocos:
        html = html.replace('<script src="js/o_cos.js"></script>', '')
        changed = True
        if basename != 'o_cos':
            with open('js/o_cos.js', 'r', encoding='utf-8') as f:
                js_content += f.read() + "\n\n"
            needs_specific_js = True

    # Check inline script at the end
    script_pattern = re.compile(r'<script>(.*?)</script>', re.DOTALL)
    script_matches = script_pattern.findall(html)
    
    for script_content in script_matches:
        if script_content.strip():
            js_content += script_content.strip() + "\n\n"
            needs_specific_js = True
            
    html = script_pattern.sub('', html)
    if script_matches:
        changed = True

    if needs_specific_js:
        with open(f'js/{basename}.js', 'w', encoding='utf-8') as f:
            f.write(js_content)
            
    if changed:
        script_tags = '    <script src="js/shared.js"></script>\n'
        if needs_specific_js or basename in ['projects', 'o_cos']:
            script_tags += f'    <script src="js/{basename}.js"></script>\n'
            
        html = html.replace('</body>', f'{script_tags}</body>')
        
        # Clean up empty lines created by removing tags
        html = re.sub(r'\n\s*\n\s*\n', '\n\n', html)
        
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html)
            
print("Refactoring complete.")
