import { json } from "@remix-run/node";
import prisma from "../db.server"; // chemin relatif à adapter selon ta structure
import { authenticate } from "../shopify.server"; // chemin relatif

export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shopId = session.shop;

    const status = await prisma.whatsappStatus.findUnique({
      where: { shopId },
    });

    if (!status) {
      return json({
        ok: true,
        status: "not_connected",
        shop: shopId,
      });
    }

    return json({
      ok: true,
      shop: shopId,
      status: status.status,
      phoneNumber: status.phoneNumber || null,
      connectedAt: status.connectedAt || null,
      updatedAt: status.updatedAt,
    });
  } catch (error) {
    console.error("[WhatsApp Status] Error:", error);

    return json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
