const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const path = require("path");
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// GET questions
app.get("/api/questions", async (req, res) => {
  let { count = 5, category, difficulty } = req.query;

  count = parseInt(count) || 5;

  try {
    // 🔥 TRY API FIRST
    let url = `https://opentdb.com/api.php?amount=${count}`;

    if (difficulty) {
      url += `&difficulty=${difficulty.toLowerCase()}`;
    }

    console.log("Fetching:", url);

    const response = await fetch(url);
    const apiData = await response.json();

    if (apiData.response_code === 0 && apiData.results.length > 0) {
      const formatted = apiData.results.map((q, index) => {
        const options = [...q.incorrect_answers, q.correct_answer]
          .sort(() => 0.5 - Math.random());

        return {
          id: Date.now() + index,
          question: q.question,
          options,
          answer: q.correct_answer,
          category: q.category,
          difficulty: q.difficulty,
        };
      });

      return res.json(formatted);
    }

    throw new Error("API returned empty");
  } catch (err) {
    console.log("⚠️ API failed, using local fallback");
console.log("ERROR:", err);

    // 🟡 FALLBACK
    const data = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "data", "questions.json"),
        "utf-8"
      )
    );

    let filtered = data;

    if (category) {
      filtered = filtered.filter(
        (q) => q.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (difficulty) {
      filtered = filtered.filter(
        (q) => q.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    const shuffled = filtered.sort(() => 0.5 - Math.random());
    const limited = shuffled.slice(0, count);

    res.json(limited);
  }
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