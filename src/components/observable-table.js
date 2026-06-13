export function observableTable(data, Inputs, options = {}) {
  const { columns, format, sort, reverse, rows, wrapperClass, rowHref } = options;

  const tableOptions = {};
  if (columns) tableOptions.columns = columns;
  if (format) tableOptions.format = format;
  if (sort) tableOptions.sort = sort;
  if (typeof reverse === "boolean") tableOptions.reverse = reverse;
  if (typeof rows === "number") tableOptions.rows = rows;
  tableOptions.select = false;

  const table = Inputs.table(data, tableOptions);

  // Add click handlers to table rows if rowHref is provided
  if (rowHref) {
    setTimeout(() => {
      const tbody = table.querySelector("tbody");
      if (tbody) {
        const rows = tbody.querySelectorAll("tr");
        rows.forEach((row, index) => {
          const rowData = data[index];
          if (rowData) {
            const href = rowHref(rowData);
            row.style.cursor = "pointer";
            row.addEventListener("click", () => {
              window.location.href = href;
            });
            row.addEventListener("mouseenter", () => {
              row.style.opacity = "0.8";
            });
            row.addEventListener("mouseleave", () => {
              row.style.opacity = "1";
            });
          }
        });
      }
    }, 0);
  }

  if (!wrapperClass) return table;

  const wrapper = document.createElement("div");
  wrapper.className = wrapperClass;
  wrapper.append(table);
  return wrapper;
}
