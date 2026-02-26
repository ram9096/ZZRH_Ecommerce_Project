import PDFDocument from "pdfkit";
import orderModel from "../model/orderModel.js";

export const downloadInvoice = async (req, res) => {
  try {

    const order = await orderModel.findById(req.params.id)
      .populate("userId")
      .populate("shippingAddressId");

    if (!order) {
      return res.status(404).send("Order not found");
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderCode}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderCode}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // ===== Header =====
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("RAFTAARA", 50, 45);
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("INVOICE", 275, 50, { align: "right" })
      .fontSize(10)
      .text(`Order Code: ${order.orderCode}`, { align: "right" })
      .text(`Order Date: ${new Date(order.createdAt).toDateString()}`, { align: "right" })
      .moveDown();

    // ===== Customer Info =====
    doc.fillColor("#000").fontSize(12).text("Bill To:", 50, 150);
    doc.font("Helvetica-Bold").text(order.userId?.username || "Customer Name", 50, 165);
    doc.font("Helvetica").text(order.userId?.email, 50, 180);

    // ===== Shipping Address =====
    doc.font("Helvetica-Bold").text("Shipping Address:", 50, 210);
    const address = order.shippingAddressId;
    doc.font("Helvetica").text(`${address.street_address || ""}`, 50, 225);
    doc.text(`${address.city || ""}, ${address.state || ""}`, 50, 240);
    doc.text(`${address.pincode || ""}`, 50, 255);

    // ===== Items Table =====
    const tableTop = 300;
    const itemX = 50;
    const quantityX = 300;
    const priceX = 370;
    const totalX = 450;

    doc.font("Helvetica-Bold");
    doc.text("Item", itemX, tableTop);
    doc.text("Quantity", quantityX, tableTop);
    doc.text("Price", priceX, tableTop);
    doc.text("Total", totalX, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;
    doc.font("Helvetica");
    const cancelledVariants = order.cancelledAt?.[0]?.cancelledProducts || [];
    order.orderItems.forEach((item) => {

      const isCancelled = cancelledVariants.some(
        id => id.toString() === item.variantId.toString()
      );

      const itemText = `${item.productName} (${item.variantName})`;
      const priceText = `₹${item.price.toFixed(2)}`;
      const totalText = `₹${(item.price * item.quantity).toFixed(2)}`;

      // Draw normal text
      doc.fillColor(isCancelled ? "red" : "black");

      doc.text(itemText, itemX, y);
      doc.text(item.quantity.toString(), quantityX, y);
      doc.text(priceText, priceX, y);
      doc.text(totalText, totalX, y);

      // 🔥 STRIKE THROUGH
      if (isCancelled) {
        const lineY = y + 7; // adjust vertical position

        doc
          .moveTo(itemX, lineY)
          .lineTo(totalX + 60, lineY) // extend till end of total
          .strokeColor("red")
          .lineWidth(1)
          .stroke();
      }

      y += 20;
    });

    y += 20;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;

    doc.font("Helvetica-Bold");
    doc.text(`Subtotal: ₹${order.subTotal.toFixed(2)}`, totalX - 50, y, { align: "right" });
    y += 15;
    doc.text(`Tax: ₹${order.taxAmount.toFixed(2)}`, totalX - 50, y, { align: "right" });
    y += 15;
    doc.text(`Total: ₹${order.totalAmount.toFixed(2)}`, totalX - 50, y, { align: "right" });

    // ===== Footer =====
    doc.fontSize(10).fillColor("#444444")
      .text("Thank you for shopping with us!", 50, 700, { align: "center", width: 500 });

    doc.end();
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to generate invoice");
    }
};
