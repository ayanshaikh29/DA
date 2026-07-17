const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            if (dirPath.endsWith('.html')) {
                callback(dirPath);
            }
        }
    });
}

const svgIcon = `<svg id="menu-icon" class="w-6 h-6" style="color:#000;display:block;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>`;
const closeIconInner = `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`;
const menuIconInner = `<line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line>`;

const oldFuncRegex = /function toggleMobileMenu\(\)\s*\{\s*var menu = document\.getElementById\('mobile-menu'\);\s*if \(\!menu\) return;\s*menu\.classList\.toggle\('open'\);\s*\}/g;

const newFunc = `function toggleMobileMenu() {
  var menu = document.getElementById('mobile-menu');
  var icon = document.getElementById('menu-icon');
  if (!menu) return;
  var isOpen = menu.classList.toggle('open');
  if (icon && icon.tagName.toLowerCase() === 'svg') {
    icon.innerHTML = isOpen ? '${closeIconInner}' : '${menuIconInner}';
  }
}`;

let count = 0;
walkDir('.', function(filePath) {
    if (filePath.includes('node_modules')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Replace lucide unpkg CDN
    content = content.replace(/https:\/\/unpkg\.com\/lucide@0\.395\.0(?!.*?umd)/g, 'js/lucide.min.js');
    
    // 2. Replace hamburger icon
    content = content.replace(/<i data-lucide="menu" id="menu-icon"[^>]*><\/i>/g, svgIcon);
    
    // 3. Replace inline function
    content = content.replace(oldFuncRegex, newFunc);
    
    fs.writeFileSync(filePath, content);
    count++;
});
console.log('Processed ' + count + ' HTML files.');
