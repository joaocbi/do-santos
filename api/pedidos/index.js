const { readData, writeData, isKvEnabled } = require("../_lib/store");

function createOrderNumber() {
  return `DSM-${String(Date.now()).slice(-8)}`;
}

module.exports = async function handler(req, res) {
  const method = req.method || "GET";
  const orders = await readData("orders.json", []);

  if (method === "GET") {
    return res.status(200).json({
      ok: true,
      total: orders.length,
      orders,
      storage: (await isKvEnabled()) ? "upstash-redis" : "local-fallback",
    });
  }

  if (method === "POST") {
    const payload = req.body || {};
    const order = {
      id: `order-${Date.now()}`,
      orderNumber: createOrderNumber(),
      customerName: payload.customerName || "Cliente",
      customerEmail: payload.customerEmail || "",
      status: payload.status || "pendente",
      paymentStatus: payload.paymentStatus || "aguardando",
      totalValue: Number(payload.totalValue || 0),
      items: Array.isArray(payload.items) ? payload.items : [],
      createdAt: new Date().toISOString(),
    };

    orders.unshift(order);
    await writeData("orders.json", orders.slice(0, 200));

    return res.status(201).json({
      ok: true,
      message: "Pedido criado com sucesso.",
      order,
      storage: (await isKvEnabled()) ? "upstash-redis" : "local-fallback",
    });
  }

  return res.status(405).json({
    ok: false,
    message: "Metodo nao permitido.",
  });
};
