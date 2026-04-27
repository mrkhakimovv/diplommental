import fs from 'fs';

async function fetchBg() {
    try {
        const response = await fetch('https://en.wikipedia.org/w/api.php?action=query&titles=Emblem_of_Uzbekistan&prop=pageimages&format=json&pithumbsize=600');
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const imageUrl = pages[pageId].thumbnail.source;
        console.log('Found image URL:', imageUrl);
        
        const imgResponse = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const arrayBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const outPath = 'src/assets/coatOfArms.ts';
        fs.mkdirSync('src/assets', { recursive: true });
        fs.writeFileSync(outPath, `export const coatOfArmsBase64 = "data:image/png;base64,${base64}";\n`);
        console.log('SUCCESS');
    } catch (e) {
        console.error('ERROR', e);
    }
}
fetchBg();
