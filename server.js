import { createRequestHandler } from "@remix-run/express";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// Middleware de logging
app.use(morgan("tiny"));

// Middleware de compression
app.use(compression());

// Servir les fichiers statiques
app.use(express.static("public"));
app.use("/assets", express.static("build/client/assets"));

// Handler pour Remix
app.all(
  "*",
  createRequestHandler({
    build: await import("./build/server/index.js"),
    mode: process.env.NODE_ENV,
  })
);

// Démarrer le serveur
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`✅ TripleForm COD démarré sur le port ${port}`);
  console.log(`✅ Environnement: ${process.env.NODE_ENV}`);
  console.log(`✅ Shopify App URL: ${process.env.SHOPIFY_APP_URL || "Non défini"}`);
  console.log(`✅ Base URL: ${process.env.DATABASE_URL ? "Connectée" : "Non connectée"}`);
});
