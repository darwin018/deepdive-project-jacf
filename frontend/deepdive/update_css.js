const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'src', 'css');
const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

const colorMap = {
    '#0B0B0B': '#FAFAFA',
    '#111111': '#F5F5F5',
    '#1C1C1C': '#FFFFFF',
    '#2A2A2A': '#FEEE91',
    '#3A3A3A': '#E5E7EB',
    '#B5B5B5': '#6B7280',
    '#CCCCCC': '#6B7280',
    '#EF4444': '#FF5656',
    'rgba(0, 210, 190,': 'rgba(255, 162, 57,'
};

const buttonClasses = [
    /(\.heroButton[^{]*\{)([^}]+)(\})/g,
    /(\.addToCartBtn[^{]*\{)([^}]+)(\})/g,
    /(\.offerButton[^{]*\{)([^}]+)(\})/g,
    /(\.checkoutButton[^{]*\{)([^}]+)(\})/g,
    /(\.finalCheckoutButton[^{]*\{)([^}]+)(\})/g,
    /(\.viewBtn[^{]*\{)([^}]+)(\})/g,
    /(\.submitButton[^{]*\{)([^}]+)(\})/g
];

for (const file of files) {
    const filePath = path.join(cssDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Base colors
    for (const [oldC, newC] of Object.entries(colorMap)) {
        content = content.replace(new RegExp(oldC, 'gi'), newC);
    }
    
    // 2. White text to dark charcoal
    content = content.replace(/color:\s*#FFFFFF/gi, 'color: #1F2937');
    content = content.replace(/color:\s*white/gi, 'color: #1F2937');

    // 3. Default Teal mapping
    content = content.replace(/#00D2BE/gi, '#FFA239');
    content = content.replace(/#00B3A4/gi, '#E68924');

    // 4. Fix specific button classes
    for (const btnPattern of buttonClasses) {
        content = content.replace(btnPattern, (match, p1, p2, p3) => {
            let inner = p2;
            inner = inner.replace(/#FFA239/gi, '#FF5656');
            inner = inner.replace(/#E68924/gi, '#E04444');
            inner = inner.replace(/color:\s*#1F2937/gi, 'color: #FFFFFF');
            inner = inner.replace(/color:\s*#[0-9a-fA-F]{6}/gi, 'color: #FFFFFF');
            return p1 + inner + p3;
        });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
}

console.log('Processed ' + files.length + ' files successfully.');
