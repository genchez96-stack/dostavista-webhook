import express from "express";
import axios from "axios";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.send("OK");
});

app.post("/", async (req, res) => {
  try {
    console.log("📦 RAW TILDA DATA:");
    console.log(req.body);

    if (!req.body.payment) {
      console.log("❌ payment not found");
      return res.send("OK");
    }

    const payment = JSON.parse(req.body.payment);

    console.log("💳 PAYMENT DATA:");
    console.log(payment);

    // Проверка доставки
    if (!payment.delivery || !payment.delivery.includes("Достависта")) {
      console.log("ℹ️ Not Dostavista delivery");
      return res.send("OK");
    }

    // Данные клиента
    const customerName =
      payment.delivery_fio || req.body.Name || "Клиент";
    const customerPhone = req.body.Phone || "+79999999999";

    // ❗ ЧИСТИМ АДРЕС
    const deliveryAddress = payment.delivery_address
      .replace(/^RU:\s*/i, "")
      .trim();

    const deliveryComment = payment.delivery_comment || "";

    // ✅ ПРАВИЛЬНЫЙ PAYLOAD
    const dostavistaPayload = {
      matter: `Заказ №${payment.orderid}`,
      vehicle_type: "courier",
      points: [
        {
          address: "Москва, ул. Тверская, 1",
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
      `${process.env.DOSTAVISTA_API_URL}/create-order`,
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

    res.send("OK");
  } catch (error) {
    console.error("❌ ERROR");

    if (error.response) {
      console.error(error.response.status);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }

    res.send("OK");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server started on port", PORT);
});

