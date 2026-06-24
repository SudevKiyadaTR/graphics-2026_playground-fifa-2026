import pw from 'playwright';

(async () => {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage();
  
  let matchesData = null;
  
  page.on('response', async (response) => {
    if (response.url().includes('/data/matches.json')) {
      try {
        const json = await response.json();
        matchesData = json;
      } catch (e) {}
    }
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  if (matchesData) {
    const tbdCount = matchesData.filter(m => m.homeScore === null || m.awayScore === null).length;
    console.log('Total matches loaded:', matchesData.length);
    console.log('TBD matches:', tbdCount);
    console.log('Completed matches:', matchesData.filter(m => m.homeScore !== null && m.awayScore !== null).length);
  }
  
  // Get actual table rows
  const tableRows = await page.evaluate(() => {
    return document.querySelectorAll('tbody tr').length;
  });
  
  console.log('Table rows visible:', tableRows);
  
  await browser.close();
})();
