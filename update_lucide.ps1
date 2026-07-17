Get-ChildItem -Path '.' -Filter '*.html' -Recurse | ForEach-Object {
    $content = Get-Content -Raw -Path $_.FullName
    
    # 1. Replace lucide CDN
    $content = $content -replace 'https://unpkg\.com/lucide@0\.395\.0(?!/dist/umd/lucide\.js)', 'js/lucide.min.js'
    
    # 2. Replace the hamburger icon
    # Note: Using regex to match the exact <i> tag
    $oldIcon = '<i data-lucide="menu" id="menu-icon" class="w-6 h-6" style="color:#000;display:block;"></i>'
    $newIcon = '<svg id="menu-icon" class="w-6 h-6" style="color:#000;display:block;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line class="top-line" x1="4" y1="6" x2="20" y2="6"></line><line class="mid-line" x1="4" y1="12" x2="20" y2="12"></line><line class="bot-line" x1="4" y1="18" x2="20" y2="18"></line></svg>'
    $content = $content -replace [regex]::Escape($oldIcon), $newIcon

    # 3. Replace inline toggleMobileMenu function
    $oldFunc = 'function toggleMobileMenu\(\) \{\s*var menu = document\.getElementById\(''mobile-menu''\);\s*if \(\!menu\) return;\s*menu\.classList\.toggle\(''open''\);\s*\}'
    $newFunc = "function toggleMobileMenu() {
  var menu = document.getElementById('mobile-menu');
  var icon = document.getElementById('menu-icon');
  if (!menu) return;
  var isOpen = menu.classList.toggle('open');
  if (icon && icon.tagName.toLowerCase() === 'svg') {
    if (isOpen) {
      icon.innerHTML = '<line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line>';
    } else {
      icon.innerHTML = '<line class=\"top-line\" x1=\"4\" y1=\"6\" x2=\"20\" y2=\"6\"></line><line class=\"mid-line\" x1=\"4\" y1=\"12\" x2=\"20\" y2=\"12\"></line><line class=\"bot-line\" x1=\"4\" y1=\"18\" x2=\"20\" y2=\"18\"></line>';
    }
  }
}"
    $content = [regex]::Replace($content, $oldFunc, $newFunc)

    Set-Content -Path $_.FullName -Value $content
}
