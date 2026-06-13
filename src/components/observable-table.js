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

  const makeRowClickable = (container) => {
    if (typeof rowHref !== "function") return;

    const rowEls = container.querySelectorAll("tbody tr");
    rowEls.forEach((rowEl, index) => {
      const href = rowHref(data[index], index);
      if (!href) return;

      rowEl.style.cursor = "pointer";
      rowEl.tabIndex = 0;
      rowEl.setAttribute("role", "link");
      const rowId = data[index]?.id;
      rowEl.setAttribute("aria-label", rowId ? `Open match ${rowId}` : `Open row ${index + 1}`);

      rowEl.addEventListener("click", (event) => {
        if (event.target.closest("a,button,input,select,textarea,label")) return;
        window.location.assign(href);
      });

      rowEl.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        window.location.assign(href);
      });
    });
  };

  if (!wrapperClass) {
    // Wait a tick so table rows are mounted before wiring row click handlers.
    setTimeout(() => makeRowClickable(table), 0);
    return table;
  }

  const wrapper = document.createElement("div");
  wrapper.className = wrapperClass;
  wrapper.append(table);
  setTimeout(() => makeRowClickable(wrapper), 0);
  return wrapper;
}
