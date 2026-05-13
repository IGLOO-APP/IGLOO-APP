
const fs = require('fs');
const content = fs.readFileSync('e:/IGLOO/IGLOO-APP/components/messages/ChatWindow.tsx', 'utf8');

let openDivs = 0;
let openSpans = 0;
let openCurly = 0;
let openParen = 0;

const lines = content.split('\n');
lines.forEach((line, i) => {
    const l = line.trim();
    if (l.startsWith('//')) return;
    
    // Simple regex for tags
    const divs = (line.match(/<div/g) || []).length;
    const closedDivs = (line.match(/<\/div>/g) || []).length;
    const selfClosedDivs = (line.match(/<div[^>]*\/>/g) || []).length;
    
    openDivs += divs - closedDivs - selfClosedDivs;
    
    const spans = (line.match(/<span/g) || []).length;
    const closedSpans = (line.match(/<\/span>/g) || []).length;
    const selfClosedSpans = (line.match(/<span[^>]*\/>/g) || []).length;
    
    openSpans += spans - closedSpans - selfClosedSpans;
    
    const curlies = (line.match(/{/g) || []).length;
    const closedCurlies = (line.match(/}/g) || []).length;
    openCurly += curlies - closedCurlies;
    
    if (openDivs < 0 || openSpans < 0 || openCurly < 0) {
        console.log(`Imbalance at line ${i+1}: Divs=${openDivs}, Spans=${openSpans}, Curlies=${openCurly}`);
    }
});

console.log(`Final: Divs=${openDivs}, Spans=${openSpans}, Curlies=${openCurly}`);
