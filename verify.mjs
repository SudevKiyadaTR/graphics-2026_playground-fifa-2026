import pw from 'playwright';

(async () => {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Get the table content
  const tableContent = await page.evaluate(() => {
    const rows = document.querySelectorAll('tbody tr');
    return Array.from(rows).slice(0, 10).map(row => {
      const cells = row.querySelectorAll('td');
      return {
        date: cells[0]?.textContent.trim(),
        match: cells[1]?.textContent.trim(),
        score: cells[2]?.textContent.trim(),
        stage: cells[3]?.textContent.trim()
      };
    });
  });
  
  console.log('First 10 rows:');
  console.log(JSON.stringify(tableContent, null, 2));
  
  // Count TBD matches visible
  const tbdCount = await page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll('tbody td'));
    return cells.filter(cell => cell.textContent.includes('TBD')).length;
  });
  
  console.log('\nTBD matches visible:', tbdCount);
  
  await browser.close();
})();
