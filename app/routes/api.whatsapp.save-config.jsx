// app/routes/api.whatsapp.save-config.jsx
import { json } from "@remix-run/node"; // or your runtime

// This loader handles GET requests to the same URL
export async function loader({ request }) {
  // ... your logic to load config ...
  return json({ ok: true, config: loadedConfig });
}

// The ACTION function handles POST/PUT/PATCH/DELETE
export async function action({ request }) {
  if (request.method !== "POST") {
    // Return a 405 for non-POST methods if needed
    return json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const body = await request.json(); // Parse the incoming JSON
    const { config, mode } = body; // Destructure the data sent from your component

    // 1. Validate the incoming `config` data here.
    // 2. Save the config to your database (using your Prisma client).
    // 3. Return a success response.

    return json({ ok: true, message: "Configuration saved" });
  } catch (error) {
    console.error("Error saving WhatsApp config:", error);
    return json({ ok: false, error: error.message }, { status: 500 });
  }
}