import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop; // Renommez shopId en shopDomain

    const status = await prisma.whatsappStatus.findUnique({
      where: { shopDomain }, // Utilisez shopDomain ici
    });

    if (!status) {
      return json({
        ok: true,
        status: "not_connected",
        shop: shopDomain,
      });
    }

    return json({
      ok: true,
      shop: shopDomain,
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