console.log("🔥 VERSION: 2026-01-17 18:45 — vehicle_type_id FIX");

import express from "express";
import axios from "axios";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Проверка, что сервер жив
app.get("/", (req, res) => {
  res.send("OK");
});

app.post("/", async (req, res) => {
  try {
    console.log("📦 RAW TILDA DATA:");
    console.log(req.body);

    // Парсим payment из Tilda
    if (!req.body.payment) {
      console.log("❌ payment not found");
      return res.status(200).send("OK");
    }

    const payment = JSON.parse(req.body.payment);

    console.log("💳 PAYMENT DATA:");
    console.log(payment);

    // Проверяем, что доставка — Достависта
    if (!payment.delivery || !payment.delivery.includes("Достависта")) {
      console.log("ℹ️ Not Dostavista delivery, skipping");
      return res.status(200).send("OK");
    }

    // Данные клиента
    const customerName = payment.delivery_fio || req.body.Name || "Клиент";
    const customerPhone = req.body.Phone;
    const deliveryAddress = payment.delivery_address;
    const deliveryComment = payment.delivery_comment || "";

    // ❗ ОБЯЗАТЕЛЬНО реальный адрес точки А
    const shopAddress = "Москва, ул. Тверская, 1";

    // Формируем заказ для Dostavista
    const dostavistaPayload = {
      matter: `Заказ №${payment.orderid}`,

      // ✅ ПЕШИЙ КУРЬЕР
      vehicle_type_id: 6,

      points: [
        {
          address: shopAddress,
          contact_person: {
            name: "Магазин",
            phone: "+79999999999"
          }
        },
        {
          address: deliveryAddress,
          contact_person: {
            name: customerName,
            phone: customerPhone
          },
          note: deliveryComment
        }
      ]
    };

    console.log("🚚 DOSTAVISTA REQUEST:");
    console.log(dostavistaPayload);

    const response = await axios.post(
      "https://robotapitest.dostavista.ru/api/business/1.5/create-order",
      dostavistaPayload,
      {
        headers: {
          "X-DV-Auth-Token": process.env.DOSTAVISTA_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ DOSTAVISTA RESPONSE:");
    console.log(response.data);

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ ERROR:");

    if (error.response) {
      console.error("STATUS:", error.response.status);
      console.error("DATA:", error.response.data);
    } else {
      console.error(error.message);
    }

    // Tilda всегда должна получить 200
    res.status(200).send("OK");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server started on port", PORT);
});

