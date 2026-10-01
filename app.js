const form = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const expenseId = document.getElementById("expenseId");
const expenseList = document.getElementById("expenseList");
const filter = document.getElementById("filter");
const message = document.getElementById("message");
const cancelEdit = document.getElementById("cancelEdit");

let expenses = [];

dateInput.value = new Date().toISOString().split("T")[0];

async function loadExpenses() {
  const response = await fetch("/api/expenses");
  expenses = await response.json();
  render();
}

function money(value) {
  return `₹${Number(value).toLocaleString("en-IN", {maximumFractionDigits: 2})}`;
}

function render() {
  const selected = filter.value;
  const visible = selected === "All"
    ? expenses
    : expenses.filter(e => e.category === selected);

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const month = new Date().toISOString().slice(0, 7);
  const monthTotal = expenses
    .filter(e => e.date.startsWith(month))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  document.getElementById("totalAmount").textContent = money(total);
  document.getElementById("transactionCount").textContent = expenses.length;
  document.getElementById("monthAmount").textContent = money(monthTotal);

  if (!visible.length) {
    expenseList.innerHTML = '<div class="empty">No expenses found.</div>';
    return;
  }

  expenseList.innerHTML = visible
    .slice()
    .sort((a,b) => b.date.localeCompare(a.date))
    .map(e => `
      <article class="expense">
        <div>
          <div class="expense-title">${escapeHTML(e.title)}</div>
          <div class="expense-meta">${formatDate(e.date)}</div>
        </div>
        <div class="amount">${money(e.amount)}</div>
        <div class="tag">${escapeHTML(e.category)}</div>
        <div class="actions">
          <button onclick="editExpense('${e.id}')">Edit</button>
          <button onclick="deleteExpense('${e.id}')">Delete</button>
        </div>
      </article>
    `).join("");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    title: titleInput.value,
    amount: amountInput.value,
    category: categoryInput.value,
    date: dateInput.value
  };

  const id = expenseId.value;
  const url = id ? `/api/expenses/${id}` : "/api/expenses";
  const method = id ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    message.textContent = data.message || "Something went wrong.";
    return;
  }

  message.textContent = id ? "Expense updated." : "Expense added.";
  resetForm();
  await loadExpenses();
});

function editExpense(id) {
  const e = expenses.find(item => item.id === id);
  if (!e) return;

  expenseId.value = e.id;
  titleInput.value = e.title;
  amountInput.value = e.amount;
  categoryInput.value = e.category;
  dateInput.value = e.date;

  document.getElementById("formTitle").textContent = "Edit Expense";
  document.getElementById("submitButton").textContent = "Update Expense";
  cancelEdit.classList.remove("hidden");
  window.scrollTo({top: 0, behavior: "smooth"});
}

async function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;

  await fetch(`/api/expenses/${id}`, {method: "DELETE"});
  await loadExpenses();
}

cancelEdit.addEventListener("click", resetForm);
filter.addEventListener("change", render);

function resetForm() {
  form.reset();
  expenseId.value = "";
  dateInput.value = new Date().toISOString().split("T")[0];
  document.getElementById("formTitle").textContent = "Add Expense";
  document.getElementById("submitButton").textContent = "Add Expense";
  cancelEdit.classList.add("hidden");
}

function formatDate(date) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

loadExpenses();
