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

// This will match the single-line or multi-line without chevron
const footerRegexNoChevron = /<li>\s*<a href="services\.html" class="text-\[14px\] text-white\/80 hover:text-white transition-colors">\s*Services\s*<\/a>\s*<\/li>/g;

// Also match the one with chevron in case any were missed by the previous script (e.g. multi-line)
const footerRegexWithChevron = /<li>\s*<a href="services\.html" class="text-\[14px\] text-white\/80 hover:text-white transition-colors">\s*Services\s*<i data-lucide="chevron-down" class="w-3 h-3"><\/i>\s*<\/a>\s*<\/li>/g;

const replacement = `<li><a href="services.html" class="text-[14px] text-white/80 hover:text-white transition-colors" style="display:inline-flex; align-items:center; gap:4px;">Services <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg></a></li>`;

let count = 0;
walkDir('.', function(filePath) {
    if (filePath.includes('node_modules')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    let matched = false;
    if (content.match(footerRegexNoChevron)) {
        content = content.replace(footerRegexNoChevron, replacement);
        matched = true;
    }
    if (content.match(footerRegexWithChevron)) {
        content = content.replace(footerRegexWithChevron, replacement);
        matched = true;
    }
    
    if (matched) {
        fs.writeFileSync(filePath, content);
        count++;
    }
});
console.log('Added properly styled chevron back to footer Services in ' + count + ' HTML files.');
