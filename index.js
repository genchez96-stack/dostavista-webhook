import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/", async (req, res) => {
  console.log("TILDA DATA:", req.body);

  // временно просто логируем, без Dostavista
  res.send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on", PORT);
});
