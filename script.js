// Bank Customer Priority System
// Data structure: Binary Heap / Priority Queue.
// Priority 3 = High, 2 = Medium, 1 = Normal.
// For equal priority, earlier arrival is served first.

const STORAGE_KEY = "bankPrioritySystemData";
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  queue: [], history: [], served: 0, nextNumber: 101, nowServing: null
};

const $ = id => document.getElementById(id);

function priorityName(p) {
  return p === 3 ? "High" : p === 2 ? "Medium" : "Normal";
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function compare(a,b) {
  if (a.priority !== b.priority) return b.priority - a.priority;
  return a.order - b.order;
}

// Heap implementation
function heapPush(item) {
  data.queue.push(item);
  let i = data.queue.length - 1;
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (compare(data.queue[parent], data.queue[i]) <= 0) break;
    [data.queue[parent], data.queue[i]] = [data.queue[i], data.queue[parent]];
    i = parent;
  }
}

function heapPop() {
  if (!data.queue.length) return null;
  const top = data.queue[0];
  const last = data.queue.pop();
  if (data.queue.length) {
    data.queue[0] = last;
    let i = 0;
    while (true) {
      let left = 2*i+1, right = 2*i+2, best = i;
      if (left < data.queue.length && compare(data.queue[left], data.queue[best]) < 0) best = left;
      if (right < data.queue.length && compare(data.queue[right], data.queue[best]) < 0) best = right;
      if (best === i) break;
      [data.queue[i], data.queue[best]] = [data.queue[best], data.queue[i]];
      i = best;
    }
  }
  return top;
}

function render() {
  $("totalCount").textContent = data.queue.length + data.history.length;
  $("waitingCount").textContent = data.queue.length;
  $("servedCount").textContent = data.served;
  $("highCount").textContent = data.queue.filter(c => c.priority === 3).length;

  const search = $("search").value.trim().toLowerCase();
  const filter = $("filter").value;
  const list = [...data.queue].sort(compare).filter(c =>
    (!search || c.name.toLowerCase().includes(search) || c.token.toLowerCase().includes(search)) &&
    (filter === "all" || String(c.priority) === filter)
  );

  if (!list.length) {
    $("queueList").innerHTML = `<div class="empty-queue">🎫 No customers in the waiting queue.</div>`;
  } else {
    $("queueList").innerHTML = list.map(c => `
      <div class="customer-row">
        <div class="token">${c.token}</div>
        <div><div class="customer-name">${escapeHTML(c.name)}</div>
        <div class="customer-meta">${escapeHTML(c.service)}${c.phone ? " • " + escapeHTML(c.phone) : ""}</div></div>
        <span class="priority-badge p${c.priority}">${priorityName(c.priority)}</span>
        <button class="serve-small" onclick="serveById('${c.id}')">Serve</button>
        <button class="remove-btn" onclick="removeCustomer('${c.id}')">✕</button>
      </div>`).join("");
  }

  const now = data.nowServing;
  $("nowServing").className = "now-serving" + (now ? "" : " empty");
  $("nowServing").innerHTML = now
    ? `<div class="big-token">${now.token}</div><h3>${escapeHTML(now.name)}</h3><p>${escapeHTML(now.service)} • ${priorityName(now.priority)} Priority</p>`
    : `<div class="big-token">—</div><h3>No customer</h3><p>Click “Serve Next” to start.</p>`;

  const history = data.history.slice(-8).reverse();
  $("historyList").innerHTML = history.length ? history.map(c =>
    `<div class="history-item"><span>✅ <strong>${c.token}</strong> — ${escapeHTML(c.name)}</span><small>${escapeHTML(c.service)}</small></div>`
  ).join("") : `<div class="empty-queue">No service history yet.</div>`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

function showToast(message) {
  const t = $("toast");
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

$("customerForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  const service = $("service").value;
  const priority = Number(document.querySelector('input[name="priority"]:checked').value);

  if (!name) return;
  if (phone && !/^\d{10}$/.test(phone)) {
    showToast("Enter a valid 10-digit phone number.");
    return;
  }

  const customer = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    token: "A" + data.nextNumber++,
    name, phone, service, priority,
    order: Date.now() + Math.random()
  };
  heapPush(customer);
  save();
  e.target.reset();
  render();
  showToast(`${customer.token} added to the priority queue.`);
});

$("serveNext").addEventListener("click", () => {
  const customer = heapPop();
  if (!customer) {
    showToast("No customers are waiting.");
    return;
  }
  data.nowServing = customer;
  data.served++;
  data.history.push(customer);
  save();
  render();
  showToast(`${customer.token} is now being served.`);
});

window.serveById = function(id) {
  const index = data.queue.findIndex(c => c.id === id);
  if (index === -1) return;
  const [customer] = data.queue.splice(index, 1);
  // Rebuild heap after direct removal.
  const old = data.queue;
  data.queue = [];
  old.forEach(heapPush);
  data.nowServing = customer;
  data.served++;
  data.history.push(customer);
  save();
  render();
  showToast(`${customer.token} is now being served.`);
};

window.removeCustomer = function(id) {
  const customer = data.queue.find(c => c.id === id);
  data.queue = data.queue.filter(c => c.id !== id);
  const old = data.queue;
  data.queue = [];
  old.forEach(heapPush);
  save();
  render();
  if (customer) showToast(`${customer.token} removed from queue.`);
};

$("search").addEventListener("input", render);
$("filter").addEventListener("change", render);

$("resetBtn").addEventListener("click", () => {
  if (!confirm("Reset all queue, history, and statistics?")) return;
  data = {queue: [], history: [], served: 0, nextNumber: 101, nowServing: null};
  save();
  render();
  showToast("All data has been reset.");
});

render();
