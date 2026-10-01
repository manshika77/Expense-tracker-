const express = require("express");
const serverless = require("serverless-http");
const { getStore } = require("@netlify/blobs");

const app = express();
app.use(express.json());

const store = getStore("expense-tracker-data");

const seedExpenses = [
  { id: "demo-1", title: "Groceries", amount: 850, category: "Food", date: "2026-10-01" },
  { id: "demo-2", title: "Metro Recharge", amount: 500, category: "Transport", date: "2026-09-29" }
];

async function getExpenses() {
  const data = await store.get("expenses", { type: "json" });
  if (data === null) {
    await store.setJSON("expenses", seedExpenses);
    return seedExpenses;
  }
  return data;
}

async function saveExpenses(expenses) {
  await store.setJSON("expenses", expenses);
}

app.get("/expenses", async (req, res) => {
  try {
    res.json(await getExpenses());
  } catch (error) {
    res.status(500).json({ message: "Unable to load expenses." });
  }
});

app.post("/expenses", async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category || !date || Number(amount) <= 0) {
      return res.status(400).json({ message: "Please provide valid expense details." });
    }

    const expenses = await getExpenses();
    const expense = {
      id: crypto.randomUUID(),
      title: title.trim(),
      amount: Number(amount),
      category,
      date
    };

    expenses.push(expense);
    await saveExpenses(expenses);
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Unable to add expense." });
  }
});

app.put("/expenses/:id", async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const expenses = await getExpenses();
    const index = expenses.findIndex(e => e.id === req.params.id);

    if (index === -1) return res.status(404).json({ message: "Expense not found." });
    if (!title || !amount || !category || !date || Number(amount) <= 0) {
      return res.status(400).json({ message: "Please provide valid expense details." });
    }

    expenses[index] = {
      ...expenses[index],
      title: title.trim(),
      amount: Number(amount),
      category,
      date
    };

    await saveExpenses(expenses);
    res.json(expenses[index]);
  } catch (error) {
    res.status(500).json({ message: "Unable to update expense." });
  }
});

app.delete("/expenses/:id", async (req, res) => {
  try {
    const expenses = await getExpenses();
    const filtered = expenses.filter(e => e.id !== req.params.id);

    if (filtered.length === expenses.length) {
      return res.status(404).json({ message: "Expense not found." });
    }

    await saveExpenses(filtered);
    res.json({ message: "Expense deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete expense." });
  }
});

module.exports.handler = serverless(app);
