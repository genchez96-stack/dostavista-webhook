import express from "express";

const app = express();

// Tilda шлёт application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// health-check (очень полезно для Render)
app.get("/", (req, res) => {
  res.send("OK");
});

app.post("/", async (req, res) => {
  try {
    console.log("📦 TILDA DATA:", req.body);

    // ⚠️ fetch пока НЕ вызываем
    // позже добавим Dostavista сюда

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).send("ERROR");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server started on port", PORT);
});

