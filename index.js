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

    // Парсим payment
    const payment = req.body.payment ? JSON.parse(req.body.payment) : null;

    if (!payment) {
      console.log("❌ payment not found");
      return res.status(200).send("OK");
    }

    console.log("💳 PAYMENT DATA:");
    console.log(payment);

    // Данные клиента
    const customerName = payment.delivery_fio || req.body.Name || "Клиент";
    const customerPhone = req.body.Phone;
    const address = payment.delivery_address;
    const comment = payment.delivery_comment || "";

    // Защита: если это не Достависта — выходим
    if (!payment.delivery || !payment.delivery.includes("Достависта")) {
      console.log("ℹ️ Not Dostavista delivery, skipping");
      return res.status(200).send("OK");
    }

    // Формируем заказ для Dostavista
    const dostavistaPayload = {
      matter: `Заказ №${payment.orderid}`,
      vehicle_type: "foot",
      points: [
        {
          address: "Москва, склад продавца",
          contact_person: {
            name: "Магазин",
            phone: "+79999999999"
          }
        },
        {
          address: address,
          contact_person: {
            name: customerName,
            phone: customerPhone
          },
          note: comment
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
      console.error(error.response.status);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }

    res.status(200).send("OK");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server started on port", PORT);
});
