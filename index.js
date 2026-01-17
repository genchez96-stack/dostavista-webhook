import express from "express";

const app = express();

/**
 * Tilda отправляет данные как application/x-www-form-urlencoded
 * Поэтому ОБЯЗАТЕЛЬНО включаем оба парсера
 */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Проверка, что сервер жив
 * (можно открыть в браузере)
 */
app.get("/", (req, res) => {
  res.send("OK");
});

/**
 * Основной webhook от Tilda
 */
app.post("/", async (req, res) => {
  try {
    console.log("📦 RAW TILDA DATA:");
    console.log(req.body);

    // payment приходит как строка → превращаем в объект
    let paymentData = null;

    if (req.body.payment) {
      paymentData = JSON.parse(req.body.payment);

      console.log("💳 PARSED PAYMENT DATA:");
      console.log(paymentData);
    } else {
      console.log("⚠️ payment field not found");
    }

    /**
     * Для наглядности вытащим ключевые поля
     */
    const result = {
      orderId: paymentData?.orderid || null,
      deliveryType: paymentData?.delivery || null,
      deliveryAddress: paymentData?.delivery_address || null,
      deliveryComment: paymentData?.delivery_comment || null,
      customerName: req.body.Name || null,
      customerPhone: req.body.Phone || null,
      amount: paymentData?.amount || null,
    };

    console.log("📋 EXTRACTED ORDER DATA:");
    console.log(result);

    /**
     * ПОКА НИЧЕГО НЕ ОТПРАВЛЯЕМ
     * Просто подтверждаем Tilda, что всё ок
     */
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ ERROR IN WEBHOOK:");
    console.error(error);

    res.status(500).send("ERROR");
  }
});

/**
 * Render сам передаёт PORT
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server started on port", PORT);
});

