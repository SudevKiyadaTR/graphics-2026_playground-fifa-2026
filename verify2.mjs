import pw from 'playwright';

(async () => {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Scroll to see more
  await page.evaluate(() => window.scrollBy(0, 5000));
  await page.waitForTimeout(1000);
  
  // Get all rows
  const allRows = await page.evaluate(() => {
    const rows = document.querySelectorAll('tbody tr');
    return Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td');
      return Array.from(cells).map(c => c.textContent.trim());
    });
  });
  
  console.log('Total rows:', allRows.length);
  
  // Find TBD rows
  const tbdRows = allRows.filter(row => row.some(cell => cell.includes('TBD')));
  console.log('TBD rows found:', tbdRows.length);
  console.log('Sample TBD rows:', tbdRows.slice(0, 3));
  
  // Get total rows count
  const totalRowsInTable = await page.evaluate(() => {
    return document.querySelectorAll('tbody tr').length;
  });
  console.log('Rows visible in table:', totalRowsInTable);
  
  await browser.close();
})();
