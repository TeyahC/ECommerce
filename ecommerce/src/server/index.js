import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Client, Environment } from "square";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = new Client({
  environment: Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

app.post("/create-checkout", async (req, res) => {
  const { cart, userId } = req.body;

  const lineItems = cart.map((item) => ({
    name: item.name,
    quantity: String(item.quantity),
    basePriceMoney: {
      amount: Math.round(item.price * 100),
      currency: "GBP",
    },
  }));

  try {
    const response = await client.checkoutApi.createCheckout("L4S1PSM9N97RP", {
      idempotencyKey: String(Date.now()),
      order: {
        order: {
          locationId: "L4S1PSM9N97RP",
          lineItems,
        },
      },
      askForShippingAddress: false,
      redirectUrl: `${process.env.FRONTEND_URL}/checkout-success`,
    });

    res.json({ checkoutUrl: response.result.checkout.checkoutPageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Correct port
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
