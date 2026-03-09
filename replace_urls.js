const fs = require('fs');
const path = require('path');
const dir = path.join('d:', 'deepdive-project', 'frontend', 'deepdive', 'src', 'Components');
let count = 0;
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(/http:\/\/localhost:8000/g, 'https://demoapp-50039367885.development.catalystappsail.in')
                              .replace(/http:\/\/127\.0\.0\.1:8000/g, 'https://demoapp-50039367885.development.catalystappsail.in');
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      count++;
      console.log('Updated ' + file);
    }
  }
});
console.log('Total updated: ' + count);
