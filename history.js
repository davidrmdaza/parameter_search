const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

let allItems = [];
let currentPage = 1;
let pageSize = 50;

function getHistoryItems(maxResults = 5000) {
  return new Promise((resolve, reject) => {
    try {
      const maybePromise = browserAPI.history.search({ text: '', maxResults }, (items) => {
        if (items) resolve(items);
        else resolve([]);
      });
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.then(resolve).catch(reject);
      }
    } catch (err) {
      reject(err);
    }
  });
}

function formatDate(ms) {
  if (!ms) return '';
  const d = new Date(ms);
  return d.toLocaleString();
}

function domainFromUrl(url) {
  try { return new URL(url).hostname; } catch (e) { return ''; }
}

function parseParams(url) {
  try {
    const u = new URL(url);
    const params = [];
    for (const [k, v] of u.searchParams.entries()) params.push({ k, v });
    return params;
  } catch (e) { return []; }
}

function renderParamsTable(params) {
  if (!params || params.length === 0) return document.createTextNode('');
  const table = document.createElement('table');
  table.className = 'params-table';
  for (const p of params) {
    const tr = document.createElement('tr');
    const tdk = document.createElement('td');
    tdk.className = 'params-key';
    tdk.textContent = p.k;
    const tdv = document.createElement('td');
    tdv.className = 'params-value';
    tdv.textContent = p.v;
    tr.appendChild(tdk);
    tr.appendChild(tdv);
    table.appendChild(tr);
  }
  return table;
}

function trimString(str, max = 50) {
  if (!str) return '';
  return (str.length > max) ? (str.slice(0, max - 1) + '…') : str;
}

function renderRow(it) {
  const tr = document.createElement('tr');
  const tdDate = document.createElement('td');
  tdDate.textContent = formatDate(it.lastVisitTime);

  const tdTitle = document.createElement('td');
  const titleDiv = document.createElement('div');
  titleDiv.className = 'title-cell';
  const fullTitle = it.title || it.url || '(no title)';
  titleDiv.textContent = trimString(fullTitle, 50);
  titleDiv.title = fullTitle;
  tdTitle.appendChild(titleDiv);

  const tdDomain = document.createElement('td');
  tdDomain.textContent = domainFromUrl(it.url) || '';

  const tdParams = document.createElement('td');
  const params = parseParams(it.url || '');
  const paramsTable = renderParamsTable(params);
  if (paramsTable) tdParams.appendChild(paramsTable);

  tr.appendChild(tdDate);
  tr.appendChild(tdTitle);
  tr.appendChild(tdDomain);
  tr.appendChild(tdParams);
  return tr;
}

function renderPage(page = 1) {
  const tbody = document.querySelector('#historyTable tbody');
  tbody.innerHTML = '';
  if (!allItems || allItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="muted">No history items found.</td></tr>';
    document.getElementById('pageInfo').textContent = 'Page 0 of 0';
    return;
  }
  const total = allItems.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  currentPage = Math.max(1, Math.min(page, pages));
  const start = (currentPage - 1) * pageSize;
  const slice = allItems.slice(start, start + pageSize);
  for (const it of slice) tbody.appendChild(renderRow(it));
  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${pages}`;
  document.getElementById('prevBtn').disabled = (currentPage <= 1);
  document.getElementById('nextBtn').disabled = (currentPage >= pages);
}

function setupPaginationControls() {
  document.getElementById('prevBtn').addEventListener('click', () => renderPage(currentPage - 1));
  document.getElementById('nextBtn').addEventListener('click', () => renderPage(currentPage + 1));
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  pageSizeSelect.value = String(pageSize);
  pageSizeSelect.addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value, 10) || 50;
    renderPage(1);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupPaginationControls();
  getHistoryItems(5000).then(items => {
    allItems = items.sort((a,b) => (b.lastVisitTime||0) - (a.lastVisitTime||0));
    renderPage(1);
  }).catch(err => {
    const tbody = document.querySelector('#historyTable tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="muted">Unable to load history: ' + (err && err.message ? err.message : err) + '</td></tr>';
  });
});
