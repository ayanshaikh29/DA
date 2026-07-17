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

const oldChevronButtonRegex = /<button type="button" onclick="event\.stopPropagation\(\);event\.preventDefault\(\);toggleMobileServices\(\)" aria-label="Toggle Services submenu">\s*<i data-lucide="chevron-down"[^>]*id="mobile-services-chevron"[^>]*><\/i>\s*<\/button>/g;

const newChevronButton = `<button type="button" onclick="event.stopPropagation();event.preventDefault();toggleMobileServices()" aria-label="Toggle Services submenu" style="background:transparent; border:none; padding:8px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">
    <svg id="mobile-services-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s ease;">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
</button>`;

let count = 0;
walkDir('.', function(filePath) {
    if (filePath.includes('node_modules')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.match(oldChevronButtonRegex)) {
        content = content.replace(oldChevronButtonRegex, newChevronButton);
        fs.writeFileSync(filePath, content);
        count++;
    }
});
console.log('Replaced mobile services chevron in ' + count + ' HTML files.');
