-- WhatsApp simple interface fields 
ALTER TABLE "WhatsappConfig" ADD COLUMN IF NOT EXISTS "businessName" TEXT; 
ALTER TABLE "WhatsappConfig" ADD COLUMN IF NOT EXISTS "orderMessage" TEXT; 
ALTER TABLE "WhatsappConfig" ADD COLUMN IF NOT EXISTS "sendAutomatically" BOOLEAN DEFAULT true; 
ALTER TABLE "WhatsappConfig" ADD COLUMN IF NOT EXISTS "useToken" BOOLEAN DEFAULT false; 
ALTER TABLE "WhatsappConfig" ADD COLUMN IF NOT EXISTS "permanentToken" TEXT; 
ALTER TABLE "WhatsappConfig" ADD COLUMN IF NOT EXISTS "mode" TEXT DEFAULT 'simple'; 
