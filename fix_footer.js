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

const footerRegex = /<li><a href="services\.html" class="text-\[14px\] text-white\/80 hover:text-white transition-colors">\s*Services\s*<i data-lucide="chevron-down" class="w-3 h-3"><\/i>\s*<\/a><\/li>/g;
const replacement = '<li><a href="services.html" class="text-[14px] text-white/80 hover:text-white transition-colors">Services</a></li>';

let count = 0;
walkDir('.', function(filePath) {
    if (filePath.includes('node_modules')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.match(footerRegex)) {
        content = content.replace(footerRegex, replacement);
        fs.writeFileSync(filePath, content);
        count++;
    }
});
console.log('Fixed footer Services link in ' + count + ' HTML files.');
