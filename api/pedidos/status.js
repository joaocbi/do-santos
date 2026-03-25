const { readData, writeData, isKvEnabled } = require("../_lib/store");

module.exports = async function handler(req, res) {
  if ((req.method || "GET") !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Metodo nao permitido.",
    });
  }

  const payload = req.body || {};
  const orders = await readData("orders.json", []);
  const orderId = payload.orderId;

  if (!orderId) {
    return res.status(400).json({
      ok: false,
      message: "orderId é obrigatório.",
    });
  }

  let updatedOrder = null;
  const nextOrders = orders.map((order) => {
    if (order.id !== orderId) {
      return order;
    }

    updatedOrder = {
      ...order,
      status: payload.status || order.status,
      paymentStatus: payload.paymentStatus || order.paymentStatus,
      updatedAt: new Date().toISOString(),
    };

    return updatedOrder;
  });

  if (!updatedOrder) {
    return res.status(404).json({
      ok: false,
      message: "Pedido não encontrado.",
    });
  }

  await writeData("orders.json", nextOrders);

  return res.status(200).json({
    ok: true,
    message: "Status do pedido atualizado.",
    order: updatedOrder,
    storage: (await isKvEnabled()) ? "upstash-redis" : "local-fallback",
  });
};
