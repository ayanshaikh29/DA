const fs = require('fs');
const path = require('path');

const mobileCSS = `
/* ===== MOBILE VISIBILITY OVERRIDE ===== */
@media (max-width: 767px) {
    .reveal, .reveal.animate-in,
    .reveal-left, .reveal-left.animate-in,
    .reveal-right, .reveal-right.animate-in,
    .reveal-scale, .reveal-scale.animate-in,
    .reveal-rotate, .reveal-rotate.animate-in,
    .reveal-blur, .reveal-blur.animate-in,
    .glass {
        opacity: 1 !important;
        transform: none !important;
        filter: none !important;
        visibility: visible !important;
        transition: none !important;
    }
    .reveal-stagger > * {
        opacity: 1 !important;
        transform: none !important;
        transition-delay: 0ms !important;
        visibility: visible !important;
    }
    #client-websites-grid {
        grid-template-columns: repeat(2, 1fr) !important;
    }
    #portfolio-showcase .portfolio-masonry {
        display: flex !important;
        flex-direction: column !important;
        height: auto !important;
        gap: 20px !important;
        align-items: center !important;
    }
    #portfolio-showcase .portfolio-card {
        position: relative !important;
        width: 100% !important;
        max-width: 320px !important;
        opacity: 1 !important;
        transform: none !important;
    }
    #portfolio-showcase .portfolio-card--featured {
        width: 100% !important;
        max-width: 320px !important;
        min-height: 280px !important;
    }
}
`;

const filePath = path.join(__dirname, 'web-development.html');
let content = fs.readFileSync(filePath, 'utf8');

// Insert mobile CSS just before the first </style> tag
if (content.includes('</style>')) {
    content = content.replace('</style>', mobileCSS + '</style>');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Mobile CSS injected successfully into web-development.html');
} else {
    console.log('ERROR: Could not find </style> tag');
}
