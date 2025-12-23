export async function action({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;

    const existing = await prisma.whatsappStatus.findUnique({
      where: { shopDomain },
    });

    if (existing?.status === "connected") {
      return json(
        { ok: false, error: "WhatsApp déjà connecté" },
        { status: 400 }
      );
    }

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: `whatsapp_${shopDomain.replace(".myshopify.com", "")}`,
      }),
      puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
    });

    client.on("qr", async (qr) => {
      try {
        // ✅ CORRECTION ICI : Convertir le QR en Data URL string
        const qrCodeDataURL = await create(qr, { 
          type: "png", 
          width: 300, 
          margin: 1 
        });
        
        // qrCodeDataURL est déjà une string (Data URL)
        // ex: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."

        await prisma.whatsappStatus.upsert({
          where: { shopDomain },
          update: { 
            qrCode: qrCodeDataURL, // ✅ String, pas objet
            status: "waiting_qr", 
            updatedAt: new Date() 
          },
          create: { 
            shopDomain, 
            qrCode: qrCodeDataURL, // ✅ String, pas objet
            status: "waiting_qr" 
          },
        });

        whatsappClients.set(shopDomain, client);
      } catch (err) {
        console.error("QR generation error:", err);
      }
    });

    client.on("ready", async () => {
      const phoneNumber = client.info?.wid?.user || null;

      await prisma.whatsappStatus.update({
        where: { shopDomain },
        data: { 
          phoneNumber, 
          connectedAt: new Date(), 
          status: "connected", 
          qrCode: null 
        },
      });

      console.log(`[WhatsApp] Connected for ${shopDomain}`);
    });

    client.on("auth_failure", async (error) => {
      console.error("Auth failure:", error);
      await prisma.whatsappStatus.update({
        where: { shopDomain },
        data: { 
          status: "auth_failure", 
          lastError: error.message, 
          qrCode: null 
        },
      });
    });

    await client.initialize();

    // Attendre un peu pour que le QR soit généré
    await new Promise(resolve => setTimeout(resolve, 2000));

    const status = await prisma.whatsappStatus.findUnique({ 
      where: { shopDomain } 
    });

    if (!status?.qrCode) {
      return json({ 
        ok: false, 
        error: "QR non généré - réessayez" 
      }, { status: 500 });
    }

    return json({ 
      ok: true, 
      status: "waiting_qr", 
      qrCode: status.qrCode 
    });
  } catch (error) {
    console.error("[WhatsApp Generate QR] Error:", error);
    return json({ 
      ok: false, 
      error: error.message 
    }, { status: 500 });
  }
}