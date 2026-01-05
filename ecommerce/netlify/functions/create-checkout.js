// netlify/functions/create-checkout.js
import pkg from "square";
const { Client, Environment } = pkg;

const client = new Client({
  environment: Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

export async function handler(event, context) {
  const { cart, userId } = JSON.parse(event.body);

  const lineItems = cart.map((item) => ({
    name: item.name,
    quantity: String(item.quantity),
    basePriceMoney: {
      amount: Math.round(item.price * 100), // pence
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
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout-success`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        checkoutUrl: response.result.checkout.checkoutPageUrl,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
