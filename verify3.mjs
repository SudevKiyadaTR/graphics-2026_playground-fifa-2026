import pw from 'playwright';

(async () => {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Get the actual data in the Observable cells
  const cellData = await page.evaluate(() => {
    // Look for the matches variable
    if (typeof matches !== 'undefined') {
      return {
        totalMatches: matches.length,
        withScores: matches.filter(m => m.homeScore !== null && m.awayScore !== null).length,
        withoutScores: matches.filter(m => m.homeScore === null || m.awayScore === null).length,
        sampleNullScores: matches.filter(m => m.homeScore === null || m.awayScore === null).slice(0, 2).map(m => ({ home: m.homeTeam, away: m.awayTeam }))
      };
    }
    return { error: 'matches not found in window' };
  });
  
  console.log(JSON.stringify(cellData, null, 2));
  
  await browser.close();
})();
