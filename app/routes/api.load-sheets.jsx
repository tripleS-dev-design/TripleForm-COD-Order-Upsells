// ===== File: app/routes/api.load-sheets.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  ensureValidAccessToken,
  getSheetsConfigForShop,
} from "../services/google.server";

// helper robuste pour récupérer le shop
function getShopFromRequest(request, session, admin) {
  return (
    session?.shop ||
    admin?.rest?.session?.shop ||
    new URL(request.url).searchParams.get("shop")
  );
}

export const loader = async ({ request }) => {
  try {
    const { session, admin } = await authenticate.admin(request);
    const shop = getShopFromRequest(request, session, admin);

    if (!shop) {
      throw new Error("Shop introuvable dans /api/load-sheets");
    }

    // 1️⃣ Token Google valide
    const accessToken = await ensureValidAccessToken(shop);

    // 2️⃣ Charger les Google Sheets via Google Drive API
    const driveRes = await fetch(
      "https://www.googleapis.com/drive/v3/files" +
        "?q=mimeType='application/vnd.google-apps.spreadsheet'" +
        "&fields=files(id,name)" +
        "&pageSize=1000",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const driveJson = await driveRes.json().catch(() => null);

    if (!driveRes.ok) {
      throw new Error(
        driveJson?.error?.message ||
          "Impossible de charger les Google Sheets"
      );
    }

    const spreadsheets =
      driveJson?.files?.map((f) => ({
        id: f.id,
        name: f.name,
      })) || [];

    // 3️⃣ Charger la config existante (si déjà sauvegardée)
    const cfg = await getSheetsConfigForShop(shop);

    return json({
      ok: true,
      spreadsheets,
      config: cfg || null,
    });
  } catch (e) {
    console.error("Erreur /api/load-sheets:", e);
    return json(
      {
        ok: false,
        error: String(e?.message || e),
      },
      { status: 500 }
    );
  }
};
