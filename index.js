console.log("🔥 VERSION: 2026-01-17 — FINAL");

import express from "express";
import axios from "axios";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => res.send("OK"));

app.post("/", async (req, res) => {
  try {
    console.log("📦 RAW TILDA DATA:", req.body);

    if (!req.body.payment) return res.status(200).send("OK");

    const payment = JSON.parse(req.body.payment);
    console.log("💳 PAYMENT DATA:", payment);

    if (!payment.delivery?.includes("Достависта")) {
      console.log("ℹ️ Not Dostavista delivery");
      return res.status(200).send("OK");
    }

    const customerName = payment.delivery_fio || "Клиент";
    const customerPhone = req.body.Phone;
    const deliveryComment = payment.delivery_comment || "";

    const cleanDeliveryAddress = payment.delivery_address
      .replace(/^RU:\s*/i, "")
      .trim();

    const shopAddress = "Москва, улица Космонавтов, 22";

    const dostavistaPayload = {
      matter: `Заказ №${payment.orderid}`,
      vehicle_type_id: 6, // пеший курьер
      points: [
        {
          address: shopAddress,
          contact_person: {
            name: "Магазин",
            phone: "+79999999999"
          }
        },
        {
          address: cleanDeliveryAddress,
          contact_person: {
            name: customerName,
            phone: customerPhone
          },
          note: deliveryComment
        }
      ]
    };

    console.log("🚚 DOSTAVISTA REQUEST:", dostavistaPayload);

    const response = await axios.post(
      "https://robot.dostavista.ru/api/business/1.5/create-order", // ❗ PROD
      dostavistaPayload,
      {
        headers: {
          "X-DV-Auth-Token": process.env.DOSTAVISTA_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ DOSTAVISTA RESPONSE:", response.data);
    res.status(200).send("OK");

  } catch (error) {
    console.error("❌ ERROR:", error.response?.data || error.message);
    res.status(200).send("OK");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("🚀 Server started on port", PORT));
