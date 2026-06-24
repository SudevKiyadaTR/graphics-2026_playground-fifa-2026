import pw from 'playwright';

(async () => {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage();
  
  let loadedFileContent = null;
  
  // Intercept the file request
  page.on('response', async (response) => {
    if (response.url().includes('/data/matches.json')) {
      try {
        const json = await response.json();
        loadedFileContent = json;
        console.log('Matches.json loaded:', json.length, 'total matches');
        console.log('With null scores:', json.filter(m => m.homeScore === null || m.awayScore === null).length);
      } catch (e) {
        console.log('Could not parse response');
      }
    }
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
