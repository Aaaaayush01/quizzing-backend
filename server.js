const path = require("path");
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// GET questions
app.get("/api/questions", (req, res) => {
  const data = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "data", "questions.json"),
      "utf-8"
    )
  );

  const { category, difficulty, count } = req.query;

  let filtered = data;

  if (category) {
    filtered = filtered.filter(q => q.category === category);
  }

  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  if (filtered.length === 0) {
  filtered = data; // fallback to all questions
}

  const shuffled = filtered.sort(() => 0.5 - Math.random());

  const limited = shuffled.slice(0, parseInt(count) || filtered.length);

  res.json(limited);
});

// POST result
app.post("/api/submit", (req, res) => {
  const newResult = req.body;

  const filePath = "./data/results.json";

  const existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  existing.push({
    ...newResult,
    id: Date.now()
  });

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

  res.json({ message: "Result saved successfully" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/results", (req, res) => {
  const data = JSON.parse(
    fs.readFileSync("./data/results.json", "utf-8")
  );

  // sort by score (highest first)
  const sorted = data.sort((a, b) => b.score - a.score);

  res.json(sorted);
});