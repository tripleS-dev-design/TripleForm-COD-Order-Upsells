// ===== File: app/i18n/dictionaries.js =====
import { DEFAULT_LANGUAGE } from "./config";

/* ========================================================================
 * EN — base dictionary (Section 0 + FAQ)
 * ===================================================================== */
const EN = {
  "app.name": "TripleForm COD & Upsells",

  /* -------- Header & navigation -------- */
  "section0.header.title": "TripleForm COD · Dashboard",
  "section0.header.subtitle": "Overview, support and billing",
  "section0.header.pill": "COD form · Google Sheets · Pixels · Anti-bot",

  "section0.nav.forms": "Section 1 — COD forms",
  "section0.nav.offers": "Section 2 — Offers (upsell/bundles)",
  "section0.nav.sheets": "Section 3 — Google Sheets",
  "section0.nav.pixels": "Section 4 — Pixel events",
  "section0.nav.antibot": "Section 5 — Anti-bot",
  "section0.nav.locations": "Section 6 — Cities/Provinces/Countries",

  "section0.group.main": "Assistant & TripleForm COD setup",

  "section0.tabs.support": "Support & assistant",
  "section0.tabs.billing": "Plans & billing",

  /* -------- Billing / plans -------- */
  "section0.billing.loading": "Checking your subscription…",
  "section0.billing.active": "Active subscription ✅",
  "section0.billing.none": "No active subscription at the moment.",
  "section0.billing.planAnnual": "Annual plan",
  "section0.billing.planMonthly": "Monthly plan",
  "section0.billing.testMode": "(test mode)",

  "section0.banner.alreadySubscribed.title":
    "You already have an active subscription",
  "section0.banner.alreadySubscribed.body":
    "You can switch to another plan or change monthly/annual at any time. Shopify will automatically cancel the old subscription when you accept the new one.",

  "section0.plans.starter.title": "Starter",
  "section0.plans.basic.title": "Basic",
  "section0.plans.premium.title": "Premium",
  "section0.plans.badge.popular": "Popular",
  "section0.plans.badge.current": "Current plan",

  "section0.plans.price.perMonth": "per month",
  "section0.plans.price.perYear": "per year",
  "section0.plans.price.saving": "Save ~{percent}%",
  "section0.plans.btn.chooseMonthly": "Choose monthly",
  "section0.plans.btn.chooseAnnual": "Choose annual",
  "section0.plans.btn.alreadyMonthly": "Already on monthly",
  "section0.plans.btn.alreadyAnnual": "Already on annual",

  "section0.plans.starter.orders": "Up to 100 COD orders / month",
  "section0.plans.basic.orders": "Up to 500 COD orders / month",
  "section0.plans.premium.orders": "Unlimited COD orders",

  /* -------- Features list -------- */
  "section0.features.1": "One-click COD form on product pages.",
  "section0.features.2": "Real-time sync with Google Sheets.",
  "section0.features.3": "Upsells & bundles after the COD form.",
  "section0.features.4": "Recover abandoned COD orders via WhatsApp.",
  "section0.features.5": "Shipping rates by country, city and province.",
  "section0.features.6":
    "Multi-pixels (Meta, TikTok, Google…) for COD events.",
  "section0.features.7": "Anti-bot & protection against fake orders.",
  "section0.features.8":
    "Triple S Partners support by email & WhatsApp.",

  /* -------- Quick start block -------- */
  "section0.quickstart.title": "Quick start with TripleForm COD",
  "section0.quickstart.step1":
    "1) Choose a plan and confirm the subscription in Shopify.",
  "section0.quickstart.step2":
    "2) Add the block TripleForm COD — Order form to your product template.",
  "section0.quickstart.step3":
    "3) Configure Form, Offers, Google Sheets, Pixels & Anti-bot, then test a COD order to verify everything is tracked.",

  /* -------- Videos block -------- */
  "section0.videos.pill": "Video center · TripleForm COD",
  "section0.videos.title": "Tutorial videos for each section.",
  "section0.videos.subtitle":
    "You can later add your YouTube links here: each card = a short clear video (installation, configuration, real examples).",

  "section0.videos.item.intro.title":
    "Introduction · TripleForm COD overview",
  "section0.videos.item.intro.sub":
    "Quick tour of the dashboard, navigation and first settings.",
  "section0.videos.item.forms.title": "Section 1 · COD forms",
  "section0.videos.item.forms.sub":
    "Create the one-click form, fields, design and order tests.",
  "section0.videos.item.offers.title": "Section 2 · Offers & bundles",
  "section0.videos.item.offers.sub":
    "Upsell after the form, bundles and higher AOV.",
  "section0.videos.item.sheets.title":
    "Section 3 · Google Sheets in real time",
  "section0.videos.item.sheets.sub":
    "Connection, columns, filters and tracking for your call center.",
  "section0.videos.item.pixels.title":
    "Section 4 · Pixels & COD events",
  "section0.videos.item.pixels.sub":
    "Meta, TikTok, Google… how to track each COD order.",
  "section0.videos.item.antibot.title":
    "Section 5 · Anti-bot & filters",
  "section0.videos.item.antibot.sub":
    "Block fake orders and protect your campaigns.",
  "section0.videos.item.locations.title":
    "Section 6 · Cities, provinces & countries",
  "section0.videos.item.locations.sub":
    "Manage deliverable zones, fees by country and city filters.",

  /* -------- Language selector label -------- */
  "section0.lang.label": "Interface language",

  /* -------- SmartSupportPanel UI -------- */
  "section0.support.header": "Support · COD sections FAQ",
  "section0.support.search.placeholder":
    "Search (Google Sheets, Form, Pixels, Anti-bot...)",
  "section0.support.noResults": "No question found.",
  "section0.support.contactText": "Need personalized help on your store?",
  "section0.support.whatsapp": "WhatsApp",
  "section0.support.email": "Email",
  "section0.support.cat.all": "All",
  "section0.support.cat.start": "Getting started",
  "section0.support.cat.forms": "Forms",
  "section0.support.cat.offers": "Offers",
  "section0.support.cat.sheets": "Google Sheets",
  "section0.support.cat.pixels": "Pixels",
  "section0.support.cat.antibot": "Anti-bot",
  "section0.support.cat.shipping": "Shipping",
  "section0.support.cat.billing": "Billing",
  "section0.support.cat.support": "Support",

  /* -------- PlanUsageWidget -------- */
  "section0.usage.noPlan.title": "Plan status",
  "section0.usage.noPlan.body":
    "No active plan. Choose one in the Plans & billing tab.",
  "section0.usage.planFallback": "Active plan",
  "section0.usage.header.title": "Plan usage",
  "section0.usage.header.subtitleTail": "COD orders",
  "section0.usage.badge.active": "Active subscription",
  "section0.usage.commandsLabel": "ORDERS",
  "section0.usage.loading": "Refreshing statistics…",
  "section0.usage.unlimitedText":
    "Unlimited COD orders on your current plan.",
  "section0.usage.limitedText":
    "COD order usage in your current period.",
  "section0.usage.used": "Used",
  "section0.usage.usedOf": "of",
  "section0.usage.remaining": "Remaining",
  "section0.usage.beforeLimit": "before the limit",
  "section0.usage.progress": "Progress",
  "section0.usage.since": "Since:",
  "section0.usage.term.annual": "Annual",
  "section0.usage.term.monthly": "Monthly",

  /* ======================================================================
   * FAQ — START
   * ==================================================================== */
  "section0.faq.start.1.title":
    "Where should I start with the COD app?",
  "section0.faq.start.1.answer.1":
    "1) Add the block TripleForm COD — Order form in your Shopify theme (product template).",
  "section0.faq.start.1.answer.2":
    "2) Go to Section 1 — COD forms to choose fields and design.",
  "section0.faq.start.1.answer.3":
    "3) Configure Section 3 — Google Sheets if you want a call center or real-time tracking.",
  "section0.faq.start.1.answer.4":
    "4) Place a test order from a real product to verify that everything is tracked correctly.",

  "section0.faq.start.2.title":
    "How do I install the COD block in my theme?",
  "section0.faq.start.2.answer.1":
    "1) Open the Shopify theme editor.",
  "section0.faq.start.2.answer.2":
    "2) In your product template, click Add block or Add section.",
  "section0.faq.start.2.answer.3":
    "3) Search for TripleForm COD — Order form and add it under the product description or near the Add to cart button.",
  "section0.faq.start.2.answer.4":
    "4) Save: the COD form is now visible on your product pages.",

  "section0.faq.start.3.title":
    "How can I place a full test COD order?",
  "section0.faq.start.3.answer.1":
    "1) Go to a real product with the COD block active.",
  "section0.faq.start.3.answer.2":
    "2) Fill in all required fields (Name, Phone, City, etc.).",
  "section0.faq.start.3.answer.3":
    "3) Use a real phone number (to test the call center).",
  "section0.faq.start.3.answer.4":
    "4) Check in Shopify › Orders and, if enabled, in Google Sheets and Pixels.",

  "section0.faq.start.4.title":
    "The COD form does not appear on my products",
  "section0.faq.start.4.answer.1":
    "1) Check that the block TripleForm COD — Order form is added in the product template.",
  "section0.faq.start.4.answer.2":
    "2) Make sure you are viewing a product that uses this template.",
  "section0.faq.start.4.answer.3":
    "3) Temporarily disable other apps or scripts that heavily modify the DOM (custom theme, page builder…).",
  "section0.faq.start.4.answer.4":
    "4) Reload the theme and clear cache if needed.",

  /* ======================================================================
   * FAQ — FORMS
   * ==================================================================== */
  "section0.faq.forms.1.title":
    "How do I enable/disable fields in the COD form?",
  "section0.faq.forms.1.answer.1":
    "1) Go to Section 1 — COD forms in the app.",
  "section0.faq.forms.1.answer.2":
    "2) In the Form fields panel, enable or disable Full name, Phone, Address, City, Province, Notes, etc.",
  "section0.faq.forms.1.answer.3":
    "3) You can make some fields required to avoid incomplete orders.",
  "section0.faq.forms.1.answer.4":
    "4) Save and test on a product to see the new form.",

  "section0.faq.forms.2.title":
    "How do I change the colors and design of the form?",
  "section0.faq.forms.2.answer.1":
    "1) In Section 1, open the Form design group or tab.",
  "section0.faq.forms.2.answer.2":
    "2) Change button colors, background, borders and typography.",
  "section0.faq.forms.2.answer.3":
    "3) You can tweak border radius, shadow and alignment to match your theme.",
  "section0.faq.forms.2.answer.4":
    "4) Save and refresh the product page to see the final result.",

  "section0.faq.forms.3.title":
    "The Submit order button is not working",
  "section0.faq.forms.3.answer.1":
    "1) Check that all required fields are filled (especially phone).",
  "section0.faq.forms.3.answer.2":
    "2) If you use Anti-bot (Section 5), first disable overly strict rules for testing.",
  "section0.faq.forms.3.answer.3":
    "3) Make sure the product and variant are valid (correct variantId).",
  "section0.faq.forms.3.answer.4":
    "4) If the problem persists, contact support with a console screenshot (F12) and the error message.",

  "section0.faq.forms.4.title":
    "How do I enable phone number validation?",
  "section0.faq.forms.4.answer.1":
    "1) In Section 1 — Forms, enable the phone validation option (by country).",
  "section0.faq.forms.4.answer.2":
    "2) Choose allowed prefixes (e.g. +212, +213, +216) and minimum length.",
  "section0.faq.forms.4.answer.3":
    "3) If the number is too short or invalid, the form shows an error message and blocks submission.",

  "section0.faq.forms.5.title":
    "How do I add a Notes/Comment field for the customer?",
  "section0.faq.forms.5.answer.1":
    "1) In Section 1, enable the Notes/Comment field if available.",
  "section0.faq.forms.5.answer.2":
    "2) This text is sent to the Shopify order note and to Google Sheets if you map the corresponding column.",
  "section0.faq.forms.5.answer.3":
    "3) Useful for info such as: floor, door code, delivery time slot, etc.",

  /* ======================================================================
   * FAQ — OFFERS
   * ==================================================================== */
  "section0.faq.offers.1.title":
    "How do I enable upsell after the COD form?",
  "section0.faq.offers.1.answer.1":
    "1) Go to Section 2 — Offers (upsell/bundles).",
  "section0.faq.offers.1.answer.2":
    "2) Create a new offer by choosing the main product and the upsell product.",
  "section0.faq.offers.1.answer.3":
    "3) Configure the discount (for example -20%) and the offer text.",
  "section0.faq.offers.1.answer.4":
    "4) Activate the offer: after the COD form, the customer will see the upsell.",

  "section0.faq.offers.2.title":
    "How do I create a 1 / 2 / 3 items bundle with discount?",
  "section0.faq.offers.2.answer.1":
    "1) In Section 2, add an offer of type bundle.",
  "section0.faq.offers.2.answer.2":
    "2) Define 1 item, 2 items, 3 items options with discount percentages for each tier.",
  "section0.faq.offers.2.answer.3":
    "3) The customer can choose the bundle directly in the interface after the COD form.",

  "section0.faq.offers.3.title":
    "Upsell or bundle does not appear after the form",
  "section0.faq.offers.3.answer.1":
    "1) Check that the offer is active in Section 2.",
  "section0.faq.offers.3.answer.2":
    "2) Make sure the product condition is respected (same product or collection).",
  "section0.faq.offers.3.answer.3":
    "3) Place a full test order: some offers only show after a real form submission.",

  /* ======================================================================
   * FAQ — SHEETS
   * ==================================================================== */
  "section0.faq.sheets.1.title":
    "How do I connect my Google Sheets spreadsheet?",
  "section0.faq.sheets.1.answer.1":
    "1) Go to Section 3 — Google Sheets.",
  "section0.faq.sheets.1.answer.2":
    "2) Paste the sheet ID (the part between /d/ and /edit in the URL).",
  "section0.faq.sheets.1.answer.3":
    "3) Choose the exact tab name where you want to receive orders.",
  "section0.faq.sheets.1.answer.4":
    "4) Use the carousel to map each column (Full name, Phone, City, Product, Total, etc.), then click Save.",

  "section0.faq.sheets.2.title":
    "Orders do not arrive (or no longer arrive) in Google Sheets",
  "section0.faq.sheets.2.answer.1":
    "1) Check that the sheet ID and tab name are correct.",
  "section0.faq.sheets.2.answer.2":
    "2) Make sure the Google service account email has edit access to the sheet.",
  "section0.faq.sheets.2.answer.3":
    "3) Check that the config is saved in Section 3 (Save store button).",
  "section0.faq.sheets.2.answer.4":
    "4) Place a new test order and check server logs if needed.",

  "section0.faq.sheets.3.title":
    "How do I define the column order in the sheet?",
  "section0.faq.sheets.3.answer.1":
    "1) In Section 3, use the column carousel (Column 1, Column 2, etc.).",
  "section0.faq.sheets.3.answer.2":
    "2) For each column, choose the type (datetime, number, currency, string...) and the field (customer.name, customer.phone, cart.productTitle, cart.total...).",
  "section0.faq.sheets.3.answer.3":
    "3) Reorder columns by moving them in the carousel.",
  "section0.faq.sheets.3.answer.4":
    "4) Save, then place a test order to see the order applied in Google Sheets.",

  "section0.faq.sheets.4.title":
    "What is the difference between Total without shipping and Total with shipping?",
  "section0.faq.sheets.4.answer.1":
    "1) Order total (without shipping): product amount + discounts, without shipping fees.",
  "section0.faq.sheets.4.answer.2":
    "2) Order total (with shipping): also includes shipping fees (if configured).",
  "section0.faq.sheets.4.answer.3":
    "3) In Section 3, you can choose which total to send to Google Sheets (cart.subtotal or cart.totalWithShipping).",

  /* ======================================================================
   * FAQ — PIXELS
   * ==================================================================== */
  "section0.faq.pixels.1.title":
    "How do I connect Meta Pixel, TikTok or Google?",
  "section0.faq.pixels.1.answer.1":
    "1) Go to Section 4 — Pixels events.",
  "section0.faq.pixels.1.answer.2":
    "2) Paste your Meta Pixel ID, TikTok Pixel ID or Google Measurement ID.",
  "section0.faq.pixels.1.answer.3":
    "3) Enable the events (Purchase COD, PageView, etc.) you want to send.",
  "section0.faq.pixels.1.answer.4":
    "4) Place a test order and check in Meta Events Manager / TikTok Events / Google DebugView.",

  "section0.faq.pixels.2.title":
    "Which event is sent for a COD order?",
  "section0.faq.pixels.2.answer.1":
    "1) The app sends a Purchase event for COD orders.",
  "section0.faq.pixels.2.answer.2":
    "2) The event contains: total amount, currency, quantity and product information.",
  "section0.faq.pixels.2.answer.3":
    "3) You can use this data to optimize Meta, TikTok or Google Ads campaigns.",

  "section0.faq.pixels.3.title":
    "The pixel is not receiving events",
  "section0.faq.pixels.3.answer.1":
    "1) Check that IDs (Meta, TikTok, Google) are correct and saved.",
  "section0.faq.pixels.3.answer.2":
    "2) Disable ad blockers on your browser during the test.",
  "section0.faq.pixels.3.answer.3":
    "3) Use a real product and place a full order to trigger Purchase.",
  "section0.faq.pixels.3.answer.4":
    "4) Also check server logs if the app sends events via API (CAPI).",

  /* ======================================================================
   * FAQ — ANTI-BOT
   * ==================================================================== */
  "section0.faq.antibot.1.title":
    "What is the Anti-bot section used for?",
  "section0.faq.antibot.1.answer.1":
    "1) Block spam orders and bots filling your COD form.",
  "section0.faq.antibot.1.answer.2":
    "2) Filter phone numbers that are too short or suspicious.",
  "section0.faq.antibot.1.answer.3":
    "3) Limit orders from certain countries or IPs if needed.",

  "section0.faq.antibot.2.title":
    "How to configure Anti-bot without blocking real customers?",
  "section0.faq.antibot.2.answer.1":
    "1) Start simple: enable phone validation (minDigits) and honeypot (hidden field + minimum time).",
  "section0.faq.antibot.2.answer.2":
    "2) Add IP rules (denyList/allowList) only if you see repetitive spam.",
  "section0.faq.antibot.2.answer.3":
    "3) For countries, prefer an allowList of countries where you really sell.",
  "section0.faq.antibot.2.answer.4":
    "4) Test your changes with a real order to confirm the flow is still smooth.",

  "section0.faq.antibot.3.title":
    "Why are some orders blocked by Anti-bot?",
  "section0.faq.antibot.3.answer.1":
    "1) The error message contains an ANTIBOT_BLOCKED code and the reason: phone too short, country not allowed, honeypot filled, IP blocked, etc.",
  "section0.faq.antibot.3.answer.2":
    "2) Check your configuration in Section 5 — Anti-bot and relax rules if you block real customers.",

  /* ======================================================================
   * FAQ — SHIPPING / LOCATIONS
   * ==================================================================== */
  "section0.faq.shipping.1.title":
    "How do I add my countries, cities and provinces?",
  "section0.faq.shipping.1.answer.1":
    "1) Go to Section 6 — Cities/Provinces/Countries.",
  "section0.faq.shipping.1.answer.2":
    "2) First add the countries you deliver to (e.g. Morocco, Algeria, Tunisia…).",
  "section0.faq.shipping.1.answer.3":
    "3) Then add cities and provinces linked to each country.",
  "section0.faq.shipping.1.answer.4":
    "4) This data can be used for the COD form and for your call center via Google Sheets.",

  "section0.faq.shipping.2.title":
    "Can I apply different shipping fees by city?",
  "section0.faq.shipping.2.answer.1":
    "1) Yes, Section 6 is meant to structure countries / provinces / cities.",
  "section0.faq.shipping.2.answer.2":
    "2) You can then use this data in your workflow (Sheets, call center, shipping rules) to apply different fees by zone.",

  /* ======================================================================
   * FAQ — BILLING
   * ==================================================================== */
  "section0.faq.billing.1.title":
    "How does the Shopify subscription for the app work?",
  "section0.faq.billing.1.answer.1":
    "1) In Section 0 — Dashboard, tab Plans & billing, choose Starter, Basic or Premium (monthly or annual).",
  "section0.faq.billing.1.answer.2":
    "2) Shopify opens an official confirmation page to create the subscription.",
  "section0.faq.billing.1.answer.3":
    "3) Once validated, the app detects your active plan and unlocks features.",
  "section0.faq.billing.1.answer.4":
    "4) Billing is fully managed by Shopify (you can see invoices in Shopify Billing).",

  "section0.faq.billing.2.title":
    "How do I change plan (Starter, Basic, Premium)?",
  "section0.faq.billing.2.answer.1":
    "1) Open Section 0 — Dashboard, tab Plans & billing.",
  "section0.faq.billing.2.answer.2":
    "2) Click Choose monthly or Choose annual on the new plan.",
  "section0.faq.billing.2.answer.3":
    "3) Shopify opens a new confirmation page.",
  "section0.faq.billing.2.answer.4":
    "4) After validation, the new plan is active and the old one is automatically canceled by Shopify.",

  /* ======================================================================
   * FAQ — SUPPORT
   * ==================================================================== */
  "section0.faq.support.1.title":
    "How can I contact support for personalized help?",
  "section0.faq.support.1.answer.1":
    "1) WhatsApp: for quick questions, screenshots and live tests.",
  "section0.faq.support.1.answer.2":
    "2) Email: for longer requests, detailed technical issues or suggestions.",
  "section0.faq.support.1.answer.3":
    "3) Feel free to send a short video of your issue (Loom, phone…) so we can understand it faster.",
  
  // ===== Section 1 — COD Forms =====
  // Header
  "section1.header.appTitle": "Forms COD — Order form",
  "section1.header.appSubtitle":
    "Customize your COD order form and order summary for your products.",
  "section1.header.btnAddToTheme": "Add block in theme",
  "section1.header.btnPreview": "Preview form",
  "section1.header.btnSave": "Save settings",

  // Left rail / navigation
  "section1.rail.title": "COD form",
  "section1.rail.cart": "Order summary",
  "section1.rail.titles": "Form titles",
  "section1.rail.buttons": "Buttons & messages",
  "section1.rail.fieldsSeparator": "Form fields",
  "section1.rail.appearanceSeparator": "Appearance & options",
  "section1.rail.colors": "Colors & style",
  "section1.rail.options": "Options",

  // Groups
  "section1.group.cart.title": "Order summary texts",
  "section1.group.formTitles.title": "Form titles",
  "section1.group.buttons.title": "Buttons & messages",
  "section1.group.colors.title": "Form colors & style",
  "section1.group.options.title": "Display & behavior options",
  "section1.group.fields.title": "Fields configuration",

  // Cart texts
  "section1.cart.labelTop": "Cart top title",
  "section1.cart.labelPrice": "Price label",
  "section1.cart.labelShipping": "Shipping label",
  "section1.cart.labelTotal": "Total label",

  // Form texts
  "section1.form.titleLabel": "Form title",
  "section1.form.subtitleLabel": "Form subtitle",
  "section1.form.successTextLabel": "Success message",

  // Buttons
  "section1.buttons.displayStyleLabel": "Form display style",
  "section1.buttons.style.inline": "Inline",
  "section1.buttons.style.popup": "Popup",
  "section1.buttons.style.drawer": "Drawer",
  "section1.buttons.mainCtaLabel": "Main button text",
  "section1.buttons.totalSuffixLabel": "Total suffix",
  "section1.buttons.successTextLabel": "Success message",

  // Colors section
  "section1.colors.formSection": "Form colors",
  "section1.colors.bg": "Background",
  "section1.colors.text": "Text color",
  "section1.colors.border": "Border color",
  "section1.colors.inputBg": "Input background",
  "section1.colors.inputBorder": "Input border",
  "section1.colors.placeholder": "Placeholder color",
  "section1.colors.buttonSection": "Button colors",
  "section1.colors.btnBg": "Button background",
  "section1.colors.btnText": "Button text",
  "section1.colors.btnBorder": "Button border",
  "section1.colors.btnHeight": "Button height",
  "section1.colors.cartSection": "Cart colors",
  "section1.colors.cartBg": "Cart background",
  "section1.colors.cartBorder": "Cart border",
  "section1.colors.cartRowBg": "Row background",
  "section1.colors.cartRowBorder": "Row border",
  "section1.colors.cartTitle": "Title color",
  "section1.colors.cartText": "Text color",
  "section1.colors.layoutSection": "Form layout & spacing",
  "section1.colors.radius": "Border radius",
  "section1.colors.padding": "Internal padding",
  "section1.colors.fontSize": "Font size",
  "section1.colors.direction": "Text direction",
  "section1.colors.titleAlign": "Title alignment",
  "section1.colors.fieldAlign": "Fields alignment",
  "section1.colors.shadow": "Shadow",
  "section1.colors.glow": "Glow effect",
  "section1.colors.glowPx": "Glow intensity",
  "section1.colors.hexLabel": "Hex color",

  // Alignment options
  "section1.align.left": "Left",
  "section1.align.center": "Center",
  "section1.align.right": "Right",

  // Options section
  "section1.options.behavior": "Behavior",
  "section1.options.openDelayMs": "Open delay (ms)",
  "section1.options.effect": "Visual effect",
  "section1.options.effect.none": "None",
  "section1.options.effect.light": "Light shadow",
  "section1.options.effect.glow": "Glow",
  "section1.options.closeOnOutside": "Close on outside click",
  "section1.options.drawer": "Drawer settings",
  "section1.options.drawerDirection": "Drawer direction",
  "section1.options.drawerDirection.right": "Right",
  "section1.options.drawerDirection.left": "Left",
  "section1.options.drawerSize": "Drawer size",
  "section1.options.overlayColor": "Overlay color",
  "section1.options.overlayOpacity": "Overlay opacity",
  "section1.options.stickyButton": "Sticky button",
  "section1.options.stickyType": "Sticky type",
  "section1.options.sticky.none": "None",
  "section1.options.sticky.bottomBar": "Bottom bar",
  "section1.options.sticky.bubbleRight": "Bubble right",
  "section1.options.sticky.bubbleLeft": "Bubble left",
  "section1.options.stickyLabel": "Sticky button label",
  "section1.options.countries": "Countries & regions",
  "section1.options.countries.storeCountryLabel": "Store country",
  "section1.options.countries.selectPlaceholder": "Select country",
  "section1.options.countries.note": "Select your main country for phone prefixes and regions",
  "section1.options.consents": "Consents",
  "section1.options.requireGdpr": "Require GDPR consent",
  "section1.options.gdprLabel": "GDPR label",
  "section1.options.whatsappOptIn": "WhatsApp opt-in",
  "section1.options.whatsappLabel": "WhatsApp label",

  // Field editor
  "section1.group.formTexts.title": "Form texts",
  "section1.fieldEditor.activeLabel": "Active",
  "section1.fieldEditor.requiredLabel": "Required",
  "section1.fieldEditor.typeLabel": "Field type",
  "section1.fieldEditor.type.text": "Text",
  "section1.fieldEditor.type.phone": "Phone",
  "section1.fieldEditor.type.textarea": "Textarea",
  "section1.fieldEditor.type.number": "Number",
  "section1.fieldEditor.labelLabel": "Label",
  "section1.fieldEditor.placeholderLabel": "Placeholder",
  "section1.fieldEditor.phonePrefixLabel": "Phone prefix",
  "section1.fieldEditor.minLabel": "Minimum",
  "section1.fieldEditor.maxLabel": "Maximum",
"section1.fieldEditor.titlePrefix.fullName": "Full name",
"section1.fieldEditor.titlePrefix.phone": "Phone (WhatsApp)",
"section1.fieldEditor.titlePrefix.city": "City",
"section1.fieldEditor.titlePrefix.province": "Province/State",
"section1.fieldEditor.titlePrefix.address": "Address",
"section1.fieldEditor.titlePrefix.notes": "Notes/comment",
"section1.fieldEditor.titlePrefix.quantity": "Quantity",

  // Preview
  "section1.preview.priceExample": "199.00",
  "section1.preview.freeShipping": "Free shipping",
  "section1.preview.cityPlaceholder": "Select city",
  "section1.preview.cityPlaceholderNoProvince": "Select city",
  "section1.preview.cityPlaceholderNoProv": "Select city",
  "section1.preview.provincePlaceholder": "Select province",
  "section1.preview.style.inline": "Inline",
  "section1.preview.style.popup": "Popup",
  "section1.preview.style.drawer": "Drawer",
  "section1.preview.stickyBarLabel": "Sticky bar",
  "section1.preview.stickyBubbleLabel": "Sticky bubble",

  // Save messages
  "section1.save.errorGeneric": "Error saving settings",
  "section1.save.success": "Settings saved successfully!",
  "section1.save.unknownError": "Unknown error occurred",
  "section1.save.failedPrefix": "Failed to save: ",

  // Modal preview
  "section1.modal.previewTitle": "COD form preview",
  "section1.modal.previewClose": "Close preview",
   // Header
  "section2.header.appTitle": "Offers · COD Upsells & Bundles",
  "section2.header.appSubtitle": "Configure automatic discounts, bundles and gifts above the COD form",
  "section2.header.btnSave": "Save settings",

  // Rail navigation
  "section2.rail.title": "Offers configuration",
  "section2.rail.global": "Global & colors",
  "section2.rail.discount": "Offers (conditions)",
  "section2.rail.upsell": "Gift / upsell",

  // Groups
  "section2.group.global.title": "Global options",
  "section2.group.theme.title": "Colors & style (preview)",
  "section2.group.discount.title": "Offers — Conditional discount",
  "section2.group.display.title": "Display on product page",
  "section2.group.upsell.title": "Upsell — Winning gift",
  "section2.group.gift.title": "Gift",

  // Global options
  "section2.global.enable": "Enable offers & upsell",
  "section2.global.currency": "Display currency",
  "section2.global.rounding": "Total rounding",
  "section2.global.rounding.none": "No rounding",
  "section2.global.rounding.unit": "Round to unit",
  "section2.global.rounding.99": "End with .99",

  // Theme presets
  "section2.theme.preset": "Quick palette (no color code)",
  "section2.theme.preset.light": "Light — white background, black button",
  "section2.theme.preset.dark": "Dark — dark background, orange button",
  "section2.theme.preset.purple": "Purple — premium style",
  "section2.theme.statusBarBg": "Status bar background OFFERS",
  "section2.theme.statusBarText": "Status bar text OFFERS",
  "section2.theme.offerBg": "OFFER card background",
  "section2.theme.upsellBg": "GIFT card background",
  "section2.theme.ctaBg": "CTA button background",
  "section2.theme.ctaText": "CTA button text",
  "section2.theme.ctaBorder": "CTA button border",

  // Discount/Offer settings
  "section2.discount.enable": "Enable offers",
  "section2.discount.product": "Product (Shopify)",
  "section2.discount.product.placeholder": "No product selected",
  "section2.discount.previewTitle": "OFFER title (preview)",
  "section2.discount.previewDescription": "OFFER description",
  "section2.discount.productRef": "Handle / ID / URL product OFFER",
  "section2.discount.imageUrl": "Product image OFFER (URL)",
  "section2.discount.iconEmoji": "OFFER icon (emoji)",
  "section2.discount.iconUrl": "OFFER icon (URL small image)",
  "section2.discount.type": "Discount type",
  "section2.discount.type.percent": "Percentage (%)",
  "section2.discount.type.fixed": "Fixed amount",
  "section2.discount.percent": "% discount",
  "section2.discount.fixedAmount": "Fixed amount",
  "section2.discount.conditions.minQty": "Minimum quantity (minQty)",
  "section2.discount.conditions.minSubtotal": "Minimum subtotal",
  "section2.discount.conditions.requiresCode": "Requires a code",
  "section2.discount.conditions.code": "Coupon code",
  "section2.discount.caps.maxDiscount": "Discount cap (0 = none)",

  // Display settings
  "section2.display.style": "OFFER block style (above form)",
  "section2.display.style.style1": "Style 1 — Full card",
  "section2.display.style.style2": "Style 2 — Gradient banner",
  "section2.display.style.style3": "Style 3 — Compact block",
  "section2.display.style.style4": "Style 4 — Badge + total",
  "section2.display.style.style5": "Style 5 — Minimal badges",
  "section2.display.showDiscountLine": "Show discount line",
  "section2.display.showUpsellLine": "Show gift / upsell line",

  // Upsell settings
  "section2.upsell.enable": "Enable gift upsell",
  "section2.upsell.product": "Product (Shopify)",
  "section2.upsell.product.placeholder": "No product selected",
  "section2.upsell.previewTitle": "GIFT title (preview)",
  "section2.upsell.previewDescription": "GIFT description",
  "section2.upsell.productRef": "Handle / ID / URL product GIFT",
  "section2.upsell.imageUrl": "Product image GIFT (URL)",
  "section2.upsell.iconEmoji": "GIFT icon (emoji)",
  "section2.upsell.iconUrl": "GIFT icon (URL small image)",
  "section2.upsell.trigger.type": "Trigger",
  "section2.upsell.trigger.type.subtotal": "Minimum subtotal",
  "section2.upsell.trigger.type.product": "Specific product",
  "section2.upsell.trigger.minSubtotal": "Minimum subtotal",
  "section2.upsell.trigger.productHandle": "Trigger product handle / ID",

  // Gift settings
  "section2.gift.title": "Title",
  "section2.gift.note": "Note",
  "section2.gift.priceBefore": "Price before (info)",
  "section2.gift.isFree": "Free (0)",

  // Buttons
  "section2.button.save": "Save offers",

  // Preview texts
  "section2.preview.title": "Cash on Delivery (COD)",
  "section2.preview.subtitle": "Preview (form + offers)",
  "section2.preview.offersStatus.active": "OFFER activated",
  "section2.preview.offersStatus.inactive": "OFFER not eligible",
  "section2.preview.offersStatus.giftActive": "GIFT active",
  "section2.preview.offersStatus.giftPending": "GIFT pending",
  "section2.preview.offersStatus.displayAbove": "Displayed above COD form",
  "section2.preview.offerStrip.offer": "OFFER — Product with discount",
  "section2.preview.offerStrip.gift": "GIFT — Free product / upsell",
  "section2.preview.orderSummary.title": "Order summary",
  "section2.preview.orderSummary.productPrice": "Product price",
  "section2.preview.orderSummary.shipping": "Shipping price",
  "section2.preview.orderSummary.total": "Total",
  "section2.preview.form.title": "Order form",
  "section2.preview.form.fullName": "Full name *",
  "section2.preview.form.phone": "Phone (WhatsApp) *",
  "section2.preview.form.city": "City",
  "section2.preview.form.submit": "Confirm order - Total: {price} {currency}",

  // Help texts
  "section2.helpText.product": "Choose the main product linked to this offer",
  "section2.helpText.offerDesc": "Ex: Discount -10% from 2 items",
  "section2.helpText.offerImage": "Main image displayed on the left",
  "section2.helpText.offerIconEmoji": "Ex: 🔥, ⭐, -10% ...",
  "section2.helpText.offerIconUrl": "Ex: https://.../icon.png",
  "section2.helpText.giftDesc": "Ex: Free gift automatically",
  "section2.helpText.giftIconEmoji": "Ex: 🎁, ⭐, FREE ...",
  "section2.helpText.display": "This block is displayed above the COD form on the product page, without modifying the form settings",
  // ===== Section 3 — Google Sheets =====
// Header
"section3.header.title": "TripleForm COD · Google Sheets & Dashboard",
"section3.header.subtitle": "Connect Google Sheets to track COD orders in real time (confirmed & abandoned) — without leaving the interface.",
"section3.header.pill": "Google Sheets sync · Live orders",

// Rail navigation
"section3.rail.panelsTitle": "Panels",
"section3.rail.panels.sheets": "Google Sheets (orders)",
"section3.rail.panels.abandons": "Google Sheets (abandoned)",
"section3.rail.panels.realtime": "Real-time orders",
"section3.rail.panels.whatsapp": "WhatsApp & export",
"section3.rail.previewOrders": "Column preview · orders",
"section3.rail.previewAbandons": "Column preview · abandoned",
"section3.rail.noAbandonedColumns": "No columns configured for abandoned orders yet.",
"section3.rail.filtersTitle": "Order filters",
"section3.rail.stats.period": "Stats period:",
"section3.rail.stats.days": "days",
"section3.rail.stats.codOnly": "(COD only)",
"section3.rail.stats.allOrders": "(all COD app orders)",
"section3.rail.stats.orders": "Orders:",
"section3.rail.stats.total": "Total:",
"section3.rail.filters.period": "Order period",
"section3.rail.filters.periodOptions.7days": "7 days",
"section3.rail.filters.periodOptions.15days": "15 days",
"section3.rail.filters.periodOptions.30days": "30 days",
"section3.rail.filters.periodOptions.60days": "60 days",
"section3.rail.filters.codOnly": "Show only COD orders",
"section3.rail.filters.description": "These settings control the real-time order list and the summary in the purple bar. If the Shopify API returns an access error, only the message is displayed (no fake data).",
"section3.rail.filters.save": "Save (store)",

// Google connection
"section3.connection.title": "Google connection & orders sheet",
"section3.connection.loading": "Checking Google connection…",
"section3.connection.accountConnected": "Google account connected:",
"section3.connection.mainSheet": "Main sheet (orders):",
"section3.connection.notDefined": "Not defined",
"section3.connection.id": "ID",
"section3.connection.revocable": "You can change accounts or sheets anytime, access remains 100% revocable from your Google account.",
"section3.connection.description": "Connect your Google account so TripleForm COD automatically sends confirmed orders to your own Google Sheets.",
"section3.connection.authorization": "Authorization goes through the official Google screen. You can revoke it anytime from your Google account.",
"section3.connection.changeSheet": "Change orders sheet",
"section3.connection.connect": "Connect with Google",
"section3.connection.openSheet": "Open orders sheet",
"section3.connection.test": "Test connection",
"section3.connection.testSuccess": "Google Sheets connection (orders) OK ✔️",
"section3.connection.testError": "Failure ❌: {error}",
"section3.connection.unknownError": "Unknown error",

// Field mapping
"section3.mapping.title": "Fields → Google Sheets columns (orders)",
"section3.mapping.selectField": "Select a field and add it",
"section3.mapping.selectPlaceholder": "Choose a field…",
"section3.mapping.exampleName": "+ Name (example)",
"section3.mapping.description": "Each choice becomes a column in your orders sheet. The carousel remains stable even if you add or delete columns.",
"section3.mapping.configuredColumns": "Configured columns (carousel)",
"section3.mapping.previous": "Previous",
"section3.mapping.next": "Next",
"section3.mapping.column": "Column",
"section3.mapping.delete": "Delete",
"section3.mapping.fieldForColumn": "Field for column {number}",
"section3.mapping.asLink": "Save as link (HYPERLINK)",
"section3.mapping.linkTemplate": "Link template",
"section3.mapping.linkExample": "ex: https://wa.me/{value}",
"section3.mapping.width": "Width",

// Display settings
"section3.display.title": "Sheet display in app",
"section3.display.mode": "Display mode",
"section3.display.options.none": "None",
"section3.display.options.link": "Link (button)",
"section3.display.options.embedTop": "Embed at top",
"section3.display.options.embedBottom": "Embed at bottom",
"section3.display.height": "Embed height",
"section3.display.description": "You can display the orders sheet directly in the app (iframe) or just offer a quick access button.",

// Abandoned orders
"section3.abandoned.title": "Google connection & abandoned sheet",
"section3.abandoned.selectedSheet": "Selected abandoned sheet:",
"section3.abandoned.description": "This sheet is designed for abandoned orders/carts: customers who fill out the form but don't complete payment.",
"section3.abandoned.useSecondSheet": "Use a second Google Sheets to track abandoned orders (prospects who leave at the last moment).",
"section3.abandoned.whenAbandoned": "When a customer enters their info but doesn't confirm, their data can go to this dedicated sheet (WhatsApp follow-up, call, etc.).",
"section3.abandoned.changeSheet": "Choose/change abandoned sheet",
"section3.abandoned.openSheet": "Open abandoned sheet",
"section3.abandoned.testSuccess": "Google Sheets connection (abandoned) OK ✔️",
"section3.abandoned.mappingTitle": "Fields → Google Sheets columns (abandoned)",
"section3.abandoned.examplePhone": "+ Phone (example)",
"section3.abandoned.mappingDescription": "Use this sheet for \"hot\" leads who filled out their info but didn't complete the order. Remember to add at least Name + Phone + Product.",
"section3.abandoned.abandonedColumn": "Abandoned column",
"section3.abandoned.noColumns": "No columns for now. Add at least one field to start.",

// Real-time orders
"section3.realtime.title": "Real-time orders (wide)",
"section3.realtime.loading": "Loading orders…",
"section3.realtime.error": "Error: {error}",
"section3.realtime.unknownError": "unknown error",
"section3.realtime.noOrders": "No orders found for the selected period.",

// WhatsApp & export
"section3.whatsapp.title": "WhatsApp & export",
"section3.whatsapp.supportNumber": "WhatsApp support number",
"section3.whatsapp.messageTemplate": "Message template",
"section3.whatsapp.templatePlaceholder": "Hello {customer.name}, thank you for your order #{order.id}…",
"section3.whatsapp.whenToSend": "When to send?",
"section3.whatsapp.options.immediate": "Immediately",
"section3.whatsapp.options.1h": "1 hour later",
"section3.whatsapp.options.24h": "24 hours later",
"section3.whatsapp.description": "This section is still in preparation. Later you'll be able to connect order sending to WhatsApp or an external tool (webhook, Zapier, etc.). For now it's a visual mockup.",

// Guide
"section3.guide.title": "Guide · Google Sheets & orders",
"section3.guide.panelSheets": "Panel \"Google Sheets (orders)\"",
"section3.guide.panelSheetsDesc": "connect your main sheet and map COD fields to Google Sheets columns. Use the carousel to adjust order and width.",
"section3.guide.panelAbandons": "Panel \"Google Sheets (abandoned)\"",
"section3.guide.panelAbandonsDesc": "configure a second sheet dedicated to abandoned carts/orders. Useful for WhatsApp or call center follow-up.",
"section3.guide.panelRealtime": "Panel \"Real-time orders\"",
"section3.guide.panelRealtimeDesc": "displays the latest orders received by TripleForm COD for the period chosen in the left filters.",
"section3.guide.panelWhatsapp": "Panel \"WhatsApp & export\"",
"section3.guide.panelWhatsappDesc": "will later be used to send your orders to WhatsApp or to an external tool (webhook, Zapier, etc.).",

// Preview
"section3.preview.columnHeaders.date": "Date",
"section3.preview.columnHeaders.orderId": "Order ID",
"section3.preview.columnHeaders.customer": "Customer",
"section3.preview.columnHeaders.customerName": "Customer name",
"section3.preview.columnHeaders.phone": "Phone",
"section3.preview.columnHeaders.city": "City",
"section3.preview.columnHeaders.product": "Product",
"section3.preview.columnHeaders.total": "Total",
"section3.preview.columnHeaders.country": "Country",
"section3.preview.empty": "—",

// Save messages
"section3.save.success": "Google Sheets settings saved on store ✔️",
"section3.save.error": "Store save failed ❌: {error}",
"section3.save.unknownError": "Unknown error",

// Fields (pour APP_FIELDS)
"section3.fields.customer.name": "Full name",
"section3.fields.customer.phone": "Phone",
"section3.fields.customer.city": "City",
"section3.fields.customer.province": "Province/Region",
"section3.fields.customer.country": "Country",
"section3.fields.customer.address": "Address",
"section3.fields.customer.notes": "Order notes",
"section3.fields.cart.productTitle": "Product — Title",
"section3.fields.cart.variantTitle": "Product — Variant",
"section3.fields.cart.offerName": "Offer / Bundle",
"section3.fields.cart.upsellName": "Upsell",
"section3.fields.cart.quantity": "Quantity",
"section3.fields.cart.subtotal": "Order total (excluding shipping)",
"section3.fields.cart.shipping": "Shipping fees",
"section3.fields.cart.totalWithShipping": "Order total (with shipping)",
"section3.fields.cart.currency": "Currency",
"section3.fields.order.id": "Order ID",
"section3.fields.order.date": "Order date",
// Section 3 — Google Sheets (clés manquantes)
"section3.sheetsConfiguration.title": "Google Sheets configuration",
"section3.sheetsConfiguration.ordersSheet": "Orders sheet",
"section3.sheetsConfiguration.abandonedSheet": "Abandoned sheet",
"section3.sheetsConfiguration.spreadsheetId": "Spreadsheet ID",
"section3.sheetsConfiguration.spreadsheetIdHelp": "The ID from your Google Sheets URL (between /d/ and /edit)",
"section3.sheetsConfiguration.tabName": "Tab/Sheet name",
"section3.sheetsConfiguration.tabNameHelp": "Name of the tab where orders will be written",
"section3.sheetsConfiguration.headerRow": "Header row",
"section3.sheetsConfiguration.headerRowHelp": "Row number where column headers are located (usually 1)",
"section3.sheetsConfiguration.testConnection": "Test connection",
"section3.sheetsConfiguration.openSheet": "Open sheet",
"section3.sheetsConfiguration.testSuccess": "✓ Connection test successful",
"section3.sheetsConfiguration.testError": "✗ Test failed: {error}",
"section3.sheetsConfiguration.noSpreadsheetId": "Please enter a spreadsheet ID first",
"section3.sheetsConfiguration.disconnect": "Disconnect",
"section3.sheetsConfiguration.disconnectConfirm": "Are you sure you want to disconnect Google account? This will stop sending orders to Google Sheets.",
"section3.sheetsConfiguration.disconnected": "Google account disconnected",
"section3.sheetsConfiguration.disconnectError": "Disconnect error: {error}",

// Sheets tabs
"section3.sheetsTabs.orders": "Orders",
"section3.sheetsTabs.abandoned": "Abandoned",

// Connection messages
"section3.connection.success": "Google account successfully connected",
"section3.connection.error": "Connection error: {error}",
"section3.connection.popupBlocked": "The popup was blocked. Please allow popups for this site.",
"section3.connection.popupBlockedAfterOpen": "The popup was closed or blocked. Please try again.",
"section3.sheetsConfiguration.selectSpreadsheet": "Select spreadsheet",
"section3.sheetsConfiguration.selectSpreadsheetHelp": "Choose the Google Sheets spreadsheet to use",
"section3.sheetsConfiguration.selectTab": "Select tab",
"section3.sheetsConfiguration.selectTabHelp": "Choose the tab in the spreadsheet",
"section3.connection.accountConnected": "Google account connected:",
"section3.connection.mainSheet": "Main sheet (orders):",
"section3.sheetsConfiguration.selectSpreadsheet": "Select spreadsheet",
"section3.sheetsConfiguration.selectSpreadsheetHelp": "Choose the Google Sheets spreadsheet to use",
"section3.sheetsConfiguration.selectTab": "Select tab",
"section3.sheetsConfiguration.selectTabHelp": "Choose the tab in the spreadsheet",

// Section 4 — Pixels & Tracking
"section4.header.appTitle": "TripleForm COD · Pixels & Suivi",
"section4.header.appSubtitle": "Connecte Google, Facebook (Pixel & Conversions API) et TikTok pour suivre tes commandes COD.",
"section4.header.pill": "Pixels & tracking hub",

"section4.rail.title": "Panneaux",
"section4.rail.statusTitle": "Statut des pixels",
"section4.rail.statusNote": "Active uniquement les canaux dont tu as vraiment besoin. Tu pourras ensuite connecter les appels réels dans tes routes Remix et blocs Theme Extension.",
"section4.rail.panels.overview": "Overview & checklist",
"section4.rail.panels.google": "Google (GA4 & Ads)",
"section4.rail.panels.fb": "Facebook Pixel (client)",
"section4.rail.panels.capi_fb": "Facebook Conversions API",
"section4.rail.panels.tiktok": "TikTok Pixel (client)",
"section4.rail.panels.tiktok_api": "TikTok Events API (server)",
"section4.rail.panels.tests": "Tests & debug",

"section4.status.on": "ON",
"section4.status.off": "OFF",
"section4.status.ready": "Ready",
"section4.status.notReady": "Not ready",

"section4.platforms.google": "Google",
"section4.platforms.fbPixel": "Facebook Pixel",
"section4.platforms.fbCAPI": "Facebook CAPI",
"section4.platforms.tiktokPixel": "TikTok Pixel",
"section4.platforms.tiktokAPI": "TikTok Events API",

"section4.buttons.saveStore": "Save (store)",

// Overview
"section4.overview.title": "Tracking summary & best practices",
"section4.overview.description": "Here you manage all your pixels from one place: Google, Facebook Pixel & Conversions API, TikTok Pixel & Events API. The goal is to prepare the front configuration, then we connect the real APIs on the server side.",
"section4.overview.googleDesc": "GA4 Measurement ID + optionally Conversion ID/Label for Google Ads.",
"section4.overview.fbPixelDesc": "Browser script for PageView, ViewContent, AddToCart, Purchase...",
"section4.overview.fbCAPIDesc": "Server-side sending with Pixel ID + Access Token + deduplication via event_id.",
"section4.overview.tiktokPixelDesc": "Browser-side tracking (page, product views, add-to-cart, purchase).",
"section4.overview.tiktokAPIDesc": "Server-side conversions with Pixel Code + business token.",

// Google
"section4.google.mainTitle": "Google — main tag (GA4 / Ads)",
"section4.google.enableLabel": "Enable Google (gtag.js)",
"section4.google.measurementIdLabel": "GA4 Measurement ID (G-XXXX...)",
"section4.google.adsConversionIdLabel": "Google Ads Conversion ID (AW-XXXX...)",
"section4.google.adsConversionLabel": "Google Ads Conversion Label (optional)",
"section4.google.helpText": "You can use these IDs in your Theme Extension block and/or in a Remix route to send events (purchase, etc.).",
"section4.google.eventsTitle": "Google — automatic events",
"section4.google.sendPageView": "Send PageView automatically",
"section4.google.sendPurchase": "Send Purchase automatically",
"section4.google.eventsHelp": "In practice, you'll later decide in your JavaScript/Remix code when to call gtag (on ViewContent, AddToCart, Purchase...).",

// Facebook Pixel
"section4.fbPixel.mainTitle": "Facebook Pixel — configuration (client)",
"section4.fbPixel.enableLabel": "Enable Facebook Pixel (client)",
"section4.fbPixel.nameLabel": "Pixel name",
"section4.fbPixel.pixelIdLabel": "Pixel ID",
"section4.fbPixel.helpText": "The client pixel sends events via fbq() from the browser. You can generate an event_id to deduplicate with CAPI.",
"section4.fbPixel.eventsTitle": "Facebook Pixel — events & advanced matching",
"section4.fbPixel.pageView": "PageView",
"section4.fbPixel.viewContent": "ViewContent",
"section4.fbPixel.addToCart": "AddToCart",
"section4.fbPixel.initiateCheckout": "InitiateCheckout",
"section4.fbPixel.purchase": "Purchase",
"section4.fbPixel.advancedMatching": "Enable advanced matching (email, phone...)",

// Facebook CAPI
"section4.fbCAPI.mainTitle": "Facebook Conversions API — connection (server)",
"section4.fbCAPI.enableLabel": "Enable Facebook CAPI (server)",
"section4.fbCAPI.pixelIdLabel": "Pixel ID (required)",
"section4.fbCAPI.accessTokenLabel": "Access Token (required)",
"section4.fbCAPI.testEventCodeLabel": "Test Event Code (optional)",
"section4.fbCAPI.helpText": "These settings will be used in a Remix route (ex: /api/fb/capi) to send server-side events with the SDK or a simple HTTP request.",
"section4.fbCAPI.eventsTitle": "Facebook CAPI — events & deduplication",
"section4.fbCAPI.sendViewContent": "Send ViewContent server-side",
"section4.fbCAPI.sendAddToCart": "Send AddToCart server-side",
"section4.fbCAPI.sendPurchase": "Send Purchase server-side",
"section4.fbCAPI.useEventIdDedup": "Use event_id to deduplicate client + CAPI",
"section4.fbCAPI.eventsHelp": "Later, you'll pass the same event_id to the client pixel (fbq) and your CAPI call to avoid duplicates in Ads Manager.",

// TikTok Pixel
"section4.tiktokPixel.mainTitle": "TikTok Pixel — configuration (client)",
"section4.tiktokPixel.enableLabel": "Enable TikTok Pixel (client)",
"section4.tiktokPixel.nameLabel": "Pixel name",
"section4.tiktokPixel.pixelIdLabel": "Pixel ID",
"section4.tiktokPixel.helpText": "TikTok Pixel browser-side will help track product views, cart additions and purchases from your COD form.",
"section4.tiktokPixel.eventsTitle": "TikTok Pixel — automatic events",
"section4.tiktokPixel.pageView": "PageView",
"section4.tiktokPixel.viewContent": "ViewContent",
"section4.tiktokPixel.addToCart": "AddToCart",
"section4.tiktokPixel.purchase": "Purchase",

// TikTok Events API
"section4.tiktokAPI.mainTitle": "TikTok Events API — connection (server)",
"section4.tiktokAPI.enableLabel": "Enable TikTok Events API (server)",
"section4.tiktokAPI.pixelCodeLabel": "Pixel Code (required)",
"section4.tiktokAPI.accessTokenLabel": "Business Access Token (required)",
"section4.tiktokAPI.helpText": "This info will be used to call TikTok Events API directly from your backend, to send server-side conversions.",
"section4.tiktokAPI.eventsTitle": "TikTok Events API — events",
"section4.tiktokAPI.sendPurchase": "Send Purchase (server)",
"section4.tiktokAPI.eventsHelp": "For now we only plan the Purchase event server-side. You can extend later if needed.",

// Tests & Debug
"section4.tests.title": "Tests & debug — backend Pixels",
"section4.tests.description": "This test checks if your backend configuration is ready to send events:",
"section4.tests.list.fbPixel": "Facebook Pixel (client): ID present + enabled (config only, not real events).",
"section4.tests.list.tiktokPixel": "TikTok Pixel (client): ID present + enabled (config).",
"section4.tests.list.fbCAPI": "Facebook CAPI: Pixel ID + Access Token + enabled.",
"section4.tests.list.tiktokAPI": "TikTok Events API: Pixel Code + Access Token + enabled.",
"section4.tests.testButton": "Test Pixels configuration (backend)",
"section4.tests.error": "Test error: {error}",
"section4.tests.result.fbPixel": "Facebook Pixel (client config)",
"section4.tests.result.tiktokPixel": "TikTok Pixel (client config)",
"section4.tests.result.fbCAPI": "Facebook Conversions API (server)",
"section4.tests.result.tiktokAPI": "TikTok Events API (server)",
"section4.tests.resultNote": "This test does not check real events in Meta / TikTok, it only validates that the config is sufficient on the app side. To see real-time events, use Meta Pixel Helper and TikTok Pixel Helper extensions on the storefront.",

// Guide
"section4.guide.title": "Guide · Pixels & tracking",
"section4.guide.step1": "1. Start with the Google (GA4 & Ads) panel to add your Measurement ID and optionally Google Ads conversions.",
"section4.guide.step2": "2. Then enable Facebook Pixel client to track standard events from the browser.",
"section4.guide.step3": "3. Add Facebook Conversions API to double events server-side (more reliable, ad blockers, etc.).",
"section4.guide.step4": "4. Configure TikTok Pixel & Events API if you run TikTok Ads campaigns.",
"section4.guide.step5": "5. Use the Tests & debug tab to verify backend configuration is correct, then check real events with browser extensions (Meta / TikTok).",

// Save messages
"section4.save.success": "Pixels settings saved on store ✔️",
"section4.save.error": "Failed (store) ❌: {error}",
"section4.save.unknownError": "Unknown error",

// Test messages
"section4.test.unknownError": "Unknown error",
// Section 5 — Anti‑bot & Protection
"section5.header.appTitle": "TripleForm COD · Anti-bot & Protection",
"section5.header.appSubtitle": "IP · phone · country · reCAPTCHA · honeypot — to block bot orders without breaking real customers.",
"section5.header.pill": "Anti-spam security center",

"section5.rail.title": "Panels",
"section5.rail.statusTitle": "Protection summary",
"section5.rail.statusNote": "IP rules: {ips} · Phone rules: {phones}",
"section5.rail.panels.overview": "Overview & strategy",
"section5.rail.panels.ip": "IP blocking",
"section5.rail.panels.phone": "Phone blocking",
"section5.rail.panels.country": "Country blocking",
"section5.rail.panels.recap": "Google reCAPTCHA",
"section5.rail.panels.honeypot": "Honeypot & timer",

"section5.status.on": "ON",
"section5.status.off": "OFF",
"section5.status.ready": "Ready",
"section5.status.notReady": "Not ready",

"section5.buttons.save": "Save",
"section5.buttons.saveStore": "Save (store)",
"section5.buttons.add": "Add",
"section5.buttons.addCSV": "Add CSV",
"section5.buttons.remove": "Remove",
"section5.buttons.test": "Test connection",

"section5.overview.title": "Anti-bot summary & advice",
"section5.overview.description": "This section protects your COD form against bots and spam orders (scripts, fake numbers, abusive IPs...). You can enable one or several layers depending on your needs.",
"section5.overview.ip": "IP: blocks suspicious IPs, attempt limits per IP, temporary auto-ban.",
"section5.overview.phone": "Phone: controls length, allowed prefixes, fake number patterns, limits per number/day.",
"section5.overview.country": "Country: allows or blocks certain countries, or imposes a challenge (captcha).",
"section5.overview.recaptcha": "reCAPTCHA: Google layer (v2/v3) to detect robots at submission time.",
"section5.overview.honeypot": "Honeypot & timer: hidden field + minimum time on page, very effective against simple scripts.",

"section5.ipBlock.title": "Blocking by IP address",
"section5.ipBlock.enable": "Enable IP blocking",
"section5.ipBlock.trustProxy": "Trust proxy (use X-Forwarded-For)",
"section5.ipBlock.clientIpHeader": "Client IP header",
"section5.ipBlock.allowList": "Allow list — exact IPs ALLOWED",
"section5.ipBlock.denyList": "Deny list — exact IPs BLOCKED",
"section5.ipBlock.cidrList": "CIDR ranges — BLOCKED",
"section5.ipBlock.cidrHelp": "Paste one or several ranges, separated by comma or line break.",
"section5.ipBlock.autoBanFails": "Auto-ban after X failures",
"section5.ipBlock.autoBanMinutes": "Auto-ban duration (minutes)",
"section5.ipBlock.maxOrdersPerDay": "Max orders / IP / day",

"section5.phoneBlock.title": "Blocking by phone number",
"section5.phoneBlock.enable": "Enable phone blocking",
"section5.phoneBlock.minDigits": "Minimum number of digits",
"section5.phoneBlock.requirePrefix": "Require a prefix (+212…)",
"section5.phoneBlock.allowedPrefixes": "Allowed prefixes",
"section5.phoneBlock.blockedNumbers": "Blocked numbers (exact)",
"section5.phoneBlock.blockedPatterns": "Blocked patterns (simple RegExp)",
"section5.phoneBlock.maxOrdersPerDay": "Max orders / number / day",

"section5.countryBlock.title": "Blocking by country",
"section5.countryBlock.enable": "Enable country blocking",
"section5.countryBlock.defaultAction": "Default action",
"section5.countryBlock.defaultActionOptions.allow": "Allow",
"section5.countryBlock.defaultActionOptions.block": "Block",
"section5.countryBlock.defaultActionOptions.challenge": "Challenge (captcha)",
"section5.countryBlock.allowList": "Allowed countries (ISO2 codes)",
"section5.countryBlock.denyList": "Blocked countries (ISO2 codes)",

"section5.recaptcha.title": "Google reCAPTCHA",
"section5.recaptcha.enable": "Enable reCAPTCHA",
"section5.recaptcha.version": "Version",
"section5.recaptcha.versionOptions.v2_checkbox": "v2 (Checkbox)",
"section5.recaptcha.versionOptions.v2_invisible": "v2 (Invisible)",
"section5.recaptcha.versionOptions.v3": "v3 (Score)",
"section5.recaptcha.siteKey": "Site key",
"section5.recaptcha.secretKey": "Secret key (server)",
"section5.recaptcha.minScore": "Minimum score (v3)",
"section5.recaptcha.helpText": "For v2, you display a widget on the frontend. For v3, you send the token to the server and verify the score with the reCAPTCHA API before creating the order.",

"section5.honeypot.title": "Honeypot & minimum time on page",
"section5.honeypot.enable": "Enable honeypot (hidden field)",
"section5.honeypot.blockIfFilled": "Block if hidden field is filled",
"section5.honeypot.checkMouseMove": "Check mouse movements / scroll",
"section5.honeypot.fieldName": "Honeypot field name",
"section5.honeypot.minTime": "Minimum time before submission (ms)",
"section5.honeypot.timeHelp": "Ex: 3000ms = 3 seconds. If the form is submitted too quickly, we consider it a bot.",
"section5.honeypot.description": "Very simple to implement in your COD block: add a hidden field and a JavaScript timer. Many robots fill all fields or send the request instantly, making them easy to block.",

"section5.empty": "No items",
"section5.placeholder": "Add…",

"section5.save.success": "Anti-bot settings saved ✔️",
"section5.save.error": "Failed: {error}",
"section5.save.unknownError": "Unknown error",

"section5.guide.title": "Guide · TripleForm COD Anti-bot",
"section5.guide.step1": "• Start light (honeypot + phone limit) then add IP / country if you see a lot of spam.",
"section5.guide.step2": "• Allow list always takes precedence over blocking: handy for your IP or your team's IP.",
"section5.guide.step3": "• Keep reasonable values for limits (ex: 40 orders / IP / day) to avoid blocking a real customer.",
"section5.guide.step4": "• reCAPTCHA is useful if you receive many 'intelligent' bots that pass other filters.",
"section5.guide.step5": "When ready, you'll be able to use these settings in your Remix routes /api/antibot/* and in the COD form block.",
// ===== Section 6 — Geo / Shipping =====
"section6.header.appTitle": "TripleForm COD · Shipping Rates by Country/City",
"section6.header.appSubtitle": "Configure shipping rates for Morocco, Algeria, Tunisia — per province, city, or price brackets.",
"section6.header.pill": "Shipping calculator · Cities/Provinces",

"section6.rail.title": "Panels",
"section6.rail.panels.province": "Province rates",
"section6.rail.panels.city": "City rates",
"section6.rail.panels.price": "Price brackets",
"section6.rail.panels.advanced": "Advanced options",
"section6.rail.summaryTitle": "Shipping summary",
"section6.rail.type": "Type",
"section6.rail.free": "Free",
"section6.rail.paid": "Paid",
"section6.rail.mode": "Mode",
"section6.rail.priceBrackets": "Price brackets",
"section6.rail.provinces": "Provinces",
"section6.rail.cities": "Cities",
"section6.rail.countryCurrency": "Country: {country} | Currency: {currency}",

"section6.buttons.saveStore": "Save (store)",
"section6.buttons.deleteProvince": "Delete province",
"section6.buttons.addProvince": "Add province",
"section6.buttons.deleteCity": "Delete city",
"section6.buttons.addCity": "Add city",
"section6.buttons.deleteBracket": "Delete bracket",
"section6.buttons.addBracket": "Add bracket",
"section6.buttons.save": "Save advanced options",

"section6.general.title": "General shipping settings",
"section6.general.shippingType": "Shipping type",
"section6.general.freeOption": "Free shipping",
"section6.general.paidOption": "Paid shipping",
"section6.general.mainCountry": "Main country",
"section6.general.countries.MA": "Morocco",
"section6.general.countries.DZ": "Algeria",
"section6.general.countries.TN": "Tunisia",
"section6.general.countryHelp": "The main country for shipping calculations and regions.",
"section6.general.currency": "Currency",
"section6.general.currencyHelp": "Currency used for rates (MAD, DZD, TND, etc.).",
"section6.general.pricingMode": "Pricing mode",
"section6.general.modeProvince": "By province/region",
"section6.general.modeCity": "By city",
"section6.general.modePrice": "By order amount",
"section6.general.freeShippingInfo": "Your COD orders will have free shipping (no extra fees).",
"section6.general.freeShippingDetails": "Shipping is free for all orders. You can still configure advanced options (min order, COD fee, etc.).",

"section6.province.title": "Shipping rates by province — {country}",
"section6.province.description": "Define shipping fees for each province/wilaya. If a province isn't listed, the default rate will apply.",
"section6.province.provinceLabel": "Province/Wilaya",
"section6.province.provinceHelp": "Select a province or enter a custom name",
"section6.province.codeLabel": "Code",
"section6.province.codeHelp": "Optional code (ex: MA-01, DZ-16)",
"section6.province.rateLabel": "Rate ({currency})",
"section6.province.rateHelp": "Shipping fee for this province",

"section6.city.title": "Shipping rates by city — {country}",
"section6.city.description": "Define shipping fees per city. First choose province, then select city.",
"section6.city.provinceLabel": "Province/Wilaya",
"section6.city.provinceHelp": "Select province first to see its cities",
"section6.city.cityLabel": "City",
"section6.city.cityHelpEnabled": "Cities available for selected province",
"section6.city.cityHelpDisabled": "First select a province",
"section6.city.rateLabel": "Rate ({currency})",
"section6.city.rateHelp": "Shipping fee for this city",

"section6.select.provincePlaceholder": "Select province…",
"section6.select.cityPlaceholder": "Select city…",

"section6.price.title": "Shipping rates by order amount",
"section6.price.description": "Define price brackets. Ex: 0-299 MAD = 29 MAD shipping, ≥300 MAD = free.",
"section6.price.minAmount": "Minimum amount ({currency})",
"section6.price.maxAmount": "Maximum amount ({currency})",
"section6.price.maxHelp": "Leave empty or 0 for 'unlimited' (no upper limit)",
"section6.price.rateLabel": "Rate ({currency})",

"section6.advanced.title": "Advanced shipping options",
"section6.advanced.defaultRate": "Default rate ({currency})",
"section6.advanced.defaultRateHelp": "Applied if no specific rule matches",
"section6.advanced.freeThreshold": "Free threshold ({currency})",
"section6.advanced.freeThresholdHelp": "Order amount above which shipping is free",
"section6.advanced.minOrderAmount": "Minimum order amount ({currency})",
"section6.advanced.codExtraFee": "COD extra fee ({currency})",
"section6.advanced.codExtraFeeHelp": "Additional fee for COD orders (optional)",
"section6.advanced.note": "Note for customer",
"section6.advanced.noteHelp": "Displayed near shipping total",

"section6.save.success": "Shipping settings saved ✔️",
"section6.save.error": "Save failed: {error}",
"section6.save.unknownError": "Unknown error",

"section6.mode.price": "By price",
"section6.mode.province": "By province",
"section6.mode.city": "By city",

"section6.status.enabled": "Enabled",
"section6.status.disabled": "Disabled",

"section6.guide.title": "Guide · Shipping by country/city",
"section6.guide.step1": "1. Choose free or paid shipping. If paid, select mode: province, city, or price brackets.",
"section6.guide.step2": "2. Select your main country (Morocco, Algeria, Tunisia) and currency (MAD, DZD, TND).",
"section6.guide.step3": "3. Configure rates: add provinces/cities with fees, or create price brackets (0-299 = X, 300+ = free).",
"section6.guide.step4": "4. Use advanced options for default rate, free threshold, min order, COD extra fee.",
"section6.guide.step5": "5. Save → rates will be calculated automatically in your COD form.",


"section1.preview.shippingToCalculate": "Shipping to calculate",
"section3.sheetsConfiguration.chooseTab": "Choose tab",
"section3.connection.refresh": "Refresh connection",
"section1.cart.freeShipping": "Free shipping",
// ===== Section WhatsApp — Automation =====
"whatsapp.title": "WhatsApp Automation",
"whatsapp.subtitle": "Connect WhatsApp and automate your communications",
"whatsapp.connected": "Connected",
"whatsapp.disconnected": "Disconnected",
"whatsapp.connectedTo": "Connected to",
"whatsapp.lastConnected": "Last connected",
"whatsapp.refreshStatus": "Refresh status",
"whatsapp.testConnection": "Test connection",
"whatsapp.disconnect": "Disconnect",
"whatsapp.qr.placeholder": "WhatsApp QR Code",
"whatsapp.qr.generate": "Generate QR Code",
"whatsapp.qr.regenerate": "Regenerate QR Code",
"whatsapp.qr.instructions": "Open WhatsApp > Settings > Linked devices > Link a device > Scan this QR code",
"whatsapp.stats.messagesSent": "Messages sent",
"whatsapp.stats.successful": "Successful",
"whatsapp.stats.recoveryRate": "Recovery rate",
"whatsapp.stats.avgResponse": "Average response time",
"whatsapp.features.afterCOD.title": "After COD order",
"whatsapp.features.afterCOD.description": "Send an automatic message after a COD order is confirmed",
"whatsapp.features.afterCOD.enable": "Enable after-order messages",
"whatsapp.features.afterCOD.buttonText": "Button text",
"whatsapp.features.afterCOD.position": "Button position",
"whatsapp.features.afterCOD.autoSend": "Send automatically",
"whatsapp.features.afterCOD.delay": "Send delay",
"whatsapp.features.recovery.title": "Cart recovery",
"whatsapp.features.recovery.description": "Send a WhatsApp reminder for abandoned carts",
"whatsapp.features.recovery.enable": "Enable recovery",
"whatsapp.features.recovery.delay": "Delay before sending",
"whatsapp.features.recovery.discount": "Recovery discount",
"whatsapp.features.recovery.code": "Recovery code",
"whatsapp.features.templates.title": "Message templates",
"whatsapp.features.templates.description": "Customize your WhatsApp messages",
"whatsapp.features.templates.orderMessage": "After-order message",
"whatsapp.features.templates.recoveryMessage": "Recovery message",
"whatsapp.variables.available": "Available variables",
"whatsapp.variables.orderId": "Order number",
"whatsapp.variables.customerName": "Customer name",
"whatsapp.variables.customerPhone": "Customer phone",
"whatsapp.variables.productName": "Product name",
"whatsapp.variables.orderTotal": "Order total",
"whatsapp.variables.deliveryDate": "Delivery date",
"whatsapp.variables.shopName": "Store name",
"whatsapp.variables.trackingUrl": "Tracking URL",
"whatsapp.variables.supportNumber": "Support number",
"whatsapp.variables.recoveryCode": "Recovery code",
"whatsapp.delays.immediate": "Immediately",
"whatsapp.delays.5min": "5 minutes",
"whatsapp.delays.30min": "30 minutes",
"whatsapp.delays.1h": "1 hour",
"whatsapp.delays.2h": "2 hours",
"whatsapp.delays.6h": "6 hours",
"whatsapp.delays.24h": "24 hours",
"whatsapp.positions.below": "Below",
"whatsapp.positions.right": "Right",
"whatsapp.positions.replace": "Replace",
"whatsapp.advanced.title": "Advanced settings",
"whatsapp.advanced.description": "WhatsApp advanced configuration",
"whatsapp.advanced.autoConnect": "Auto-connect",
"whatsapp.advanced.analytics": "Enable analytics",
"whatsapp.advanced.readReceipts": "Read receipts",
"whatsapp.advanced.businessHours": "Business hours only",
"whatsapp.advanced.startTime": "Start time",
"whatsapp.advanced.endTime": "End time",
"whatsapp.advanced.maxRetries": "Max retries",
"whatsapp.advanced.mediaMessages": "Media messages",
"whatsapp.advanced.mediaUrl": "Media URL",
"whatsapp.advanced.buttons": "Interactive buttons",
"whatsapp.preview.title": "Message preview",
"whatsapp.preview.description": "How your message will appear",
"whatsapp.sendTest": "Send a test",
"whatsapp.saveConfig": "Save configuration",
"whatsapp.configSaved": "Configuration saved!",
"whatsapp.testSuccess": "Connection test successful!",
"whatsapp.testError": "Test error: {error}",
"whatsapp.testMessageSent": "Test message sent successfully!",
"whatsapp.confirmDisconnect": "Are you sure you want to disconnect WhatsApp?",
"whatsapp.confirmTestMessage": "Send a test message to your WhatsApp number?",
"whatsapp.errors.qrGeneration": "QR code generation error",
"whatsapp.errors.disconnect": "Disconnect error",
"whatsapp.errors.saveConfig": "Save error",
"whatsapp.errors.testMessage": "Test send error: {error}",
 /* ===== Icônes et sélecteurs ===== */
  "section1.fieldEditor.iconLabel": "Icon",
  "section1.iconSelector.title": "Choose an icon",
  "section1.cart.cartIcon": "Cart icon",

  /* ===== Libellés d'icônes ===== */
  "icon.label.CartIcon": "Cart",
  "icon.label.BagIcon": "Bag", 
  "icon.label.ProductsIcon": "Products",
  "icon.label.CheckoutIcon": "Checkout",
  "icon.label.ReceiptIcon": "Receipt",
  "icon.label.NoteIcon": "Note",
  "icon.label.ProfileIcon": "Profile",
  "icon.label.PersonIcon": "Person",
  "icon.label.UserIcon": "User",
  "icon.label.CustomersIcon": "Customers",
  "icon.label.PhoneIcon": "Phone",
  "icon.label.MobileIcon": "Mobile",
  "icon.label.CallIcon": "Call",
  "icon.label.ChatIcon": "Chat",
  "icon.label.HashtagIcon": "Hashtag",
  "icon.label.NumberIcon": "Number",
  "icon.label.CirclePlusIcon": "Plus",
  "icon.label.LocationIcon": "Location",
  "icon.label.PinIcon": "Pin",
  "icon.label.HomeIcon": "Home",
  "icon.label.StoreIcon": "Store",
  "icon.label.CityIcon": "City",
  "icon.label.GlobeIcon": "Globe",
  "icon.label.MapIcon": "Map",
  "icon.label.RegionIcon": "Region",
  "icon.label.ClipboardIcon": "Clipboard",
  "icon.label.DocumentIcon": "Document",
  "icon.label.TextIcon": "Text",
  "icon.label.TruckIcon": "Truck",
  "icon.label.CheckCircleIcon": "Check",
  "icon.label.PlayIcon": "Play",
  "icon.label.ArrowRightIcon": "Arrow right",
  "icon.label.SendIcon": "Send",
  // Rail navigation
"section2.rail.title": "Navigation",
"section2.rail.offers": "Offers (conditions)",
"section2.rail.upsells": "Gifts / Upsell",

// Groups
"section2.group.conditions.title": "Application conditions",
"section2.group.display.title": "Display",

// Global settings
"section2.global.rounding.label": "Price rounding",

// Display settings
"section2.display.showOrderSummary": "Show order summary",
"section2.display.showOffersSection": "Show offers section",

// Offer settings (individual offers)
"section2.offer.title": "Offer {{number}}",
"section2.offer.titleField": "Offer title",
"section2.offer.description": "Description",
"section2.offer.enable": "Enable this offer",
"section2.offer.type": "Discount type",
"section2.offer.type.percent": "Percentage",
"section2.offer.type.fixed": "Fixed amount",
"section2.offer.percent": "Percentage",
"section2.offer.fixedAmount": "Fixed amount",
"section2.offer.product": "Product concerned",
"section2.offer.selectProduct": "Select a product",
"section2.offer.minQuantity": "Minimum quantity",
"section2.offer.minSubtotal": "Minimum subtotal",
"section2.offer.maxDiscount": "Maximum discount (0 = unlimited)",
"section2.offer.requiresCode": "Requires a code",
"section2.offer.code": "Promo code",
"section2.offer.imageUrl": "Image URL",
"section2.offer.icon": "Icon",
"section2.offer.showInPreview": "Show in preview",

// Upsell settings (individual)
"section2.upsell.title": "Gift {{number}}",
"section2.upsell.titleField": "Gift title",
"section2.upsell.description": "Description",
"section2.upsell.enable": "Enable this gift",
"section2.upsell.product": "Gift product",
"section2.upsell.triggerType": "Activation condition",
"section2.upsell.trigger.subtotal": "Minimum subtotal",
"section2.upsell.trigger.product": "Specific product",
"section2.upsell.minSubtotal": "Minimum subtotal",
"section2.upsell.productHandle": "Product handle",
"section2.upsell.imageUrl": "Image URL",
"section2.upsell.icon": "Icon",
"section2.upsell.showInPreview": "Show in preview",

// Gift details
"section2.gift.originalPrice": "Original price",

// Buttons
"section2.button.addOffer": "Add offer",
"section2.button.addUpsell": "Add gift",

// Preview
"section2.preview.active": "Active",
"section2.preview.inactive": "Inactive",
"section2.preview.offerStrip.offer": "OFFER",
"section2.preview.offerStrip.gift": "GIFT",
"section2.preview.defaultOfferTitle": "Special offer",
"section2.preview.defaultUpsellTitle": "Surprise gift",
"section2.preview.discountPercent": "Discount of {{percent}}%",
"section2.preview.discountFixed": "Discount of {{amount}} {{currency}}",
"section2.preview.giftDescription": "Free with your order",
"section2.preview.orderSummary.title": "Order summary",
"section2.preview.orderSummary.subtotal": "Subtotal",
"section2.preview.orderSummary.shipping": "Shipping",
"section2.preview.orderSummary.total": "Total",
"section1.preview.shippingTo": "Shipping to",
"section1.newFieldPlaceholder": "New field placeholder",
"section1.newFieldLabel": "New field label",
"section1.addNewField": "Add new field",
"section1.rail.fieldsTitle": "Form fields",
"section3.statsCard.title": "Orders Statistics",
"section3.errors.sessionExpired": "Session expired, please refresh",
"whatsapp.defaults.orderMessage": "Hello {customer.name}, thank you for your order #{order.id}. We'll contact you shortly.",
"whatsapp.header.title": "WhatsApp Automation",
"whatsapp.header.subtitle": "Send automatic messages after COD orders",
"whatsapp.status.connectedTo": "Connected to",
"whatsapp.status.notConnected": "Not connected",
"whatsapp.mode.title": "Connection mode",
"whatsapp.mode.simple.title": "Simple mode (phone number)",
"whatsapp.mode.simple.subtitle": "Connect via your phone number",
"whatsapp.mode.simple.b1": "Quick setup",
"whatsapp.mode.simple.b2": "No API token needed",
"whatsapp.mode.simple.b3": "Manual QR code scan",
"whatsapp.mode.simple.b4": "Basic features",
"whatsapp.mode.advanced.title": "Advanced mode (API)",
"whatsapp.mode.advanced.subtitle": "Connect via WhatsApp Business API",
"whatsapp.mode.advanced.b1": "Automated connection",
"whatsapp.mode.advanced.b2": "Higher message limits",
"whatsapp.mode.advanced.b3": "Advanced analytics",
"whatsapp.mode.advanced.b4": "Webhook support",
"whatsapp.fields.phone.label": "Phone number",
"whatsapp.fields.phone.placeholder": "Enter WhatsApp number (with country code)",
"whatsapp.fields.phone.help": "Example: +212612345678",
"whatsapp.fields.businessName.label": "Business name",
"whatsapp.fields.businessName.placeholder": "Your business name",
"whatsapp.fields.businessName.help": "Displayed in messages",
"whatsapp.warning.title": "Important notes",
"whatsapp.warning.b1": "Keep WhatsApp Web/Desktop open",
"whatsapp.warning.b2": "Phone must have internet",
"whatsapp.warning.b3": "QR code expires every few minutes",
"whatsapp.warning.b4": "Test with a real number first",
"whatsapp.fields.token.label": "API Token",
"whatsapp.fields.token.placeholder": "Enter your WhatsApp Business API token",
"whatsapp.fields.token.help": "Get from WhatsApp Business API provider",
"whatsapp.noteApi": "Note: WhatsApp Business API requires approval and may have costs.",
"whatsapp.fields.message.label": "Message template",
"whatsapp.fields.message.placeholder": "Enter your message with variables...",
"whatsapp.fields.message.help": "Use {customer.name}, {order.id}, etc.",
"whatsapp.fields.autoSend.label": "Send automatically",
"whatsapp.qr.title": "QR Code Connection",
"whatsapp.qr.subtitle": "Scan with WhatsApp to connect",
"whatsapp.qr.empty": "No QR code generated yet",
"whatsapp.qr.howTo": "How to connect:",
"whatsapp.qr.step1": "1. Open WhatsApp on your phone",
"whatsapp.qr.step2": "2. Go to Settings → Linked devices",
"whatsapp.qr.step3": "3. Tap 'Link a device' and scan the QR code",
"whatsapp.qr.generate": "Generate QR Code",
"whatsapp.qr.regenerate": "Regenerate QR Code",
"whatsapp.qr.refresh": "Refresh QR Code",
"whatsapp.connected.title": "Connection Status",
"whatsapp.connected.last": "Last connected:",
"whatsapp.connected.sent": "Messages sent:",
"whatsapp.connected.ready": "Ready to send messages",
"common.save": "Save",
"common.disconnect": "Disconnect",
"section1.fieldEditor.titlePrefix.birthday": "Birthday",
"section1.fieldEditor.titlePrefix.company": "Company",
"section1.fieldEditor.titlePrefix.pincode": "Postal code",
"section1.fieldEditor.titlePrefix.email": "Email",
"section2.ui.header.subtitle": "Offers & Upsells — Pro settings",
"section2.ui.status.dirty": "Unsaved changes",
"section2.ui.status.saved": "Saved",
"section2.ui.status.loading": "Loading...",

"section2.ui.tabs.global": "Global",
"section2.ui.tabs.offers": "Offers",
"section2.ui.tabs.upsells": "Upsells",

"section2.ui.hero.badge": "{offers} Offers • {upsells} Upsells",
"section2.ui.hero.title": "Offers & Upsells",
"section2.ui.hero.subtitle": "Clean settings + solid preview",
"section2.ui.hero.currentTab": "{tab}",

"section2.ui.modal.unsaved.title": "Unsaved changes",
"section2.ui.modal.unsaved.body": "You have unsaved changes. Save or discard before switching sections?",
"section2.ui.modal.unsaved.primary": "Save & continue",
"section2.ui.modal.unsaved.primaryLoading": "Saving...",
"section2.ui.modal.unsaved.cancel": "Cancel",
"section2.ui.modal.unsaved.discard": "Discard",

"section2.ui.preview.title": "Preview",
"section2.ui.preview.badge.active": "Active",
"section2.ui.preview.badge.inactive": "Inactive",
"section2.ui.preview.subtitle": "Quick preview (what the customer will see).",
"section2.ui.preview.offers.title": "Offers",
"section2.ui.preview.offers.none": "No active offer in preview.",
"section2.ui.preview.upsells.title": "Upsells",
"section2.ui.preview.upsells.none": "No active upsell in preview.",
"section2.ui.preview.productLabel": "Product:",
"section2.ui.preview.product.none": "None",
"section2.ui.preview.product.selected": "Selected product",
"section2.ui.offers.title": "Offers ({count}/3)",
"section2.ui.upsells.title": "Upsells ({count}/3)",

"section2.ui.badge.proSettings": "Pro settings",
"section2.ui.badge.noButton": "No button",

"section2.ui.offer.cardTitle": "Offer {n}",
"section2.ui.upsell.cardTitle": "Upsell {n}",
"section2.ui.field.enable": "Enable",

"section2.ui.group.content": "Content",
"section2.ui.group.iconDesign": "Icon & Design",
"section2.ui.group.button": "Button (Offer)",
"section2.ui.group.preview": "Preview",

"section2.ui.field.title": "Title",
"section2.ui.field.description": "Text",
"section2.ui.field.product": "Shopify product",
"section2.ui.field.image": "Image",
"section2.ui.field.imageMode.product": "Product image (auto)",
"section2.ui.field.imageMode.custom": "Custom image (URL)",
"section2.ui.field.imageUrl": "Image URL",

"section2.ui.field.icon": "Icon",
"section2.ui.field.iconBg": "Icon background",
"section2.ui.field.cardBg": "Background",
"section2.ui.field.borderColor": "Border",

"section2.ui.field.buttonText": "Button text",
"section2.ui.field.buttonBg": "Button background",
"section2.ui.field.buttonTextColor": "Button text color",
"section2.ui.field.buttonBorder": "Button border",

"section2.ui.field.showInPreview": "Show in preview",

"section2.ui.helper.noImagesDetected": "No images detected for this product (based on returned format).",

"section2.ui.action.addOffer": "Add an offer",
"section2.ui.action.addUpsell": "Add an upsell",
"section2.ui.action.remove": "Remove",

// ======================= Section2 — Thank You Page (EN) =======================

// Tab
"section2.ui.tabs.thankyou": "Thank you page",

// Global / intro
"section2.ui.thankyou.title": "Thank you page",
"section2.ui.thankyou.subtitle": "Customize the post-order experience",
"section2.ui.thankyou.enable": "Enable thank you page",
"section2.ui.thankyou.mode.label": "Mode",
"section2.ui.thankyou.mode.simple": "Simple (button / redirect)",
"section2.ui.thankyou.mode.popup": "Popup (image + content)",
"section2.ui.thankyou.mode.help": "Choose how the thank you page behaves after checkout",

// Popup behavior
"section2.ui.thankyou.popup.enable": "Enable popup",
"section2.ui.thankyou.popup.title": "Popup title",
"section2.ui.thankyou.popup.text": "Popup text",
"section2.ui.thankyou.popup.showClose": "Show close button",
"section2.ui.thankyou.popup.closeLabel": "Close",
"section2.ui.thankyou.popup.delayMs": "Open delay (ms)",
"section2.ui.thankyou.popup.autoCloseMs": "Auto close (ms)",
"section2.ui.thankyou.popup.overlay": "Overlay background",
"section2.ui.thankyou.popup.overlayOpacity": "Overlay opacity",
"section2.ui.thankyou.popup.animation": "Animation",
"section2.ui.thankyou.popup.animation.none": "None",
"section2.ui.thankyou.popup.animation.zoom": "Zoom",
"section2.ui.thankyou.popup.animation.slideUp": "Slide up",
"section2.ui.thankyou.popup.position": "Position",
"section2.ui.thankyou.popup.position.center": "Center",
"section2.ui.thankyou.popup.position.bottom": "Bottom",

// Visual editor (Canva-like)
"section2.ui.thankyou.editor.title": "Editor",
"section2.ui.thankyou.editor.hint": "Add image, icon, text and buttons like a mini Canva editor",
"section2.ui.thankyou.editor.addBlock": "Add element",
"section2.ui.thankyou.editor.block.text": "Text",
"section2.ui.thankyou.editor.block.image": "Image",
"section2.ui.thankyou.editor.block.icon": "Icon",
"section2.ui.thankyou.editor.block.button": "Button",
"section2.ui.thankyou.editor.block.divider": "Divider",

// Insert / sources
"section2.ui.thankyou.insert.title": "Insert",
"section2.ui.thankyou.insert.image": "Insert image",
"section2.ui.thankyou.insert.imageUrl": "Image URL",
"section2.ui.thankyou.insert.iconUrl": "Icon URL",
"section2.ui.thankyou.insert.linkUrl": "Link URL",
"section2.ui.thankyou.insert.shopifyImage": "Choose Shopify image",

// Styling tools
"section2.ui.thankyou.style.title": "Style",
"section2.ui.thankyou.style.bg": "Background",
"section2.ui.thankyou.style.textColor": "Text color",
"section2.ui.thankyou.style.borderColor": "Border color",
"section2.ui.thankyou.style.radius": "Border radius",
"section2.ui.thankyou.style.shadow": "Shadow",
"section2.ui.thankyou.style.padding": "Padding",
"section2.ui.thankyou.style.align": "Alignment",
"section2.ui.thankyou.style.align.left": "Left",
"section2.ui.thankyou.style.align.center": "Center",
"section2.ui.thankyou.style.align.right": "Right",
"section2.ui.thankyou.style.fontSize": "Font size",
"section2.ui.thankyou.style.fontWeight": "Font weight",

// Palette
"section2.ui.thankyou.palette.title": "Palettes",
"section2.ui.thankyou.palette.apply": "Apply palette",
"section2.ui.thankyou.palette.custom": "Custom colors",

// Buttons
"section2.ui.thankyou.button.primaryText": "Primary button text",
"section2.ui.thankyou.button.primaryUrl": "Primary button link",
"section2.ui.thankyou.button.secondaryText": "Secondary button text",
"section2.ui.thankyou.button.secondaryUrl": "Secondary button link",

// Preview
"section2.ui.thankyou.preview.title": "Thank you page preview",
"section2.ui.thankyou.preview.openPopup": "Open popup preview",
"section2.ui.thankyou.preview.empty": "No elements yet. Add text, image or button to start."




};

/* ========================================================================
 * FR — French
 * ===================================================================== */
const FR = {
  ...EN,
  "app.name": "TripleForm COD & Upsells",

  "section0.header.title": "TripleForm COD · Dashboard",
  "section0.header.subtitle": "Vue d'ensemble, support et abonnement",
  "section0.header.pill":"Formulaire COD · Google Sheets · Pixels · Anti-bot",

  "section0.nav.forms": "Section 1 — Formulaires COD",
  "section0.nav.offers": "Section 2 — Offers (upsell/bundles)",
  "section0.nav.sheets": "Section 3 — Google Sheets",
  "section0.nav.pixels": "Section 4 — Pixels events",
  "section0.nav.antibot": "Section 5 — Anti-bot",
  "section0.nav.locations": "Section 6 — Villes/Provinces/Pays",

  "section0.group.main": "Assistant & configuration TripleForm COD",

  "section0.tabs.support": "Support & assistant",
  "section0.tabs.billing": "Plans & billing",

  "section0.billing.loading":
    "Vérification de l'abonnement en cours…",
  "section0.billing.active": "Abonnement actif ✅",
  "section0.billing.none":
    "Aucun abonnement actif pour le moment.",
  "section0.billing.planAnnual": "Plan annuel",
  "section0.billing.planMonthly": "Plan mensuel",
  "section0.billing.testMode": "(mode test)",

  "section0.banner.alreadySubscribed.title":
    "Tu as déjà un abonnement actif",
  "section0.banner.alreadySubscribed.body":
    "Tu peux passer sur un autre plan ou changer mensuel/annuel à tout moment. Shopify annulera automatiquement l'ancien abonnement quand tu acceptes le nouveau.",

  "section0.plans.badge.popular": "Populaire",
  "section0.plans.badge.current": "Plan actuel",

  "section0.plans.price.perMonth": "par mois",
  "section0.plans.price.perYear": "par an",
  "section0.plans.price.saving": "Économisez ~{percent}%",
  "section0.plans.btn.chooseMonthly": "Choisir mensuel",
  "section0.plans.btn.chooseAnnual": "Choisir annuel",
  "section0.plans.btn.alreadyMonthly": "Déjà sur mensuel",
  "section0.plans.btn.alreadyAnnual": "Déjà sur annuel",

  "section0.plans.starter.orders":"Jusqu'à 100 commandes COD / mois",
  "section0.plans.basic.orders": "Jusqu'à 500 commandes COD / mois",
  "section0.plans.premium.orders":"Commandes COD illimitées",

  "section0.features.1":
    "Formulaire COD en 1 clic sur les pages produit.",
  "section0.features.2":
    "Synchronisation en temps réel avec Google Sheets.",
  "section0.features.3":
    "Upsells & bundles après le formulaire COD.",
  "section0.features.4":
    "Relance des commandes abandonnées via WhatsApp.",
  "section0.features.5":
    "Tarifs d'expédition par pays, ville et province.",
  "section0.features.6":
    "Multi-pixels (Meta, TikTok, Google…) pour les events COD.",
  "section0.features.7":
    "Anti-bot & protection contre les fausses commandes.",
  "section0.features.8":
    "Support Triple S Partners par email & WhatsApp.",

  "section0.quickstart.title":
    "Démarrage rapide avec TripleForm COD",
  "section0.quickstart.step1":
    "1) Choisissez un plan et validez l'abonnement dans Shopify.",
  "section0.quickstart.step2":
    "2) Ajoutez le bloc « TripleForm COD — Order form » dans le template de vos produits.",
  "section0.quickstart.step3":
    "3) Configurez Form, Offers, Google Sheets, Pixels & Anti-bot, puis testez une commande COD pour vérifier que tout remonte bien.",

  "section0.videos.pill": "Centre vidéos · TripleForm COD",
  "section0.videos.title":
    "Vidéos d'explication pour chaque section.",
  "section0.videos.subtitle":
    "Tu pourras ajouter ici les liens YouTube : chaque carte = une courte vidéo claire (installation, configuration, exemples réels).",

  "section0.videos.item.intro.title":
    "Introduction · Vue d'ensemble TripleForm COD",
  "section0.videos.item.intro.sub":
    "Tour rapide du dashboard, navigation et premiers réglages.",
  "section0.videos.item.forms.title":
    "Section 1 · Formulaires COD",
  "section0.videos.item.forms.sub":
    "Créer le formulaire 1 clic, champs, design et tests de commande.",
  "section0.videos.item.offers.title":
    "Section 2 · Offers & bundles",
  "section0.videos.item.offers.sub":
    "Upsell après le formulaire, bundles et augmentation du panier.",
  "section0.videos.item.sheets.title":
    "Section 3 · Google Sheets en temps réel",
  "section0.videos.item.sheets.sub":
    "Connexion, colonnes, filtres et suivi pour ton call-center.",
  "section0.videos.item.pixels.title":
    "Section 4 · Pixels & events COD",
  "section0.videos.item.pixels.sub":
    "Meta, TikTok, Google… comment suivre chaque commande COD.",
  "section0.videos.item.antibot.title":
    "Section 5 · Anti-bot & filtres",
  "section0.videos.item.antibot.sub":
    "Bloquer les fausses commandes et sécuriser tes campagnes.",
  "section0.videos.item.locations.title":
    "Section 6 · Villes, provinces & pays",
  "section0.videos.item.locations.sub":
    "Gérer les zones livrables, frais par pays et filtrage par ville.",

  "section0.lang.label": "Langue de l'interface",

  "section0.support.header": "Support · FAQ sections COD",
  "section0.support.search.placeholder":
    "Rechercher (Google Sheets, Formulaire, Pixels, Anti-bot...)",
  "section0.support.noResults": "Aucune question trouvée.",
  "section0.support.contactText":
    "Besoin d'aide personnalisée sur ton store ?",
  "section0.support.whatsapp": "WhatsApp",
  "section0.support.email": "Email",
  "section0.support.cat.all": "Tous",
  "section0.support.cat.start": "Commencer",
  "section0.support.cat.forms": "Formulaires",
  "section0.support.cat.offers": "Offers",
  "section0.support.cat.sheets": "Google Sheets",
  "section0.support.cat.pixels": "Pixels",
  "section0.support.cat.antibot": "Anti-bot",
  "section0.support.cat.shipping": "Livraison",
  "section0.support.cat.billing": "Abonnement",
  "section0.support.cat.support": "Support",

  "section0.usage.noPlan.title": "Statut du plan",
  "section0.usage.noPlan.body":
    "Aucune formule active. Choisis un plan dans l'onglet « Plans & billing ». ",
  "section0.usage.planFallback": "Plan actif",
  "section0.usage.header.title": "Suivi de ton plan",
  "section0.usage.header.subtitleTail": "commandes COD",
  "section0.usage.badge.active": "Abonnement actif",
  "section0.usage.commandsLabel": "Commandes",
  "section0.usage.loading":
    "Actualisation des statistiques en cours…",
  "section0.usage.unlimitedText":
    "Commandes COD illimitées sur ton plan actuel.",
  "section0.usage.limitedText":
    "Suivi des commandes COD sur ta période actuelle.",
  "section0.usage.used": "Utilisées",
  "section0.usage.usedOf": "sur",
  "section0.usage.remaining": "Restantes",
  "section0.usage.beforeLimit": "avant la limite",
  "section0.usage.progress": "Progression",
  "section0.usage.since": "Depuis :",
  "section0.usage.term.annual": "Annuel",
  "section0.usage.term.monthly": "Mensuel",

  /* FAQ — FR (mêmes textes que tu avais) */
  "section0.faq.start.1.title":
    "Par où commencer avec l'application COD ?",
  "section0.faq.start.1.answer.1":
    "1) Ajoute le bloc TripleForm COD — Order form dans ton thème Shopify (template produit).",
  "section0.faq.start.1.answer.2":
    "2) Va dans la Section 1 — Formulaires COD pour choisir les champs et le design.",
  "section0.faq.start.1.answer.3":
    "3) Configure la Section 3 — Google Sheets si tu veux un call-center ou un suivi en temps réel.",
  "section0.faq.start.1.answer.4":
    "4) Fais une commande test depuis un vrai produit pour vérifier que tout remonte bien.",

  "section0.faq.start.2.title":
    "Comment installer le bloc COD dans mon thème ?",
  "section0.faq.start.2.answer.1":
    "1) Ouvre l'éditeur de thème Shopify.",
  "section0.faq.start.2.answer.2":
    "2) Dans le template de tes produits, clique sur Ajouter un bloc ou Ajouter une section.",
  "section0.faq.start.2.answer.3":
    "3) Cherche TripleForm COD — Order form et ajoute-le sous la description produit ou près du bouton Ajouter au panier.",
  "section0.faq.start.2.answer.4":
    "4) Enregistre : le formulaire COD est maintenant visible sur tes pages produits.",

  "section0.faq.start.3.title":
    "Comment faire une commande test complète ?",
  "section0.faq.start.3.answer.1":
    "1) Va sur un produit réel avec le bloc COD actif.",
  "section0.faq.start.3.answer.2":
    "2) Remplis tous les champs obligatoires (Nom, Téléphone, Ville, etc.).",
  "section0.faq.start.3.answer.3":
    "3) Utilise un vrai numéro de téléphone (pour tester le call-center).",
  "section0.faq.start.3.answer.4":
    "4) Vérifie ensuite dans Shopify › Commandes et, si activé, dans Google Sheets et dans les Pixels.",

  "section0.faq.start.4.title":
    "Le formulaire COD ne s'affiche pas sur mes produits",
  "section0.faq.start.4.answer.1":
    "1) Vérifie que le bloc TripleForm COD — Order form est bien ajouté dans le template de produit.",
  "section0.faq.start.4.answer.2":
    "2) Assure-toi que tu regardes un produit qui utilise ce template.",
  "section0.faq.start.4.answer.3":
    "3) Désactive temporairement d'autres apps ou scripts qui modifient fortement le DOM (theme custom, page builder…).",
  "section0.faq.start.4.answer.4":
    "4) Recharge le thème et vide le cache si nécessaire.",

  "section0.faq.forms.1.title":
    "Comment activer / désactiver les champs du formulaire COD ?",
  "section0.faq.forms.1.answer.1":
    "1) Va dans la Section 1 — Formulaires COD de l'app.",
  "section0.faq.forms.1.answer.2":
    "2) Dans le panneau Champs du formulaire, active ou désactive Nom complet, Téléphone, Adresse, Ville, Province, Notes, etc.",
  "section0.faq.forms.1.answer.3":
    "3) Tu peux rendre certains champs obligatoires (required) pour éviter les commandes incomplètes.",
  "section0.faq.forms.1.answer.4":
    "4) Enregistre puis teste sur un produit pour voir le nouveau formulaire.",

  "section0.faq.forms.2.title":
    "Comment changer les couleurs et le design du formulaire ?",
  "section0.faq.forms.2.answer.1":
    "1) Dans la Section 1, ouvre l'onglet ou le groupe Design du formulaire.",
  "section0.faq.forms.2.answer.2":
    "2) Modifie les couleurs du bouton, de l'arrière-plan, des bordures et de la typographie.",
  "section0.faq.forms.2.answer.3":
    "3) Tu peux ajuster le rayon des bordures, l'ombre, et l'alignement pour matcher ton thème.",
  "section0.faq.forms.2.answer.4":
    "4) Enregistre et rafraîchis la page produit pour voir le rendu final.",

  "section0.faq.forms.3.title":
    "Le bouton « Envoyer la commande » ne fonctionne pas",
  "section0.faq.forms.3.answer.1":
    "1) Vérifie que tous les champs obligatoires sont bien remplis (surtout le téléphone).",
  "section0.faq.forms.3.answer.2":
    "2) Si tu utilises l'Anti-bot (Section 5), commence par désactiver temporairement les règles trop strictes pour tester.",
  "section0.faq.forms.3.answer.3":
    "3) Assure-toi que le produit et la variante sont valides (variantId bien envoyé).",
  "section0.faq.forms.3.answer.4":
    "4) Si le problème persiste, contacte le support avec une capture de la console (F12) et du message d'erreur.",

  "section0.faq.forms.4.title":
    "Comment activer la validation du numéro de téléphone ?",
  "section0.faq.forms.4.answer.1":
    "1) Dans la Section 1 — Formulaires, active l'option de validation du téléphone (par pays).",
  "section0.faq.forms.4.answer.2":
    "2) Choisis les préfixes autorisés (ex : +212, +213, +216) et la longueur minimum.",
  "section0.faq.forms.4.answer.3":
    "3) En cas de numéro trop court ou invalide, le formulaire affiche un message et bloque l'envoi.",

  "section0.faq.forms.5.title":
    "Comment ajouter un champ Notes ou Commentaire pour le client ?",
  "section0.faq.forms.5.answer.1":
    "1) Dans la Section 1, active le champ Notes / Commentaire si disponible.",
  "section0.faq.forms.5.answer.2":
    "2) Ce texte sera transmis vers la commande Shopify (note) et vers Google Sheets si tu mappes la colonne correspondante.",
  "section0.faq.forms.5.answer.3":
    "3) Idéal pour des infos comme : étage, code porte, créneau de livraison, etc.",

  "section0.faq.offers.1.title":
    "Comment activer l'upsell après l'envoi du formulaire COD ?",
  "section0.faq.offers.1.answer.1":
    "1) Va dans la Section 2 — Offers (upsell/bundles).",
  "section0.faq.offers.1.answer.2":
    "2) Crée une nouvelle offre en choisissant le produit principal + le produit d'upsell.",
  "section0.faq.offers.1.answer.3":
    "3) Configure la réduction (par exemple -20 %) et le texte de l'offre.",
  "section0.faq.offers.1.answer.4":
    "4) Active l'offre : après le formulaire COD, le client verra la proposition d'upsell.",

  "section0.faq.offers.2.title":
    "Comment créer un bundle 1 / 2 / 3 pièces avec réduction ?",
  "section0.faq.offers.2.answer.1":
    "1) Dans Section 2, ajoute une offre de type bundle.",
  "section0.faq.offers.2.answer.2":
    "2) Définit les options 1 pièce, 2 pièces, 3 pièces avec les pourcentages de réduction pour chaque palier.",
  "section0.faq.offers.2.answer.3":
    "3) Le client peut choisir directement le bundle dans l'interface après le formulaire COD.",

  "section0.faq.offers.3.title":
    "L'upsell ou le bundle ne s'affiche pas après le formulaire",
  "section0.faq.offers.3.answer.1":
    "1) Vérifie que l'offre est bien activée dans la Section 2.",
  "section0.faq.offers.3.answer.2":
    "2) Assure-toi que la condition de produit est respectée (même produit ou collection).",
  "section0.faq.offers.3.answer.3":
    "3) Fais une commande test complète : certaines offres ne s'affichent qu'après un vrai envoi du formulaire.",

  "section0.faq.sheets.1.title":
    "Comment connecter ma feuille Google Sheets ?",
  "section0.faq.sheets.1.answer.1":
    "1) Va dans la Section 3 — Google Sheets.",
  "section0.faq.sheets.1.answer.2":
    "2) Colle l'ID de la feuille (la partie entre /d/ et /edit dans l'URL).",
  "section0.faq.sheets.1.answer.3":
    "3) Choisis l'onglet (Tab name) exact où tu veux recevoir les commandes.",
  "section0.faq.sheets.1.answer.4":
    "4) Utilise le carrousel pour mapper chaque colonne (Nom complet, Téléphone, Ville, Produit, Total, etc.), puis clique sur Enregistrer.",

  "section0.faq.sheets.2.title":
    "Les commandes n'arrivent pas ou plus dans Google Sheets",
  "section0.faq.sheets.2.answer.1":
    "1) Vérifie que l'ID de la feuille et le nom d'onglet sont corrects.",
  "section0.faq.sheets.2.answer.2":
    "2) Assure-toi que l'email du service Google (service account) a bien accès en édition à la feuille (partage).",
  "section0.faq.sheets.2.answer.3":
    "3) Vérifie que la config est bien enregistrée dans la Section 3 (bouton Enregistrer boutique).",
  "section0.faq.sheets.2.answer.4":
    "4) Fais une nouvelle commande test et vérifie les logs serveur si nécessaire.",

  "section0.faq.sheets.3.title":
    "Comment définir l'ordre des colonnes dans la feuille ?",
  "section0.faq.sheets.3.answer.1":
    "1) Dans la Section 3, utilise le carrousel des colonnes (Colonne 1, Colonne 2, etc.).",
  "section0.faq.sheets.3.answer.2":
    "2) Pour chaque colonne, choisis le type (datetime, number, currency, string...) et le champ (customer.name, customer.phone, cart.productTitle, cart.total...).",
  "section0.faq.sheets.3.answer.3":
    "3) Réorganise les colonnes en les déplaçant dans le carrousel.",
  "section0.faq.sheets.3.answer.4":
    "4) Enregistre, puis fais une commande test pour voir l'ordre appliqué dans Google Sheets.",

  "section0.faq.sheets.4.title":
    "Quelle est la différence entre Total hors livraison et Total avec livraison ?",
  "section0.faq.sheets.4.answer.1":
    "1) Total commande (hors livraison) : montant du produit + éventuelles réductions, sans les frais de livraison.",
  "section0.faq.sheets.4.answer.2":
    "2) Total commande (avec livraison) : inclut aussi les frais d'expédition (si tu les as configurés).",
  "section0.faq.sheets.4.answer.3":
    "3) Dans la Section 3, tu peux choisir quel total envoyer dans la colonne Google Sheets (cart.subtotal ou cart.totalWithShipping).",

  "section0.faq.pixels.1.title":
    "Comment connecter Meta Pixel, TikTok ou Google ?",
  "section0.faq.pixels.1.answer.1":
    "1) Va dans la Section 4 — Pixels events.",
  "section0.faq.pixels.1.answer.2":
    "2) Colle ton Meta Pixel ID, TikTok Pixel ID ou Google Measurement ID dans les champs prévus.",
  "section0.faq.pixels.1.answer.3":
    "3) Active les événements (Purchase COD, PageView, etc.) que tu veux envoyer.",
  "section0.faq.pixels.1.answer.4":
    "4) Fais une commande test et vérifie dans Meta Events Manager / TikTok Events / Google DebugView.",

  "section0.faq.pixels.2.title":
    "Quel événement est envoyé pour une commande COD ?",
  "section0.faq.pixels.2.answer.1":
    "1) L'app envoie un event de type Purchase (achat) pour les commandes COD.",
  "section0.faq.pixels.2.answer.2":
    "2) L'event contient : montant total, devise, quantité et informations produit.",
  "section0.faq.pixels.2.answer.3":
    "3) Tu peux utiliser ces données pour optimiser tes campagnes Meta, TikTok ou Google Ads.",

  "section0.faq.pixels.3.title":
    "Le pixel ne reçoit pas les événements",
  "section0.faq.pixels.3.answer.1":
    "1) Vérifie que les IDs (Meta, TikTok, Google) sont corrects et bien enregistrés.",
  "section0.faq.pixels.3.answer.2":
    "2) Désactive les bloqueurs de pub / adblockers sur ton navigateur pendant le test.",
  "section0.faq.pixels.3.answer.3":
    "3) Utilise un vrai produit et fais une commande complète pour déclencher Purchase.",
  "section0.faq.pixels.3.answer.4":
    "4) Vérifie aussi les logs côté serveur si l'app envoie des events via API (CAPI).",

  "section0.faq.antibot.1.title":
    "À quoi sert la section Anti-bot ?",
  "section0.faq.antibot.1.answer.1":
    "1) Bloquer les commandes spam et les robots qui remplissent ton formulaire COD.",
  "section0.faq.antibot.1.answer.2":
    "2) Filtrer les numéros de téléphone trop courts ou suspects.",
  "section0.faq.antibot.1.answer.3":
    "3) Limiter les commandes depuis certains pays ou IP si nécessaire.",

  "section0.faq.antibot.2.title":
    "Comment bien configurer l'Anti-bot sans bloquer les vrais clients ?",
  "section0.faq.antibot.2.answer.1":
    "1) Commence simple : active la validation du téléphone (minDigits) et le honeypot (champ caché + temps minimum).",
  "section0.faq.antibot.2.answer.2":
    "2) Ajoute ensuite des règles IP (denyList/allowList) uniquement si tu vois du spam répétitif.",
  "section0.faq.antibot.2.answer.3":
    "3) Pour les pays, utilise plutôt une allowList des pays où tu vends réellement.",
  "section0.faq.antibot.2.answer.4":
    "4) Teste tes changements avec une vraie commande pour vérifier que tout reste fluide.",

  "section0.faq.antibot.3.title":
    "Pourquoi certaines commandes sont bloquées par l'Anti-bot ?",
  "section0.faq.antibot.3.answer.1":
    "1) Le message d'erreur contient un code ANTIBOT_BLOCKED et la raison : téléphone trop court, pays non autorisé, honeypot rempli, IP bloquée, etc.",
  "section0.faq.antibot.3.answer.2":
    "2) Vérifie ta configuration dans la Section 5 — Anti-bot et assouplis les règles si tu bloques des vrais clients.",

  "section0.faq.shipping.1.title":
    "Comment ajouter mes pays, villes et provinces ?",
  "section0.faq.shipping.1.answer.1":
    "1) Va dans la Section 6 — Villes/Provinces/Pays.",
  "section0.faq.shipping.1.answer.2":
    "2) Ajoute d'abord les pays que tu dessers (ex : Maroc, Algérie, Tunisie…).",
  "section0.faq.shipping.1.answer.3":
    "3) Ajoute ensuite les villes et les provinces associées à chaque pays.",
  "section0.faq.shipping.1.answer.4":
    "4) Ces données peuvent être utilisées pour le formulaire COD et pour ton call-center via Google Sheets.",

  "section0.faq.shipping.2.title":
    "Puis-je appliquer des frais de livraison différents selon la ville ?",
  "section0.faq.shipping.2.answer.1":
    "1) Oui, l'objectif de la Section 6 est de structurer les villes / provinces / pays.",
  "section0.faq.shipping.2.answer.2":
    "2) Tu peux ensuite utiliser ces infos dans ton workflow (Sheets, call-center, règles de livraison) pour appliquer des tarifs différents par zone.",

  "section0.faq.billing.1.title":
    "Comment fonctionne l'abonnement Shopify pour l'app ?",
  "section0.faq.billing.1.answer.1":
    "1) Dans la Section 0 — Dashboard, onglet Plans & billing, choisis Starter, Basic ou Premium (mensuel ou annuel).",
  "section0.faq.billing.1.answer.2":
    "2) Shopify ouvre une page de confirmation officielle pour créer l'abonnement.",
  "section0.faq.billing.1.answer.3":
    "3) Une fois validé, l'app détecte ton plan actif et débloque les fonctionnalités.",
  "section0.faq.billing.1.answer.4":
    "4) La facturation est gérée à 100 % par Shopify (tu peux voir les factures dans Shopify Billing).",

  "section0.faq.billing.2.title":
    "Comment changer de plan (Starter, Basic, Premium) ?",
  "section0.faq.billing.2.answer.1":
    "1) Ouvre la Section 0 — Dashboard, onglet Plans & billing.",
  "section0.faq.billing.2.answer.2":
    "2) Clique sur Choisir mensuel ou Choisir annuel sur le nouveau plan.",
  "section0.faq.billing.2.answer.3":
    "3) Shopify t'ouvre une nouvelle page de confirmation.",
  "section0.faq.billing.2.answer.4":
    "4) Après validation, le nouveau plan devient actif et l'ancien est automatiquement annulé par Shopify.",

  "section0.faq.support.1.title":
    "Comment contacter le support pour une aide personnalisée ?",
  "section0.faq.support.1.answer.1":
    "1) WhatsApp : pour les questions rapides, captures d'écran et tests en direct.",
  "section0.faq.support.1.answer.2":
    "2) Email : pour les demandes plus longues, problèmes techniques détaillés ou suggestions.",
  "section0.faq.support.1.answer.3":
    "3) N'hésite pas à envoyer une vidéo courte de ton problème (Loom, téléphone…) pour qu'on le comprenne plus vite.",
  
  // ===== Section 1 — COD Forms =====
  // Header
  "section1.header.appTitle": "Forms COD — Formulaire de commande",
  "section1.header.appSubtitle":
    "Personnalise le formulaire COD et le résumé de commande pour tes produits.",
  "section1.header.btnAddToTheme": "Ajouter le bloc dans le thème",
  "section1.header.btnPreview": "Prévisualiser le formulaire",
  "section1.header.btnSave": "Enregistrer les réglages",

  // Left rail / navigation
  "section1.rail.title": "Formulaire COD",
  "section1.rail.cart": "Résumé de commande",
  "section1.rail.titles": "Titres du formulaire",
  "section1.rail.buttons": "Boutons & messages",
  "section1.rail.fieldsSeparator": "Champs du formulaire",
  "section1.rail.appearanceSeparator": "Apparence & options",
  "section1.rail.colors": "Couleurs & style",
  "section1.rail.options": "Options",

  // Groups
  "section1.group.cart.title": "Textes du résumé de commande",
  "section1.group.formTitles.title": "Titres du formulaire",
  "section1.group.buttons.title": "Boutons & messages",
  "section1.group.colors.title": "Couleurs & style du formulaire",
  "section1.group.options.title": "Options d'affichage & comportement",
  "section1.group.fields.title": "Configuration des champs",

  // Cart texts
  "section1.cart.labelTop": "Titre du panier",
  "section1.cart.labelPrice": "Label prix",
  "section1.cart.labelShipping": "Label livraison",
  "section1.cart.labelTotal": "Label total",

  // Form texts
  "section1.form.titleLabel": "Titre du formulaire",
  "section1.form.subtitleLabel": "Sous-titre du formulaire",
  "section1.form.successTextLabel": "Message de succès",

  // Buttons
  "section1.buttons.displayStyleLabel": "Style d'affichage",
  "section1.buttons.style.inline": "En ligne",
  "section1.buttons.style.popup": "Popup",
  "section1.buttons.style.drawer": "Tiroir",
  "section1.buttons.mainCtaLabel": "Texte du bouton principal",
  "section1.buttons.totalSuffixLabel": "Suffixe total",
  "section1.buttons.successTextLabel": "Message de succès",

  // Colors section
  "section1.colors.formSection": "Couleurs du formulaire",
  "section1.colors.bg": "Arrière-plan",
  "section1.colors.text": "Couleur du texte",
  "section1.colors.border": "Couleur de bordure",
  "section1.colors.inputBg": "Arrière-plan des champs",
  "section1.colors.inputBorder": "Bordure des champs",
  "section1.colors.placeholder": "Couleur du placeholder",
  "section1.colors.buttonSection": "Couleurs du bouton",
  "section1.colors.btnBg": "Arrière-plan du bouton",
  "section1.colors.btnText": "Texte du bouton",
  "section1.colors.btnBorder": "Bordure du bouton",
  "section1.colors.btnHeight": "Hauteur du bouton",
  "section1.colors.cartSection": "Couleurs du panier",
  "section1.colors.cartBg": "Arrière-plan du panier",
  "section1.colors.cartBorder": "Bordure du panier",
  "section1.colors.cartRowBg": "Arrière-plan des lignes",
  "section1.colors.cartRowBorder": "Bordure des lignes",
  "section1.colors.cartTitle": "Couleur des titres",
  "section1.colors.cartText": "Couleur du texte",
  "section1.colors.layoutSection": "Mise en page & espacements",
  "section1.colors.radius": "Rayon des bordures",
  "section1.colors.padding": "Padding interne",
  "section1.colors.fontSize": "Taille de police",
  "section1.colors.direction": "Direction du texte",
  "section1.colors.titleAlign": "Alignement du titre",
  "section1.colors.fieldAlign": "Alignement des champs",
  "section1.colors.shadow": "Ombre",
  "section1.colors.glow": "Effet lumineux",
  "section1.colors.glowPx": "Intensité du glow",
  "section1.colors.hexLabel": "Couleur hexadécimale",

  // Alignment options
  "section1.align.left": "Gauche",
  "section1.align.center": "Centre",
  "section1.align.right": "Droite",

  // Options section
  "section1.options.behavior": "Comportement",
  "section1.options.openDelayMs": "Délai d'ouverture (ms)",
  "section1.options.effect": "Effet visuel",
  "section1.options.effect.none": "Aucun",
  "section1.options.effect.light": "Ombre légère",
  "section1.options.effect.glow": "Lueur",
  "section1.options.closeOnOutside": "Fermer au clic extérieur",
  "section1.options.drawer": "Paramètres du tiroir",
  "section1.options.drawerDirection": "Direction du tiroir",
  "section1.options.drawerDirection.right": "Droite",
  "section1.options.drawerDirection.left": "Gauche",
  "section1.options.drawerSize": "Taille du tiroir",
  "section1.options.overlayColor": "Couleur de l'overlay",
  "section1.options.overlayOpacity": "Opacité de l'overlay",
  "section1.options.stickyButton": "Bouton collant",
  "section1.options.stickyType": "Type de sticky",
  "section1.options.sticky.none": "Aucun",
  "section1.options.sticky.bottomBar": "Barre du bas",
  "section1.options.sticky.bubbleRight": "Bulle droite",
  "section1.options.sticky.bubbleLeft": "Bulle gauche",
  "section1.options.stickyLabel": "Label du bouton sticky",
  "section1.options.countries": "Pays & régions",
  "section1.options.countries.storeCountryLabel": "Pays du store",
  "section1.options.countries.selectPlaceholder": "Sélectionner un pays",
  "section1.options.countries.note": "Sélectionnez votre pays principal pour les préfixes téléphoniques et régions",
  "section1.options.consents": "Consentements",
  "section1.options.requireGdpr": "Exiger consentement RGPD",
  "section1.options.gdprLabel": "Label RGPD",
  "section1.options.whatsappOptIn": "Opt-in WhatsApp",
  "section1.options.whatsappLabel": "Label WhatsApp",

  // Field editor
  "section1.group.formTexts.title": "Textes du formulaire",
  "section1.fieldEditor.activeLabel": "Actif",
  "section1.fieldEditor.requiredLabel": "Obligatoire",
  "section1.fieldEditor.typeLabel": "Type de champ",
  "section1.fieldEditor.type.text": "Texte",
  "section1.fieldEditor.type.phone": "Téléphone",
  "section1.fieldEditor.type.textarea": "Zone de texte",
  "section1.fieldEditor.type.number": "Nombre",
  "section1.fieldEditor.labelLabel": "Label",
  "section1.fieldEditor.placeholderLabel": "Placeholder",
  "section1.fieldEditor.phonePrefixLabel": "Préfixe téléphonique",
  "section1.fieldEditor.minLabel": "Minimum",
  "section1.fieldEditor.maxLabel": "Maximum",
"section1.fieldEditor.titlePrefix.fullName": "Nom complet",
"section1.fieldEditor.titlePrefix.phone": "Téléphone (WhatsApp)",
"section1.fieldEditor.titlePrefix.city": "Ville",
"section1.fieldEditor.titlePrefix.province": "Province/Région",
"section1.fieldEditor.titlePrefix.address": "Adresse",
"section1.fieldEditor.titlePrefix.notes": "Notes/commentaire",
"section1.fieldEditor.titlePrefix.quantity": "Quantité",

  // Preview
  "section1.preview.priceExample": "199,00",
  "section1.preview.freeShipping": "Livraison gratuite",
  "section1.preview.cityPlaceholder": "Choisir la ville",
  "section1.preview.cityPlaceholderNoProvince": "Choisir la ville",
  "section1.preview.cityPlaceholderNoProv": "Choisir la ville",
  "section1.preview.provincePlaceholder": "Sélectionner la province",
  "section1.preview.style.inline": "En ligne",
  "section1.preview.style.popup": "Popup",
  "section1.preview.style.drawer": "Tiroir",
  "section1.preview.stickyBarLabel": "Barre collante",
  "section1.preview.stickyBubbleLabel": "Bulle collante",

  // Save messages
  "section1.save.errorGeneric": "Erreur lors de l'enregistrement",
  "section1.save.success": "Paramètres enregistrés avec succès !",
  "section1.save.unknownError": "Une erreur inconnue est survenue",
  "section1.save.failedPrefix": "Échec de l'enregistrement : ",

  // Modal preview
  "section1.modal.previewTitle": "Aperçu du formulaire COD",
  "section1.modal.previewClose": "Fermer l'aperçu",
   // Header
  "section2.header.appTitle": "Offres · Upsells & Bundles COD",
  "section2.header.appSubtitle": "Configure les réductions automatiques, bundles et cadeaux au-dessus du formulaire COD",
  "section2.header.btnSave": "Enregistrer les réglages",

  // Rail navigation
  "section2.rail.title": "Configuration des offres",
  "section2.rail.global": "Global & couleurs",
  "section2.rail.discount": "Offres (conditions)",
  "section2.rail.upsell": "Cadeau / upsell",

  // Groups
  "section2.group.global.title": "Options globales",
  "section2.group.theme.title": "Couleurs & style (aperçu)",
  "section2.group.discount.title": "Offres — Remise conditionnelle",
  "section2.group.display.title": "Affichage sur la fiche produit",
  "section2.group.upsell.title": "Upsell — Cadeau gagnant",
  "section2.group.gift.title": "Cadeau",

  // Global options
  "section2.global.enable": "Activer les offres & upsell",
  "section2.global.currency": "Devise affichée",
  "section2.global.rounding": "Arrondi du total",
  "section2.global.rounding.none": "Aucun arrondi",
  "section2.global.rounding.unit": "Arrondi à l'unité",
  "section2.global.rounding.99": "Terminer en .99",

  // Theme presets
  "section2.theme.preset": "Palette rapide (sans code couleur)",
  "section2.theme.preset.light": "Clair — fond blanc, bouton noir",
  "section2.theme.preset.dark": "Sombre — fond foncé, bouton orange",
  "section2.theme.preset.purple": "Violet — style premium",
  "section2.theme.statusBarBg": "Fond barre statut OFFRES",
  "section2.theme.statusBarText": "Texte barre statut OFFRES",
  "section2.theme.offerBg": "Fond carte OFFRE",
  "section2.theme.upsellBg": "Fond carte CADEAU",
  "section2.theme.ctaBg": "Fond bouton CTA",
  "section2.theme.ctaText": "Texte bouton CTA",
  "section2.theme.ctaBorder": "Bordure bouton CTA",

  // Discount/Offer settings
  "section2.discount.enable": "Activer les offres",
  "section2.discount.product": "Produit (Shopify)",
  "section2.discount.product.placeholder": "Aucun produit sélectionné",
  "section2.discount.previewTitle": "Titre OFFRE (aperçu)",
  "section2.discount.previewDescription": "Description OFFRE",
  "section2.discount.productRef": "Handle / ID / URL produit OFFRE",
  "section2.discount.imageUrl": "Image produit OFFRE (URL)",
  "section2.discount.iconEmoji": "Icône OFFRE (emoji)",
  "section2.discount.iconUrl": "Icône OFFRE (URL petite image)",
  "section2.discount.type": "Type de remise",
  "section2.discount.type.percent": "Pourcentage (%)",
  "section2.discount.type.fixed": "Montant fixe",
  "section2.discount.percent": "% remise",
  "section2.discount.fixedAmount": "Montant fixe",
  "section2.discount.conditions.minQty": "Quantité minimale (minQty)",
  "section2.discount.conditions.minSubtotal": "Sous-total minimum",
  "section2.discount.conditions.requiresCode": "Requiert un code",
  "section2.discount.conditions.code": "Code coupon",
  "section2.discount.caps.maxDiscount": "Plafond de remise (0 = aucun)",

  // Display settings
  "section2.display.style": "Style du bloc OFFRE (au-dessus du formulaire)",
  "section2.display.style.style1": "Style 1 — Carte complète",
  "section2.display.style.style2": "Style 2 — Bandeau dégradé",
  "section2.display.style.style3": "Style 3 — Bloc compact",
  "section2.display.style.style4": "Style 4 — Badge + total",
  "section2.display.style.style5": "Style 5 — Badges minimaux",
  "section2.display.showDiscountLine": "Afficher la ligne de remise",
  "section2.display.showUpsellLine": "Afficher la ligne de cadeau / upsell",

  // Upsell settings
  "section2.upsell.enable": "Activer le cadeau upsell",
  "section2.upsell.product": "Produit (Shopify)",
  "section2.upsell.product.placeholder": "Aucun produit sélectionné",
  "section2.upsell.previewTitle": "Titre CADEAU (aperçu)",
  "section2.upsell.previewDescription": "Description CADEAU",
  "section2.upsell.productRef": "Handle / ID / URL produit CADEAU",
  "section2.upsell.imageUrl": "Image produit CADEAU (URL)",
  "section2.upsell.iconEmoji": "Icône CADEAU (emoji)",
  "section2.upsell.iconUrl": "Icône CADEAU (URL petite image)",
  "section2.upsell.trigger.type": "Déclencheur",
  "section2.upsell.trigger.type.subtotal": "Sous-total minimum",
  "section2.upsell.trigger.type.product": "Produit spécifique",
  "section2.upsell.trigger.minSubtotal": "Sous-total minimum",
  "section2.upsell.trigger.productHandle": "Handle / ID du produit déclencheur",

  // Gift settings
  "section2.gift.title": "Titre",
  "section2.gift.note": "Note",
  "section2.gift.priceBefore": "Prix avant (info)",
  "section2.gift.isFree": "Gratuit (0)",

  // Buttons
  "section2.button.save": "Enregistrer les offres",

  // Preview texts
  "section2.preview.title": "Paiement à la livraison (COD)",
  "section2.preview.subtitle": "Prévisualisation (formulaire + offres)",
  "section2.preview.offersStatus.active": "OFFRE activée",
  "section2.preview.offersStatus.inactive": "OFFRE non éligible",
  "section2.preview.offersStatus.giftActive": "CADEAU actif",
  "section2.preview.offersStatus.giftPending": "CADEAU en attente",
  "section2.preview.offersStatus.displayAbove": "Affiché au-dessus du formulaire COD",
  "section2.preview.offerStrip.offer": "OFFRE — Produit avec remise",
  "section2.preview.offerStrip.gift": "CADEAU — Produit offert / upsell",
  "section2.preview.orderSummary.title": "Récapitulatif de la commande",
  "section2.preview.orderSummary.productPrice": "Prix du produit",
  "section2.preview.orderSummary.shipping": "Prix de la livraison",
  "section2.preview.orderSummary.total": "Total",
  "section2.preview.form.title": "Formulaire de commande",
  "section2.preview.form.fullName": "Nom complet *",
  "section2.preview.form.phone": "Téléphone (WhatsApp) *",
  "section2.preview.form.city": "Ville",
  "section2.preview.form.submit": "Confirmer la commande - Total : {price} {currency}",

  // Help texts
  "section2.helpText.product": "Choisis le produit principal lié à cette offre",
  "section2.helpText.offerDesc": "Ex : Remise -10% à partir de 2 pièces",
  "section2.helpText.offerImage": "Image principale affichée à gauche",
  "section2.helpText.offerIconEmoji": "Ex : 🔥, ⭐, -10% ...",
  "section2.helpText.offerIconUrl": "Ex : https://.../icone.png",
  "section2.helpText.giftDesc": "Ex : Cadeau offert automatiquement",
  "section2.helpText.giftIconEmoji": "Ex : 🎁, ⭐, FREE ...",
  "section2.helpText.display": "Ce bloc est affiché au-dessus du formulaire COD sur la fiche produit, sans modifier les réglages du formulaire",
  // ===== Section 3 — Google Sheets =====
// Header
"section3.header.title": "TripleForm COD · Google Sheets & Dashboard",
"section3.header.subtitle": "Connecte Google Sheets pour suivre les commandes COD en temps réel (validées & abandons) — sans quitter l'interface.",
"section3.header.pill": "Google Sheets sync · Live orders",

// Rail navigation
"section3.rail.panelsTitle": "Panneaux",
"section3.rail.panels.sheets": "Google Sheets (commandes)",
"section3.rail.panels.abandons": "Google Sheets (abandons)",
"section3.rail.panels.realtime": "Commandes en temps réel",
"section3.rail.panels.whatsapp": "WhatsApp & export",
"section3.rail.previewOrders": "Aperçu des colonnes · commandes",
"section3.rail.previewAbandons": "Aperçu des colonnes · abandons",
"section3.rail.noAbandonedColumns": "Aucune colonne configurée pour les abandons pour le moment.",
"section3.rail.filtersTitle": "Filtres des commandes",
"section3.rail.stats.period": "Période stats :",
"section3.rail.stats.days": "jours",
"section3.rail.stats.codOnly": "(COD uniquement)",
"section3.rail.stats.allOrders": "(toutes commandes COD app)",
"section3.rail.stats.orders": "Cmd :",
"section3.rail.stats.total": "Total :",
"section3.rail.filters.period": "Période des commandes",
"section3.rail.filters.periodOptions.7days": "7 jours",
"section3.rail.filters.periodOptions.15days": "15 jours",
"section3.rail.filters.periodOptions.30days": "30 jours",
"section3.rail.filters.periodOptions.60days": "60 jours",
"section3.rail.filters.codOnly": "Afficher seulement les commandes COD",
"section3.rail.filters.description": "Ces réglages contrôlent la liste des commandes en temps réel et le résumé dans la barre violette. Si l'API Shopify renvoie une erreur d'accès, on affiche uniquement le message (aucune fausse donnée).",
"section3.rail.filters.save": "Enregistrer (boutique)",

// Google connection
"section3.connection.title": "Connexion Google & feuille commandes",
"section3.connection.loading": "Vérification de la connexion Google…",
"section3.connection.accountConnected": "Compte Google connecté :",
"section3.connection.mainSheet": "Feuille principale (commandes) :",
"section3.connection.notDefined": "Non défini",
"section3.connection.id": "ID",
"section3.connection.revocable": "Tu peux changer de compte ou de feuille quand tu veux, l'accès reste 100% réversible depuis ton compte Google.",
"section3.connection.description": "Connecte ton compte Google pour que TripleForm COD envoie automatiquement les commandes confirmées dans ta propre feuille Google Sheets.",
"section3.connection.authorization": "L'autorisation passe par l'écran officiel Google. Tu peux la révoquer à tout moment depuis ton compte Google.",
"section3.connection.changeSheet": "Changer la feuille commandes",
"section3.connection.connect": "Connecter avec Google",
"section3.connection.openSheet": "Ouvrir la feuille commandes",
"section3.connection.test": "Tester la connexion",
"section3.connection.testSuccess": "Connexion Google Sheets (commandes) OK ✔️",
"section3.connection.testError": "Échec ❌ : {error}",
"section3.connection.unknownError": "Erreur inconnue",

// Field mapping
"section3.mapping.title": "Champs → colonnes Google Sheets (commandes)",
"section3.mapping.selectField": "Sélectionner un champ et l'ajouter",
"section3.mapping.selectPlaceholder": "Choisir un champ…",
"section3.mapping.exampleName": "+ Nom (exemple)",
"section3.mapping.description": "Chaque choix devient une colonne dans ta feuille commandes. Le carrousel reste stable même si tu ajoutes ou supprimes des colonnes.",
"section3.mapping.configuredColumns": "Colonnes configurées (carrousel)",
"section3.mapping.previous": "Précédent",
"section3.mapping.next": "Suivant",
"section3.mapping.column": "Colonne",
"section3.mapping.delete": "Supprimer",
"section3.mapping.fieldForColumn": "Champ pour colonne {number}",
"section3.mapping.asLink": "Enregistrer comme lien (HYPERLINK)",
"section3.mapping.linkTemplate": "Template lien",
"section3.mapping.linkExample": "ex: https://wa.me/{value}",
"section3.mapping.width": "Largeur",

// Display settings
"section3.display.title": "Affichage de la feuille dans l'app",
"section3.display.mode": "Mode d'affichage",
"section3.display.options.none": "Aucun",
"section3.display.options.link": "Lien (bouton)",
"section3.display.options.embedTop": "Intégrer en haut",
"section3.display.options.embedBottom": "Intégrer en bas",
"section3.display.height": "Hauteur intégration",
"section3.display.description": "Tu peux afficher la feuille commandes directement dans l'app (iframe) ou juste proposer un bouton d'accès rapide.",

// Abandoned orders
"section3.abandoned.title": "Connexion Google & feuille abandons",
"section3.abandoned.selectedSheet": "Feuille abandons sélectionnée :",
"section3.abandoned.description": "Cette feuille est pensée pour les commandes / paniers abandonnés : clients qui remplissent le formulaire mais ne vont pas jusqu'au paiement.",
"section3.abandoned.useSecondSheet": "Utilise une deuxième feuille Google Sheets pour suivre les abandons (prospects qui quittent au dernier moment).",
"section3.abandoned.whenAbandoned": "Dès qu'un client entre ses infos mais ne confirme pas, ses données peuvent partir dans cette feuille dédiée (relance WhatsApp, call, etc.).",
"section3.abandoned.changeSheet": "Choisir / changer la feuille abandons",
"section3.abandoned.openSheet": "Ouvrir la feuille abandons",
"section3.abandoned.testSuccess": "Connexion Google Sheets (abandons) OK ✔️",
"section3.abandoned.mappingTitle": "Champs → colonnes Google Sheets (abandons)",
"section3.abandoned.examplePhone": "+ Téléphone (exemple)",
"section3.abandoned.mappingDescription": "Utilise cette feuille pour les leads \"chauds\" qui ont rempli leurs infos mais n'ont pas terminé la commande. Pense à ajouter au minimum Nom + Téléphone + Produit.",
"section3.abandoned.abandonedColumn": "Colonne abandons",
"section3.abandoned.noColumns": "Aucune colonne pour le moment. Ajoute au moins un champ pour commencer.",

// Real-time orders
"section3.realtime.title": "Commandes en temps réel (large)",
"section3.realtime.loading": "Chargement des commandes…",
"section3.realtime.error": "Erreur : {error}",
"section3.realtime.unknownError": "erreur inconnue",
"section3.realtime.noOrders": "Aucune commande trouvée sur la période sélectionnée.",

// WhatsApp & export
"section3.whatsapp.title": "WhatsApp & export",
"section3.whatsapp.supportNumber": "Numéro WhatsApp support",
"section3.whatsapp.messageTemplate": "Template de message",
"section3.whatsapp.templatePlaceholder": "Bonjour {customer.name}, merci pour votre commande #{order.id}…",
"section3.whatsapp.whenToSend": "Quand envoyer ?",
"section3.whatsapp.options.immediate": "Immédiatement",
"section3.whatsapp.options.1h": "1h après",
"section3.whatsapp.options.24h": "24h après",
"section3.whatsapp.description": "Cette partie est encore en préparation. Plus tard tu pourras brancher l'envoi des commandes vers WhatsApp ou un outil externe (webhook, Zapier, etc.). Pour l'instant c'est une maquette visuelle.",

// Guide
"section3.guide.title": "Guide · Google Sheets & commandes",
"section3.guide.panelSheets": "Panneau \"Google Sheets (commandes)\"",
"section3.guide.panelSheetsDesc": "connecte ta feuille principale et mappe les champs COD vers les colonnes Google Sheets. Utilise le carrousel pour régler l'ordre et la largeur.",
"section3.guide.panelAbandons": "Panneau \"Google Sheets (abandons)\"",
"section3.guide.panelAbandonsDesc": "configure une deuxième feuille dédiée aux paniers / commandes abandonnés. Pratique pour la relance WhatsApp ou call center.",
"section3.guide.panelRealtime": "Panneau \"Commandes en temps réel\"",
"section3.guide.panelRealtimeDesc": "affiche les dernières commandes reçues par TripleForm COD sur la période choisie dans les filtres à gauche.",
"section3.guide.panelWhatsapp": "Panneau \"WhatsApp & export\"",
"section3.guide.panelWhatsappDesc": "servira plus tard à envoyer tes commandes vers WhatsApp ou vers un outil externe (webhook, Zapier, etc.).",

// Preview
"section3.preview.columnHeaders.date": "Date",
"section3.preview.columnHeaders.orderId": "Order ID",
"section3.preview.columnHeaders.customer": "Client",
"section3.preview.columnHeaders.customerName": "Nom client",
"section3.preview.columnHeaders.phone": "Téléphone",
"section3.preview.columnHeaders.city": "Ville",
"section3.preview.columnHeaders.product": "Produit",
"section3.preview.columnHeaders.total": "Total",
"section3.preview.columnHeaders.country": "Pays",
"section3.preview.empty": "—",

// Save messages
"section3.save.success": "Paramètres Google Sheets enregistrés sur la boutique ✔️",
"section3.save.error": "Échec (boutique) ❌ : {error}",
"section3.save.unknownError": "Erreur inconnue",

// Fields (pour APP_FIELDS)
"section3.fields.customer.name": "Nom complet",
"section3.fields.customer.phone": "Téléphone",
"section3.fields.customer.city": "Ville",
"section3.fields.customer.province": "Province / Région",
"section3.fields.customer.country": "Pays",
"section3.fields.customer.address": "Adresse",
"section3.fields.customer.notes": "Notes commande",
"section3.fields.cart.productTitle": "Produit — Titre",
"section3.fields.cart.variantTitle": "Produit — Variante",
"section3.fields.cart.offerName": "Offre / Bundle",
"section3.fields.cart.upsellName": "Upsell",
"section3.fields.cart.quantity": "Quantité",
"section3.fields.cart.subtotal": "Total commande (hors livraison)",
"section3.fields.cart.shipping": "Frais de livraison",
"section3.fields.cart.totalWithShipping": "Total commande (avec livraison)",
"section3.fields.cart.currency": "Devise",
"section3.fields.order.id": "Order ID",
"section3.fields.order.date": "Order date",
// Section 3 — Google Sheets (clés manquantes)
"section3.sheetsConfiguration.title": "Configuration Google Sheets",
"section3.sheetsConfiguration.ordersSheet": "Feuille commandes",
"section3.sheetsConfiguration.abandonedSheet": "Feuille abandons",
"section3.sheetsConfiguration.spreadsheetId": "ID de la feuille",
"section3.sheetsConfiguration.spreadsheetIdHelp": "L'ID depuis l'URL de votre Google Sheets (entre /d/ et /edit)",
"section3.sheetsConfiguration.tabName": "Nom de l'onglet",
"section3.sheetsConfiguration.tabNameHelp": "Nom de l'onglet où les commandes seront écrites",
"section3.sheetsConfiguration.headerRow": "Ligne d'en-tête",
"section3.sheetsConfiguration.headerRowHelp": "Numéro de ligne où se trouvent les en-têtes de colonnes (généralement 1)",
"section3.sheetsConfiguration.testConnection": "Tester la connexion",
"section3.sheetsConfiguration.openSheet": "Ouvrir la feuille",
"section3.sheetsConfiguration.testSuccess": "✓ Test de connexion réussi",
"section3.sheetsConfiguration.testError": "✗ Test échoué : {error}",
"section3.sheetsConfiguration.noSpreadsheetId": "Veuillez d'abord entrer un ID de feuille",
"section3.sheetsConfiguration.disconnect": "Déconnecter",
"section3.sheetsConfiguration.disconnectConfirm": "Êtes-vous sûr de vouloir déconnecter le compte Google ? Cela arrêtera l'envoi des commandes vers Google Sheets.",
"section3.sheetsConfiguration.disconnected": "Compte Google déconnecté",
"section3.sheetsConfiguration.disconnectError": "Erreur de déconnexion : {error}",

// Sheets tabs
"section3.sheetsTabs.orders": "Commandes",
"section3.sheetsTabs.abandoned": "Abandons",

// Connection messages
"section3.connection.success": "Compte Google connecté avec succès",
"section3.connection.error": "Erreur de connexion : {error}",
"section3.connection.popupBlocked": "La fenêtre popup a été bloquée. Veuillez autoriser les popups pour ce site.",
"section3.connection.popupBlockedAfterOpen": "La fenêtre popup a été fermée ou bloquée. Veuillez réessayer.",
"section3.sheetsConfiguration.selectSpreadsheet": "Sélectionner une feuille",
"section3.sheetsConfiguration.selectSpreadsheetHelp": "Choisissez la feuille Google Sheets à utiliser",
"section3.sheetsConfiguration.selectTab": "Sélectionner un onglet",
"section3.sheetsConfiguration.selectTabHelp": "Choisissez l'onglet dans la feuille",
"section3.connection.accountConnected": "Compte Google connecté :",
"section3.connection.mainSheet": "Feuille principale (commandes) :",
"section3.sheetsConfiguration.selectSpreadsheet": "Sélectionner une feuille",
"section3.sheetsConfiguration.selectSpreadsheetHelp": "Choisissez la feuille Google Sheets à utiliser",
"section3.sheetsConfiguration.selectTab": "Sélectionner un onglet",
"section3.sheetsConfiguration.selectTabHelp": "Choisissez l'onglet dans la feuille",

// Section 4 — Pixels & Tracking
"section4.header.appTitle": "TripleForm COD · Pixels & Tracking",
"section4.header.appSubtitle": "Connecte Google, Facebook (Pixel & Conversions API) et TikTok pour suivre tes commandes COD.",
"section4.header.pill": "Centre de pixels & tracking",

"section4.rail.title": "Panneaux",
"section4.rail.statusTitle": "Statut des pixels",
"section4.rail.statusNote": "Active uniquement les canaux dont tu as vraiment besoin. Tu pourras ensuite brancher les appels réels dans tes routes Remix et tes blocks Theme Extension.",
"section4.rail.panels.overview": "Résumé & checklist",
"section4.rail.panels.google": "Google (GA4 & Ads)",
"section4.rail.panels.fb": "Facebook Pixel (client)",
"section4.rail.panels.capi_fb": "Facebook Conversions API",
"section4.rail.panels.tiktok": "TikTok Pixel (client)",
"section4.rail.panels.tiktok_api": "TikTok Events API (server)",
"section4.rail.panels.tests": "Tests & debug",

"section4.status.on": "ON",
"section4.status.off": "OFF",
"section4.status.ready": "Prêt",
"section4.status.notReady": "Non prêt",

"section4.platforms.google": "Google",
"section4.platforms.fbPixel": "Facebook Pixel",
"section4.platforms.fbCAPI": "Facebook CAPI",
"section4.platforms.tiktokPixel": "TikTok Pixel",
"section4.platforms.tiktokAPI": "TikTok Events API",

"section4.buttons.saveStore": "Enregistrer (boutique)",

// Overview
"section4.overview.title": "Résumé tracking & bonnes pratiques",
"section4.overview.description": "Ici tu gères tous tes pixels depuis un seul endroit : Google, Facebook Pixel & Conversions API, TikTok Pixel & Events API. L'objectif est de préparer la configuration front, puis on branche les vraies API côté serveur.",
"section4.overview.googleDesc": "Measurement ID GA4 + éventuellement Conversion ID/Label pour Google Ads.",
"section4.overview.fbPixelDesc": "Script navigateur pour PageView, ViewContent, AddToCart, Purchase...",
"section4.overview.fbCAPIDesc": "Envoi côté serveur avec Pixel ID + Access Token + déduplication via event_id.",
"section4.overview.tiktokPixelDesc": "Tracking côté navigateur (page, vues produit, add-to-cart, purchase).",
"section4.overview.tiktokAPIDesc": "Conversions côté serveur avec Pixel Code + token business.",

// Google
"section4.google.mainTitle": "Google — balise principale (GA4 / Ads)",
"section4.google.enableLabel": "Activer Google (gtag.js)",
"section4.google.measurementIdLabel": "Measurement ID GA4 (G-XXXX...)",
"section4.google.adsConversionIdLabel": "Google Ads Conversion ID (AW-XXXX...)",
"section4.google.adsConversionLabel": "Google Ads Conversion Label (optionnel)",
"section4.google.helpText": "Tu pourras utiliser ces identifiants dans ton bloc Theme Extension et/ou dans une route Remix pour envoyer les événements (purchase, etc.).",
"section4.google.eventsTitle": "Google — événements automatiques",
"section4.google.sendPageView": "Envoyer les PageView automatiquement",
"section4.google.sendPurchase": "Envoyer les Purchase automatiquement",
"section4.google.eventsHelp": "En pratique, tu décideras plus tard dans ton code JavaScript/Remix quand appeler gtag (sur ViewContent, AddToCart, Purchase...).",

// Facebook Pixel
"section4.fbPixel.mainTitle": "Facebook Pixel — configuration (client)",
"section4.fbPixel.enableLabel": "Activer le pixel Facebook (client)",
"section4.fbPixel.nameLabel": "Nom du pixel",
"section4.fbPixel.pixelIdLabel": "Pixel ID",
"section4.fbPixel.helpText": "Le pixel client envoie les événements via fbq() côté navigateur. Tu pourras générer un event_id pour dédupliquer avec CAPI.",
"section4.fbPixel.eventsTitle": "Facebook Pixel — événements & advanced matching",
"section4.fbPixel.pageView": "PageView",
"section4.fbPixel.viewContent": "ViewContent",
"section4.fbPixel.addToCart": "AddToCart",
"section4.fbPixel.initiateCheckout": "InitiateCheckout",
"section4.fbPixel.purchase": "Purchase",
"section4.fbPixel.advancedMatching": "Activer l'advanced matching (email, phone...)",

// Facebook CAPI
"section4.fbCAPI.mainTitle": "Facebook Conversions API — connexion (server)",
"section4.fbCAPI.enableLabel": "Activer Facebook CAPI (server)",
"section4.fbCAPI.pixelIdLabel": "Pixel ID (obligatoire)",
"section4.fbCAPI.accessTokenLabel": "Access Token (obligatoire)",
"section4.fbCAPI.testEventCodeLabel": "Test Event Code (optionnel)",
"section4.fbCAPI.helpText": "Ces paramètres serviront dans une route Remix (ex: /api/fb/capi) pour envoyer les événements server-side avec le SDK ou une requête HTTP simple.",
"section4.fbCAPI.eventsTitle": "Facebook CAPI — événements & déduplication",
"section4.fbCAPI.sendViewContent": "Envoyer ViewContent côté serveur",
"section4.fbCAPI.sendAddToCart": "Envoyer AddToCart côté serveur",
"section4.fbCAPI.sendPurchase": "Envoyer Purchase côté serveur",
"section4.fbCAPI.useEventIdDedup": "Utiliser event_id pour dédupliquer client + CAPI",
"section4.fbCAPI.eventsHelp": "Plus tard, tu passeras le même event_id au pixel client (fbq) et à ton appel CAPI pour éviter les doublons dans l'Ads Manager.",

// TikTok Pixel
"section4.tiktokPixel.mainTitle": "TikTok Pixel — configuration (client)",
"section4.tiktokPixel.enableLabel": "Activer TikTok Pixel (client)",
"section4.tiktokPixel.nameLabel": "Nom du pixel",
"section4.tiktokPixel.pixelIdLabel": "Pixel ID",
"section4.tiktokPixel.helpText": "TikTok Pixel côté navigateur t'aidera à suivre les vues produit, ajouts au panier et achats depuis ton formulaire COD.",
"section4.tiktokPixel.eventsTitle": "TikTok Pixel — événements automatiques",
"section4.tiktokPixel.pageView": "PageView",
"section4.tiktokPixel.viewContent": "ViewContent",
"section4.tiktokPixel.addToCart": "AddToCart",
"section4.tiktokPixel.purchase": "Purchase",

// TikTok Events API
"section4.tiktokAPI.mainTitle": "TikTok Events API — connexion (server)",
"section4.tiktokAPI.enableLabel": "Activer TikTok Events API (server)",
"section4.tiktokAPI.pixelCodeLabel": "Pixel Code (obligatoire)",
"section4.tiktokAPI.accessTokenLabel": "Access Token Business (obligatoire)",
"section4.tiktokAPI.helpText": "Ces infos serviront pour appeler l'Events API TikTok directement depuis ton backend, afin d'envoyer les conversions côté serveur.",
"section4.tiktokAPI.eventsTitle": "TikTok Events API — événements",
"section4.tiktokAPI.sendPurchase": "Envoyer Purchase (server)",
"section4.tiktokAPI.eventsHelp": "Pour l'instant on ne prévoit que l'événement Purchase côté serveur. Tu pourras étendre plus tard si besoin.",

// Tests & Debug
"section4.tests.title": "Tests & debug — backend Pixels",
"section4.tests.description": "Ce test vérifie si ta configuration backend est prête pour envoyer des events :",
"section4.tests.list.fbPixel": "Facebook Pixel (client) : ID présent + enabled (config seulement, pas les vrais events).",
"section4.tests.list.tiktokPixel": "TikTok Pixel (client) : ID présent + enabled (config).",
"section4.tests.list.fbCAPI": "Facebook CAPI : Pixel ID + Access Token + enabled.",
"section4.tests.list.tiktokAPI": "TikTok Events API : Pixel Code + Access Token + enabled.",
"section4.tests.testButton": "Tester la configuration Pixels (backend)",
"section4.tests.error": "Erreur test : {error}",
"section4.tests.result.fbPixel": "Facebook Pixel (client config)",
"section4.tests.result.tiktokPixel": "TikTok Pixel (client config)",
"section4.tests.result.fbCAPI": "Facebook Conversions API (server)",
"section4.tests.result.tiktokAPI": "TikTok Events API (server)",
"section4.tests.resultNote": "Ce test ne vérifie pas les vrais events dans Meta / TikTok, il valide seulement que la config est suffisante côté app. Pour voir les events en temps réel, utilise les extensions Meta Pixel Helper et TikTok Pixel Helper sur le storefront.",

// Guide
"section4.guide.title": "Guide · Pixels & tracking",
"section4.guide.step1": "1. Commence par le panneau Google (GA4 & Ads) pour ajouter ton Measurement ID et éventuellement la partie conversions Google Ads.",
"section4.guide.step2": "2. Active ensuite le Facebook Pixel client pour suivre les événements standard depuis le navigateur.",
"section4.guide.step3": "3. Ajoute Facebook Conversions API pour doubler les events côté serveur (plus fiable, bloqueurs de pubs, etc.).",
"section4.guide.step4": "4. Configure TikTok Pixel & Events API si tu fais des campagnes TikTok Ads.",
"section4.guide.step5": "5. Utilise l'onglet Tests & debug pour vérifier que la configuration backend est correcte, puis contrôle les vrais events avec les extensions navigateur (Meta / TikTok).",

// Save messages
"section4.save.success": "Paramètres Pixels enregistrés sur la boutique ✔️",
"section4.save.error": "Échec (boutique) ❌ : {error}",
"section4.save.unknownError": "Erreur inconnue",

// Test messages
"section4.test.unknownError": "Erreur inconnue",
// Section 5 — Anti‑bot & Protection
"section5.header.appTitle": "TripleForm COD · Anti-bot & Protection",
"section5.header.appSubtitle": "IP · téléphone · pays · reCAPTCHA · honeypot — pour bloquer les commandes robots sans casser les vrais clients.",
"section5.header.pill": "Centre de sécurité anti-spam",

"section5.rail.title": "Panneaux",
"section5.rail.statusTitle": "Résumé protection",
"section5.rail.statusNote": "IP règles: {ips} · Téléphone règles: {phones}",
"section5.rail.panels.overview": "Résumé & stratégie",
"section5.rail.panels.ip": "Blocage IP",
"section5.rail.panels.phone": "Blocage téléphone",
"section5.rail.panels.country": "Blocage par pays",
"section5.rail.panels.recap": "Google reCAPTCHA",
"section5.rail.panels.honeypot": "Honeypot & timer",

"section5.status.on": "ON",
"section5.status.off": "OFF",
"section5.status.ready": "Prêt",
"section5.status.notReady": "Non prêt",

"section5.buttons.save": "Enregistrer",
"section5.buttons.saveStore": "Enregistrer (boutique)",
"section5.buttons.add": "Ajouter",
"section5.buttons.addCSV": "Ajouter CSV",
"section5.buttons.remove": "Supprimer",
"section5.buttons.test": "Tester connexion",

"section5.overview.title": "Résumé anti-bot & conseils",
"section5.overview.description": "Cette section protège ton formulaire COD contre les robots et les commandes spam (scripts, numéros bidons, IP abusives…). Tu peux activer une ou plusieurs couches selon tes besoins.",
"section5.overview.ip": "IP : bloque les IP suspectes, limites d'essais par IP, auto-ban temporaire.",
"section5.overview.phone": "Téléphone : contrôle longueur, préfixes autorisés, patterns de numéros fake, limites par numéro/jour.",
"section5.overview.country": "Pays : autorise ou bloque certains pays, ou impose un challenge (captcha).",
"section5.overview.recaptcha": "reCAPTCHA : couche Google (v2/v3) pour détecter les robots au moment de la soumission.",
"section5.overview.honeypot": "Honeypot & timer : champ caché + temps minimum sur la page, très efficace contre les scripts simples.",

"section5.ipBlock.title": "Blocage par adresse IP",
"section5.ipBlock.enable": "Activer blocage IP",
"section5.ipBlock.trustProxy": "Trust proxy (utiliser X-Forwarded-For)",
"section5.ipBlock.clientIpHeader": "Header IP client",
"section5.ipBlock.allowList": "Allow list — IP exactes AUTORISÉES",
"section5.ipBlock.denyList": "Deny list — IP exactes BLOQUÉES",
"section5.ipBlock.cidrList": "Plages CIDR — BLOQUÉES",
"section5.ipBlock.cidrHelp": "Colle une ou plusieurs plages, séparées par virgule ou retour à la ligne.",
"section5.ipBlock.autoBanFails": "Auto-ban après X échecs",
"section5.ipBlock.autoBanMinutes": "Durée auto-ban (minutes)",
"section5.ipBlock.maxOrdersPerDay": "Max commandes / IP / jour",

"section5.phoneBlock.title": "Blocage par numéro de téléphone",
"section5.phoneBlock.enable": "Activer blocage téléphone",
"section5.phoneBlock.minDigits": "Nombre minimum de chiffres",
"section5.phoneBlock.requirePrefix": "Exiger un préfixe (+212…)",
"section5.phoneBlock.allowedPrefixes": "Préfixes autorisés",
"section5.phoneBlock.blockedNumbers": "Numéros bloqués (exact)",
"section5.phoneBlock.blockedPatterns": "Patterns bloqués (RegExp simple)",
"section5.phoneBlock.maxOrdersPerDay": "Max commandes / numéro / jour",

"section5.countryBlock.title": "Blocage par pays",
"section5.countryBlock.enable": "Activer blocage par pays",
"section5.countryBlock.defaultAction": "Action par défaut",
"section5.countryBlock.defaultActionOptions.allow": "Autoriser",
"section5.countryBlock.defaultActionOptions.block": "Bloquer",
"section5.countryBlock.defaultActionOptions.challenge": "Challenger (captcha)",
"section5.countryBlock.allowList": "Pays autorisés (codes ISO2)",
"section5.countryBlock.denyList": "Pays bloqués (codes ISO2)",

"section5.recaptcha.title": "Google reCAPTCHA",
"section5.recaptcha.enable": "Activer reCAPTCHA",
"section5.recaptcha.version": "Version",
"section5.recaptcha.versionOptions.v2_checkbox": "v2 (Checkbox)",
"section5.recaptcha.versionOptions.v2_invisible": "v2 (Invisible)",
"section5.recaptcha.versionOptions.v3": "v3 (Score)",
"section5.recaptcha.siteKey": "Site key",
"section5.recaptcha.secretKey": "Secret key (serveur)",
"section5.recaptcha.minScore": "Score minimum (v3)",
"section5.recaptcha.helpText": "Pour v2, tu affiches un widget côté front. Pour v3, tu envoies le token côté serveur et tu vérifies le score avec l'API reCAPTCHA avant de créer la commande.",

"section5.honeypot.title": "Honeypot & temps minimum sur la page",
"section5.honeypot.enable": "Activer le honeypot (champ caché)",
"section5.honeypot.blockIfFilled": "Bloquer si le champ caché est rempli",
"section5.honeypot.checkMouseMove": "Contrôler les mouvements souris / scroll",
"section5.honeypot.fieldName": "Nom du champ honeypot",
"section5.honeypot.minTime": "Temps minimum avant soumission (ms)",
"section5.honeypot.timeHelp": "Ex: 3000ms = 3 secondes. Si le formulaire est soumis trop vite, on considère que c'est un robot.",
"section5.honeypot.description": "Très simple à implémenter dans ton bloc COD : tu ajoutes un champ caché et un timer JavaScript. Beaucoup de robots remplissent tous les champs ou envoient la requête instantanément, ce qui les rend faciles à bloquer.",

"section5.empty": "Aucun élément",
"section5.placeholder": "Ajouter…",

"section5.save.success": "Paramètres Anti-bot enregistrés ✔️",
"section5.save.error": "Échec : {error}",
"section5.save.unknownError": "Erreur inconnue",

"section5.guide.title": "Guide · Anti-bot TripleForm COD",
"section5.guide.step1": "• Commence léger (honeypot + limite téléphone) puis ajoute IP / pays si tu vois beaucoup de spam.",
"section5.guide.step2": "• Allow list passe toujours avant les blocages : pratique pour ton IP ou celle de ton équipe.",
"section5.guide.step3": "• Garde des valeurs raisonnables pour les limites (ex: 40 commandes / IP / jour) pour éviter de bloquer un vrai client.",
"section5.guide.step4": "• reCAPTCHA est utile si tu reçois beaucoup de bots « intelligents » qui passent à travers les autres filtres.",
"section5.guide.step5": "Quand tu seras prêt, tu pourras utiliser ces réglages dans tes routes Remix /api/antibot/* et dans le bloc du formulaire COD.",
// ===== Section 6 — Geo / Shipping =====
"section6.header.appTitle": "TripleForm COD · Tarifs de livraison par pays/ville",
"section6.header.appSubtitle": "Configure les frais de livraison pour Maroc, Algérie, Tunisie — par province, ville ou paliers de prix.",
"section6.header.pill": "Calculateur livraison · Villes/Provinces",

"section6.rail.title": "Panneaux",
"section6.rail.panels.province": "Tarifs par province",
"section6.rail.panels.city": "Tarifs par ville",
"section6.rail.panels.price": "Paliers de prix",
"section6.rail.panels.advanced": "Options avancées",
"section6.rail.summaryTitle": "Résumé livraison",
"section6.rail.type": "Type",
"section6.rail.free": "Gratuit",
"section6.rail.paid": "Payant",
"section6.rail.mode": "Mode",
"section6.rail.priceBrackets": "Paliers de prix",
"section6.rail.provinces": "Provinces",
"section6.rail.cities": "Villes",
"section6.rail.countryCurrency": "Pays : {country} | Devise : {currency}",

"section6.buttons.saveStore": "Enregistrer (boutique)",
"section6.buttons.deleteProvince": "Supprimer province",
"section6.buttons.addProvince": "Ajouter province",
"section6.buttons.deleteCity": "Supprimer ville",
"section6.buttons.addCity": "Ajouter ville",
"section6.buttons.deleteBracket": "Supprimer palier",
"section6.buttons.addBracket": "Ajouter palier",
"section6.buttons.save": "Enregistrer options avancées",

"section6.general.title": "Paramètres généraux livraison",
"section6.general.shippingType": "Type de livraison",
"section6.general.freeOption": "Livraison gratuite",
"section6.general.paidOption": "Livraison payante",
"section6.general.mainCountry": "Pays principal",
"section6.general.countries.MA": "Maroc",
"section6.general.countries.DZ": "Algérie",
"section6.general.countries.TN": "Tunisie",
"section6.general.countryHelp": "Le pays principal pour les calculs de livraison et régions.",
"section6.general.currency": "Devise",
"section6.general.currencyHelp": "Devise utilisée pour les tarifs (MAD, DZD, TND, etc.).",
"section6.general.pricingMode": "Mode de tarification",
"section6.general.modeProvince": "Par province/région",
"section6.general.modeCity": "Par ville",
"section6.general.modePrice": "Par montant de commande",
"section6.general.freeShippingInfo": "Vos commandes COD auront la livraison gratuite (pas de frais supplémentaires).",
"section6.general.freeShippingDetails": "La livraison est gratuite pour toutes les commandes. Vous pouvez toujours configurer les options avancées (min commande, frais COD, etc.).",

"section6.province.title": "Tarifs de livraison par province — {country}",
"section6.province.description": "Définissez les frais de livraison pour chaque province/wilaya. Si une province n'est pas listée, le tarif par défaut s'applique.",
"section6.province.provinceLabel": "Province/Wilaya",
"section6.province.provinceHelp": "Sélectionnez une province ou entrez un nom personnalisé",
"section6.province.codeLabel": "Code",
"section6.province.codeHelp": "Code optionnel (ex : MA-01, DZ-16)",
"section6.province.rateLabel": "Tarif ({currency})",
"section6.province.rateHelp": "Frais de livraison pour cette province",

"section6.city.title": "Tarifs de livraison par ville — {country}",
"section6.city.description": "Définissez les frais de livraison par ville. Choisissez d'abord la province, puis sélectionnez la ville.",
"section6.city.provinceLabel": "Province/Wilaya",
"section6.city.provinceHelp": "Sélectionnez d'abord la province pour voir ses villes",
"section6.city.cityLabel": "Ville",
"section6.city.cityHelpEnabled": "Villes disponibles pour la province sélectionnée",
"section6.city.cityHelpDisabled": "Sélectionnez d'abord une province",
"section6.city.rateLabel": "Tarif ({currency})",
"section6.city.rateHelp": "Frais de livraison pour cette ville",

"section6.select.provincePlaceholder": "Sélectionner province…",
"section6.select.cityPlaceholder": "Sélectionner ville…",

"section6.price.title": "Tarifs de livraison par montant de commande",
"section6.price.description": "Définissez des paliers de prix. Ex : 0-299 MAD = 29 MAD livraison, ≥300 MAD = gratuit.",
"section6.price.minAmount": "Montant minimum ({currency})",
"section6.price.maxAmount": "Montant maximum ({currency})",
"section6.price.maxHelp": "Laissez vide ou 0 pour 'illimité' (pas de limite supérieure)",
"section6.price.rateLabel": "Tarif ({currency})",

"section6.advanced.title": "Options avancées de livraison",
"section6.advanced.defaultRate": "Tarif par défaut ({currency})",
"section6.advanced.defaultRateHelp": "Appliqué si aucune règle spécifique ne correspond",
"section6.advanced.freeThreshold": "Seuil gratuité ({currency})",
"section6.advanced.freeThresholdHelp": "Montant de commande au-delà duquel la livraison est gratuite",
"section6.advanced.minOrderAmount": "Montant minimum commande ({currency})",
"section6.advanced.codExtraFee": "Frais COD supplémentaire ({currency})",
"section6.advanced.codExtraFeeHelp": "Frais additionnel pour les commandes COD (optionnel)",
"section6.advanced.note": "Note pour le client",
"section6.advanced.noteHelp": "Affiché près du total livraison",

"section6.save.success": "Paramètres de livraison enregistrés ✔️",
"section6.save.error": "Échec enregistrement : {error}",
"section6.save.unknownError": "Erreur inconnue",

"section6.mode.price": "Par prix",
"section6.mode.province": "Par province",
"section6.mode.city": "Par ville",

"section6.status.enabled": "Activé",
"section6.status.disabled": "Désactivé",

"section6.guide.title": "Guide · Livraison par pays/ville",
"section6.guide.step1": "1. Choisissez livraison gratuite ou payante. Si payant, sélectionnez le mode : province, ville ou paliers de prix.",
"section6.guide.step2": "2. Sélectionnez votre pays principal (Maroc, Algérie, Tunisie) et devise (MAD, DZD, TND).",
"section6.guide.step3": "3. Configurez les tarifs : ajoutez provinces/villes avec frais, ou créez des paliers de prix (0-299 = X, 300+ = gratuit).",
"section6.guide.step4": "4. Utilisez les options avancées pour tarif par défaut, seuil gratuité, min commande, frais COD supplémentaire.",
"section6.guide.step5": "5. Enregistrez → les tarifs seront calculés automatiquement dans votre formulaire COD.",


"section1.preview.shippingToCalculate": "Livraison à calculer",
"section3.sheetsConfiguration.chooseTab": "Choisir l'onglet",
"section3.connection.refresh": "Rafraîchir la connexion",
"section1.cart.freeShipping": "Livraison gratuite",

// ===== Section WhatsApp — Automation =====
"whatsapp.title": "Automatisation WhatsApp",
"whatsapp.subtitle": "Connectez WhatsApp et automatisez vos communications",
"whatsapp.connected": "Connecté",
"whatsapp.disconnected": "Déconnecté",
"whatsapp.connectedTo": "Connecté à",
"whatsapp.lastConnected": "Dernière connexion",
"whatsapp.refreshStatus": "Rafraîchir le statut",
"whatsapp.testConnection": "Tester la connexion",
"whatsapp.disconnect": "Déconnecter",
"whatsapp.qr.placeholder": "QR Code WhatsApp",
"whatsapp.qr.generate": "Générer QR Code",
"whatsapp.qr.regenerate": "Régénérer QR Code",
"whatsapp.qr.instructions": "Ouvrez WhatsApp > Paramètres > Appareils liés > Lier un appareil > Scannez ce QR code",
"whatsapp.stats.messagesSent": "Messages envoyés",
"whatsapp.stats.successful": "Réussis",
"whatsapp.stats.recoveryRate": "Taux de récupération",
"whatsapp.stats.avgResponse": "Temps moyen réponse",
"whatsapp.features.afterCOD.title": "Après commande COD",
"whatsapp.features.afterCOD.description": "Envoyer un message automatique après validation d'une commande COD",
"whatsapp.features.afterCOD.enable": "Activer les messages après commande",
"whatsapp.features.afterCOD.buttonText": "Texte du bouton",
"whatsapp.features.afterCOD.position": "Position du bouton",
"whatsapp.features.afterCOD.autoSend": "Envoyer automatiquement",
"whatsapp.features.afterCOD.delay": "Délai d'envoi",
"whatsapp.features.recovery.title": "Récupération de panier",
"whatsapp.features.recovery.description": "Envoyer un rappel WhatsApp pour les paniers abandonnés",
"whatsapp.features.recovery.enable": "Activer la récupération",
"whatsapp.features.recovery.delay": "Délai avant envoi",
"whatsapp.features.recovery.discount": "Remise de récupération",
"whatsapp.features.recovery.code": "Code de récupération",
"whatsapp.features.templates.title": "Modèles de messages",
"whatsapp.features.templates.description": "Personnalisez vos messages WhatsApp",
"whatsapp.features.templates.orderMessage": "Message après commande",
"whatsapp.features.templates.recoveryMessage": "Message de récupération",
"whatsapp.variables.available": "Variables disponibles",
"whatsapp.variables.orderId": "Numéro de commande",
"whatsapp.variables.customerName": "Nom du client",
"whatsapp.variables.customerPhone": "Téléphone du client",
"whatsapp.variables.productName": "Nom du produit",
"whatsapp.variables.orderTotal": "Total de la commande",
"whatsapp.variables.deliveryDate": "Date de livraison",
"whatsapp.variables.shopName": "Nom de la boutique",
"whatsapp.variables.trackingUrl": "URL de suivi",
"whatsapp.variables.supportNumber": "Numéro de support",
"whatsapp.variables.recoveryCode": "Code de récupération",
"whatsapp.delays.immediate": "Immédiatement",
"whatsapp.delays.5min": "5 minutes",
"whatsapp.delays.30min": "30 minutes",
"whatsapp.delays.1h": "1 heure",
"whatsapp.delays.2h": "2 heures",
"whatsapp.delays.6h": "6 heures",
"whatsapp.delays.24h": "24 heures",
"whatsapp.positions.below": "En dessous",
"whatsapp.positions.right": "À droite",
"whatsapp.positions.replace": "Remplacer",
"whatsapp.advanced.title": "Paramètres avancés",
"whatsapp.advanced.description": "Configuration avancée de WhatsApp",
"whatsapp.advanced.autoConnect": "Connexion automatique",
"whatsapp.advanced.analytics": "Activer les analytics",
"whatsapp.advanced.readReceipts": "Accusés de lecture",
"whatsapp.advanced.businessHours": "Heures de bureau uniquement",
"whatsapp.advanced.startTime": "Heure de début",
"whatsapp.advanced.endTime": "Heure de fin",
"whatsapp.advanced.maxRetries": "Tentatives max",
"whatsapp.advanced.mediaMessages": "Messages avec média",
"whatsapp.advanced.mediaUrl": "URL du média",
"whatsapp.advanced.buttons": "Boutons interactifs",
"whatsapp.preview.title": "Aperçu du message",
"whatsapp.preview.description": "Comment apparaîtra votre message",
"whatsapp.sendTest": "Envoyer un test",
"whatsapp.saveConfig": "Sauvegarder la configuration",
"whatsapp.configSaved": "Configuration sauvegardée!",
"whatsapp.testSuccess": "Test de connexion réussi!",
"whatsapp.testError": "Erreur de test: {error}",
"whatsapp.testMessageSent": "Message test envoyé avec succès!",
"whatsapp.confirmDisconnect": "Êtes-vous sûr de vouloir déconnecter WhatsApp?",
"whatsapp.confirmTestMessage": "Envoyer un message test à votre numéro WhatsApp?",
"whatsapp.errors.qrGeneration": "Erreur de génération du QR code",
"whatsapp.errors.disconnect": "Erreur de déconnexion",
"whatsapp.errors.saveConfig": "Erreur de sauvegarde",
"whatsapp.errors.testMessage": "Erreur d'envoi test: {error}",
  /* ===== Icônes et sélecteurs ===== */
  "section1.fieldEditor.iconLabel": "Icône",
  "section1.iconSelector.title": "Choisir une icône",
  "section1.cart.cartIcon": "Icône du panier",

  /* ===== Libellés d'icônes ===== */
  "icon.label.CartIcon": "Panier",
  "icon.label.BagIcon": "Sac",
  "icon.label.ProductsIcon": "Produits",
  "icon.label.CheckoutIcon": "Paiement",
  "icon.label.ReceiptIcon": "Reçu",
  "icon.label.NoteIcon": "Note",
  "icon.label.ProfileIcon": "Profil",
  "icon.label.PersonIcon": "Personne",
  "icon.label.UserIcon": "Utilisateur",
  "icon.label.CustomersIcon": "Clients",
  "icon.label.PhoneIcon": "Téléphone",
  "icon.label.MobileIcon": "Mobile",
  "icon.label.CallIcon": "Appel",
  "icon.label.ChatIcon": "Chat",
  "icon.label.HashtagIcon": "Hashtag",
  "icon.label.NumberIcon": "Nombre",
  "icon.label.CirclePlusIcon": "Plus",
  "icon.label.LocationIcon": "Localisation",
  "icon.label.PinIcon": "Épingle",
  "icon.label.HomeIcon": "Maison",
  "icon.label.StoreIcon": "Magasin",
  "icon.label.CityIcon": "Ville",
  "icon.label.GlobeIcon": "Globe",
  "icon.label.MapIcon": "Carte",
  "icon.label.RegionIcon": "Région",
  "icon.label.ClipboardIcon": "Presse-papier",
  "icon.label.DocumentIcon": "Document",
  "icon.label.TextIcon": "Texte",
  "icon.label.TruckIcon": "Camion",
  "icon.label.CheckCircleIcon": "Coche",
  "icon.label.PlayIcon": "Play",
  "icon.label.ArrowRightIcon": "Flèche droite",
  "icon.label.SendIcon": "Envoyer",
  // Rail navigation
"section2.rail.title": "Navigation",
"section2.rail.offers": "Offres (conditions)",
"section2.rail.upsells": "Cadeaux / Upsell",

// Groups
"section2.group.conditions.title": "Conditions d'application",
"section2.group.display.title": "Affichage",

// Global settings
"section2.global.rounding.label": "Arrondi des prix",

// Display settings
"section2.display.showOrderSummary": "Afficher le récapitulatif",
"section2.display.showOffersSection": "Afficher la section offres",

// Offer settings (individual offers)
"section2.offer.title": "Offre {{number}}",
"section2.offer.titleField": "Titre de l'offre",
"section2.offer.description": "Description",
"section2.offer.enable": "Activer cette offre",
"section2.offer.type": "Type de réduction",
"section2.offer.type.percent": "Pourcentage",
"section2.offer.type.fixed": "Montant fixe",
"section2.offer.percent": "Pourcentage",
"section2.offer.fixedAmount": "Montant fixe",
"section2.offer.product": "Produit concerné",
"section2.offer.selectProduct": "Sélectionner un produit",
"section2.offer.minQuantity": "Quantité minimum",
"section2.offer.minSubtotal": "Sous-total minimum",
"section2.offer.maxDiscount": "Réduction maximum (0 = illimitée)",
"section2.offer.requiresCode": "Nécessite un code",
"section2.offer.code": "Code promo",
"section2.offer.imageUrl": "URL de l'image",
"section2.offer.icon": "Icône",
"section2.offer.showInPreview": "Afficher dans l'aperçu",

// Upsell settings (individual)
"section2.upsell.title": "Cadeau {{number}}",
"section2.upsell.titleField": "Titre du cadeau",
"section2.upsell.description": "Description",
"section2.upsell.enable": "Activer ce cadeau",
"section2.upsell.product": "Produit cadeau",
"section2.upsell.triggerType": "Condition d'activation",
"section2.upsell.trigger.subtotal": "Sous-total minimum",
"section2.upsell.trigger.product": "Produit spécifique",
"section2.upsell.minSubtotal": "Sous-total minimum",
"section2.upsell.productHandle": "Handle du produit",
"section2.upsell.imageUrl": "URL de l'image",
"section2.upsell.icon": "Icône",
"section2.upsell.showInPreview": "Afficher dans l'aperçu",

// Gift details
"section2.gift.originalPrice": "Prix original",

// Buttons
"section2.button.addOffer": "Ajouter une offre",
"section2.button.addUpsell": "Ajouter un cadeau",

// Preview
"section2.preview.active": "Actif",
"section2.preview.inactive": "Inactif",
"section2.preview.offerStrip.offer": "OFFRE",
"section2.preview.offerStrip.gift": "CADEAU",
"section2.preview.defaultOfferTitle": "Offre spéciale",
"section2.preview.defaultUpsellTitle": "Cadeau surprise",
"section2.preview.discountPercent": "Réduction de {{percent}}%",
"section2.preview.discountFixed": "Réduction de {{amount}} {{currency}}",
"section2.preview.giftDescription": "Offert avec votre commande",
"section2.preview.orderSummary.title": "Récapitulatif de commande",
"section2.preview.orderSummary.subtotal": "Sous-total",
"section2.preview.orderSummary.shipping": "Livraison",
"section2.preview.orderSummary.total": "Total",
"section1.preview.shippingTo": "Livraison à",
"section1.newFieldPlaceholder": "Placeholder nouveau champ",
"section1.newFieldLabel": "Label nouveau champ",
"section1.addNewField": "Ajouter un nouveau champ",
"section1.rail.fieldsTitle": "Champs du formulaire",
"section3.statsCard.title": "Statistiques des commandes",
"section3.errors.sessionExpired": "Session expirée, veuillez rafraîchir",
"whatsapp.defaults.orderMessage": "Bonjour {customer.name}, merci pour votre commande #{order.id}. Nous vous contacterons bientôt.",
"whatsapp.header.title": "Automatisation WhatsApp",
"whatsapp.header.subtitle": "Envoyer des messages automatiques après commandes COD",
"whatsapp.status.connectedTo": "Connecté à",
"whatsapp.status.notConnected": "Non connecté",
"whatsapp.mode.title": "Mode de connexion",
"whatsapp.mode.simple.title": "Mode simple (numéro)",
"whatsapp.mode.simple.subtitle": "Connectez-vous via votre numéro",
"whatsapp.mode.simple.b1": "Configuration rapide",
"whatsapp.mode.simple.b2": "Pas besoin de token API",
"whatsapp.mode.simple.b3": "Scan QR code manuel",
"whatsapp.mode.simple.b4": "Fonctionnalités de base",
"whatsapp.mode.advanced.title": "Mode avancé (API)",
"whatsapp.mode.advanced.subtitle": "Connectez-vous via WhatsApp Business API",
"whatsapp.mode.advanced.b1": "Connexion automatique",
"whatsapp.mode.advanced.b2": "Limites de messages plus élevées",
"whatsapp.mode.advanced.b3": "Analyses avancées",
"whatsapp.mode.advanced.b4": "Support webhook",
"whatsapp.fields.phone.label": "Numéro de téléphone",
"whatsapp.fields.phone.placeholder": "Entrez le numéro WhatsApp (avec indicatif)",
"whatsapp.fields.phone.help": "Exemple : +212612345678",
"whatsapp.fields.businessName.label": "Nom de l'entreprise",
"whatsapp.fields.businessName.placeholder": "Nom de votre entreprise",
"whatsapp.fields.businessName.help": "Affiché dans les messages",
"whatsapp.warning.title": "Notes importantes",
"whatsapp.warning.b1": "Gardez WhatsApp Web/Desktop ouvert",
"whatsapp.warning.b2": "Le téléphone doit avoir internet",
"whatsapp.warning.b3": "Le QR code expire toutes les minutes",
"whatsapp.warning.b4": "Testez d'abord avec un vrai numéro",
"whatsapp.fields.token.label": "Token API",
"whatsapp.fields.token.placeholder": "Entrez votre token WhatsApp Business API",
"whatsapp.fields.token.help": "Obtenez-le auprès de votre fournisseur d'API",
"whatsapp.noteApi": "Note : WhatsApp Business API nécessite une approbation et peut engendrer des coûts.",
"whatsapp.fields.message.label": "Modèle de message",
"whatsapp.fields.message.placeholder": "Entrez votre message avec variables...",
"whatsapp.fields.message.help": "Utilisez {customer.name}, {order.id}, etc.",
"whatsapp.fields.autoSend.label": "Envoyer automatiquement",
"whatsapp.qr.title": "Connexion QR Code",
"whatsapp.qr.subtitle": "Scannez avec WhatsApp pour vous connecter",
"whatsapp.qr.empty": "Aucun QR code généré",
"whatsapp.qr.howTo": "Comment se connecter :",
"whatsapp.qr.step1": "1. Ouvrez WhatsApp sur votre téléphone",
"whatsapp.qr.step2": "2. Allez dans Paramètres → Appareils liés",
"whatsapp.qr.step3": "3. Appuyez sur 'Lier un appareil' et scannez le QR code",
"whatsapp.qr.generate": "Générer QR Code",
"whatsapp.qr.regenerate": "Régénérer QR Code",
"whatsapp.qr.refresh": "Rafraîchir QR Code",
"whatsapp.connected.title": "Statut de connexion",
"whatsapp.connected.last": "Dernière connexion :",
"whatsapp.connected.sent": "Messages envoyés :",
"whatsapp.connected.ready": "Prêt à envoyer des messages",
"common.save": "Enregistrer",
"common.disconnect": "Déconnecter",
"section1.fieldEditor.titlePrefix.birthday": "Date de naissance",
"section1.fieldEditor.titlePrefix.company": "Société",
"section1.fieldEditor.titlePrefix.pincode": "Code postal",
"section1.fieldEditor.titlePrefix.email": "Email",
// ======================= Section2 Offers & Upsells (NEW UI) =======================
"section2.ui.header.subtitle": "Offres & Upsells — Settings pro",
"section2.ui.status.dirty": "Modifications non enregistrées",
"section2.ui.status.saved": "Enregistré",
"section2.ui.status.loading": "Chargement...",

"section2.ui.tabs.global": "Global",
"section2.ui.tabs.offers": "Offres",
"section2.ui.tabs.upsells": "Upsells",

"section2.ui.hero.badge": "{offers} Offres • {upsells} Upsells",
"section2.ui.hero.title": "Offres & Upsells",
"section2.ui.hero.subtitle": "Settings clairs + preview propre",
"section2.ui.hero.currentTab": "{tab}",

"section2.ui.modal.unsaved.title": "Modifications non enregistrées",
"section2.ui.modal.unsaved.body": "Tu as des modifications non enregistrées. Tu veux sauvegarder ou ignorer avant de changer de section ?",
"section2.ui.modal.unsaved.primary": "Sauvegarder & continuer",
"section2.ui.modal.unsaved.primaryLoading": "Enregistrement...",
"section2.ui.modal.unsaved.cancel": "Annuler",
"section2.ui.modal.unsaved.discard": "Ignorer",

"section2.ui.preview.title": "Preview",
"section2.ui.preview.badge.active": "Actif",
"section2.ui.preview.badge.inactive": "Inactif",
"section2.ui.preview.subtitle": "Preview rapide (ce que le client va voir).",
"section2.ui.preview.offers.title": "Offres",
"section2.ui.preview.offers.none": "Aucune offre active dans la preview.",
"section2.ui.preview.upsells.title": "Upsells",
"section2.ui.preview.upsells.none": "Aucun upsell actif dans la preview.",
"section2.ui.preview.productLabel": "Produit:",
"section2.ui.preview.product.none": "Aucun",
"section2.ui.preview.product.selected": "Produit sélectionné",
"section2.ui.offers.title": "Offres ({count}/3)",
"section2.ui.upsells.title": "Upsells ({count}/3)",

"section2.ui.badge.proSettings": "Pro settings",
"section2.ui.badge.noButton": "Sans bouton",

"section2.ui.offer.cardTitle": "Offre {n}",
"section2.ui.upsell.cardTitle": "Upsell {n}",
"section2.ui.field.enable": "Activer",

"section2.ui.group.content": "Contenu",
"section2.ui.group.iconDesign": "Icon & Design",
"section2.ui.group.button": "Bouton (Offre)",
"section2.ui.group.preview": "Prévisualisation",

"section2.ui.field.title": "Titre",
"section2.ui.field.description": "Texte",
"section2.ui.field.product": "Produit Shopify",
"section2.ui.field.image": "Image",
"section2.ui.field.imageMode.product": "Image du produit (auto)",
"section2.ui.field.imageMode.custom": "Image personnalisée (URL)",
"section2.ui.field.imageUrl": "URL image",

"section2.ui.field.icon": "Icône",
"section2.ui.field.iconBg": "Fond de l’icône",
"section2.ui.field.cardBg": "Background",
"section2.ui.field.borderColor": "Border",

"section2.ui.field.buttonText": "Texte du bouton",
"section2.ui.field.buttonBg": "Bouton background",
"section2.ui.field.buttonTextColor": "Bouton texte",
"section2.ui.field.buttonBorder": "Bouton border",

"section2.ui.field.showInPreview": "Afficher dans preview",

"section2.ui.helper.noImagesDetected": "Ce produit n’a pas d’images détectées (selon le format retourné).",

"section2.ui.action.addOffer": "Ajouter une offre",
"section2.ui.action.addUpsell": "Ajouter un upsell",
"section2.ui.action.remove": "Supprimer",
// ======================= Section2 — Thank You Page (FR) =======================

// Tab
"section2.ui.tabs.thankyou": "Page de remerciement",

// Global / intro
"section2.ui.thankyou.title": "Page de remerciement",
"section2.ui.thankyou.subtitle": "Personnalisez l’expérience après la commande",
"section2.ui.thankyou.enable": "Activer la page de remerciement",
"section2.ui.thankyou.mode.label": "Mode",
"section2.ui.thankyou.mode.simple": "Simple (bouton / redirection)",
"section2.ui.thankyou.mode.popup": "Popup (image + contenu)",
"section2.ui.thankyou.mode.help": "Choisissez le comportement après la commande",

// Popup behavior
"section2.ui.thankyou.popup.enable": "Activer le popup",
"section2.ui.thankyou.popup.title": "Titre du popup",
"section2.ui.thankyou.popup.text": "Texte du popup",
"section2.ui.thankyou.popup.showClose": "Afficher le bouton fermer",
"section2.ui.thankyou.popup.closeLabel": "Fermer",
"section2.ui.thankyou.popup.delayMs": "Délai d’ouverture (ms)",
"section2.ui.thankyou.popup.autoCloseMs": "Fermeture automatique (ms)",
"section2.ui.thankyou.popup.overlay": "Fond assombri",
"section2.ui.thankyou.popup.overlayOpacity": "Opacité du fond",
"section2.ui.thankyou.popup.animation": "Animation",
"section2.ui.thankyou.popup.animation.none": "Aucune",
"section2.ui.thankyou.popup.animation.zoom": "Zoom",
"section2.ui.thankyou.popup.animation.slideUp": "Glissement vers le haut",
"section2.ui.thankyou.popup.position": "Position",
"section2.ui.thankyou.popup.position.center": "Centre",
"section2.ui.thankyou.popup.position.bottom": "Bas",

// Visual editor
"section2.ui.thankyou.editor.title": "Éditeur",
"section2.ui.thankyou.editor.hint": "Ajoutez image, icône, texte et boutons comme dans Canva",
"section2.ui.thankyou.editor.addBlock": "Ajouter un élément",
"section2.ui.thankyou.editor.block.text": "Texte",
"section2.ui.thankyou.editor.block.image": "Image",
"section2.ui.thankyou.editor.block.icon": "Icône",
"section2.ui.thankyou.editor.block.button": "Bouton",
"section2.ui.thankyou.editor.block.divider": "Séparateur",

// Insert
"section2.ui.thankyou.insert.title": "Insérer",
"section2.ui.thankyou.insert.image": "Insérer une image",
"section2.ui.thankyou.insert.imageUrl": "URL de l’image",
"section2.ui.thankyou.insert.iconUrl": "URL de l’icône",
"section2.ui.thankyou.insert.linkUrl": "URL du lien",
"section2.ui.thankyou.insert.shopifyImage": "Choisir une image Shopify",

// Style
"section2.ui.thankyou.style.title": "Style",
"section2.ui.thankyou.style.bg": "Arrière-plan",
"section2.ui.thankyou.style.textColor": "Couleur du texte",
"section2.ui.thankyou.style.borderColor": "Couleur de la bordure",
"section2.ui.thankyou.style.radius": "Arrondi",
"section2.ui.thankyou.style.shadow": "Ombre",
"section2.ui.thankyou.style.padding": "Espacement",
"section2.ui.thankyou.style.align": "Alignement",
"section2.ui.thankyou.style.align.left": "Gauche",
"section2.ui.thankyou.style.align.center": "Centre",
"section2.ui.thankyou.style.align.right": "Droite",
"section2.ui.thankyou.style.fontSize": "Taille du texte",
"section2.ui.thankyou.style.fontWeight": "Épaisseur du texte",

// Palette
"section2.ui.thankyou.palette.title": "Palettes",
"section2.ui.thankyou.palette.apply": "Appliquer la palette",
"section2.ui.thankyou.palette.custom": "Couleurs personnalisées",

// Buttons
"section2.ui.thankyou.button.primaryText": "Texte du bouton principal",
"section2.ui.thankyou.button.primaryUrl": "Lien du bouton principal",
"section2.ui.thankyou.button.secondaryText": "Texte du bouton secondaire",
"section2.ui.thankyou.button.secondaryUrl": "Lien du bouton secondaire",

// Preview
"section2.ui.thankyou.preview.title": "Aperçu de la page de remerciement",
"section2.ui.thankyou.preview.openPopup": "Ouvrir l’aperçu du popup",
"section2.ui.thankyou.preview.empty": "Aucun élément. Ajoutez du contenu pour commencer."



};

/* ========================================================================
 * ES — Spanish
 * ===================================================================== */
const ES = {
  ...EN,

  "section0.header.title": "TripleForm COD · Panel",
  "section0.header.subtitle":
    "Resumen, soporte y facturación",
  "section0.header.pill":
    "Formulario COD · Google Sheets · Píxeles · Anti-bot",

  "section0.nav.forms": "Sección 1 — Formularios COD",
  "section0.nav.offers": "Sección 2 — Ofertas (upsell/bundles)",
  "section0.nav.sheets": "Sección 3 — Google Sheets",
  "section0.nav.pixels": "Sección 4 — Eventos de píxel",
  "section0.nav.antibot": "Sección 5 — Anti-bot",
  "section0.nav.locations":
    "Sección 6 — Ciudades/Provincias/Países",

  "section0.group.main":
    "Asistente y configuración de TripleForm COD",

  "section0.tabs.support": "Soporte y asistente",
  "section0.tabs.billing": "Planes y facturación",

  "section0.billing.loading":
    "Comprobando tu suscripción…",
  "section0.billing.active": "Suscripción activa ✅",
  "section0.billing.none":
    "No hay ninguna suscripción activa por ahora.",
  "section0.billing.planAnnual": "Plan anual",
  "section0.billing.planMonthly": "Plan mensual",
  "section0.billing.testMode": "(modo de prueba)",

  "section0.banner.alreadySubscribed.title":
    "Ya tienes una suscripción activa",
  "section0.banner.alreadySubscribed.body":
    "Puedes cambiar de plan o de mensual/anual en cualquier momento. Shopify cancelará automáticamente la suscripción antigua cuando aceptes la nueva.",

  "section0.plans.badge.popular": "Popular",
  "section0.plans.badge.current": "Plan actual",

  "section0.plans.price.perMonth": "al mes",
  "section0.plans.price.perYear": "al año",
  "section0.plans.price.saving": "Ahorra ~{percent}%",
  "section0.plans.btn.chooseMonthly": "Elegir mensual",
  "section0.plans.btn.chooseAnnual": "Elegir anual",
  "section0.plans.btn.alreadyMonthly":
    "Ya en mensual",
  "section0.plans.btn.alreadyAnnual":
    "Ya en anual",

  "section0.plans.starter.orders":
    "Hasta 100 pedidos COD / mes",
  "section0.plans.basic.orders":
    "Hasta 500 pedidos COD / mes",
  "section0.plans.premium.orders":
    "Pedidos COD ilimitados",

  "section0.features.1":
    "Formulario COD en un clic en las páginas de producto.",
  "section0.features.2":
    "Sincronización en tiempo real con Google Sheets.",
  "section0.features.3":
    "Upsells y bundles después del formulario COD.",
  "section0.features.4":
    "Recupera pedidos COD abandonados por WhatsApp.",
  "section0.features.5":
    "Tarifas de envío por país, ciudad y provincia.",
  "section0.features.6":
    "Multi-píxeles (Meta, TikTok, Google…) para eventos COD.",
  "section0.features.7":
    "Anti-bot y protección contra pedidos falsos.",
  "section0.features.8":
    "Soporte Triple S Partners por email y WhatsApp.",

  "section0.quickstart.title":
    "Empezar rápido con TripleForm COD",
  "section0.quickstart.step1":
    "1) Elige un plan y confirma la suscripción en Shopify.",
  "section0.quickstart.step2":
    "2) Añade el bloque TripleForm COD — Order form a la plantilla de producto.",
  "section0.quickstart.step3":
    "3) Configura Form, Offers, Google Sheets, Pixels y Anti-bot, luego haz un pedido COD de prueba para comprobar que todo se rastrea bien.",

  "section0.videos.pill":
    "Centro de vídeos · TripleForm COD",
  "section0.videos.title":
    "Vídeos tutoriales para cada sección.",
  "section0.videos.subtitle":
    "Más adelante podrás añadir aquí tus enlaces de YouTube: cada tarjeta = un vídeo corto y claro (instalación, configuración, ejemplos reales).",

  "section0.videos.item.intro.title":
    "Introducción · Vista general de TripleForm COD",
  "section0.videos.item.intro.sub":
    "Recorrido rápido del panel, navegación y primeros ajustes.",
  "section0.videos.item.forms.title":
    "Sección 1 · Formularios COD",
  "section0.videos.item.forms.sub":
    "Crear el formulario de un clic, campos, diseño y pedidos de prueba.",
  "section0.videos.item.offers.title":
    "Sección 2 · Ofertas y bundles",
  "section0.videos.item.offers.sub":
    "Upsell después del formulario, bundles y aumento del carrito.",
  "section0.videos.item.sheets.title":
    "Sección 3 · Google Sheets en tiempo real",
  "section0.videos.item.sheets.sub":
    "Conexión, columnas, filtros y seguimiento para tu call center.",
  "section0.videos.item.pixels.title":
    "Sección 4 · Píxeles y eventos COD",
  "section0.videos.item.pixels.sub":
    "Meta, TikTok, Google… cómo rastrear cada pedido COD.",
  "section0.videos.item.antibot.title":
    "Sección 5 · Anti-bot y filtros",
  "section0.videos.item.antibot.sub":
    "Bloquear pedidos falsos y proteger tus campañas.",
  "section0.videos.item.locations.title":
    "Sección 6 · Ciudades, provincias y países",
  "section0.videos.item.locations.sub":
    "Gestionar zonas entregables, tarifas por país y filtro por ciudad.",

  "section0.lang.label": "Idioma de la interfaz",

  "section0.support.header":
    "Soporte · FAQ secciones COD",
  "section0.support.search.placeholder":
    "Buscar (Google Sheets, Formulario, Píxeles, Anti-bot...)",
  "section0.support.noResults":
    "No se encontró ninguna pregunta.",
  "section0.support.contactText":
    "¿Necesitas ayuda personalizada para tu tienda?",
  "section0.support.whatsapp": "WhatsApp",
  "section0.support.email": "Correo",
  "section0.support.cat.all": "Todas",
  "section0.support.cat.start": "Empezar",
  "section0.support.cat.forms": "Formularios",
  "section0.support.cat.offers": "Ofertas",
  "section0.support.cat.sheets": "Google Sheets",
  "section0.support.cat.pixels": "Píxeles",
  "section0.support.cat.antibot": "Anti-bot",
  "section0.support.cat.shipping": "Envío",
  "section0.support.cat.billing": "Facturación",
  "section0.support.cat.support": "Soporte",

  "section0.usage.noPlan.title": "Estado del plan",
  "section0.usage.noPlan.body":
    "No hay un plan activo. Elige uno en la pestaña «Planes y facturación».",
  "section0.usage.planFallback": "Plan activo",
  "section0.usage.header.title":
    "Uso de tu plan",
  "section0.usage.header.subtitleTail":
    "pedidos COD",
  "section0.usage.badge.active":
    "Suscripción activa",
  "section0.usage.commandsLabel": "Pedidos",
  "section0.usage.loading":
    "Actualizando estadísticas…",
  "section0.usage.unlimitedText":
    "Pedidos COD ilimitados en tu plan actual.",
  "section0.usage.limitedText":
    "Uso de pedidos COD en tu período actual.",
  "section0.usage.used": "Usados",
  "section0.usage.usedOf": "de",
  "section0.usage.remaining": "Restantes",
  "section0.usage.beforeLimit": "antes del límite",
  "section0.usage.progress": "Progreso",
  "section0.usage.since": "Desde:",
  "section0.usage.term.annual": "Anual",
  "section0.usage.term.monthly": "Mensual",

  /* FAQ ES */
  "section0.faq.start.1.title":
    "¿Por dónde empiezo con la app COD?",
  "section0.faq.start.1.answer.1":
    "1) Añade el bloque TripleForm COD — Order form en tu tema de Shopify (plantilla de producto).",
  "section0.faq.start.1.answer.2":
    "2) Ve a la Sección 1 — Formularios COD para elegir los campos y el diseño.",
  "section0.faq.start.1.answer.3":
    "3) Configura la Sección 3 — Google Sheets si quieres un call center o seguimiento en tiempo real.",
  "section0.faq.start.1.answer.4":
    "4) Haz un pedido de prueba desde un producto real para comprobar que todo se registra bien.",

  "section0.faq.start.2.title":
    "¿Cómo instalo el bloque COD en mi tema?",
  "section0.faq.start.2.answer.1":
    "1) Abre el editor de temas de Shopify.",
  "section0.faq.start.2.answer.2":
    "2) En la plantilla de producto, haz clic en Agregar bloque o Agregar sección.",
  "section0.faq.start.2.answer.3":
    "3) Busca TripleForm COD — Order form y añádelo debajo de la descripción o cerca del botón de Añadir al carrito.",
  "section0.faq.start.2.answer.4":
    "4) Guarda: el formulario COD ya es visible en tus páginas de producto.",

  "section0.faq.start.3.title":
    "¿Cómo hago un pedido de prueba completo?",
  "section0.faq.start.3.answer.1":
    "1) Ve a un producto real con el bloque COD activo.",
  "section0.faq.start.3.answer.2":
    "2) Rellena todos los campos obligatorios (Nombre, Teléfono, Ciudad, etc.).",
  "section0.faq.start.3.answer.3":
    "3) Utiliza un número de teléfono real (para probar el call center).",
  "section0.faq.start.3.answer.4":
    "4) Revisa luego en Shopify › Pedidos y, si está activado, en Google Sheets y en los píxeles.",

  "section0.faq.start.4.title":
    "El formulario COD no aparece en mis productos",
  "section0.faq.start.4.answer.1":
    "1) Comprueba que el bloque TripleForm COD — Order form está añadido en la plantilla de producto.",
  "section0.faq.start.4.answer.2":
    "2) Asegúrate de estar viendo un producto que usa esa plantilla.",
  "section0.faq.start.4.answer.3":
    "3) Desactiva temporalmente otras apps o scripts que modifiquen mucho el DOM (tema custom, page builder…).",
  "section0.faq.start.4.answer.4":
    "4) Recarga el tema y borra la caché si es necesario.",

  "section0.faq.forms.1.title":
    "¿Cómo activo/desactivo campos del formulario COD?",
  "section0.faq.forms.1.answer.1":
    "1) Ve a la Sección 1 — Formularios COD en la app.",
  "section0.faq.forms.1.answer.2":
    "2) En el panel Campos del formulario, activa o desactiva Nombre completo, Teléfono, Dirección, Ciudad, Provincia, Notas, etc.",
  "section0.faq.forms.1.answer.3":
    "3) Puedes hacer algunos campos obligatorios para evitar pedidos incompletos.",
  "section0.faq.forms.1.answer.4":
    "4) Guarda y prueba en un producto para ver el nuevo formulario.",

  "section0.faq.forms.2.title":
    "¿Cómo cambio los colores y el diseño del formulario?",
  "section0.faq.forms.2.answer.1":
    "1) En la Sección 1, abre el grupo o pestaña Diseño del formulario.",
  "section0.faq.forms.2.answer.2":
    "2) Cambia los colores del botón, del fondo, de los bordes y la tipografía.",
  "section0.faq.forms.2.answer.3":
    "3) Puedes ajustar el radio de borde, la sombra y la alineación para que combine con tu tema.",
  "section0.faq.forms.2.answer.4":
    "4) Guarda y actualiza la página de producto para ver el resultado final.",

  "section0.faq.forms.3.title":
    "El botón «Enviar pedido» no funciona",
  "section0.faq.forms.3.answer.1":
    "1) Comprueba que todos los campos obligatorios estén rellenados (especialmente el teléfono).",
  "section0.faq.forms.3.answer.2":
    "2) Si usas Anti-bot (Sección 5), primero desactiva las reglas demasiado estrictas para probar.",
  "section0.faq.forms.3.answer.3":
    "3) Asegúrate de que el producto y la variante sean válidos (variantId correcto).",
  "section0.faq.forms.3.answer.4":
    "4) Si el problema sigue, contacta con soporte con una captura de consola (F12) y el mensaje de error.",

  "section0.faq.forms.4.title":
    "¿Cómo activo la validación del número de teléfono?",
  "section0.faq.forms.4.answer.1":
    "1) En la Sección 1 — Formularios, activa la opción de validación de teléfono (por país).",
  "section0.faq.forms.4.answer.2":
    "2) Elige los prefijos permitidos (ej.: +212, +213, +216) y la longitud mínima.",
  "section0.faq.forms.4.answer.3":
    "3) Si el número es demasiado corto o inválido, el formulario mostrará un mensaje y bloqueará el envío.",

  "section0.faq.forms.5.title":
    "¿Cómo añado un campo de Notas/Comentario para el cliente?",
  "section0.faq.forms.5.answer.1":
    "1) En la Sección 1, activa el campo de Notas/Comentario si está disponible.",
  "section0.faq.forms.5.answer.2":
    "2) Este texto se envía a la nota del pedido de Shopify y a Google Sheets si mapeas la columna correspondiente.",
  "section0.faq.forms.5.answer.3":
    "3) Ideal para info como: piso, código de puerta, franja horaria de entrega, etc.",

  "section0.faq.offers.1.title":
    "¿Cómo activo el upsell después del formulario COD?",
  "section0.faq.offers.1.answer.1":
    "1) Ve a la Sección 2 — Ofertas (upsell/bundles).",
  "section0.faq.offers.1.answer.2":
    "2) Crea una nueva oferta eligiendo el producto principal y el producto de upsell.",
  "section0.faq.offers.1.answer.3":
    "3) Configura el descuento (por ejemplo -20 %) y el texto de la oferta.",
  "section0.faq.offers.1.answer.4":
    "4) Activa la oferta: después del formulario COD, el cliente verá la propuesta de upsell.",

  "section0.faq.offers.2.title":
    "¿Cómo creo un bundle de 1 / 2 / 3 unidades con descuento?",
  "section0.faq.offers.2.answer.1":
    "1) En la Sección 2, añade una oferta de tipo bundle.",
  "section0.faq.offers.2.answer.2":
    "2) Define las opciones 1 unidad, 2 unidades, 3 unidades con los porcentajes de descuento para cada nivel.",
  "section0.faq.offers.2.answer.3":
    "3) El cliente puede elegir el bundle directamente en la interfaz después del formulario COD.",

  "section0.faq.offers.3.title":
    "El upsell o el bundle no aparecen después del formulario",
  "section0.faq.offers.3.answer.1":
    "1) Comprueba que la oferta esté activa en la Sección 2.",
  "section0.faq.offers.3.answer.2":
    "2) Asegúrate de que la condición de producto se cumpla (mismo producto o colección).",
  "section0.faq.offers.3.answer.3":
    "3) Haz un pedido de prueba completo: algunas ofertas solo aparecen después de un envío real del formulario.",

  "section0.faq.sheets.1.title":
    "¿Cómo conecto mi hoja de Google Sheets?",
  "section0.faq.sheets.1.answer.1":
    "1) Ve a la Sección 3 — Google Sheets.",
  "section0.faq.sheets.1.answer.2":
    "2) Pega el ID de la hoja (la parte entre /d/ y /edit en la URL).",
  "section0.faq.sheets.1.answer.3":
    "3) Elige el nombre de pestaña exacto donde quieres recibir los pedidos.",
  "section0.faq.sheets.1.answer.4":
    "4) Usa el carrusel para mapear cada columna (Nombre completo, Teléfono, Ciudad, Producto, Total, etc.) y luego haz clic en Guardar.",

  "section0.faq.sheets.2.title":
    "Los pedidos no llegan o han dejado de llegar a Google Sheets",
  "section0.faq.sheets.2.answer.1":
    "1) Comprueba que el ID de la hoja y el nombre de pestaña sean correctos.",
  "section0.faq.sheets.2.answer.2":
    "2) Asegúrate de que el email de la cuenta de servicio de Google tenga acceso de edición a la hoja.",
  "section0.faq.sheets.2.answer.3":
    "3) Verifica que la configuración esté guardada en la Sección 3 (botón Guardar tienda).",
  "section0.faq.sheets.2.answer.4":
    "4) Haz un nuevo pedido de prueba y revisa los logs del servidor si es necesario.",

  "section0.faq.sheets.3.title":
    "¿Cómo defino el orden de las columnas en la hoja?",
  "section0.faq.sheets.3.answer.1":
    "1) En la Sección 3, usa el carrusel de columnas (Columna 1, Columna 2, etc.).",
  "section0.faq.sheets.3.answer.2":
    "2) Para cada columna, elige el tipo (datetime, number, currency, string...) y el campo (customer.name, customer.phone, cart.productTitle, cart.total...).",
  "section0.faq.sheets.3.answer.3":
    "3) Reordena las columnas moviéndolas en el carrusel.",
  "section0.faq.sheets.3.answer.4":
    "4) Guarda y haz un pedido de prueba para ver el orden aplicado en Google Sheets.",

  "section0.faq.sheets.4.title":
    "¿Cuál es la diferencia entre Total sin envío y Total con envío?",
  "section0.faq.sheets.4.answer.1":
    "1) Total del pedido (sin envío): importe del producto + posibles descuentos, sin gastos de envío.",
  "section0.faq.sheets.4.answer.2":
    "2) Total del pedido (con envío): incluye también los gastos de envío (si los has configurado).",
  "section0.faq.sheets.4.answer.3":
    "3) En la Sección 3, puedes elegir qué total enviar a Google Sheets (cart.subtotal o cart.totalWithShipping).",

  "section0.faq.pixels.1.title":
    "¿Cómo conecto Meta Pixel, TikTok o Google?",
  "section0.faq.pixels.1.answer.1":
    "1) Ve a la Sección 4 — Eventos de píxel.",
  "section0.faq.pixels.1.answer.2":
    "2) Pega tu Meta Pixel ID, TikTok Pixel ID o Google Measurement ID.",
  "section0.faq.pixels.1.answer.3":
    "3) Activa los eventos (Purchase COD, PageView, etc.) que quieres enviar.",
  "section0.faq.pixels.1.answer.4":
    "4) Haz un pedido de prueba y revisa en Meta Events Manager / TikTok Events / Google DebugView.",

  "section0.faq.pixels.2.title":
    "¿Qué evento se envía para un pedido COD?",
  "section0.faq.pixels.2.answer.1":
    "1) La app envía un evento de tipo Purchase para los pedidos COD.",
  "section0.faq.pixels.2.answer.2":
    "2) El evento contiene: importe total, moneda, cantidad e información del producto.",
  "section0.faq.pixels.2.answer.3":
    "3) Puedes usar estos datos para optimizar tus campañas de Meta, TikTok o Google Ads.",

  "section0.faq.pixels.3.title":
    "El píxel no recibe eventos",
  "section0.faq.pixels.3.answer.1":
    "1) Comprueba que los IDs (Meta, TikTok, Google) sean correctos y estén guardados.",
  "section0.faq.pixels.3.answer.2":
    "2) Desactiva los bloqueadores de anuncios en tu navegador durante la prueba.",
  "section0.faq.pixels.3.answer.3":
    "3) Usa un producto real y haz un pedido completo para disparar Purchase.",
  "section0.faq.pixels.3.answer.4":
    "4) Revisa también los logs del servidor si la app envía eventos por API (CAPI).",

  "section0.faq.antibot.1.title":
    "¿Para qué sirve la sección Anti-bot?",
  "section0.faq.antibot.1.answer.1":
    "1) Bloquear pedidos spam y bots que rellenan tu formulario COD.",
  "section0.faq.antibot.1.answer.2":
    "2) Filtrar números de teléfono demasiado cortos o sospechosos.",
  "section0.faq.antibot.1.answer.3":
    "3) Limitar pedidos desde ciertos países o IPs si es necesario.",

  "section0.faq.antibot.2.title":
    "¿Cómo configuro Anti-bot sin bloquear clientes reales?",
  "section0.faq.antibot.2.answer.1":
    "1) Empieza simple: activa la validación de teléfono (minDigits) y el honeypot (campo oculto + tiempo mínimo).",
  "section0.faq.antibot.2.answer.2":
    "2) Añade reglas de IP (denyList/allowList) solo si ves spam repetitivo.",
  "section0.faq.antibot.2.answer.3":
    "3) Para países, usa mejor una allowList de los países donde realmente vendes.",
  "section0.faq.antibot.2.answer.4":
    "4) Prueba los cambios con un pedido real para verificar que el flujo sigue siendo fluido.",

  "section0.faq.antibot.3.title":
    "¿Por qué algunos pedidos son bloqueados por Anti-bot?",
  "section0.faq.antibot.3.answer.1":
    "1) El mensaje de error contiene un código ANTIBOT_BLOCKED y la razón: teléfono demasiado corto, país no permitido, honeypot rellenado, IP bloqueada, etc.",
  "section0.faq.antibot.3.answer.2":
    "2) Revisa tu configuración en la Sección 5 — Anti-bot y suaviza las reglas si bloqueas clientes reales.",

  "section0.faq.shipping.1.title":
    "¿Cómo añado mis países, ciudades y provincias?",
  "section0.faq.shipping.1.answer.1":
    "1) Ve a la Sección 6 — Ciudades/Provincias/Países.",
  "section0.faq.shipping.1.answer.2":
    "2) Primero añade los países a los que envías (ej.: Marruecos, Argelia, Túnez…).",
  "section0.faq.shipping.1.answer.3":
    "3) Después añade las ciudades y provincias asociadas a cada país.",
  "section0.faq.shipping.1.answer.4":
    "4) Estos datos pueden usarse en el formulario COD y en tu call center vía Google Sheets.",

  "section0.faq.shipping.2.title":
    "¿Puedo aplicar tarifas de envío distintas según la ciudad?",
  "section0.faq.shipping.2.answer.1":
    "1) Sí, el objetivo de la Sección 6 es estructurar países / provincias / ciudades.",
  "section0.faq.shipping.2.answer.2":
    "2) Luego puedes usar estos datos en tu flujo (Sheets, call center, reglas de envío) para aplicar tarifas diferentes por zona.",

  "section0.faq.billing.1.title":
    "¿Cómo funciona la suscripción de Shopify para la app?",
  "section0.faq.billing.1.answer.1":
    "1) En la Sección 0 — Panel, pestaña Planes y facturación, elige Starter, Basic o Premium (mensual o anual).",
  "section0.faq.billing.1.answer.2":
    "2) Shopify abre una página oficial de confirmación para crear la suscripción.",
  "section0.faq.billing.1.answer.3":
    "3) Una vez validado, la app detecta tu plan activo y desbloquea las funcionalidades.",
  "section0.faq.billing.1.answer.4":
    "4) La facturación la gestiona 100 % Shopify (puedes ver las facturas en Billing de Shopify).",

  "section0.faq.billing.2.title":
    "¿Cómo cambio de plan (Starter, Basic, Premium)?",
  "section0.faq.billing.2.answer.1":
    "1) Abre la Sección 0 — Panel, pestaña Planes y facturación.",
  "section0.faq.billing.2.answer.2":
    "2) Haz clic en Elegir mensual o Elegir anual en el nuevo plan.",
  "section0.faq.billing.2.answer.3":
    "3) Shopify te abrirá una nueva página de confirmación.",
  "section0.faq.billing.2.answer.4":
    "4) Tras la validación, el nuevo plan se activa y el antiguo se cancela automáticamente.",

  "section0.faq.support.1.title":
    "¿Cómo contacto con soporte para una ayuda personalizada?",
  "section0.faq.support.1.answer.1":
    "1) WhatsApp: para preguntas rápidas, capturas de pantalla y pruebas en directo.",
  "section0.faq.support.1.answer.2":
    "2) Correo: para solicitudes plus longues, problèmes techniques détaillés ou suggestions.",
  "section0.faq.support.1.answer.3":
    "3) No dudes en enviar un vídeo corto de tu problema (Loom, móvil…) para que lo entendamos más rápido.",
  
  // ===== Section 1 — COD Forms =====
  // Header
  "section1.header.appTitle": "Forms COD — Formulario de pedido",
  "section1.header.appSubtitle":
    "Personaliza tu formulario de pago contra reembolso y el resumen del pedido.",
  "section1.header.btnAddToTheme": "Añadir bloque al tema",
  "section1.header.btnPreview": "Previsualizar formulario",
  "section1.header.btnSave": "Guardar ajustes",

  // Left rail / navigation
  "section1.rail.title": "Formulario COD",
  "section1.rail.cart": "Resumen del pedido",
  "section1.rail.titles": "Títulos del formulario",
  "section1.rail.buttons": "Botones y mensajes",
  "section1.rail.fieldsSeparator": "Campos del formulario",
  "section1.rail.appearanceSeparator": "Apariencia y opciones",
  "section1.rail.colors": "Colores y estilo",
  "section1.rail.options": "Opciones",

  // Groups
  "section1.group.cart.title": "Textos del resumen del pedido",
  "section1.group.formTitles.title": "Títulos del formulario",
  "section1.group.buttons.title": "Botones y mensajes",
  "section1.group.colors.title": "Colores y estilo del formulario",
  "section1.group.options.title": "Opciones de visualización y comportamiento",
  "section1.group.fields.title": "Configuración de campos",

  // Cart texts
  "section1.cart.labelTop": "Título superior del carrito",
  "section1.cart.labelPrice": "Etiqueta precio",
  "section1.cart.labelShipping": "Etiqueta envío",
  "section1.cart.labelTotal": "Etiqueta total",

  // Form texts
  "section1.form.titleLabel": "Título del formulario",
  "section1.form.subtitleLabel": "Subtítulo del formulario",
  "section1.form.successTextLabel": "Mensaje de éxito",

  // Buttons
  "section1.buttons.displayStyleLabel": "Estilo de visualización",
  "section1.buttons.style.inline": "En línea",
  "section1.buttons.style.popup": "Popup",
  "section1.buttons.style.drawer": "Cajón",
  "section1.buttons.mainCtaLabel": "Texto del botón principal",
  "section1.buttons.totalSuffixLabel": "Sufijo total",
  "section1.buttons.successTextLabel": "Mensaje de éxito",

  // Colors section
  "section1.colors.formSection": "Colores del formulario",
  "section1.colors.bg": "Fondo",
  "section1.colors.text": "Color del texto",
  "section1.colors.border": "Color del borde",
  "section1.colors.inputBg": "Fondo de campos",
  "section1.colors.inputBorder": "Borde de campos",
  "section1.colors.placeholder": "Color del placeholder",
  "section1.colors.buttonSection": "Colores del botón",
  "section1.colors.btnBg": "Fondo del botón",
  "section1.colors.btnText": "Texto del botón",
  "section1.colors.btnBorder": "Borde del botón",
  "section1.colors.btnHeight": "Altura del botón",
  "section1.colors.cartSection": "Colores del carrito",
  "section1.colors.cartBg": "Fondo del carrito",
  "section1.colors.cartBorder": "Borde del carrito",
  "section1.colors.cartRowBg": "Fondo de filas",
  "section1.colors.cartRowBorder": "Borde de filas",
  "section1.colors.cartTitle": "Color de títulos",
  "section1.colors.cartText": "Color del texto",
  "section1.colors.layoutSection": "Diseño y espaciado",
  "section1.colors.radius": "Radio del borde",
  "section1.colors.padding": "Padding interno",
  "section1.colors.fontSize": "Tamaño de fuente",
  "section1.colors.direction": "Dirección del texto",
  "section1.colors.titleAlign": "Alineación del título",
  "section1.colors.fieldAlign": "Alineación de campos",
  "section1.colors.shadow": "Sombra",
  "section1.colors.glow": "Efecto brillo",
  "section1.colors.glowPx": "Intensidad del brillo",
  "section1.colors.hexLabel": "Color hexadecimal",

  // Alignment options
  "section1.align.left": "Izquierda",
  "section1.align.center": "Centro",
  "section1.align.right": "Derecha",

  // Options section
  "section1.options.behavior": "Comportamiento",
  "section1.options.openDelayMs": "Retardo apertura (ms)",
  "section1.options.effect": "Efecto visual",
  "section1.options.effect.none": "Ninguno",
  "section1.options.effect.light": "Sombra ligera",
  "section1.options.effect.glow": "Brillo",
  "section1.options.closeOnOutside": "Cerrar al hacer clic fuera",
  "section1.options.drawer": "Ajustes del cajón",
  "section1.options.drawerDirection": "Dirección del cajón",
  "section1.options.drawerDirection.right": "Derecha",
  "section1.options.drawerDirection.left": "Izquierda",
  "section1.options.drawerSize": "Tamaño del cajón",
  "section1.options.overlayColor": "Color del overlay",
  "section1.options.overlayOpacity": "Opacidad del overlay",
  "section1.options.stickyButton": "Botón fijo",
  "section1.options.stickyType": "Tipo de fijo",
  "section1.options.sticky.none": "Ninguno",
  "section1.options.sticky.bottomBar": "Barra inferior",
  "section1.options.sticky.bubbleRight": "Burbuja derecha",
  "section1.options.sticky.bubbleLeft": "Burbuja izquierda",
  "section1.options.stickyLabel": "Etiqueta del botón fijo",
  "section1.options.countries": "Países y regiones",
  "section1.options.countries.storeCountryLabel": "País de la tienda",
  "section1.options.countries.selectPlaceholder": "Seleccionar país",
  "section1.options.countries.note": "Selecciona tu país principal para prefijos telefónicos y regiones",
  "section1.options.consents": "Consentimientos",
  "section1.options.requireGdpr": "Requerir consentimiento GDPR",
  "section1.options.gdprLabel": "Etiqueta GDPR",
  "section1.options.whatsappOptIn": "Opt-in WhatsApp",
  "section1.options.whatsappLabel": "Etiqueta WhatsApp",

  // Field editor
  "section1.group.formTexts.title": "Textos del formulario",
  "section1.fieldEditor.activeLabel": "Activo",
  "section1.fieldEditor.requiredLabel": "Requerido",
  "section1.fieldEditor.typeLabel": "Tipo de campo",
  "section1.fieldEditor.type.text": "Texto",
  "section1.fieldEditor.type.phone": "Teléfono",
  "section1.fieldEditor.type.textarea": "Área de texto",
  "section1.fieldEditor.type.number": "Número",
  "section1.fieldEditor.labelLabel": "Etiqueta",
  "section1.fieldEditor.placeholderLabel": "Placeholder",
  "section1.fieldEditor.phonePrefixLabel": "Prefijo telefónico",
  "section1.fieldEditor.minLabel": "Mínimo",
  "section1.fieldEditor.maxLabel": "Máximo",
"section1.fieldEditor.titlePrefix.fullName": "Nombre completo",
"section1.fieldEditor.titlePrefix.phone": "Teléfono (WhatsApp)",
"section1.fieldEditor.titlePrefix.city": "Ciudad",
"section1.fieldEditor.titlePrefix.province": "Provincia/Estado",
"section1.fieldEditor.titlePrefix.address": "Dirección",
"section1.fieldEditor.titlePrefix.notes": "Notas/comentario",
"section1.fieldEditor.titlePrefix.quantity": "Cantidad",


  // Preview
  "section1.preview.priceExample": "199,00",
  "section1.preview.freeShipping": "Envío gratis",
  "section1.preview.cityPlaceholder": "Seleccionar ciudad",
  "section1.preview.cityPlaceholderNoProvince": "Seleccionar ciudad",
  "section1.preview.cityPlaceholderNoProv": "Seleccionar ciudad",
  "section1.preview.provincePlaceholder": "Seleccionar provincia",
  "section1.preview.style.inline": "En línea",
  "section1.preview.style.popup": "Popup",
  "section1.preview.style.drawer": "Cajón",
  "section1.preview.stickyBarLabel": "Barra fija",
  "section1.preview.stickyBubbleLabel": "Burbuja fija",

  // Save messages
  "section1.save.errorGeneric": "Error al guardar ajustes",
  "section1.save.success": "¡Ajustes guardados correctamente!",
  "section1.save.unknownError": "Se produjo un error desconocido",
  "section1.save.failedPrefix": "Error al guardar: ",

  // Modal preview
  "section1.modal.previewTitle": "Vista previa del formulario COD",
  "section1.modal.previewClose": "Cerrar vista previa",
   // Header
  "section2.header.appTitle": "Ofertas · Upsells & Bundles COD",
  "section2.header.appSubtitle": "Configura descuentos automáticos, bundles y regalos sobre el formulario COD",
  "section2.header.btnSave": "Guardar ajustes",

  // Rail navigation
  "section2.rail.title": "Configuración de ofertas",
  "section2.rail.global": "Global y colores",
  "section2.rail.discount": "Ofertas (condiciones)",
  "section2.rail.upsell": "Regalo / upsell",

  // Groups
  "section2.group.global.title": "Opciones globales",
  "section2.group.theme.title": "Colores y estilo (vista previa)",
  "section2.group.discount.title": "Ofertas — Descuento condicional",
  "section2.group.display.title": "Visualización en página de producto",
  "section2.group.upsell.title": "Upsell — Regalo ganador",
  "section2.group.gift.title": "Regalo",

  // Global options
  "section2.global.enable": "Activar ofertas y upsell",
  "section2.global.currency": "Divisa mostrada",
  "section2.global.rounding": "Redondeo del total",
  "section2.global.rounding.none": "Sin redondeo",
  "section2.global.rounding.unit": "Redondear a unidad",
  "section2.global.rounding.99": "Terminar en .99",

  // Theme presets
  "section2.theme.preset": "Paleta rápida (sin código de color)",
  "section2.theme.preset.light": "Claro — fondo blanco, botón negro",
  "section2.theme.preset.dark": "Oscuro — fondo oscuro, botón naranja",
  "section2.theme.preset.purple": "Púrpura — estilo premium",
  "section2.theme.statusBarBg": "Fondo barra estado OFERTAS",
  "section2.theme.statusBarText": "Texto barra estado OFERTAS",
  "section2.theme.offerBg": "Fondo tarjeta OFERTA",
  "section2.theme.upsellBg": "Fondo tarjeta REGALO",
  "section2.theme.ctaBg": "Fondo botón CTA",
  "section2.theme.ctaText": "Texto botón CTA",
  "section2.theme.ctaBorder": "Borde botón CTA",

  // Discount/Offer settings
  "section2.discount.enable": "Activar ofertas",
  "section2.discount.product": "Producto (Shopify)",
  "section2.discount.product.placeholder": "Ningún producto seleccionado",
  "section2.discount.previewTitle": "Título OFERTA (vista previa)",
  "section2.discount.previewDescription": "Descripción OFERTA",
  "section2.discount.productRef": "Handle / ID / URL producto OFERTA",
  "section2.discount.imageUrl": "Imagen producto OFERTA (URL)",
  "section2.discount.iconEmoji": "Icono OFERTA (emoji)",
  "section2.discount.iconUrl": "Icono OFERTA (URL imagen pequeña)",
  "section2.discount.type": "Tipo de descuento",
  "section2.discount.type.percent": "Porcentaje (%)",
  "section2.discount.type.fixed": "Cantidad fija",
  "section2.discount.percent": "% descuento",
  "section2.discount.fixedAmount": "Cantidad fija",
  "section2.discount.conditions.minQty": "Cantidad mínima (minQty)",
  "section2.discount.conditions.minSubtotal": "Subtotal mínimo",
  "section2.discount.conditions.requiresCode": "Requiere un código",
  "section2.discount.conditions.code": "Código cupón",
  "section2.discount.caps.maxDiscount": "Límite descuento (0 = ninguno)",

  // Display settings
  "section2.display.style": "Estilo bloque OFERTA (sobre formulario)",
  "section2.display.style.style1": "Estilo 1 — Tarjeta completa",
  "section2.display.style.style2": "Estilo 2 — Banda degradada",
  "section2.display.style.style3": "Estilo 3 — Bloque compacto",
  "section2.display.style.style4": "Estilo 4 — Badge + total",
  "section2.display.style.style5": "Estilo 5 — Badges mínimos",
  "section2.display.showDiscountLine": "Mostrar línea de descuento",
  "section2.display.showUpsellLine": "Mostrar línea de regalo / upsell",

  // Upsell settings
  "section2.upsell.enable": "Activar regalo upsell",
  "section2.upsell.product": "Producto (Shopify)",
  "section2.upsell.product.placeholder": "Ningún producto seleccionado",
  "section2.upsell.previewTitle": "Título REGALO (vista previa)",
  "section2.upsell.previewDescription": "Descripción REGALO",
  "section2.upsell.productRef": "Handle / ID / URL producto REGALO",
  "section2.upsell.imageUrl": "Imagen producto REGALO (URL)",
  "section2.upsell.iconEmoji": "Icono REGALO (emoji)",
  "section2.upsell.iconUrl": "Icono REGALO (URL imagen pequeña)",
  "section2.upsell.trigger.type": "Disparador",
  "section2.upsell.trigger.type.subtotal": "Subtotal mínimo",
  "section2.upsell.trigger.type.product": "Producto específico",
  "section2.upsell.trigger.minSubtotal": "Subtotal mínimo",
  "section2.upsell.trigger.productHandle": "Handle / ID producto disparador",

  // Gift settings
  "section2.gift.title": "Título",
  "section2.gift.note": "Nota",
  "section2.gift.priceBefore": "Precio antes (info)",
  "section2.gift.isFree": "Gratuito (0)",

  // Buttons
  "section2.button.save": "Guardar ofertas",

  // Preview texts
  "section2.preview.title": "Pago contra reembolso (COD)",
  "section2.preview.subtitle": "Vista previa (formulario + ofertas)",
  "section2.preview.offersStatus.active": "OFERTA activada",
  "section2.preview.offersStatus.inactive": "OFERTA no elegible",
  "section2.preview.offersStatus.giftActive": "REGALO activo",
  "section2.preview.offersStatus.giftPending": "REGALO pendiente",
  "section2.preview.offersStatus.displayAbove": "Mostrado sobre formulario COD",
  "section2.preview.offerStrip.offer": "OFERTA — Producto con descuento",
  "section2.preview.offerStrip.gift": "REGALO — Producto gratis / upsell",
  "section2.preview.orderSummary.title": "Resumen del pedido",
  "section2.preview.orderSummary.productPrice": "Precio del producto",
  "section2.preview.orderSummary.shipping": "Precio del envío",
  "section2.preview.orderSummary.total": "Total",
  "section2.preview.form.title": "Formulario de pedido",
  "section2.preview.form.fullName": "Nombre completo *",
  "section2.preview.form.phone": "Teléfono (WhatsApp) *",
  "section2.preview.form.city": "Ciudad",
  "section2.preview.form.submit": "Confirmar pedido - Total: {price} {currency}",

  // Help texts
  "section2.helpText.product": "Elige el producto principal vinculado a esta oferta",
  "section2.helpText.offerDesc": "Ej: Descuento -10% desde 2 unidades",
  "section2.helpText.offerImage": "Imagen principal mostrada a la izquierda",
  "section2.helpText.offerIconEmoji": "Ej: 🔥, ⭐, -10% ...",
  "section2.helpText.offerIconUrl": "Ej: https://.../icono.png",
  "section2.helpText.giftDesc": "Ej: Regalo gratis automáticamente",
  "section2.helpText.giftIconEmoji": "Ej: 🎁, ⭐, FREE ...",
  "section2.helpText.display": "Este bloque se muestra sobre el formulario COD en la página de producto, sin modificar la configuración del formulario",
  // ===== Section 3 — Google Sheets =====
// Header
"section3.header.title": "TripleForm COD · Google Sheets & Panel",
"section3.header.subtitle": "Conecta Google Sheets para seguir pedidos COD en tiempo real (confirmados & abandonados) — sin salir de la interfaz.",
"section3.header.pill": "Google Sheets sync · Pedidos en vivo",

// Rail navigation
"section3.rail.panelsTitle": "Paneles",
"section3.rail.panels.sheets": "Google Sheets (pedidos)",
"section3.rail.panels.abandons": "Google Sheets (abandonados)",
"section3.rail.panels.realtime": "Pedidos en tiempo real",
"section3.rail.panels.whatsapp": "WhatsApp & exportar",
"section3.rail.previewOrders": "Vista previa columnas · pedidos",
"section3.rail.previewAbandons": "Vista previa columnas · abandonados",
"section3.rail.noAbandonedColumns": "Aún no hay columnas configuradas para pedidos abandonados.",
"section3.rail.filtersTitle": "Filtros de pedidos",
"section3.rail.stats.period": "Período estadísticas:",
"section3.rail.stats.days": "días",
"section3.rail.stats.codOnly": "(solo COD)",
"section3.rail.stats.allOrders": "(todos pedidos COD app)",
"section3.rail.stats.orders": "Pedidos:",
"section3.rail.stats.total": "Total:",
"section3.rail.filters.period": "Período de pedidos",
"section3.rail.filters.periodOptions.7days": "7 días",
"section3.rail.filters.periodOptions.15days": "15 días",
"section3.rail.filters.periodOptions.30days": "30 días",
"section3.rail.filters.periodOptions.60days": "60 días",
"section3.rail.filters.codOnly": "Mostrar solo pedidos COD",
"section3.rail.filters.description": "Estos ajustes controlan la lista de pedidos en tiempo real y el resumen en la barra púrpura. Si la API Shopify devuelve un error de acceso, solo se muestra el mensaje (sin datos falsos).",
"section3.rail.filters.save": "Guardar (tienda)",

// Google connection
"section3.connection.title": "Conexión Google & hoja pedidos",
"section3.connection.loading": "Verificando conexión Google…",
"section3.connection.accountConnected": "Cuenta Google conectada:",
"section3.connection.mainSheet": "Hoja principal (pedidos):",
"section3.connection.notDefined": "No definido",
"section3.connection.id": "ID",
"section3.connection.revocable": "Puedes cambiar cuentas o hojas cuando quieras, el acceso sigue siendo 100% revocable desde tu cuenta Google.",
"section3.connection.description": "Conecta tu cuenta Google para que TripleForm COD envíe automáticamente pedidos confirmados a tu propia hoja Google Sheets.",
"section3.connection.authorization": "La autorización pasa por la pantalla oficial de Google. Puedes revocarla en cualquier momento desde tu cuenta Google.",
"section3.connection.changeSheet": "Cambiar hoja pedidos",
"section3.connection.connect": "Conectar con Google",
"section3.connection.openSheet": "Abrir hoja pedidos",
"section3.connection.test": "Probar conexión",
"section3.connection.testSuccess": "Conexión Google Sheets (pedidos) OK ✔️",
"section3.connection.testError": "Fallo ❌: {error}",
"section3.connection.unknownError": "Error desconocido",

// Field mapping
"section3.mapping.title": "Campos → columnas Google Sheets (pedidos)",
"section3.mapping.selectField": "Seleccionar un campo y añadirlo",
"section3.mapping.selectPlaceholder": "Elegir un campo…",
"section3.mapping.exampleName": "+ Nombre (ejemplo)",
"section3.mapping.description": "Cada elección se convierte en una columna en tu hoja de pedidos. El carrusel permanece estable incluso si añades o eliminas columnas.",
"section3.mapping.configuredColumns": "Columnas configuradas (carrusel)",
"section3.mapping.previous": "Anterior",
"section3.mapping.next": "Siguiente",
"section3.mapping.column": "Columna",
"section3.mapping.delete": "Eliminar",
"section3.mapping.fieldForColumn": "Campo para columna {number}",
"section3.mapping.asLink": "Guardar como enlace (HYPERLINK)",
"section3.mapping.linkTemplate": "Plantilla enlace",
"section3.mapping.linkExample": "ej: https://wa.me/{value}",
"section3.mapping.width": "Ancho",

// Display settings
"section3.display.title": "Visualización de hoja en la app",
"section3.display.mode": "Modo de visualización",
"section3.display.options.none": "Ninguno",
"section3.display.options.link": "Enlace (botón)",
"section3.display.options.embedTop": "Integrar arriba",
"section3.display.options.embedBottom": "Integrar abajo",
"section3.display.height": "Altura integración",
"section3.display.description": "Puedes mostrar la hoja de pedidos directamente en la app (iframe) o solo ofrecer un botón de acceso rápido.",

// Abandoned orders
"section3.abandoned.title": "Conexión Google & hoja abandonados",
"section3.abandoned.selectedSheet": "Hoja abandonados seleccionada:",
"section3.abandoned.description": "Esta hoja está pensada para pedidos / carritos abandonados: clientes que rellenan el formulario pero no completan el pago.",
"section3.abandoned.useSecondSheet": "Usa una segunda hoja Google Sheets para seguir pedidos abandonados (prospectos que abandonan en el último momento).",
"section3.abandoned.whenAbandoned": "Cuando un cliente introduce su información pero no confirma, sus datos pueden ir a esta hoja dedicada (seguimiento WhatsApp, llamada, etc.).",
"section3.abandoned.changeSheet": "Elegir / cambiar hoja abandonados",
"section3.abandoned.openSheet": "Abrir hoja abandonados",
"section3.abandoned.testSuccess": "Conexión Google Sheets (abandonados) OK ✔️",
"section3.abandoned.mappingTitle": "Campos → columnas Google Sheets (abandonados)",
"section3.abandoned.examplePhone": "+ Teléfono (ejemplo)",
"section3.abandoned.mappingDescription": "Usa esta hoja para leads \"calientes\" que rellenaron su información pero no completaron el pedido. Recuerda añadir al menos Nombre + Teléfono + Producto.",
"section3.abandoned.abandonedColumn": "Columna abandonados",
"section3.abandoned.noColumns": "Aún no hay columnas. Añade al menos un campo para empezar.",

// Real-time orders
"section3.realtime.title": "Pedidos en tiempo real (ancho)",
"section3.realtime.loading": "Cargando pedidos…",
"section3.realtime.error": "Error: {error}",
"section3.realtime.unknownError": "error desconocido",
"section3.realtime.noOrders": "No se encontraron pedidos para el período seleccionado.",

// WhatsApp & export
"section3.whatsapp.title": "WhatsApp & exportar",
"section3.whatsapp.supportNumber": "Número WhatsApp soporte",
"section3.whatsapp.messageTemplate": "Plantilla de mensaje",
"section3.whatsapp.templatePlaceholder": "Hola {customer.name}, gracias por tu pedido #{order.id}…",
"section3.whatsapp.whenToSend": "¿Cuándo enviar?",
"section3.whatsapp.options.immediate": "Inmediatamente",
"section3.whatsapp.options.1h": "1 hora después",
"section3.whatsapp.options.24h": "24 horas después",
"section3.whatsapp.description": "Esta sección aún está en preparación. Más tarde podrás conectar el envío de pedidos a WhatsApp o una herramienta externa (webhook, Zapier, etc.). Por ahora es una maqueta visual.",

// Guide
"section3.guide.title": "Guía · Google Sheets & pedidos",
"section3.guide.panelSheets": "Panel \"Google Sheets (pedidos)\"",
"section3.guide.panelSheetsDesc": "conecta tu hoja principal y mapea los campos COD a las columnas Google Sheets. Usa el carrusel para ajustar orden y ancho.",
"section3.guide.panelAbandons": "Panel \"Google Sheets (abandonados)\"",
"section3.guide.panelAbandonsDesc": "configura una segunda hoja dedicada a carritos / pedidos abandonados. Útil para seguimiento WhatsApp o call center.",
"section3.guide.panelRealtime": "Panel \"Pedidos en tiempo real\"",
"section3.guide.panelRealtimeDesc": "muestra los últimos pedidos recibidos por TripleForm COD en el período elegido en los filtros izquierdos.",
"section3.guide.panelWhatsapp": "Panel \"WhatsApp & exportar\"",
"section3.guide.panelWhatsappDesc": "servirá más tarde para enviar tus pedidos a WhatsApp o a una herramienta externa (webhook, Zapier, etc.).",

// Preview
"section3.preview.columnHeaders.date": "Fecha",
"section3.preview.columnHeaders.orderId": "Order ID",
"section3.preview.columnHeaders.customer": "Cliente",
"section3.preview.columnHeaders.customerName": "Nombre cliente",
"section3.preview.columnHeaders.phone": "Teléfono",
"section3.preview.columnHeaders.city": "Ciudad",
"section3.preview.columnHeaders.product": "Producto",
"section3.preview.columnHeaders.total": "Total",
"section3.preview.columnHeaders.country": "País",
"section3.preview.empty": "—",

// Save messages
"section3.save.success": "Configuración Google Sheets guardada en tienda ✔️",
"section3.save.error": "Error (tienda) ❌: {error}",
"section3.save.unknownError": "Error desconocido",

// Fields (pour APP_FIELDS)
"section3.fields.customer.name": "Nombre completo",
"section3.fields.customer.phone": "Teléfono",
"section3.fields.customer.city": "Ciudad",
"section3.fields.customer.province": "Provincia/Región",
"section3.fields.customer.country": "País",
"section3.fields.customer.address": "Dirección",
"section3.fields.customer.notes": "Notas pedido",
"section3.fields.cart.productTitle": "Producto — Título",
"section3.fields.cart.variantTitle": "Producto — Variante",
"section3.fields.cart.offerName": "Oferta / Bundle",
"section3.fields.cart.upsellName": "Upsell",
"section3.fields.cart.quantity": "Cantidad",
"section3.fields.cart.subtotal": "Total pedido (sin envío)",
"section3.fields.cart.shipping": "Gastos de envío",
"section3.fields.cart.totalWithShipping": "Total pedido (con envío)",
"section3.fields.cart.currency": "Moneda",
"section3.fields.order.id": "Order ID",
"section3.fields.order.date": "Order date",
// Section 3 — Google Sheets (clés manquantes)
"section3.sheetsConfiguration.title": "Configuración Google Sheets",
"section3.sheetsConfiguration.ordersSheet": "Hoja pedidos",
"section3.sheetsConfiguration.abandonedSheet": "Hoja abandonados",
"section3.sheetsConfiguration.spreadsheetId": "ID de la hoja",
"section3.sheetsConfiguration.spreadsheetIdHelp": "El ID desde la URL de tu Google Sheets (entre /d/ y /edit)",
"section3.sheetsConfiguration.tabName": "Nombre de la pestaña",
"section3.sheetsConfiguration.tabNameHelp": "Nombre de la pestaña donde se escribirán los pedidos",
"section3.sheetsConfiguration.headerRow": "Fila de encabezado",
"section3.sheetsConfiguration.headerRowHelp": "Número de fila donde están los encabezados de columnas (generalmente 1)",
"section3.sheetsConfiguration.testConnection": "Probar conexión",
"section3.sheetsConfiguration.openSheet": "Abrir hoja",
"section3.sheetsConfiguration.testSuccess": "✓ Prueba de conexión exitosa",
"section3.sheetsConfiguration.testError": "✗ Prueba fallida: {error}",
"section3.sheetsConfiguration.noSpreadsheetId": "Por favor ingresa primero un ID de hoja",
"section3.sheetsConfiguration.disconnect": "Desconectar",
"section3.sheetsConfiguration.disconnectConfirm": "¿Estás seguro de que quieres desconectar la cuenta de Google? Esto detendrá el envío de pedidos a Google Sheets.",
"section3.sheetsConfiguration.disconnected": "Cuenta de Google desconectada",
"section3.sheetsConfiguration.disconnectError": "Error de desconexión: {error}",

// Sheets tabs
"section3.sheetsTabs.orders": "Pedidos",
"section3.sheetsTabs.abandoned": "Abandonados",

// Connection messages
"section3.connection.success": "Cuenta de Google conectada con éxito",
"section3.connection.error": "Error de conexión: {error}",
"section3.connection.popupBlocked": "La ventana emergente fue bloqueada. Por favor permite las ventanas emergentes para este sitio.",
"section3.connection.popupBlockedAfterOpen": "La ventana emergente fue cerrada o bloqueada. Por favor intenta de nuevo.",
"section3.sheetsConfiguration.selectSpreadsheet": "Seleccionar hoja",
"section3.sheetsConfiguration.selectSpreadsheetHelp": "Elige la hoja de Google Sheets a utilizar",
"section3.sheetsConfiguration.selectTab": "Seleccionar pestaña",
"section3.sheetsConfiguration.selectTabHelp": "Elige la pestaña en la hoja",
"section3.connection.accountConnected": "Cuenta Google conectada:",
"section3.connection.mainSheet": "Hoja principal (pedidos):",
"section3.sheetsConfiguration.selectSpreadsheet": "Seleccionar hoja",
"section3.sheetsConfiguration.selectSpreadsheetHelp": "Elige la hoja de Google Sheets a utilizar",
"section3.sheetsConfiguration.selectTab": "Seleccionar pestaña",
"section3.sheetsConfiguration.selectTabHelp": "Elige la pestaña en la hoja",
// Section 4 — Pixels & Tracking
"section4.header.appTitle": "TripleForm COD · Píxeles y Seguimiento",
"section4.header.appSubtitle": "Conecta Google, Facebook (Pixel y Conversions API) y TikTok para rastrear tus pedidos COD.",
"section4.header.pill": "Centro de píxeles y tracking",

"section4.rail.title": "Paneles",
"section4.rail.statusTitle": "Estado de píxeles",
"section4.rail.statusNote": "Activa solo los canales que realmente necesitas. Luego podrás conectar las llamadas reales en tus rutas Remix y bloques Theme Extension.",
"section4.rail.panels.overview": "Resumen y lista de verificación",
"section4.rail.panels.google": "Google (GA4 y Ads)",
"section4.rail.panels.fb": "Facebook Pixel (cliente)",
"section4.rail.panels.capi_fb": "Facebook Conversions API",
"section4.rail.panels.tiktok": "TikTok Pixel (cliente)",
"section4.rail.panels.tiktok_api": "TikTok Events API (servidor)",
"section4.rail.panels.tests": "Pruebas y depuración",

"section4.status.on": "ACTIVO",
"section4.status.off": "INACTIVO",
"section4.status.ready": "Listo",
"section4.status.notReady": "No listo",

"section4.platforms.google": "Google",
"section4.platforms.fbPixel": "Facebook Pixel",
"section4.platforms.fbCAPI": "Facebook CAPI",
"section4.platforms.tiktokPixel": "TikTok Pixel",
"section4.platforms.tiktokAPI": "TikTok Events API",

"section4.buttons.saveStore": "Guardar (tienda)",

// Overview
"section4.overview.title": "Resumen de seguimiento y mejores prácticas",
"section4.overview.description": "Aquí gestionas todos tus píxeles desde un solo lugar: Google, Facebook Pixel y Conversions API, TikTok Pixel y Events API. El objetivo es preparar la configuración frontend, luego conectamos las APIs reales en el servidor.",
"section4.overview.googleDesc": "ID de medición GA4 + opcionalmente ID/Label de conversión para Google Ads.",
"section4.overview.fbPixelDesc": "Script del navegador para PageView, ViewContent, AddToCart, Purchase...",
"section4.overview.fbCAPIDesc": "Envío del lado del servidor con Pixel ID + Access Token + deduplicación mediante event_id.",
"section4.overview.tiktokPixelDesc": "Seguimiento en el navegador (página, vistas de producto, add-to-cart, purchase).",
"section4.overview.tiktokAPIDesc": "Conversiones del lado del servidor con Pixel Code + token de negocio.",

// Google
"section4.google.mainTitle": "Google — etiqueta principal (GA4 / Ads)",
"section4.google.enableLabel": "Activar Google (gtag.js)",
"section4.google.measurementIdLabel": "ID de medición GA4 (G-XXXX...)",
"section4.google.adsConversionIdLabel": "ID de conversión de Google Ads (AW-XXXX...)",
"section4.google.adsConversionLabel": "Etiqueta de conversión de Google Ads (opcional)",
"section4.google.helpText": "Podrás usar estos ID en tu bloque Theme Extension y/o en una ruta Remix para enviar eventos (purchase, etc.).",
"section4.google.eventsTitle": "Google — eventos automáticos",
"section4.google.sendPageView": "Enviar PageView automáticamente",
"section4.google.sendPurchase": "Enviar Purchase automáticamente",
"section4.google.eventsHelp": "En la práctica, luego decidirás en tu código JavaScript/Remix cuándo llamar a gtag (en ViewContent, AddToCart, Purchase...).",

// Facebook Pixel
"section4.fbPixel.mainTitle": "Facebook Pixel — configuración (cliente)",
"section4.fbPixel.enableLabel": "Activar Facebook Pixel (cliente)",
"section4.fbPixel.nameLabel": "Nombre del píxel",
"section4.fbPixel.pixelIdLabel": "ID del píxel",
"section4.fbPixel.helpText": "El píxel cliente envía eventos mediante fbq() desde el navegador. Puedes generar un event_id para deduplicar con CAPI.",
"section4.fbPixel.eventsTitle": "Facebook Pixel — eventos y coincidencia avanzada",
"section4.fbPixel.pageView": "PageView",
"section4.fbPixel.viewContent": "ViewContent",
"section4.fbPixel.addToCart": "AddToCart",
"section4.fbPixel.initiateCheckout": "InitiateCheckout",
"section4.fbPixel.purchase": "Purchase",
"section4.fbPixel.advancedMatching": "Activar coincidencia avanzada (email, teléfono...)",

// Facebook CAPI
"section4.fbCAPI.mainTitle": "Facebook Conversions API — conexión (servidor)",
"section4.fbCAPI.enableLabel": "Activar Facebook CAPI (servidor)",
"section4.fbCAPI.pixelIdLabel": "ID del píxel (obligatorio)",
"section4.fbCAPI.accessTokenLabel": "Token de acceso (obligatorio)",
"section4.fbCAPI.testEventCodeLabel": "Código de evento de prueba (opcional)",
"section4.fbCAPI.helpText": "Estos ajustes se usarán en una ruta Remix (ej: /api/fb/capi) para enviar eventos del lado del servidor con el SDK o una solicitud HTTP simple.",
"section4.fbCAPI.eventsTitle": "Facebook CAPI — eventos y deduplicación",
"section4.fbCAPI.sendViewContent": "Enviar ViewContent del lado del servidor",
"section4.fbCAPI.sendAddToCart": "Enviar AddToCart del lado del servidor",
"section4.fbCAPI.sendPurchase": "Enviar Purchase del lado del servidor",
"section4.fbCAPI.useEventIdDedup": "Usar event_id para deduplicar cliente + CAPI",
"section4.fbCAPI.eventsHelp": "Más tarde, pasarás el mismo event_id al píxel cliente (fbq) y tu llamada CAPI para evitar duplicados en Ads Manager.",

// TikTok Pixel
"section4.tiktokPixel.mainTitle": "TikTok Pixel — configuración (cliente)",
"section4.tiktokPixel.enableLabel": "Activar TikTok Pixel (cliente)",
"section4.tiktokPixel.nameLabel": "Nombre del píxel",
"section4.tiktokPixel.pixelIdLabel": "ID del píxel",
"section4.tiktokPixel.helpText": "TikTok Pixel en el navegador te ayudará a rastrear vistas de producto, adiciones al carrito y compras desde tu formulario COD.",
"section4.tiktokPixel.eventsTitle": "TikTok Pixel — eventos automáticos",
"section4.tiktokPixel.pageView": "PageView",
"section4.tiktokPixel.viewContent": "ViewContent",
"section4.tiktokPixel.addToCart": "AddToCart",
"section4.tiktokPixel.purchase": "Purchase",

// TikTok Events API
"section4.tiktokAPI.mainTitle": "TikTok Events API — conexión (servidor)",
"section4.tiktokAPI.enableLabel": "Activar TikTok Events API (servidor)",
"section4.tiktokAPI.pixelCodeLabel": "Código de píxel (obligatorio)",
"section4.tiktokAPI.accessTokenLabel": "Token de acceso de negocio (obligatorio)",
"section4.tiktokAPI.helpText": "Esta información se usará para llamar a TikTok Events API directamente desde tu backend, para enviar conversiones del lado del servidor.",
"section4.tiktokAPI.eventsTitle": "TikTok Events API — eventos",
"section4.tiktokAPI.sendPurchase": "Enviar Purchase (servidor)",
"section4.tiktokAPI.eventsHelp": "Por ahora solo planeamos el evento Purchase del lado del servidor. Puedes extenderlo más tarde si es necesario.",

// Tests & Debug
"section4.tests.title": "Pruebas y depuración — Píxeles backend",
"section4.tests.description": "Esta prueba verifica si tu configuración backend está lista para enviar eventos:",
"section4.tests.list.fbPixel": "Facebook Pixel (cliente): ID presente + habilitado (solo configuración, no eventos reales).",
"section4.tests.list.tiktokPixel": "TikTok Pixel (cliente): ID presente + habilitado (configuración).",
"section4.tests.list.fbCAPI": "Facebook CAPI: Pixel ID + Access Token + habilitado.",
"section4.tests.list.tiktokAPI": "TikTok Events API: Pixel Code + Access Token + habilitado.",
"section4.tests.testButton": "Probar configuración de Píxeles (backend)",
"section4.tests.error": "Error de prueba: {error}",
"section4.tests.result.fbPixel": "Facebook Pixel (configuración cliente)",
"section4.tests.result.tiktokPixel": "TikTok Pixel (configuración cliente)",
"section4.tests.result.fbCAPI": "Facebook Conversions API (servidor)",
"section4.tests.result.tiktokAPI": "TikTok Events API (servidor)",
"section4.tests.resultNote": "Esta prueba no verifica eventos reales en Meta / TikTok, solo valida que la configuración es suficiente en el lado de la aplicación. Para ver eventos en tiempo real, usa las extensiones Meta Pixel Helper y TikTok Pixel Helper en el storefront.",

// Guide
"section4.guide.title": "Guía · Píxeles y seguimiento",
"section4.guide.step1": "1. Comienza con el panel Google (GA4 y Ads) para agregar tu Measurement ID y opcionalmente las conversiones de Google Ads.",
"section4.guide.step2": "2. Luego activa Facebook Pixel cliente para rastrear eventos estándar desde el navegador.",
"section4.guide.step3": "3. Agrega Facebook Conversions API para duplicar eventos del lado del servidor (más confiable, bloqueadores de anuncios, etc.).",
"section4.guide.step4": "4. Configura TikTok Pixel y Events API si ejecutas campañas TikTok Ads.",
"section4.guide.step5": "5. Usa la pestaña Pruebas y depuración para verificar que la configuración backend sea correcta, luego revisa los eventos reales con extensiones del navegador (Meta / TikTok).",

// Save messages
"section4.save.success": "Configuración de Píxeles guardada en la tienda ✔️",
"section4.save.error": "Falló (tienda) ❌: {error}",
"section4.save.unknownError": "Error desconocido",

// Test messages
"section4.test.unknownError": "Error desconocido",
// Section 5 — Anti‑bot & Protection
"section5.header.appTitle": "TripleForm COD · Anti-bot & Protección",
"section5.header.appSubtitle": "IP · teléfono · país · reCAPTCHA · honeypot — para bloquear pedidos de robots sin afectar a clientes reales",
"section5.header.pill": "Centro de seguridad anti-spam",

"section5.rail.title": "Paneles",
"section5.rail.statusTitle": "Resumen de protección",
"section5.rail.statusNote": "Reglas IP: {ips} · Reglas teléfono: {phones}",
"section5.rail.panels.overview": "Resumen & estrategia",
"section5.rail.panels.ip": "Bloqueo IP",
"section5.rail.panels.phone": "Bloqueo teléfono",
"section5.rail.panels.country": "Bloqueo por país",
"section5.rail.panels.recap": "Google reCAPTCHA",
"section5.rail.panels.honeypot": "Honeypot & temporizador",

"section5.status.on": "ACTIVO",
"section5.status.off": "INACTIVO",
"section5.status.ready": "Listo",
"section5.status.notReady": "No listo",

"section5.buttons.save": "Guardar",
"section5.buttons.saveStore": "Guardar (tienda)",
"section5.buttons.add": "Añadir",
"section5.buttons.addCSV": "Añadir CSV",
"section5.buttons.remove": "Eliminar",
"section5.buttons.test": "Probar conexión",

"section5.overview.title": "Resumen anti-bot & consejos",
"section5.overview.description": "Esta sección protege tu formulario COD contra robots y pedidos spam (scripts, números falsos, IP abusivas…). Puedes activar una o varias capas según tus necesidades.",
"section5.overview.ip": "IP: bloquea IP sospechosas, límites de intentos por IP, auto-ban temporal.",
"section5.overview.phone": "Teléfono: controla longitud, prefijos permitidos, patrones de números falsos, límites por número/día.",
"section5.overview.country": "País: permite o bloquea ciertos países, o impone un desafío (captcha).",
"section5.overview.recaptcha": "reCAPTCHA: capa de Google (v2/v3) para detectar robots en el momento del envío.",
"section5.overview.honeypot": "Honeypot & temporizador: campo oculto + tiempo mínimo en la página, muy eficaz contra scripts simples.",

"section5.ipBlock.title": "Bloqueo por dirección IP",
"section5.ipBlock.enable": "Activar bloqueo IP",
"section5.ipBlock.trustProxy": "Confiar en proxy (usar X-Forwarded-For)",
"section5.ipBlock.clientIpHeader": "Cabecera IP cliente",
"section5.ipBlock.allowList": "Lista permitida — IP exactas PERMITIDAS",
"section5.ipBlock.denyList": "Lista denegada — IP exactas BLOQUEADAS",
"section5.ipBlock.cidrList": "Rangos CIDR — BLOQUEADOS",
"section5.ipBlock.cidrHelp": "Pega uno o varios rangos, separados por comas o saltos de línea.",
"section5.ipBlock.autoBanFails": "Auto-ban después de X fallos",
"section5.ipBlock.autoBanMinutes": "Duración auto-ban (minutos)",
"section5.ipBlock.maxOrdersPerDay": "Máx pedidos / IP / día",

"section5.phoneBlock.title": "Bloqueo por número de teléfono",
"section5.phoneBlock.enable": "Activar bloqueo teléfono",
"section5.phoneBlock.minDigits": "Número mínimo de dígitos",
"section5.phoneBlock.requirePrefix": "Requerir prefijo (+34…)",
"section5.phoneBlock.allowedPrefixes": "Prefijos permitidos",
"section5.phoneBlock.blockedNumbers": "Números bloqueados (exacto)",
"section5.phoneBlock.blockedPatterns": "Patrones bloqueados (RegExp simple)",
"section5.phoneBlock.maxOrdersPerDay": "Máx pedidos / número / día",

"section5.countryBlock.title": "Bloqueo por país",
"section5.countryBlock.enable": "Activar bloqueo por país",
"section5.countryBlock.defaultAction": "Acción por defecto",
"section5.countryBlock.defaultActionOptions.allow": "Permitir",
"section5.countryBlock.defaultActionOptions.block": "Bloquear",
"section5.countryBlock.defaultActionOptions.challenge": "Desafiar (captcha)",
"section5.countryBlock.allowList": "Países permitidos (códigos ISO2)",
"section5.countryBlock.denyList": "Países bloqueados (códigos ISO2)",

"section5.recaptcha.title": "Google reCAPTCHA",
"section5.recaptcha.enable": "Activar reCAPTCHA",
"section5.recaptcha.version": "Versión",
"section5.recaptcha.versionOptions.v2_checkbox": "v2 (Casilla)",
"section5.recaptcha.versionOptions.v2_invisible": "v2 (Invisible)",
"section5.recaptcha.versionOptions.v3": "v3 (Puntuación)",
"section5.recaptcha.siteKey": "Clave del sitio",
"section5.recaptcha.secretKey": "Clave secreta (servidor)",
"section5.recaptcha.minScore": "Puntuación mínima (v3)",
"section5.recaptcha.helpText": "Para v2, muestras un widget en frontend. Para v3, envías el token al servidor y verificas la puntuación con la API reCAPTCHA antes de crear el pedido.",

"section5.honeypot.title": "Honeypot & tiempo mínimo en la página",
"section5.honeypot.enable": "Activar honeypot (campo oculto)",
"section5.honeypot.blockIfFilled": "Bloquear si se rellena el campo oculto",
"section5.honeypot.checkMouseMove": "Controlar movimientos ratón / scroll",
"section5.honeypot.fieldName": "Nombre del campo honeypot",
"section5.honeypot.minTime": "Tiempo mínimo antes de envío (ms)",
"section5.honeypot.timeHelp": "Ej: 3000ms = 3 segundos. Si el formulario se envía demasiado rápido, consideramos que es un robot.",
"section5.honeypot.description": "Muy sencillo de implementar en tu bloque COD: añades un campo oculto y un temporizador JavaScript. Muchos robots rellenan todos los campos o envían la solicitud instantáneamente, lo que los hace fáciles de bloquear.",

"section5.empty": "Sin elementos",
"section5.placeholder": "Añadir…",

"section5.save.success": "Configuración Anti-bot guardada ✔️",
"section5.save.error": "Fallo: {error}",
"section5.save.unknownError": "Error desconocido",

"section5.guide.title": "Guía · Anti-bot TripleForm COD",
"section5.guide.step1": "• Empieza ligero (honeypot + límite teléfono) luego añade IP / país si ves mucho spam.",
"section5.guide.step2": "• La lista permitida siempre va antes de los bloqueos: práctico para tu IP o la de tu equipo.",
"section5.guide.step3": "• Mantén valores razonables para los límites (ej: 40 pedidos / IP / día) para evitar bloquear a un cliente real.",
"section5.guide.step4": "• reCAPTCHA es útil si recibes muchos bots «inteligentes» que pasan por otros filtros.",
"section5.guide.step5": "Cuando estés listo, podrás usar estos ajustes en tus rutas Remix /api/antibot/* y en el bloque del formulario COD.",
// ===== Section 6 — Geo / Shipping =====
"section6.header.appTitle": "TripleForm COD · Tarifas de envío por país/ciudad",
"section6.header.appSubtitle": "Configura tarifas de envío para Marruecos, Argelia, Túnez — por provincia, ciudad o rangos de precio.",
"section6.header.pill": "Calculadora envío · Ciudades/Provincias",

"section6.rail.title": "Paneles",
"section6.rail.panels.province": "Tarifas por provincia",
"section6.rail.panels.city": "Tarifas por ciudad",
"section6.rail.panels.price": "Rangos de precio",
"section6.rail.panels.advanced": "Opciones avanzadas",
"section6.rail.summaryTitle": "Resumen envío",
"section6.rail.type": "Tipo",
"section6.rail.free": "Gratis",
"section6.rail.paid": "De pago",
"section6.rail.mode": "Modo",
"section6.rail.priceBrackets": "Rangos de precio",
"section6.rail.provinces": "Provincias",
"section6.rail.cities": "Ciudades",
"section6.rail.countryCurrency": "País: {country} | Moneda: {currency}",

"section6.buttons.saveStore": "Guardar (tienda)",
"section6.buttons.deleteProvince": "Eliminar provincia",
"section6.buttons.addProvince": "Añadir provincia",
"section6.buttons.deleteCity": "Eliminar ciudad",
"section6.buttons.addCity": "Añadir ciudad",
"section6.buttons.deleteBracket": "Eliminar rango",
"section6.buttons.addBracket": "Añadir rango",
"section6.buttons.save": "Guardar opciones avanzadas",

"section6.general.title": "Configuración general de envío",
"section6.general.shippingType": "Tipo de envío",
"section6.general.freeOption": "Envío gratis",
"section6.general.paidOption": "Envío de pago",
"section6.general.mainCountry": "País principal",
"section6.general.countries.MA": "Marruecos",
"section6.general.countries.DZ": "Argelia",
"section6.general.countries.TN": "Túnez",
"section6.general.countryHelp": "El país principal para cálculos de envío y regiones.",
"section6.general.currency": "Moneda",
"section6.general.currencyHelp": "Moneda usada para tarifas (MAD, DZD, TND, etc.).",
"section6.general.pricingMode": "Modo de tarificación",
"section6.general.modeProvince": "Por provincia/región",
"section6.general.modeCity": "Por ciudad",
"section6.general.modePrice": "Por importe de pedido",
"section6.general.freeShippingInfo": "Tus pedidos COD tendrán envío gratis (sin tarifas extra).",
"section6.general.freeShippingDetails": "El envío es gratis para todos los pedidos. Aún puedes configurar opciones avanzadas (pedido mínimo, tarifa COD, etc.).",

"section6.province.title": "Tarifas de envío por provincia — {country}",
"section6.province.description": "Define tarifas de envío para cada provincia/wilaya. Si una provincia no está en la lista, se aplica la tarifa por defecto.",
"section6.province.provinceLabel": "Provincia/Wilaya",
"section6.province.provinceHelp": "Selecciona una provincia o introduce un nombre personalizado",
"section6.province.codeLabel": "Código",
"section6.province.codeHelp": "Código opcional (ej: MA-01, DZ-16)",
"section6.province.rateLabel": "Tarifa ({currency})",
"section6.province.rateHelp": "Coste de envío para esta provincia",

"section6.city.title": "Tarifas de envío por ciudad — {country}",
"section6.city.description": "Define tarifas de envío por ciudad. Primero elige provincia, luego selecciona ciudad.",
"section6.city.provinceLabel": "Provincia/Wilaya",
"section6.city.provinceHelp": "Selecciona primero la provincia para ver sus ciudades",
"section6.city.cityLabel": "Ciudad",
"section6.city.cityHelpEnabled": "Ciudades disponibles para la provincia seleccionada",
"section6.city.cityHelpDisabled": "Primero selecciona una provincia",
"section6.city.rateLabel": "Tarifa ({currency})",
"section6.city.rateHelp": "Coste de envío para esta ciudad",

"section6.select.provincePlaceholder": "Seleccionar provincia…",
"section6.select.cityPlaceholder": "Seleccionar ciudad…",

"section6.price.title": "Tarifas de envío por importe de pedido",
"section6.price.description": "Define rangos de precio. Ej: 0-299 MAD = 29 MAD envío, ≥300 MAD = gratis.",
"section6.price.minAmount": "Importe mínimo ({currency})",
"section6.price.maxAmount": "Importe máximo ({currency})",
"section6.price.maxHelp": "Deja vacío o 0 para 'ilimitado' (sin límite superior)",
"section6.price.rateLabel": "Tarifa ({currency})",

"section6.advanced.title": "Opciones avanzadas de envío",
"section6.advanced.defaultRate": "Tarifa por defecto ({currency})",
"section6.advanced.defaultRateHelp": "Se aplica si ninguna regla específica coincide",
"section6.advanced.freeThreshold": "Umbral gratis ({currency})",
"section6.advanced.freeThresholdHelp": "Importe de pedido por encima del cual el envío es gratis",
"section6.advanced.minOrderAmount": "Importe mínimo pedido ({currency})",
"section6.advanced.codExtraFee": "Tarifa COD extra ({currency})",
"section6.advanced.codExtraFeeHelp": "Tarifa adicional para pedidos COD (opcional)",
"section6.advanced.note": "Nota para el cliente",
"section6.advanced.noteHelp": "Mostrado cerca del total de envío",

"section6.save.success": "Configuración de envío guardada ✔️",
"section6.save.error": "Error al guardar: {error}",
"section6.save.unknownError": "Error desconocido",

"section6.mode.price": "Por precio",
"section6.mode.province": "Por provincia",
"section6.mode.city": "Por ciudad",

"section6.status.enabled": "Activado",
"section6.status.disabled": "Desactivado",

"section6.guide.title": "Guía · Envío por país/ciudad",
"section6.guide.step1": "1. Elige envío gratis o de pago. Si es de pago, selecciona modo: provincia, ciudad o rangos de precio.",
"section6.guide.step2": "2. Selecciona tu país principal (Marruecos, Argelia, Túnez) y moneda (MAD, DZD, TND).",
"section6.guide.step3": "3. Configura tarifas: añade provincias/ciudades con costes, o crea rangos de precio (0-299 = X, 300+ = gratis).",
"section6.guide.step4": "4. Usa opciones avanzadas para tarifa por defecto, umbral gratis, pedido mínimo, tarifa COD extra.",
"section6.guide.step5": "5. Guarda → las tarifas se calcularán automáticamente en tu formulario COD.",

"section1.preview.shippingToCalculate": "Envío a calcular",
"section3.sheetsConfiguration.chooseTab": "Elegir pestaña",
"section3.connection.refresh": "Actualizar conexión",
"section1.cart.freeShipping": "Envío gratis",
// ===== Section WhatsApp — Automation =====
"whatsapp.title": "Automatización WhatsApp",
"whatsapp.subtitle": "Conecta WhatsApp y automatiza tus comunicaciones",
"whatsapp.connected": "Conectado",
"whatsapp.disconnected": "Desconectado",
"whatsapp.connectedTo": "Conectado a",
"whatsapp.lastConnected": "Última conexión",
"whatsapp.refreshStatus": "Actualizar estado",
"whatsapp.testConnection": "Probar conexión",
"whatsapp.disconnect": "Desconectar",
"whatsapp.qr.placeholder": "Código QR WhatsApp",
"whatsapp.qr.generate": "Generar código QR",
"whatsapp.qr.regenerate": "Regenerar código QR",
"whatsapp.qr.instructions": "Abre WhatsApp > Configuración > Dispositivos vinculados > Vincular un dispositivo > Escanea este código QR",
"whatsapp.stats.messagesSent": "Mensajes enviados",
"whatsapp.stats.successful": "Exitosos",
"whatsapp.stats.recoveryRate": "Tasa de recuperación",
"whatsapp.stats.avgResponse": "Tiempo promedio respuesta",
"whatsapp.features.afterCOD.title": "Después del pedido COD",
"whatsapp.features.afterCOD.description": "Enviar un mensaje automático tras confirmar un pedido COD",
"whatsapp.features.afterCOD.enable": "Activar mensajes post-pedido",
"whatsapp.features.afterCOD.buttonText": "Texto del botón",
"whatsapp.features.afterCOD.position": "Posición del botón",
"whatsapp.features.afterCOD.autoSend": "Enviar automáticamente",
"whatsapp.features.afterCOD.delay": "Retraso de envío",
"whatsapp.features.recovery.title": "Recuperación de carrito",
"whatsapp.features.recovery.description": "Enviar recordatorio WhatsApp para carritos abandonados",
"whatsapp.features.recovery.enable": "Activar recuperación",
"whatsapp.features.recovery.delay": "Retraso antes de enviar",
"whatsapp.features.recovery.discount": "Descuento de recuperación",
"whatsapp.features.recovery.code": "Código de recuperación",
"whatsapp.features.templates.title": "Plantillas de mensajes",
"whatsapp.features.templates.description": "Personaliza tus mensajes WhatsApp",
"whatsapp.features.templates.orderMessage": "Mensaje post-pedido",
"whatsapp.features.templates.recoveryMessage": "Mensaje de recuperación",
"whatsapp.variables.available": "Variables disponibles",
"whatsapp.variables.orderId": "Número de pedido",
"whatsapp.variables.customerName": "Nombre del cliente",
"whatsapp.variables.customerPhone": "Teléfono del cliente",
"whatsapp.variables.productName": "Nombre del producto",
"whatsapp.variables.orderTotal": "Total del pedido",
"whatsapp.variables.deliveryDate": "Fecha de entrega",
"whatsapp.variables.shopName": "Nombre de la tienda",
"whatsapp.variables.trackingUrl": "URL de seguimiento",
"whatsapp.variables.supportNumber": "Número de soporte",
"whatsapp.variables.recoveryCode": "Código de recuperación",
"whatsapp.delays.immediate": "Inmediatamente",
"whatsapp.delays.5min": "5 minutos",
"whatsapp.delays.30min": "30 minutos",
"whatsapp.delays.1h": "1 hora",
"whatsapp.delays.2h": "2 horas",
"whatsapp.delays.6h": "6 horas",
"whatsapp.delays.24h": "24 horas",
"whatsapp.positions.below": "Debajo",
"whatsapp.positions.right": "Derecha",
"whatsapp.positions.replace": "Reemplazar",
"whatsapp.advanced.title": "Configuración avanzada",
"whatsapp.advanced.description": "Configuración avanzada de WhatsApp",
"whatsapp.advanced.autoConnect": "Conexión automática",
"whatsapp.advanced.analytics": "Activar analíticas",
"whatsapp.advanced.readReceipts": "Acuses de recibo",
"whatsapp.advanced.businessHours": "Solo horario laboral",
"whatsapp.advanced.startTime": "Hora de inicio",
"whatsapp.advanced.endTime": "Hora de fin",
"whatsapp.advanced.maxRetries": "Intentos máximos",
"whatsapp.advanced.mediaMessages": "Mensajes con multimedia",
"whatsapp.advanced.mediaUrl": "URL del multimedia",
"whatsapp.advanced.buttons": "Botones interactivos",
"whatsapp.preview.title": "Vista previa del mensaje",
"whatsapp.preview.description": "Cómo aparecerá tu mensaje",
"whatsapp.sendTest": "Enviar prueba",
"whatsapp.saveConfig": "Guardar configuración",
"whatsapp.configSaved": "¡Configuración guardada!",
"whatsapp.testSuccess": "¡Prueba de conexión exitosa!",
"whatsapp.testError": "Error de prueba: {error}",
"whatsapp.testMessageSent": "¡Mensaje de prueba enviado con éxito!",
"whatsapp.confirmDisconnect": "¿Seguro que quieres desconectar WhatsApp?",
"whatsapp.confirmTestMessage": "¿Enviar mensaje de prueba a tu número WhatsApp?",
"whatsapp.errors.qrGeneration": "Error generando código QR",
"whatsapp.errors.disconnect": "Error al desconectar",
"whatsapp.errors.saveConfig": "Error al guardar",
"whatsapp.errors.testMessage": "Error enviando prueba: {error}",
  /* ===== Icônes et sélecteurs ===== */
  "section1.fieldEditor.iconLabel": "Icono",
  "section1.iconSelector.title": "Elegir un icono",
  "section1.cart.cartIcon": "Icono del carrito",

  /* ===== Libellés d'icônes ===== */
  "icon.label.CartIcon": "Carrito",
  "icon.label.BagIcon": "Bolso",
  "icon.label.ProductsIcon": "Productos",
  "icon.label.CheckoutIcon": "Checkout",
  "icon.label.ReceiptIcon": "Recibo",
  "icon.label.NoteIcon": "Nota",
  "icon.label.ProfileIcon": "Perfil",
  "icon.label.PersonIcon": "Persona",
  "icon.label.UserIcon": "Usuario",
  "icon.label.CustomersIcon": "Clientes",
  "icon.label.PhoneIcon": "Teléfono",
  "icon.label.MobileIcon": "Móvil",
  "icon.label.CallIcon": "Llamada",
  "icon.label.ChatIcon": "Chat",
  "icon.label.HashtagIcon": "Hashtag",
  "icon.label.NumberIcon": "Número",
  "icon.label.CirclePlusIcon": "Más",
  "icon.label.LocationIcon": "Ubicación",
  "icon.label.PinIcon": "Alfiler",
  "icon.label.HomeIcon": "Casa",
  "icon.label.StoreIcon": "Tienda",
  "icon.label.CityIcon": "Ciudad",
  "icon.label.GlobeIcon": "Globo",
  "icon.label.MapIcon": "Mapa",
  "icon.label.RegionIcon": "Región",
  "icon.label.ClipboardIcon": "Portapapeles",
  "icon.label.DocumentIcon": "Documento",
  "icon.label.TextIcon": "Texto",
  "icon.label.TruckIcon": "Camión",
  "icon.label.CheckCircleIcon": "Verificar",
  "icon.label.PlayIcon": "Play",
  "icon.label.ArrowRightIcon": "Flecha derecha",
  "icon.label.SendIcon": "Enviar",
  // Rail navigation
"section2.rail.title": "Navegación",
"section2.rail.offers": "Ofertas (condiciones)",
"section2.rail.upsells": "Regalos / Upsell",

// Groups
"section2.group.conditions.title": "Condiciones de aplicación",
"section2.group.display.title": "Visualización",

// Global settings
"section2.global.rounding.label": "Redondeo de precios",

// Display settings
"section2.display.showOrderSummary": "Mostrar resumen de pedido",
"section2.display.showOffersSection": "Mostrar sección de ofertas",

// Offer settings (individual offers)
"section2.offer.title": "Oferta {{number}}",
"section2.offer.titleField": "Título de la oferta",
"section2.offer.description": "Descripción",
"section2.offer.enable": "Activar esta oferta",
"section2.offer.type": "Tipo de descuento",
"section2.offer.type.percent": "Porcentaje",
"section2.offer.type.fixed": "Monto fijo",
"section2.offer.percent": "Porcentaje",
"section2.offer.fixedAmount": "Monto fijo",
"section2.offer.product": "Producto concernido",
"section2.offer.selectProduct": "Seleccionar un producto",
"section2.offer.minQuantity": "Cantidad mínima",
"section2.offer.minSubtotal": "Subtotal mínimo",
"section2.offer.maxDiscount": "Descuento máximo (0 = ilimitado)",
"section2.offer.requiresCode": "Requiere un código",
"section2.offer.code": "Código promocional",
"section2.offer.imageUrl": "URL de la imagen",
"section2.offer.icon": "Icono",
"section2.offer.showInPreview": "Mostrar en vista previa",

// Upsell settings (individual)
"section2.upsell.title": "Regalo {{number}}",
"section2.upsell.titleField": "Título del regalo",
"section2.upsell.description": "Descripción",
"section2.upsell.enable": "Activar este regalo",
"section2.upsell.product": "Producto regalo",
"section2.upsell.triggerType": "Condición de activación",
"section2.upsell.trigger.subtotal": "Subtotal mínimo",
"section2.upsell.trigger.product": "Producto específico",
"section2.upsell.minSubtotal": "Subtotal mínimo",
"section2.upsell.productHandle": "Handle del producto",
"section2.upsell.imageUrl": "URL de la imagen",
"section2.upsell.icon": "Icono",
"section2.upsell.showInPreview": "Mostrar en vista previa",

// Gift details
"section2.gift.originalPrice": "Precio original",

// Buttons
"section2.button.addOffer": "Añadir oferta",
"section2.button.addUpsell": "Añadir regalo",

// Preview
"section2.preview.active": "Activo",
"section2.preview.inactive": "Inactivo",
"section2.preview.offerStrip.offer": "OFERTA",
"section2.preview.offerStrip.gift": "REGALO",
"section2.preview.defaultOfferTitle": "Oferta especial",
"section2.preview.defaultUpsellTitle": "Regalo sorpresa",
"section2.preview.discountPercent": "Descuento del {{percent}}%",
"section2.preview.discountFixed": "Descuento de {{amount}} {{currency}}",
"section2.preview.giftDescription": "Gratis con tu pedido",
"section2.preview.orderSummary.title": "Resumen del pedido",
"section2.preview.orderSummary.subtotal": "Subtotal",
"section2.preview.orderSummary.shipping": "Envío",
"section2.preview.orderSummary.total": "Total",
"section1.preview.shippingTo": "Envío a",
"section1.newFieldPlaceholder": "Marcador de posición del nuevo campo",
"section1.newFieldLabel": "Etiqueta del nuevo campo",
"section1.addNewField": "Agregar nuevo campo",
"section1.rail.fieldsTitle": "Campos del formulario",
"section3.statsCard.title": "Estadísticas de pedidos",
"section3.errors.sessionExpired": "Sesión expirada, por favor actualice",
"whatsapp.defaults.orderMessage": "Hola {customer.name}, gracias por tu pedido #{order.id}. Nos pondremos en contacto contigo pronto.",
"whatsapp.header.title": "Automatización WhatsApp",
"whatsapp.header.subtitle": "Enviar mensajes automáticos después de pedidos COD",
"whatsapp.status.connectedTo": "Conectado a",
"whatsapp.status.notConnected": "No conectado",
"whatsapp.mode.title": "Modo de conexión",
"whatsapp.mode.simple.title": "Modo simple (número)",
"whatsapp.mode.simple.subtitle": "Conectarse vía número de teléfono",
"whatsapp.mode.simple.b1": "Configuración rápida",
"whatsapp.mode.simple.b2": "No necesita token API",
"whatsapp.mode.simple.b3": "Escaneo manual de código QR",
"whatsapp.mode.simple.b4": "Funciones básicas",
"whatsapp.mode.advanced.title": "Modo avanzado (API)",
"whatsapp.mode.advanced.subtitle": "Conectarse vía WhatsApp Business API",
"whatsapp.mode.advanced.b1": "Conexión automática",
"whatsapp.mode.advanced.b2": "Límites de mensajes más altos",
"whatsapp.mode.advanced.b3": "Análisis avanzados",
"whatsapp.mode.advanced.b4": "Soporte webhook",
"whatsapp.fields.phone.label": "Número de teléfono",
"whatsapp.fields.phone.placeholder": "Ingrese número WhatsApp (con código de país)",
"whatsapp.fields.phone.help": "Ejemplo: +34612345678",
"whatsapp.fields.businessName.label": "Nombre del negocio",
"whatsapp.fields.businessName.placeholder": "Nombre de su negocio",
"whatsapp.fields.businessName.help": "Mostrado en mensajes",
"whatsapp.warning.title": "Notas importantes",
"whatsapp.warning.b1": "Mantenga WhatsApp Web/Desktop abierto",
"whatsapp.warning.b2": "El teléfono debe tener internet",
"whatsapp.warning.b3": "El código QR expira cada pocos minutos",
"whatsapp.warning.b4": "Pruebe primero con un número real",
"whatsapp.fields.token.label": "Token API",
"whatsapp.fields.token.placeholder": "Ingrese su token de WhatsApp Business API",
"whatsapp.fields.token.help": "Obténgalo de su proveedor de API",
"whatsapp.noteApi": "Nota: WhatsApp Business API requiere aprobación y puede tener costos.",
"whatsapp.fields.message.label": "Plantilla de mensaje",
"whatsapp.fields.message.placeholder": "Ingrese su mensaje con variables...",
"whatsapp.fields.message.help": "Use {customer.name}, {order.id}, etc.",
"whatsapp.fields.autoSend.label": "Enviar automáticamente",
"whatsapp.qr.title": "Conexión por Código QR",
"whatsapp.qr.subtitle": "Escanee con WhatsApp para conectarse",
"whatsapp.qr.empty": "No hay código QR generado aún",
"whatsapp.qr.howTo": "Cómo conectarse:",
"whatsapp.qr.step1": "1. Abra WhatsApp en su teléfono",
"whatsapp.qr.step2": "2. Vaya a Configuración → Dispositivos vinculados",
"whatsapp.qr.step3": "3. Toque 'Vincular un dispositivo' y escanee el código QR",
"whatsapp.qr.generate": "Generar Código QR",
"whatsapp.qr.regenerate": "Regenerar Código QR",
"whatsapp.qr.refresh": "Actualizar Código QR",
"whatsapp.connected.title": "Estado de conexión",
"whatsapp.connected.last": "Última conexión:",
"whatsapp.connected.sent": "Mensajes enviados:",
"whatsapp.connected.ready": "Listo para enviar mensajes",
"common.save": "Guardar",
"common.disconnect": "Desconectar",
"section1.fieldEditor.titlePrefix.birthday": "Fecha de nacimiento",
"section1.fieldEditor.titlePrefix.company": "Empresa",
"section1.fieldEditor.titlePrefix.pincode": "Código postal",
"section1.fieldEditor.titlePrefix.email": "Correo electrónico",
"section2.ui.header.subtitle": "Ofertas & Upsells — Ajustes pro",
"section2.ui.status.dirty": "Cambios sin guardar",
"section2.ui.status.saved": "Guardado",
"section2.ui.status.loading": "Cargando...",

"section2.ui.tabs.global": "Global",
"section2.ui.tabs.offers": "Ofertas",
"section2.ui.tabs.upsells": "Upsells",

"section2.ui.hero.badge": "{offers} Ofertas • {upsells} Upsells",
"section2.ui.hero.title": "Ofertas & Upsells",
"section2.ui.hero.subtitle": "Ajustes claros + vista previa limpia",
"section2.ui.hero.currentTab": "{tab}",

"section2.ui.modal.unsaved.title": "Cambios sin guardar",
"section2.ui.modal.unsaved.body": "Tienes cambios sin guardar. ¿Guardar o ignorar antes de cambiar de sección?",
"section2.ui.modal.unsaved.primary": "Guardar y continuar",
"section2.ui.modal.unsaved.primaryLoading": "Guardando...",
"section2.ui.modal.unsaved.cancel": "Cancelar",
"section2.ui.modal.unsaved.discard": "Ignorar",

"section2.ui.preview.title": "Vista previa",
"section2.ui.preview.badge.active": "Activo",
"section2.ui.preview.badge.inactive": "Inactivo",
"section2.ui.preview.subtitle": "Vista previa rápida (lo que verá el cliente).",
"section2.ui.preview.offers.title": "Ofertas",
"section2.ui.preview.offers.none": "No hay ofertas activas en la vista previa.",
"section2.ui.preview.upsells.title": "Upsells",
"section2.ui.preview.upsells.none": "No hay upsells activos en la vista previa.",
"section2.ui.preview.productLabel": "Producto:",
"section2.ui.preview.product.none": "Ninguno",
"section2.ui.preview.product.selected": "Producto seleccionado",
"section2.ui.offers.title": "Ofertas ({count}/3)",
"section2.ui.upsells.title": "Upsells ({count}/3)",

"section2.ui.badge.proSettings": "Ajustes pro",
"section2.ui.badge.noButton": "Sin botón",

"section2.ui.offer.cardTitle": "Oferta {n}",
"section2.ui.upsell.cardTitle": "Upsell {n}",
"section2.ui.field.enable": "Activar",

"section2.ui.group.content": "Contenido",
"section2.ui.group.iconDesign": "Icono y diseño",
"section2.ui.group.button": "Botón (Oferta)",
"section2.ui.group.preview": "Vista previa",

"section2.ui.field.title": "Título",
"section2.ui.field.description": "Texto",
"section2.ui.field.product": "Producto Shopify",
"section2.ui.field.image": "Imagen",
"section2.ui.field.imageMode.product": "Imagen del producto (auto)",
"section2.ui.field.imageMode.custom": "Imagen personalizada (URL)",
"section2.ui.field.imageUrl": "URL de la imagen",

"section2.ui.field.icon": "Icono",
"section2.ui.field.iconBg": "Fondo del icono",
"section2.ui.field.cardBg": "Fondo",
"section2.ui.field.borderColor": "Borde",

"section2.ui.field.buttonText": "Texto del botón",
"section2.ui.field.buttonBg": "Fondo del botón",
"section2.ui.field.buttonTextColor": "Texto del botón",
"section2.ui.field.buttonBorder": "Borde del botón",

"section2.ui.field.showInPreview": "Mostrar en vista previa",

"section2.ui.helper.noImagesDetected": "No se detectaron imágenes para este producto (según el formato devuelto).",

"section2.ui.action.addOffer": "Añadir una oferta",
"section2.ui.action.addUpsell": "Añadir un upsell",
"section2.ui.action.remove": "Eliminar",
// ======================= Section2 — Thank You Page (ES) =======================

"section2.ui.tabs.thankyou": "Página de agradecimiento",

"section2.ui.thankyou.title": "Página de agradecimiento",
"section2.ui.thankyou.subtitle": "Personaliza la experiencia después del pedido",
"section2.ui.thankyou.enable": "Activar página de agradecimiento",
"section2.ui.thankyou.mode.label": "Modo",
"section2.ui.thankyou.mode.simple": "Simple (botón / redirección)",
"section2.ui.thankyou.mode.popup": "Popup (imagen + contenido)",
"section2.ui.thankyou.mode.help": "Elige cómo se muestra después del pedido",

"section2.ui.thankyou.popup.enable": "Activar popup",
"section2.ui.thankyou.popup.title": "Título del popup",
"section2.ui.thankyou.popup.text": "Texto del popup",
"section2.ui.thankyou.popup.showClose": "Mostrar botón cerrar",
"section2.ui.thankyou.popup.closeLabel": "Cerrar",
"section2.ui.thankyou.popup.delayMs": "Retraso de apertura (ms)",
"section2.ui.thankyou.popup.autoCloseMs": "Cierre automático (ms)",
"section2.ui.thankyou.popup.overlay": "Fondo oscuro",
"section2.ui.thankyou.popup.overlayOpacity": "Opacidad del fondo",
"section2.ui.thankyou.popup.animation": "Animación",
"section2.ui.thankyou.popup.animation.none": "Ninguna",
"section2.ui.thankyou.popup.animation.zoom": "Zoom",
"section2.ui.thankyou.popup.animation.slideUp": "Deslizar hacia arriba",
"section2.ui.thankyou.popup.position": "Posición",
"section2.ui.thankyou.popup.position.center": "Centro",
"section2.ui.thankyou.popup.position.bottom": "Abajo",

"section2.ui.thankyou.editor.title": "Editor",
"section2.ui.thankyou.editor.hint": "Agrega imagen, icono, texto y botones como Canva",
"section2.ui.thankyou.editor.addBlock": "Agregar elemento",
"section2.ui.thankyou.editor.block.text": "Texto",
"section2.ui.thankyou.editor.block.image": "Imagen",
"section2.ui.thankyou.editor.block.icon": "Icono",
"section2.ui.thankyou.editor.block.button": "Botón",
"section2.ui.thankyou.editor.block.divider": "Separador",

"section2.ui.thankyou.insert.title": "Insertar",
"section2.ui.thankyou.insert.image": "Insertar imagen",
"section2.ui.thankyou.insert.imageUrl": "URL de la imagen",
"section2.ui.thankyou.insert.iconUrl": "URL del icono",
"section2.ui.thankyou.insert.linkUrl": "URL del enlace",
"section2.ui.thankyou.insert.shopifyImage": "Elegir imagen de Shopify",

"section2.ui.thankyou.style.title": "Estilo",
"section2.ui.thankyou.style.bg": "Fondo",
"section2.ui.thankyou.style.textColor": "Color del texto",
"section2.ui.thankyou.style.borderColor": "Color del borde",
"section2.ui.thankyou.style.radius": "Radio del borde",
"section2.ui.thankyou.style.shadow": "Sombra",
"section2.ui.thankyou.style.padding": "Espaciado",
"section2.ui.thankyou.style.align": "Alineación",
"section2.ui.thankyou.style.align.left": "Izquierda",
"section2.ui.thankyou.style.align.center": "Centro",
"section2.ui.thankyou.style.align.right": "Derecha",
"section2.ui.thankyou.style.fontSize": "Tamaño del texto",
"section2.ui.thankyou.style.fontWeight": "Grosor del texto",

"section2.ui.thankyou.palette.title": "Paletas",
"section2.ui.thankyou.palette.apply": "Aplicar paleta",
"section2.ui.thankyou.palette.custom": "Colores personalizados",

"section2.ui.thankyou.button.primaryText": "Texto del botón principal",
"section2.ui.thankyou.button.primaryUrl": "Enlace del botón principal",
"section2.ui.thankyou.button.secondaryText": "Texto del botón secundario",
"section2.ui.thankyou.button.secondaryUrl": "Enlace del botón secundario",

"section2.ui.thankyou.preview.title": "Vista previa de agradecimiento",
"section2.ui.thankyou.preview.openPopup": "Abrir vista previa del popup",
"section2.ui.thankyou.preview.empty": "Aún no hay elementos. Agrega contenido para empezar."


};

/* ========================================================================
 * AR — Arabic (MSA/Darija mix)
 * ===================================================================== */
const AR = {
  ...EN,

  "section0.header.title": "TripleForm COD · لوحة التحكم",
  "section0.header.subtitle":
    "نظرة عامة، دعم وفوترة",
  "section0.header.pill":
    "نموذج الدفع عند التسليم · جوجل شيتس · بكسلات · مضاد للروبوتات",

  "section0.nav.forms": "القسم 1 — نماذج COD",
  "section0.nav.offers": "القسم 2 — العروض (Upsell/Bundles)",
  "section0.nav.sheets": "القسم 3 — Google Sheets",
  "section0.nav.pixels": "القسم 4 — أحداث البكسل",
  "section0.nav.antibot": "القسم 5 — مضاد الروبوتات",
  "section0.nav.locations":
    "القسم 6 — المدن/المناطق/الدول",

  "section0.group.main":
    "المساعد وإعداد TripleForm COD",

  "section0.tabs.support": "الدعم والمساعد",
  "section0.tabs.billing": "الخطط والفوترة",

  "section0.billing.loading":
    "جاري التحقق من اشتراكك…",
  "section0.billing.active": "اشتراك فعّال ✅",
  "section0.billing.none":
    "لا يوجد اشتراك فعّال حالياً.",
  "section0.billing.planAnnual": "خطة سنوية",
  "section0.billing.planMonthly": "خطة شهرية",
  "section0.billing.testMode": "(وضع الاختبار)",

  "section0.banner.alreadySubscribed.title":
    "لديك بالفعل اشتراك فعّال",
  "section0.banner.alreadySubscribed.body":
    "يمكنك التبديل إلى خطة أخرى أو تغيير شهري/سنوي في أي وقت. Shopify ستلغي الاشتراك القديم تلقائياً عند قبولك للجديد.",

  "section0.plans.badge.popular": "الأكثر شيوعاً",
  "section0.plans.badge.current": "الخطة الحالية",

  "section0.plans.price.perMonth": "شهرياً",
  "section0.plans.price.perYear": "سنوياً",
  "section0.plans.price.saving": "وفّر ~{percent}%",
  "section0.plans.btn.chooseMonthly": "اختيار الشهري",
  "section0.plans.btn.chooseAnnual": "اختيار السنوي",
  "section0.plans.btn.alreadyMonthly":
    "أنت على الخطة الشهرية",
  "section0.plans.btn.alreadyAnnual":
    "أنت على الخطة السنوية",

  "section0.plans.starter.orders":
    "حتى 100 طلب COD في الشهر",
  "section0.plans.basic.orders":
    "حتى 500 طلب COD في الشهر",
  "section0.plans.premium.orders":
    "طلبات COD غير محدودة",

  "section0.features.1":
    "نموذج COD بنقرة واحدة في صفحات المنتج.",
  "section0.features.2":
    "مزامنة فورية مع Google Sheets.",
  "section0.features.3":
    "عروض Upsell وBundles بعد نموذج COD.",
  "section0.features.4":
    "استرجاع طلبات COD المتروكة عبر واتساب.",
  "section0.features.5":
    "أسعار شحن حسب الدولة والمدينة والمنطقة.",
  "section0.features.6":
    "عدّة بكسلات (Meta, TikTok, Google…) لأحداث COD.",
  "section0.features.7":
    "مضاد للروبوتات وحماية من الطلبات الوهمية.",
  "section0.features.8":
    "دعم Triple S Partners عبر البريد وواتساب.",

  "section0.quickstart.title":
    "الانطلاق السريع مع TripleForm COD",
  "section0.quickstart.step1":
    "1) اختر خطة وفعّل الاشتراك من داخل Shopify.",
  "section0.quickstart.step2":
    "2) أضِف بلوك TripleForm COD — Order form إلى قالب المنتج.",
  "section0.quickstart.step3":
    "3) اضبط Form, Offers, Google Sheets, Pixels و Anti-bot ثم جرّب طلب COD للتأكد من تتبّع كل شيء.",

  "section0.videos.pill":
    "مركز الفيديو · TripleForm COD",
  "section0.videos.title":
    "فيديوهات شرح لكل قسم.",
  "section0.videos.subtitle":
    "لاحقاً يمكنك إضافة روابط يوتيوب هنا: كل بطاقة = فيديو قصير وواضح (تنصيب، إعدادات، أمثلة حقيقية).",

  "section0.videos.item.intro.title":
    "مقدمة · نظرة عامة على TripleForm COD",
  "section0.videos.item.intro.sub":
    "جولة سريعة في لوحة التحكم، التنقل وأول الإعدادات.",
  "section0.videos.item.forms.title":
    "القسم 1 · نماذج COD",
  "section0.videos.item.forms.sub":
    "إنشاء نموذج بنقرة واحدة، الحقول، التصميم وتجارب الطلب.",
  "section0.videos.item.offers.title":
    "القسم 2 · العروض و الـBundles",
  "section0.videos.item.offers.sub":
    "Upsell بعد النموذج، Bundles وزيادة قيمة السلة.",
  "section0.videos.item.sheets.title":
    "القسم 3 · Google Sheets في الوقت الحقيقي",
  "section0.videos.item.sheets.sub":
    "الاتصال، الأعمدة، الفلاتر والتتبع لمركز النداء.",
  "section0.videos.item.pixels.title":
    "القسم 4 · البكسلات وأحداث COD",
  "section0.videos.item.pixels.sub":
    "Meta, TikTok, Google… كيف تتبّع كل طلب COD.",
  "section0.videos.item.antibot.title":
    "القسم 5 · مضاد الروبوتات والفلاتر",
  "section0.videos.item.antibot.sub":
    "حظر الطلبات الوهمية وحماية الحملات.",
  "section0.videos.item.locations.title":
    "القسم 6 · المدن والمناطق والدول",
  "section0.videos.item.locations.sub":
    "إدارة مناطق التوصيل، الرسوم حسب الدولة والفلترة حسب المدينة.",

  "section0.lang.label": "لغة الواجهة",

  "section0.support.header":
    "الدعم · الأسئلة الشائعة لأقسام COD",
  "section0.support.search.placeholder":
    "ابحث (Google Sheets، النموذج، البكسلات، Anti-bot...)",
  "section0.support.noResults":
    "لم يتم العثور على أي سؤال.",
  "section0.support.contactText":
    "تحتاج مساعدة مخصّصة لمتجرك؟",
  "section0.support.whatsapp": "واتساب",
  "section0.support.email": "البريد الإلكتروني",
  "section0.support.cat.all": "الكل",
  "section0.support.cat.start": "البدء",
  "section0.support.cat.forms": "النماذج",
  "section0.support.cat.offers": "العروض",
  "section0.support.cat.sheets": "Google Sheets",
  "section0.support.cat.pixels": "البكسلات",
  "section0.support.cat.antibot": "مضاد الروبوتات",
  "section0.support.cat.shipping": "الشحن",
  "section0.support.cat.billing": "الفوترة",
  "section0.support.cat.support": "الدعم",

  "section0.usage.noPlan.title": "حالة الخطة",
  "section0.usage.noPlan.body":
    "لا توجد خطة مفعّلة. اختر خطة من تبويب «الخطط والفوترة».",
  "section0.usage.planFallback": "الخطة المفعّلة",
  "section0.usage.header.title": "استخدام الخطة",
  "section0.usage.header.subtitleTail":
    "طلبات COD",
  "section0.usage.badge.active":
    "اشتراك فعّال",
  "section0.usage.commandsLabel": "الطلبات",
  "section0.usage.loading":
    "جارٍ تحديث الإحصائيات…",
  "section0.usage.unlimitedText":
    "طلبات COD غير محدودة في خطتك الحالية.",
  "section0.usage.limitedText":
    "استخدام طلبات COD في دورتك الحالية.",
  "section0.usage.used": "المستخدمة",
  "section0.usage.usedOf": "من",
  "section0.usage.remaining": "المتبقي",
  "section0.usage.beforeLimit": "قبل الوصول للحد",
  "section0.usage.progress": "التقدّم",
  "section0.usage.since": "منذ:",
  "section0.usage.term.annual": "سنوي",
  "section0.usage.term.monthly": "شهري",

  /* FAQ AR */
  "section0.faq.start.1.title":
    "من أين أبدأ مع تطبيق COD؟",
  "section0.faq.start.1.answer.1":
    "1) أضِف البلوك TripleForm COD — Order form داخل قالب المنتج في Shopify.",
  "section0.faq.start.1.answer.2":
    "2) انتقل إلى القسم 1 — نماذج COD لاختيار الحقول والتصميم.",
  "section0.faq.start.1.answer.3":
    "3) اضبط القسم 3 — Google Sheets إذا كنت تريد مركز اتصال أو تتبعاً في الوقت الحقيقي.",
  "section0.faq.start.1.answer.4":
    "4) نفّذ طلب تجربة من منتج حقيقي للتأكد من أن كل شيء يتم تتبعه بشكل صحيح.",

  "section0.faq.start.2.title":
    "كيف أُثبّت بلوك COD في الثيم؟",
  "section0.faq.start.2.answer.1":
    "1) افتح محرر الثيم في Shopify.",
  "section0.faq.start.2.answer.2":
    "2) في قالب المنتج، اضغط إضافة بلوك أو إضافة قسم.",
  "section0.faq.start.2.answer.3":
    "3) ابحث عن TripleForm COD — Order form وأضِفه تحت وصف المنتج أو قرب زر إضافة إلى السلة.",
  "section0.faq.start.2.answer.4":
    "4) احفظ التغييرات: نموذج COD سيظهر الآن في صفحات المنتج.",

  "section0.faq.start.3.title":
    "كيف أنفّذ طلب COD تجريبي كامل؟",
  "section0.faq.start.3.answer.1":
    "1) اذهب إلى منتج حقيقي مفعَّل فيه بلوك COD.",
  "section0.faq.start.3.answer.2":
    "2) املأ جميع الحقول الإجبارية (الاسم، الهاتف، المدينة، إلخ).",
  "section0.faq.start.3.answer.3":
    "3) استخدم رقم هاتف حقيقي (لاختبار مركز الاتصال).",
  "section0.faq.start.3.answer.4":
    "4) تحقّق من الطلب في Shopify › الطلبات، وإذا كان مفعَّلاً، في Google Sheets والبكسلات.",

  "section0.faq.start.4.title":
    "نموذج COD لا يظهر في صفحات المنتجات",
  "section0.faq.start.4.answer.1":
    "1) تأكد من إضافة بلوك TripleForm COD — Order form في قالب المنتج.",
  "section0.faq.start.4.answer.2":
    "2) تأكد أنك تشاهد منتجاً يستخدم هذا القالب.",
  "section0.faq.start.4.answer.3":
    "3) عطّل مؤقتاً التطبيقات أو السكربتات الأخرى التي تغيّر الـ DOM بشكل كبير (ثيم مخصص، Page Builder…).",
  "section0.faq.start.4.answer.4":
    "4) أعد تحميل الثيم وامسح الكاش إذا لزم الأمر.",

  "section0.faq.forms.1.title":
    "كيف أفعّل أو أُعطّل الحقول في نموذج COD؟",
  "section0.faq.forms.1.answer.1":
    "1) ادخل إلى القسم 1 — نماذج COD داخل التطبيق.",
  "section0.faq.forms.1.answer.2":
    "2) في لوحة حقول النموذج، فعّل أو عطّل الاسم الكامل، الهاتف، العنوان، المدينة، المنطقة، الملاحظات، إلخ.",
  "section0.faq.forms.1.answer.3":
    "3) يمكنك جعل بعض الحقول إجبارية لتفادي الطلبات الناقصة.",
  "section0.faq.forms.1.answer.4":
    "4) احفظ ثم اختبر النموذج على منتج لترى النتيجة.",

  "section0.faq.forms.2.title":
    "كيف أغيّر الألوان وتصميم النموذج؟",
  "section0.faq.forms.2.answer.1":
    "1) في القسم 1، افتح مجموعة أو تبويب تصميم النموذج.",
  "section0.faq.forms.2.answer.2":
    "2) غيّر ألوان الزر، الخلفية، الحدود والخطوط.",
  "section0.faq.forms.2.answer.3":
    "3) يمكنك تعديل درجة تدوير الحواف، الظل والمحاذاة لتناسب الثيم.",
  "section0.faq.forms.2.answer.4":
    "4) احفظ وحدث صفحة المنتج لمعاينة النتيجة النهائية.",

  "section0.faq.forms.3.title":
    "زر «إرسال الطلب» لا يعمل",
  "section0.faq.forms.3.answer.1":
    "1) تأكد من ملء جميع الحقول الإجبارية (خصوصاً الهاتف).",
  "section0.faq.forms.3.answer.2":
    "2) إذا كنت تستخدم مضاد الروبوتات (القسم 5)، عطّل أولاً القواعد الصارمة لاختبار النموذج.",
  "section0.faq.forms.3.answer.3":
    "3) تأكد أن المنتج والمتغيّر صالحان (variantId صحيح).",
  "section0.faq.forms.3.answer.4":
    "4) إن استمر المشكل، تواصل مع الدعم وأرسل صورة للشاشة من الكونسول (F12) ورسالة الخطأ.",

  "section0.faq.forms.4.title":
    "كيف أفعّل التحقق من رقم الهاتف؟",
  "section0.faq.forms.4.answer.1":
    "1) في القسم 1 — النماذج، فعّل خيار التحقق من رقم الهاتف (حسب الدولة).",
  "section0.faq.forms.4.answer.2":
    "2) اختر المقدّمات المسموحة (مثل +212، +213، +216) والطول الأدنى.",
  "section0.faq.forms.4.answer.3":
    "3) إذا كان الرقم قصيراً جداً أو غير صالح، سيظهر تحذير ويُمنع إرسال النموذج.",

  "section0.faq.forms.5.title":
    "كيف أضيف حقل ملاحظات/تعليق للعميل؟",
  "section0.faq.forms.5.answer.1":
    "1) في القسم 1، فعّل حقل الملاحظات/التعليقات إن كان متوفراً.",
  "section0.faq.forms.5.answer.2":
    "2) هذا النص يُرسل إلى ملاحظة الطلب في Shopify وإلى Google Sheets إذا قمت بربط العمود المناسب.",
  "section0.faq.forms.5.answer.3":
    "3) مفيد لمعلومات مثل: الطابق، كود الباب، وقت التوصيل المفضّل، إلخ.",

  "section0.faq.offers.1.title":
    "كيف أفعّل Upsell بعد إرسال نموذج COD؟",
  "section0.faq.offers.1.answer.1":
    "1) ادخل إلى القسم 2 — العروض (Upsell/Bundles).",
  "section0.faq.offers.1.answer.2":
    "2) أنشئ عرضاً جديداً باختيار المنتج الأساسي ومنتج الـUpsell.",
  "section0.faq.offers.1.answer.3":
    "3) اضبط نسبة التخفيض (مثلاً -20%) ونص العرض.",
  "section0.faq.offers.1.answer.4":
    "4) فعّل العرض: بعد نموذج COD سيظهر الاقتراح للعميل.",

  "section0.faq.offers.2.title":
    "كيف أنشئ Bundle من 1 / 2 / 3 قطع مع تخفيض؟",
  "section0.faq.offers.2.answer.1":
    "1) في القسم 2، أضِف عرضاً من نوع Bundle.",
  "section0.faq.offers.2.answer.2":
    "2) حدّد خيارات 1 قطعة، 2 قطع، 3 قطع مع نسبة تخفيض لكل مستوى.",
  "section0.faq.offers.2.answer.3":
    "3) يمكن للعميل اختيار البندل مباشرة بعد إرسال النموذج.",

  "section0.faq.offers.3.title":
    "الـUpsell أو الـBundle لا يظهر بعد النموذج",
  "section0.faq.offers.3.answer.1":
    "1) تأكد أن العرض مفعّل في القسم 2.",
  "section0.faq.offers.3.answer.2":
    "2) تأكد من أن شرط المنتج محقق (نفس المنتج أو نفس المجموعة).",
  "section0.faq.offers.3.answer.3":
    "3) نفّذ طلب تجريبي كامل: بعض العروض تظهر فقط بعد إرسال حقيقي للنموذج.",

  "section0.faq.sheets.1.title":
    "كيف أربط Google Sheets؟",
  "section0.faq.sheets.1.answer.1":
    "1) ادخل إلى القسم 3 — Google Sheets.",
  "section0.faq.sheets.1.answer.2":
    "2) ألصق الـ ID الخاص بالورقة (الجزء بين /d/ و /edit في الرابط).",
  "section0.faq.sheets.1.answer.3":
    "3) اختر اسم التبويب الذي تريد استقبال الطلبات فيه.",
  "section0.faq.sheets.1.answer.4":
    "4) استخدم الكاروسيل لربط كل عمود (الاسم الكامل، الهاتف، المدينة، المنتج، المجموع، إلخ) ثم اضغط حفظ.",

  "section0.faq.sheets.2.title":
    "الطلبات لا تصل (أو توقفت) إلى Google Sheets",
  "section0.faq.sheets.2.answer.1":
    "1) تأكد أن الـ ID واسم التبويب صحيحان.",
  "section0.faq.sheets.2.answer.2":
    "2) تأكد أن بريد الحساب الخدمي في Google لديه صلاحية تعديل على الورقة.",
  "section0.faq.sheets.2.answer.3":
    "3) تحقّق من حفظ الإعدادات في القسم 3 (زر حفظ المتجر).",
  "section0.faq.sheets.2.answer.4":
    "4) نفّذ طلباً تجريبياً جديداً وراجع سجلات الخادم إذا لزم الأمر.",

  "section0.faq.sheets.3.title":
    "كيف أحدد ترتيب الأعمدة في الورقة؟",
  "section0.faq.sheets.3.answer.1":
    "1) في القسم 3، استخدم كاروسيل الأعمدة (العمود 1، العمود 2، ...).",
  "section0.faq.sheets.3.answer.2":
    "2) لكل عمود، اختر النوع (datetime, number, currency, string...) والحقل (customer.name, customer.phone, cart.productTitle, cart.total...).",
  "section0.faq.sheets.3.answer.3":
    "3) أعد ترتيب الأعمدة بسحبها في الكاروسيل.",
  "section0.faq.sheets.3.answer.4":
    "4) احفظ ثم نفّذ طلباً تجريبياً لترى الترتيب في Google Sheets.",

  "section0.faq.sheets.4.title":
    "ما الفرق بين المجموع بدون شحن ومع الشحن؟",
  "section0.faq.sheets.4.answer.1":
    "1) مجموع الطلب (بدون شحن): سعر المنتج + التخفيضات بدون رسوم الشحن.",
  "section0.faq.sheets.4.answer.2":
    "2) مجموع الطلب (مع الشحن): يشمل أيضاً رسوم الشحن (إذا قمت بضبطها).",
  "section0.faq.sheets.4.answer.3":
    "3) في القسم 3، يمكنك اختيار أي مجموع تُرسِل إلى Google Sheets (cart.subtotal أو cart.totalWithShipping).",

  "section0.faq.pixels.1.title":
    "كيف أربط Meta Pixel أو TikTok أو Google؟",
  "section0.faq.pixels.1.answer.1":
    "1) ادخل إلى القسم 4 — أحداث البكسل.",
  "section0.faq.pixels.1.answer.2":
    "2) ألصق Meta Pixel ID، TikTok Pixel ID أو Google Measurement ID.",
  "section0.faq.pixels.1.answer.3":
    "3) فعّل الأحداث (Purchase COD, PageView, إلخ) التي تريد إرسالها.",
  "section0.faq.pixels.1.answer.4":
    "4) نفّذ طلب تجربة وتحقق من Event Manager في Meta أو TikTok أو Google DebugView.",

  "section0.faq.pixels.2.title":
    "أي حدث يتم إرساله لطلب COD؟",
  "section0.faq.pixels.2.answer.1":
    "1) التطبيق يرسل حدث Purchase لطلبات COD.",
  "section0.faq.pixels.2.answer.2":
    "2) يحتوي الحدث على: المبلغ الكلي، العملة، الكمية ومعلومات المنتج.",
  "section0.faq.pixels.2.answer.3":
    "3) يمكنك استخدام هذه البيانات لتحسين حملات Meta وTikTok وGoogle Ads.",

  "section0.faq.pixels.3.title":
    "البكسل لا يستقبل أي أحداث",
  "section0.faq.pixels.3.answer.1":
    "1) تأكد من صحة الـ IDs (Meta, TikTok, Google) وحفظها.",
  "section0.faq.pixels.3.answer.2":
    "2) عطّل أدوات حظر الإعلانات في المتصفح خلال الاختبار.",
  "section0.faq.pixels.3.answer.3":
    "3) استخدم منتجاً حقيقياً ونفّذ طلباً كاملاً لتفعيل Purchase.",
  "section0.faq.pixels.3.answer.4":
    "4) راجع سجلات الخادم إذا كان التطبيق يرسل الأحداث عبر API (CAPI).",

  "section0.faq.antibot.1.title":
    "ما فائدة قسم مضاد الروبوتات؟",
  "section0.faq.antibot.1.answer.1":
    "1) حظر الطلبات المزعجة والروبوتات التي تملأ نموذج COD.",
  "section0.faq.antibot.1.answer.2":
    "2) تصفية أرقام الهاتف القصيرة جداً أو المشبوهة.",
  "section0.faq.antibot.1.answer.3":
    "3) تقييد الطلبات من دول أو عناوين IP معينة إذا لزم الأمر.",

  "section0.faq.antibot.2.title":
    "كيف أضبط مضاد الروبوتات دون حظر العملاء الحقيقيين؟",
  "section0.faq.antibot.2.answer.1":
    "1) ابدأ بشكل بسيط: فعّل التحقق من الهاتف (minDigits) وحقل honeypot المخفي مع وقت أدنى.",
  "section0.faq.antibot.2.answer.2":
    "2) أضف قواعد IP (denyList/allowList) فقط إذا لاحظت سبام متكرر.",
  "section0.faq.antibot.2.answer.3":
    "3) بالنسبة للدول، استخدم قائمة سماح للدول التي تبيع فيها فعلياً.",
  "section0.faq.antibot.2.answer.4":
    "4) اختبر التغييرات بطلب حقيقي للتأكد أن التجربة ما زالت سلسة.",

  "section0.faq.antibot.3.title":
    "لماذا يتم حظر بعض الطلبات من مضاد الروبوتات؟",
  "section0.faq.antibot.3.answer.1":
    "1) رسالة الخطأ تحتوي على كود ANTIBOT_BLOCKED وسبب الحظر: هاتف قصير، دولة غير مسموحة، حقل honeypot ممتلئ، IP محجوبة، إلخ.",
  "section0.faq.antibot.3.answer.2":
    "2) راجع إعداداتك في القسم 5 — مضاد الروبوتات وخفّف القواعد إذا كنت تحظر عملاء حقيقيين.",

  "section0.faq.shipping.1.title":
    "كيف أضيف الدول والمدن والمناطق؟",
  "section0.faq.shipping.1.answer.1":
    "1) ادخل إلى القسم 6 — المدن/المناطق/الدول.",
  "section0.faq.shipping.1.answer.2":
    "2) أضف أولاً الدول التي تقوم بالتوصيل إليها (مثل المغرب، الجزائر، تونس…).",
  "section0.faq.shipping.1.answer.3":
    "3) بعدها أضف المدن والمناطق المرتبطة بكل دولة.",
  "section0.faq.shipping.1.answer.4":
    "4) يمكن استخدام هذه البيانات في نموذج COD وفي مركز النداء عبر Google Sheets.",

  "section0.faq.shipping.2.title":
    "هل أستطيع تطبيق رسوم شحن مختلفة حسب المدينة؟",
  "section0.faq.shipping.2.answer.1":
    "1) نعم، الهدف من القسم 6 هو تنظيم الدول/المناطق/المدن.",
  "section0.faq.shipping.2.answer.2":
    "2) يمكنك بعدها استخدام هذه البيانات في سير عملك (Sheets، مركز النداء، قواعد الشحن) لتطبيق رسوم مختلفة حسب المنطقة.",

  "section0.faq.billing.1.title":
    "كيف تعمل اشتراكات Shopify الخاصة بالتطبيق؟",
  "section0.faq.billing.1.answer.1":
    "1) في القسم 0 — لوحة التحكم، تبويب الخطط والفوترة، اختر Starter أو Basic أو Premium (شهري أو سنوي).",
  "section0.faq.billing.1.answer.2":
    "2) Shopify تفتح صفحة تأكيد رسمية لإنشاء الاشتراك.",
  "section0.faq.billing.1.answer.3":
    "3) بعد الموافقة، التطبيق يكتشف خطتك المفعّلة ويفتح الخصائص.",
  "section0.faq.billing.1.answer.4":
    "4) الفوترة تُدار بالكامل من Shopify (يمكنك رؤية الفواتير داخل Billing في Shopify).",

  "section0.faq.billing.2.title":
    "كيف أغيّر الخطة (Starter, Basic, Premium)؟",
  "section0.faq.billing.2.answer.1":
    "1) افتح القسم 0 — لوحة التحكم، تبويب الخطط والفوترة.",
  "section0.faq.billing.2.answer.2":
    "2) اضغط على اختيار الشهري أو اختيار السنوي في الخطة الجديدة.",
  "section0.faq.billing.2.answer.3":
    "3) Shopify ستفتح لك صفحة تأكيد جديدة.",
  "section0.faq.billing.2.answer.4":
    "4) بعد الموافقة، تصبح الخطة الجديدة فعّالة ويتم إلغاء القديمة تلقائياً.",

  "section0.faq.support.1.title":
    "كيف أتواصل مع الدعم للحصول على مساعدة مخصّصة؟",
  "section0.faq.support.1.answer.1":
    "1) واتساب: للأسئلة السريعة، لقطات الشاشة والاختبارات المباشرة.",
  "section0.faq.support.1.answer.2":
    "2) البريد الإلكتروني: للطلبات الطويلة، المشاكل التقنية التفصيلية أو الاقتراحات.",
  "section0.faq.support.1.answer.3":
    "3) لا تتردد في إرسال فيديو قصير للمشكلة (Loom أو الهاتف) حتى نفهمها بشكل أسرع.",
  
  // ===== Section 1 — COD Forms =====
  // Header
  "section1.header.appTitle": "نماذج COD — فورم الطلب",
  "section1.header.appSubtitle":
    "خصص فورم الدفع عند الاستلام وملخص الطلب للمنتجات ديالك.",
  "section1.header.btnAddToTheme": "إضافة البلوك في الثيم",
  "section1.header.btnPreview": "معاينة الفورم",
  "section1.header.btnSave": "حفظ الإعدادات",

  // Left rail / navigation
  "section1.rail.title": "فورم COD",
  "section1.rail.cart": "ملخص الطلب",
  "section1.rail.titles": "عناوين الفورم",
  "section1.rail.buttons": "الأزرار والرسائل",
  "section1.rail.fieldsSeparator": "خانات الفورم",
  "section1.rail.appearanceSeparator": "المظهر والإعدادات",
  "section1.rail.colors": "الألوان والستايل",
  "section1.rail.options": "الإعدادات",

  // Groups
  "section1.group.cart.title": "نصوص ملخص الطلب",
  "section1.group.formTitles.title": "عناوين الفورم",
  "section1.group.buttons.title": "الأزرار والرسائل",
  "section1.group.colors.title": "ألوان وستايل الفورم",
  "section1.group.options.title": "إعدادات العرض والسلوك",
  "section1.group.fields.title": "إعدادات الخانات",

  // Cart texts
  "section1.cart.labelTop": "عنوان السلة العلوي",
  "section1.cart.labelPrice": "تسمية السعر",
  "section1.cart.labelShipping": "تسمية الشحن",
  "section1.cart.labelTotal": "تسمية المجموع",

  // Form texts
  "section1.form.titleLabel": "عنوان الفورم",
  "section1.form.subtitleLabel": "العنوان الفرعي للفورم",
  "section1.form.successTextLabel": "رسالة النجاح",

  // Buttons
  "section1.buttons.displayStyleLabel": "أسلوب العرض",
  "section1.buttons.style.inline": "مضمن",
  "section1.buttons.style.popup": "بوب أب",
  "section1.buttons.style.drawer": "درّاج",
  "section1.buttons.mainCtaLabel": "نص الزر الرئيسي",
  "section1.buttons.totalSuffixLabel": "لاحقة المجموع",
  "section1.buttons.successTextLabel": "رسالة النجاح",

  // Colors section
  "section1.colors.formSection": "ألوان الفورم",
  "section1.colors.bg": "الخلفية",
  "section1.colors.text": "لون النص",
  "section1.colors.border": "لون الحدود",
  "section1.colors.inputBg": "خلفية الخانات",
  "section1.colors.inputBorder": "حدود الخانات",
  "section1.colors.placeholder": "لون النص التوضيحي",
  "section1.colors.buttonSection": "ألوان الزر",
  "section1.colors.btnBg": "خلفية الزر",
  "section1.colors.btnText": "نص الزر",
  "section1.colors.btnBorder": "حدود الزر",
  "section1.colors.btnHeight": "ارتفاع الزر",
  "section1.colors.cartSection": "ألوان السلة",
  "section1.colors.cartBg": "خلفية السلة",
  "section1.colors.cartBorder": "حدود السلة",
  "section1.colors.cartRowBg": "خلفية الصفوف",
  "section1.colors.cartRowBorder": "حدود الصفوف",
  "section1.colors.cartTitle": "لون العناوين",
  "section1.colors.cartText": "لون النص",
  "section1.colors.layoutSection": "التنسيق والمسافات",
  "section1.colors.radius": "نصف قطر الحدود",
  "section1.colors.padding": "الحشو الداخلي",
  "section1.colors.fontSize": "حجم الخط",
  "section1.colors.direction": "اتجاه النص",
  "section1.colors.titleAlign": "محاذاة العنوان",
  "section1.colors.fieldAlign": "محاذاة الخانات",
  "section1.colors.shadow": "الظل",
  "section1.colors.glow": "تأثير اللمعان",
  "section1.colors.glowPx": "شدة اللمعان",
  "section1.colors.hexLabel": "اللون السداسي",

  // Alignment options
  "section1.align.left": "يسار",
  "section1.align.center": "وسط",
  "section1.align.right": "يمين",

  // Options section
  "section1.options.behavior": "السلوك",
  "section1.options.openDelayMs": "تأخير الفتح (مللي ثانية)",
  "section1.options.effect": "التأثير المرئي",
  "section1.options.effect.none": "لا شيء",
  "section1.options.effect.light": "ظل خفيف",
  "section1.options.effect.glow": "لمعان",
  "section1.options.closeOnOutside": "الإغلاق بالنقر خارجياً",
  "section1.options.drawer": "إعدادات الدرّاج",
  "section1.options.drawerDirection": "اتجاه الدرّاج",
  "section1.options.drawerDirection.right": "يمين",
  "section1.options.drawerDirection.left": "يسار",
  "section1.options.drawerSize": "حجم الدرّاج",
  "section1.options.overlayColor": "لون التغطية",
  "section1.options.overlayOpacity": "شفافية التغطية",
  "section1.options.stickyButton": "زر لاصق",
  "section1.options.stickyType": "نوع اللصق",
  "section1.options.sticky.none": "لا شيء",
  "section1.options.sticky.bottomBar": "شريط سفلي",
  "section1.options.sticky.bubbleRight": "فقاعة يمين",
  "section1.options.sticky.bubbleLeft": "فقاعة يسار",
  "section1.options.stickyLabel": "تسمية الزر اللاصق",
  "section1.options.countries": "الدول والمناطق",
  "section1.options.countries.storeCountryLabel": "دولة المتجر",
  "section1.options.countries.selectPlaceholder": "اختر الدولة",
  "section1.options.countries.note": "اختر بلدك الرئيسي للبادئات الهاتفية والمناطق",
  "section1.options.consents": "الموافقات",
  "section1.options.requireGdpr": "اشتراط موافقة GDPR",
  "section1.options.gdprLabel": "تسمية GDPR",
  "section1.options.whatsappOptIn": "الموافقة على واتساب",
  "section1.options.whatsappLabel": "تسمية واتساب",

  // Field editor
  "section1.group.formTexts.title": "نصوص الفورم", 
  "section1.fieldEditor.activeLabel": "فعّال",
  "section1.fieldEditor.requiredLabel": "مطلوب",
  "section1.fieldEditor.typeLabel": "نوع الحقل",
  "section1.fieldEditor.type.text": "نص",
  "section1.fieldEditor.type.phone": "هاتف",
  "section1.fieldEditor.type.textarea": "منطقة نصية",
  "section1.fieldEditor.type.number": "رقم",
  "section1.fieldEditor.labelLabel": "التسمية",
  "section1.fieldEditor.placeholderLabel": "النص التوضيحي",
  "section1.fieldEditor.phonePrefixLabel": "بادئة الهاتف",
  "section1.fieldEditor.minLabel": "الحد الأدنى",
  "section1.fieldEditor.maxLabel": "الحد الأقصى",
"section1.fieldEditor.titlePrefix.fullName": "الاسم الكامل",
"section1.fieldEditor.titlePrefix.phone": "الهاتف (واتساب)",
"section1.fieldEditor.titlePrefix.city": "المدينة",
"section1.fieldEditor.titlePrefix.province": "الولاية/المنطقة",
"section1.fieldEditor.titlePrefix.address": "العنوان",
"section1.fieldEditor.titlePrefix.notes": "ملاحظات/تعليق",
"section1.fieldEditor.titlePrefix.quantity": "الكمية",

  // Preview
  "section1.preview.priceExample": "199.00",
  "section1.preview.freeShipping": "توصيل مجاني",
  "section1.preview.cityPlaceholder": "اختيار المدينة",
  "section1.preview.cityPlaceholderNoProvince": "اختيار المدينة",
  "section1.preview.cityPlaceholderNoProv": "اختيار المدينة",
  "section1.preview.provincePlaceholder": "اختيار الولاية/المنطقة",
  "section1.preview.style.inline": "مضمن",
  "section1.preview.style.popup": "بوب أب",
  "section1.preview.style.drawer": "درّاج",
  "section1.preview.stickyBarLabel": "شريط لاصق",
  "section1.preview.stickyBubbleLabel": "فقاعة لاصقة",

  // Save messages
  "section1.save.errorGeneric": "خطأ في حفظ الإعدادات",
  "section1.save.success": "تم حفظ الإعدادات بنجاح!",
  "section1.save.unknownError": "حدث خطأ غير معروف",
  "section1.save.failedPrefix": "فشل الحفظ: ",

  // Modal preview
  "section1.modal.previewTitle": "معاينة فورم COD",
  "section1.modal.previewClose": "إغلاق المعاينة",
   // Header
  "section2.header.appTitle": "العروض · الـUpsells والـBundles للـCOD",
  "section2.header.appSubtitle": "اضبط التخفيضات التلقائية، الـBundles والهدايا فوق فورم الدفع عند الاستلام",
  "section2.header.btnSave": "حفظ الإعدادات",

  // Rail navigation
  "section2.rail.title": "إعدادات العروض",
  "section2.rail.global": "عام والألوان",
  "section2.rail.discount": "عروض (شروط)",
  "section2.rail.upsell": "هدية / upsell",

  // Groups
  "section2.group.global.title": "خيارات عامة",
  "section2.group.theme.title": "الألوان والستايل (معاينة)",
  "section2.group.discount.title": "عروض — تخفيض مشروط",
  "section2.group.display.title": "العرض في صفحة المنتج",
  "section2.group.upsell.title": "Upsell — هدية رابحة",
  "section2.group.gift.title": "الهدية",

  // Global options
  "section2.global.enable": "تفعيل العروض والـupsell",
  "section2.global.currency": "العملة المعروضة",
  "section2.global.rounding": "تقريب المجموع",
  "section2.global.rounding.none": "لا تقريب",
  "section2.global.rounding.unit": "تقريب للوحدة",
  "section2.global.rounding.99": "ينتهي بــ .99",

  // Theme presets
  "section2.theme.preset": "لوحة ألوان سريعة (بدون كود لون)",
  "section2.theme.preset.light": "فاتح — خلفية بيضاء، زر أسود",
  "section2.theme.preset.dark": "غامق — خلفية داكنة، زر برتقالي",
  "section2.theme.preset.purple": "بنفسجي — ستايل مميز",
  "section2.theme.statusBarBg": "خلفية شريط حالة العروض",
  "section2.theme.statusBarText": "نص شريط حالة العروض",
  "section2.theme.offerBg": "خلفية بطاقة العرض",
  "section2.theme.upsellBg": "خلفية بطاقة الهدية",
  "section2.theme.ctaBg": "خلفية زر الدعوة للإجراء",
  "section2.theme.ctaText": "نص زر الدعوة للإجراء",
  "section2.theme.ctaBorder": "حدود زر الدعوة للإجراء",

  // Discount/Offer settings
  "section2.discount.enable": "تفعيل العروض",
  "section2.discount.product": "المنتج (Shopify)",
  "section2.discount.product.placeholder": "لم يتم اختيار منتج",
  "section2.discount.previewTitle": "عنوان العرض (معاينة)",
  "section2.discount.previewDescription": "وصف العرض",
  "section2.discount.productRef": "الـHandle / ID / URL لمنتج العرض",
  "section2.discount.imageUrl": "صورة منتج العرض (URL)",
  "section2.discount.iconEmoji": "أيقونة العرض (إيموجي)",
  "section2.discount.iconUrl": "أيقونة العرض (URL صورة صغيرة)",
  "section2.discount.type": "نوع التخفيض",
  "section2.discount.type.percent": "نسبة مئوية (%)",
  "section2.discount.type.fixed": "مبلغ ثابت",
  "section2.discount.percent": "% تخفيض",
  "section2.discount.fixedAmount": "مبلغ ثابت",
  "section2.discount.conditions.minQty": "الحد الأدنى للكمية",
  "section2.discount.conditions.minSubtotal": "الحد الأدنى للمجموع الفرعي",
  "section2.discount.conditions.requiresCode": "يتطلب كود",
  "section2.discount.conditions.code": "كود الخصم",
  "section2.discount.caps.maxDiscount": "سقف التخفيض (0 = لا يوجد)",

  // Display settings
  "section2.display.style": "ستايل كتلة العرض (فوق الفورم)",
  "section2.display.style.style1": "الستايل 1 — بطاقة كاملة",
  "section2.display.style.style2": "الستايل 2 — شريط متدرج",
  "section2.display.style.style3": "الستايل 3 — كتلة مدمجة",
  "section2.display.style.style4": "الستايل 4 — شارة + المجموع",
  "section2.display.style.style5": "الستايل 5 — شارات بسيطة",
  "section2.display.showDiscountLine": "عرض سطر التخفيض",
  "section2.display.showUpsellLine": "عرض سطر الهدية / upsell",

  // Upsell settings
  "section2.upsell.enable": "تفعيل هدية الـupsell",
  "section2.upsell.product": "المنتج (Shopify)",
  "section2.upsell.product.placeholder": "لم يتم اختيار منتج",
  "section2.upsell.previewTitle": "عنوان الهدية (معاينة)",
  "section2.upsell.previewDescription": "وصف الهدية",
  "section2.upsell.productRef": "الـHandle / ID / URL لمنتج الهدية",
  "section2.upsell.imageUrl": "صورة منتج الهدية (URL)",
  "section2.upsell.iconEmoji": "أيقونة الهدية (إيموجي)",
  "section2.upsell.iconUrl": "أيقونة الهدية (URL صورة صغيرة)",
  "section2.upsell.trigger.type": "المُشغل",
  "section2.upsell.trigger.type.subtotal": "حد أدنى للمجموع الفرعي",
  "section2.upsell.trigger.type.product": "منتج محدد",
  "section2.upsell.trigger.minSubtotal": "حد أدنى للمجموع الفرعي",
  "section2.upsell.trigger.productHandle": "الـHandle / ID لمنتج المشغل",

  // Gift settings
  "section2.gift.title": "العنوان",
  "section2.gift.note": "ملاحظة",
  "section2.gift.priceBefore": "السعر قبل (معلومة)",
  "section2.gift.isFree": "مجاني (0)",

  // Buttons
  "section2.button.save": "حفظ العروض",

  // Preview texts
  "section2.preview.title": "الدفع عند الاستلام (COD)",
  "section2.preview.subtitle": "معاينة (الفورم + العروض)",
  "section2.preview.offersStatus.active": "العرض مفعّل",
  "section2.preview.offersStatus.inactive": "العرض غير مؤهل",
  "section2.preview.offersStatus.giftActive": "الهدية مفعّلة",
  "section2.preview.offersStatus.giftPending": "الهدية في انتظار",
  "section2.preview.offersStatus.displayAbove": "معروض فوق فورم الـCOD",
  "section2.preview.offerStrip.offer": "عرض — منتج مع تخفيض",
  "section2.preview.offerStrip.gift": "هدية — منتج مجاني / upsell",
  "section2.preview.orderSummary.title": "ملخص الطلب",
  "section2.preview.orderSummary.productPrice": "سعر المنتج",
  "section2.preview.orderSummary.shipping": "سعر الشحن",
  "section2.preview.orderSummary.total": "المجموع",
  "section2.preview.form.title": "فورم الطلب",
  "section2.preview.form.fullName": "الاسم الكامل *",
  "section2.preview.form.phone": "الهاتف (واتساب) *",
  "section2.preview.form.city": "المدينة",
  "section2.preview.form.submit": "تأكيد الطلب - المجموع: {price} {currency}",

  // Help texts
  "section2.helpText.product": "اختر المنتج الرئيسي المرتبط بهذا العرض",
  "section2.helpText.offerDesc": "مثال: تخفيض -10% ابتداء من 2 قطعة",
  "section2.helpText.offerImage": "الصورة الرئيسية المعروضة على اليسار",
  "section2.helpText.offerIconEmoji": "مثال: 🔥, ⭐, -10% ...",
  "section2.helpText.offerIconUrl": "مثال: https://.../icon.png",
  "section2.helpText.giftDesc": "مثال: هدية مجانية تلقائياً",
  "section2.helpText.giftIconEmoji": "مثال: 🎁, ⭐, FREE ...",
  "section2.helpText.display": "هذه الكتلة تعرض فوق فورم الـCOD في صفحة المنتج، بدون تعديل إعدادات الفورم",
  // ===== Section 3 — Google Sheets =====
// Header
"section3.header.title": "TripleForm COD · جوجل شيتس ولوحة التحكم",
"section3.header.subtitle": "قم بتوصيل جوجل شيتس لمتابعة طلبات الدفع عند الاستلام في الوقت الفعلي (المؤكدة والمتروكة) — دون مغادرة الواجهة.",
"section3.header.pill": "مزامنة جوجل شيتس · الطلبات المباشرة",

// Rail navigation
"section3.rail.panelsTitle": "اللوحات",
"section3.rail.panels.sheets": "جوجل شيتس (الطلبات)",
"section3.rail.panels.abandons": "جوجل شيتس (المتروكة)",
"section3.rail.panels.realtime": "الطلبات في الوقت الفعلي",
"section3.rail.panels.whatsapp": "واتساب وتصدير",
"section3.rail.previewOrders": "معاينة الأعمدة · الطلبات",
"section3.rail.previewAbandons": "معاينة الأعمدة · المتروكة",
"section3.rail.noAbandonedColumns": "لا توجد أعمدة مهيأة للطلبات المتروكة بعد.",
"section3.rail.filtersTitle": "مرشحات الطلبات",
"section3.rail.stats.period": "فترة الإحصائيات:",
"section3.rail.stats.days": "أيام",
"section3.rail.stats.codOnly": "(COD فقط)",
"section3.rail.stats.allOrders": "(جميع طلبات تطبيق COD)",
"section3.rail.stats.orders": "الطلبات:",
"section3.rail.stats.total": "الإجمالي:",
"section3.rail.filters.period": "فترة الطلبات",
"section3.rail.filters.periodOptions.7days": "7 أيام",
"section3.rail.filters.periodOptions.15days": "15 يومًا",
"section3.rail.filters.periodOptions.30days": "30 يومًا",
"section3.rail.filters.periodOptions.60days": "60 يومًا",
"section3.rail.filters.codOnly": "عرض طلبات COD فقط",
"section3.rail.filters.description": "هذه الإعدادات تتحكم في قائمة الطلبات الفورية والملخص في الشريط البنفسجي. إذا أعادت واجهة برمجة تطبيقات Shopify خطأ في الوصول، فإنه يتم عرض الرسالة فقط (بدون بيانات مزيفة).",
"section3.rail.filters.save": "حفظ (المتجر)",

// Google connection
"section3.connection.title": "اتصال جوجل وورقة الطلبات",
"section3.connection.loading": "جاري التحقق من اتصال جوجل…",
"section3.connection.accountConnected": "حساب جوجل المتصل:",
"section3.connection.mainSheet": "الورقة الرئيسية (الطلبات):",
"section3.connection.notDefined": "غير محدد",
"section3.connection.id": "المعرف",
"section3.connection.revocable": "يمكنك تغيير الحسابات أو الأوراق في أي وقت، يظل الوصول قابلاً للإلغاء بنسبة 100٪ من حساب جوجل الخاص بك.",
"section3.connection.description": "قم بتوصيل حساب جوجل الخاص بك حتى يرسل TripleForm COD الطلبات المؤكدة تلقائيًا إلى ورقة جوجل شيتس الخاصة بك.",
"section3.connection.authorization": "يتم التفويض من خلال شاشة جوجل الرسمية. يمكنك إلغاؤه في أي وقت من حساب جوجل الخاص بك.",
"section3.connection.changeSheet": "تغيير ورقة الطلبات",
"section3.connection.connect": "الاتصال بـ جوجل",
"section3.connection.openSheet": "فتح ورقة الطلبات",
"section3.connection.test": "اختبار الاتصال",
"section3.connection.testSuccess": "اتصال جوجل شيتس (الطلبات) OK ✔️",
"section3.connection.testError": "فشل ❌: {error}",
"section3.connection.unknownError": "خطأ غير معروف",

// Field mapping
"section3.mapping.title": "الحقول → أعمدة جوجل شيتس (الطلبات)",
"section3.mapping.selectField": "حدد حقلًا وأضفه",
"section3.mapping.selectPlaceholder": "اختر حقلًا…",
"section3.mapping.exampleName": "+ الاسم (مثال)",
"section3.mapping.description": "يصبح كل اختيار عمودًا في ورقة الطلبات الخاصة بك. يظل الكاروسيل مستقرًا حتى إذا أضفت أو حذفت أعمدة.",
"section3.mapping.configuredColumns": "الأعمدة المهيأة (كاروسيل)",
"section3.mapping.previous": "السابق",
"section3.mapping.next": "التالي",
"section3.mapping.column": "العمود",
"section3.mapping.delete": "حذف",
"section3.mapping.fieldForColumn": "الحقل للعمود {number}",
"section3.mapping.asLink": "حفظ كرابط (HYPERLINK)",
"section3.mapping.linkTemplate": "قالب الرابط",
"section3.mapping.linkExample": "مثال: https://wa.me/{value}",
"section3.mapping.width": "العرض",

// Display settings
"section3.display.title": "عرض الورقة في التطبيق",
"section3.display.mode": "وضع العرض",
"section3.display.options.none": "لا شيء",
"section3.display.options.link": "رابط (زر)",
"section3.display.options.embedTop": "تضمين في الأعلى",
"section3.display.options.embedBottom": "تضمين في الأسفل",
"section3.display.height": "ارتفاع التضمين",
"section3.display.description": "يمكنك عرض ورقة الطلبات مباشرة في التطبيق (iframe) أو مجرد تقديم زر وصول سريع.",

// Abandoned orders
"section3.abandoned.title": "اتصال جوجل وورقة المتروكة",
"section3.abandoned.selectedSheet": "الورقة المتروكة المحددة:",
"section3.abandoned.description": "تم تصميم هذه الورقة للطلبات / عربات التسوق المتروكة: العملاء الذين يملئون النموذج ولكن لا يكملون الدفع.",
"section3.abandoned.useSecondSheet": "استخدم ورقة جوجل شيتس ثانية لتتبع الطلبات المتروكة (الاحتمالات التي تغادر في اللحظة الأخيرة).",
"section3.abandoned.whenAbandoned": "عندما يدخل العميل معلوماته ولكن لا يؤكد، يمكن أن تذهب بياناته إلى هذه الورقة المخصصة (متابعة واتساب، مكالمة، إلخ).",
"section3.abandoned.changeSheet": "اختيار / تغيير ورقة المتروكة",
"section3.abandoned.openSheet": "فتح ورقة المتروكة",
"section3.abandoned.testSuccess": "اتصال جوجل شيتس (المتروكة) OK ✔️",
"section3.abandoned.mappingTitle": "الحقول → أعمدة جوجل شيتس (المتروكة)",
"section3.abandoned.examplePhone": "+ الهاتف (مثال)",
"section3.abandoned.mappingDescription": "استخدم هذه الورقة للعملاء المحتملين \"الساخنين\" الذين ملأوا معلوماتهم ولكن لم يكملوا الطلب. تذكر إضافة الاسم + الهاتف + المنتج على الأقل.",
"section3.abandoned.abandonedColumn": "عمود المتروكة",
"section3.abandoned.noColumns": "لا توجد أعمدة حاليًا. أضف حقلًا واحدًا على الأقل للبدء.",

// Real-time orders
"section3.realtime.title": "الطلبات في الوقت الفعلي (عريض)",
"section3.realtime.loading": "جاري تحميل الطلبات…",
"section3.realtime.error": "خطأ: {error}",
"section3.realtime.unknownError": "خطأ غير معروف",
"section3.realtime.noOrders": "لم يتم العثور على طلبات للفترة المحددة.",

// WhatsApp & export
"section3.whatsapp.title": "واتساب وتصدير",
"section3.whatsapp.supportNumber": "رقم دعم واتساب",
"section3.whatsapp.messageTemplate": "قالب الرسالة",
"section3.whatsapp.templatePlaceholder": "مرحبًا {customer.name}، شكرًا لطلبك #{order.id}…",
"section3.whatsapp.whenToSend": "متى ترسل؟",
"section3.whatsapp.options.immediate": "فورًا",
"section3.whatsapp.options.1h": "بعد ساعة واحدة",
"section3.whatsapp.options.24h": "بعد 24 ساعة",
"section3.whatsapp.description": "هذا القسم لا يزال قيد الإعداد. لاحقًا ستتمكن من توصيل إرسال الطلبات إلى واتساب أو أداة خارجية (webhook، Zapier، إلخ). في الوقت الحالي هو نموذج مرئي.",

// Guide
"section3.guide.title": "الدليل · جوجل شيتس والطلبات",
"section3.guide.panelSheets": "لوحة \"جوجل شيتس (الطلبات)\"",
"section3.guide.panelSheetsDesc": "قم بتوصيل ورقتك الرئيسية وقم بتعيين حقول COD إلى أعمدة جوجل شيتس. استخدم الكاروسيل لضبط الترتيب والعرض.",
"section3.guide.panelAbandons": "لوحة \"جوجل شيتس (المتروكة)\"",
"section3.guide.panelAbandonsDesc": "قم بتكوين ورقة ثانية مخصصة لعربات التسوق / الطلبات المتروكة. مفيد لمتابعة واتساب أو مركز الاتصال.",
"section3.guide.panelRealtime": "لوحة \"الطلبات في الوقت الفعلي\"",
"section3.guide.panelRealtimeDesc": "يعرض أحدث الطلبات التي استقبلها TripleForm COD للفترة المختارة في المرشحات اليسرى.",
"section3.guide.panelWhatsapp": "لوحة \"واتساب وتصدير\"",
"section3.guide.panelWhatsappDesc": "سيتم استخدامها لاحقًا لإرسال طلباتك إلى واتساب أو إلى أداة خارجية (webhook، Zapier، إلخ).",

// Preview
"section3.preview.columnHeaders.date": "التاريخ",
"section3.preview.columnHeaders.orderId": "معرف الطلب",
"section3.preview.columnHeaders.customer": "العميل",
"section3.preview.columnHeaders.customerName": "اسم العميل",
"section3.preview.columnHeaders.phone": "الهاتف",
"section3.preview.columnHeaders.city": "المدينة",
"section3.preview.columnHeaders.product": "المنتج",
"section3.preview.columnHeaders.total": "الإجمالي",
"section3.preview.columnHeaders.country": "البلد",
"section3.preview.empty": "—",

// Save messages
"section3.save.success": "تم حفظ إعدادات جوجل شيتس على المتجر ✔️",
"section3.save.error": "فشل الحفظ (المتجر) ❌: {error}",
"section3.save.unknownError": "خطأ غير معروف",

// Fields (pour APP_FIELDS)
"section3.fields.customer.name": "الاسم الكامل",
"section3.fields.customer.phone": "الهاتف",
"section3.fields.customer.city": "المدينة",
"section3.fields.customer.province": "الولاية / المنطقة",
"section3.fields.customer.country": "البلد",
"section3.fields.customer.address": "العنوان",
"section3.fields.customer.notes": "ملاحظات الطلب",
"section3.fields.cart.productTitle": "المنتج — العنوان",
"section3.fields.cart.variantTitle": "المنتج — المتغير",
"section3.fields.cart.offerName": "العرض / الحزمة",
"section3.fields.cart.upsellName": "بيع إضافي",
"section3.fields.cart.quantity": "الكمية",
"section3.fields.cart.subtotal": "إجمالي الطلب (باستثناء الشحن)",
"section3.fields.cart.shipping": "رسوم الشحن",
"section3.fields.cart.totalWithShipping": "إجمالي الطلب (مع الشحن)",
"section3.fields.cart.currency": "العملة",
"section3.fields.order.id": "معرف الطلب",
"section3.fields.order.date": "تاريخ الطلب",
// Section 3 — Google Sheets (clés manquantes)
"section3.sheetsConfiguration.title": "إعدادات جوجل شيتس",
"section3.sheetsConfiguration.ordersSheet": "ورقة الطلبات",
"section3.sheetsConfiguration.abandonedSheet": "ورقة المتروكة",
"section3.sheetsConfiguration.spreadsheetId": "معرف الورقة",
"section3.sheetsConfiguration.spreadsheetIdHelp": "المعرف من رابط جوجل شيتس (بين /d/ و /edit)",
"section3.sheetsConfiguration.tabName": "اسم التبويب",
"section3.sheetsConfiguration.tabNameHelp": "اسم التبويب حيث ستُكتب الطلبات",
"section3.sheetsConfiguration.headerRow": "صف العناوين",
"section3.sheetsConfiguration.headerRowHelp": "رقم الصف الذي توجد به عناوين الأعمدة (عادة 1)",
"section3.sheetsConfiguration.testConnection": "اختبار الاتصال",
"section3.sheetsConfiguration.openSheet": "فتح الورقة",
"section3.sheetsConfiguration.testSuccess": "✓ نجح اختبار الاتصال",
"section3.sheetsConfiguration.testError": "✗ فشل الاختبار: {error}",
"section3.sheetsConfiguration.noSpreadsheetId": "الرجاء إدخال معرف الورقة أولاً",
"section3.sheetsConfiguration.disconnect": "فصل الاتصال",
"section3.sheetsConfiguration.disconnectConfirm": "هل أنت متأكد من أنك تريد فصل حساب جوجل؟ هذا سيوقف إرسال الطلبات إلى جوجل شيتس.",
"section3.sheetsConfiguration.disconnected": "تم فصل حساب جوجل",
"section3.sheetsConfiguration.disconnectError": "خطأ في الفصل: {error}",

// Sheets tabs
"section3.sheetsTabs.orders": "الطلبات",
"section3.sheetsTabs.abandoned": "المتروكة",

// Connection messages
"section3.connection.success": "تم توصيل حساب جوجل بنجاح",
"section3.connection.error": "خطأ في الاتصال: {error}",
"section3.connection.popupBlocked": "تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.",
"section3.connection.popupBlockedAfterOpen": "تم إغلاق النافذة المنبثقة أو حظرها. يرجى المحاولة مرة أخرى.",
"section3.sheetsConfiguration.selectSpreadsheet": "اختر جدول البيانات",
"section3.sheetsConfiguration.selectSpreadsheetHelp": "اختر جدول بيانات جوجل للاستخدام",
"section3.sheetsConfiguration.selectTab": "اختر علامة تبويب",
"section3.sheetsConfiguration.selectTabHelp": "اختر علامة التبويب في جدول البيانات",
"section3.connection.accountConnected": "حساب جوجل متصل:",
"section3.connection.mainSheet": "الورقة الرئيسية (الطلبات):",
"section3.sheetsConfiguration.selectSpreadsheet": "اختر جدول البيانات",
"section3.sheetsConfiguration.selectSpreadsheetHelp": "اختر جدول بيانات جوجل للاستخدام",
"section3.sheetsConfiguration.selectTab": "اختر علامة تبويب",
"section3.sheetsConfiguration.selectTabHelp": "اختر علامة التبويب في جدول البيانات",
// Section 4 — Pixels & Tracking
"section4.header.appTitle": "TripleForm COD · بكسلز وتتبع",
"section4.header.appSubtitle": "اتصل بـ Google و Facebook (Pixel و Conversions API) و TikTok لتتبع طلبات COD الخاصة بك.",
"section4.header.pill": "مركز البيكسلات والتتبع",

"section4.rail.title": "الألواح",
"section4.rail.statusTitle": "حالة البكسلز",
"section4.rail.statusNote": "فعل فقط القنوات التي تحتاجها حقًا. يمكنك بعد ذلك توصيل المكالمات الحقيقية في مسارات Remix وكتل Theme Extension.",
"section4.rail.panels.overview": "نظرة عامة وقائمة التحقق",
"section4.rail.panels.google": "Google (GA4 و Ads)",
"section4.rail.panels.fb": "Facebook Pixel (عميل)",
"section4.rail.panels.capi_fb": "Facebook Conversions API",
"section4.rail.panels.tiktok": "TikTok Pixel (عميل)",
"section4.rail.panels.tiktok_api": "TikTok Events API (خادم)",
"section4.rail.panels.tests": "اختبارات وتصحيح",

"section4.status.on": "مفعل",
"section4.status.off": "معطل",
"section4.status.ready": "جاهز",
"section4.status.notReady": "غير جاهز",

"section4.platforms.google": "Google",
"section4.platforms.fbPixel": "Facebook Pixel",
"section4.platforms.fbCAPI": "Facebook CAPI",
"section4.platforms.tiktokPixel": "TikTok Pixel",
"section4.platforms.tiktokAPI": "TikTok Events API",

"section4.buttons.saveStore": "حفظ (المتجر)",

// Overview
"section4.overview.title": "ملخص التتبع وأفضل الممارسات",
"section4.overview.description": "هنا تدير جميع بكسلزك من مكان واحد: Google و Facebook Pixel و Conversions API و TikTok Pixel و Events API. الهدف هو تحضير الإعدادات الأمامية، ثم نربط APIs الحقيقية في جانب الخادم.",
"section4.overview.googleDesc": "معرف القياس GA4 + اختياريًا معرف/تسمية التحويل لـ Google Ads.",
"section4.overview.fbPixelDesc": "برنامج نصي للمتصفح لـ PageView و ViewContent و AddToCart و Purchase...",
"section4.overview.fbCAPIDesc": "إرسال من جانب الخادم مع Pixel ID + Access Token + إزالة التكرار عبر event_id.",
"section4.overview.tiktokPixelDesc": "تتبع من جانب المتصفح (صفحة، مشاهدات المنتج، إضافة إلى السلة، شراء).",
"section4.overview.tiktokAPIDesc": "تحويلات من جانب الخادم مع Pixel Code + رمز الأعمال.",

// Google
"section4.google.mainTitle": "Google — العلامة الرئيسية (GA4 / Ads)",
"section4.google.enableLabel": "تفعيل Google (gtag.js)",
"section4.google.measurementIdLabel": "معرف القياس GA4 (G-XXXX...)",
"section4.google.adsConversionIdLabel": "معرف تحويل Google Ads (AW-XXXX...)",
"section4.google.adsConversionLabel": "تسمية تحويل Google Ads (اختياري)",
"section4.google.helpText": "يمكنك استخدام هذه المعرفات في كتلة Theme Extension و/أو في مسار Remix لإرسال الأحداث (شراء، إلخ).",
"section4.google.eventsTitle": "Google — الأحداث التلقائية",
"section4.google.sendPageView": "إرسال PageView تلقائيًا",
"section4.google.sendPurchase": "إرسال Purchase تلقائيًا",
"section4.google.eventsHelp": "عمليًا، ستقرر لاحقًا في كود JavaScript/Remix الخاص بك متى تستدعي gtag (على ViewContent و AddToCart و Purchase...).",

// Facebook Pixel
"section4.fbPixel.mainTitle": "Facebook Pixel — الإعداد (عميل)",
"section4.fbPixel.enableLabel": "تفعيل Facebook Pixel (عميل)",
"section4.fbPixel.nameLabel": "اسم البكسل",
"section4.fbPixel.pixelIdLabel": "معرف البكسل",
"section4.fbPixel.helpText": "بكسل العميل يرسل الأحداث عبر fbq() من المتصفح. يمكنك إنشاء event_id لإزالة التكرار مع CAPI.",
"section4.fbPixel.eventsTitle": "Facebook Pixel — الأحداث والمطابقة المتقدمة",
"section4.fbPixel.pageView": "PageView",
"section4.fbPixel.viewContent": "ViewContent",
"section4.fbPixel.addToCart": "AddToCart",
"section4.fbPixel.initiateCheckout": "InitiateCheckout",
"section4.fbPixel.purchase": "Purchase",
"section4.fbPixel.advancedMatching": "تفعيل المطابقة المتقدمة (البريد الإلكتروني، الهاتف...)",

// Facebook CAPI
"section4.fbCAPI.mainTitle": "Facebook Conversions API — الاتصال (خادم)",
"section4.fbCAPI.enableLabel": "تفعيل Facebook CAPI (خادم)",
"section4.fbCAPI.pixelIdLabel": "معرف البكسل (مطلوب)",
"section4.fbCAPI.accessTokenLabel": "رمز الوصول (مطلوب)",
"section4.fbCAPI.testEventCodeLabel": "كود حدث الاختبار (اختياري)",
"section4.fbCAPI.helpText": "سيتم استخدام هذه الإعدادات في مسار Remix (مثال: /api/fb/capi) لإرسال الأحداث من جانب الخادم مع SDK أو طلب HTTP بسيط.",
"section4.fbCAPI.eventsTitle": "Facebook CAPI — الأحداث وإزالة التكرار",
"section4.fbCAPI.sendViewContent": "إرسال ViewContent من جانب الخادم",
"section4.fbCAPI.sendAddToCart": "إرسال AddToCart من جانب الخادم",
"section4.fbCAPI.sendPurchase": "إرسال Purchase من جانب الخادم",
"section4.fbCAPI.useEventIdDedup": "استخدام event_id لإزالة تكرار العميل + CAPI",
"section4.fbCAPI.eventsHelp": "لاحقًا، ستمرر نفس event_id إلى بكسل العميل (fbq) واستدعاء CAPI الخاص بك لتجنب التكرارات في Ads Manager.",

// TikTok Pixel
"section4.tiktokPixel.mainTitle": "TikTok Pixel — الإعداد (عميل)",
"section4.tiktokPixel.enableLabel": "تفعيل TikTok Pixel (عميل)",
"section4.tiktokPixel.nameLabel": "اسم البكسل",
"section4.tiktokPixel.pixelIdLabel": "معرف البكسل",
"section4.tiktokPixel.helpText": "TikTok Pixel في المتصفح سيساعد في تتبع مشاهدات المنتج وإضافات السلة والمشتريات من نموذج COD الخاص بك.",
"section4.tiktokPixel.eventsTitle": "TikTok Pixel — الأحداث التلقائية",
"section4.tiktokPixel.pageView": "PageView",
"section4.tiktokPixel.viewContent": "ViewContent",
"section4.tiktokPixel.addToCart": "AddToCart",
"section4.tiktokPixel.purchase": "Purchase",

// TikTok Events API
"section4.tiktokAPI.mainTitle": "TikTok Events API — الاتصال (خادم)",
"section4.tiktokAPI.enableLabel": "تفعيل TikTok Events API (خادم)",
"section4.tiktokAPI.pixelCodeLabel": "كود البكسل (مطلوب)",
"section4.tiktokAPI.accessTokenLabel": "رمز وصول الأعمال (مطلوب)",
"section4.tiktokAPI.helpText": "ستستخدم هذه المعلومات لاستدعاء TikTok Events API مباشرة من خادمك الخلفي، لإرسال التحويلات من جانب الخادم.",
"section4.tiktokAPI.eventsTitle": "TikTok Events API — الأحداث",
"section4.tiktokAPI.sendPurchase": "إرسال Purchase (خادم)",
"section4.tiktokAPI.eventsHelp": "حاليًا نخطط فقط لحدث Purchase من جانب الخادم. يمكنك التوسيع لاحقًا إذا لزم الأمر.",

// Tests & Debug
"section4.tests.title": "اختبارات وتصحيح — بكسلز الخادم الخلفي",
"section4.tests.description": "يفحص هذا الاختبار ما إذا كانت إعدادات الخادم الخلفي جاهزة لإرسال الأحداث:",
"section4.tests.list.fbPixel": "Facebook Pixel (عميل): معرف موجود + مفعل (إعدادات فقط، وليس أحداث حقيقية).",
"section4.tests.list.tiktokPixel": "TikTok Pixel (عميل): معرف موجود + مفعل (إعدادات).",
"section4.tests.list.fbCAPI": "Facebook CAPI: Pixel ID + Access Token + مفعل.",
"section4.tests.list.tiktokAPI": "TikTok Events API: Pixel Code + Access Token + مفعل.",
"section4.tests.testButton": "اختبار إعدادات البكسلز (الخادم الخلفي)",
"section4.tests.error": "خطأ في الاختبار: {error}",
"section4.tests.result.fbPixel": "Facebook Pixel (إعداد العميل)",
"section4.tests.result.tiktokPixel": "TikTok Pixel (إعداد العميل)",
"section4.tests.result.fbCAPI": "Facebook Conversions API (خادم)",
"section4.tests.result.tiktokAPI": "TikTok Events API (خادم)",
"section4.tests.resultNote": "لا يتحقق هذا الاختبار من الأحداث الحقيقية في Meta / TikTok، بل يتحقق فقط من أن الإعدادات كافية في جانب التطبيق. لرؤية الأحداث في الوقت الفعلي، استخدم إضافات Meta Pixel Helper و TikTok Pixel Helper في المتجر.",

// Guide
"section4.guide.title": "دليل · البكسلز والتتبع",
"section4.guide.step1": "1. ابدأ بلوحة Google (GA4 و Ads) لإضافة Measurement ID الخاص بك واختياريًا تحويلات Google Ads.",
"section4.guide.step2": "2. ثم فعل Facebook Pixel عميل لتتبع الأحداث القياسية من المتصفح.",
"section4.guide.step3": "3. أضف Facebook Conversions API لمضاعفة الأحداث من جانب الخادم (أكثر موثوقية، مانعات الإعلانات، إلخ).",
"section4.guide.step4": "4. قم بإعداد TikTok Pixel و Events API إذا قمت بحملات TikTok Ads.",
"section4.guide.step5": "5. استخدم علامة تبويب الاختبارات والتصحيح للتحقق من صحة إعدادات الخادم الخلفي، ثم تحقق من الأحداث الحقيقية باستخدام إضافات المتصفح (Meta / TikTok).",

// Save messages
"section4.save.success": "تم حفظ إعدادات البكسلز في المتجر ✔️",
"section4.save.error": "فشل (المتجر) ❌: {error}",
"section4.save.unknownError": "خطأ غير معروف",

// Test messages
"section4.test.unknownError": "خطأ غير معروف",
// Section 5 — Anti‑bot & Protection
"section5.header.appTitle": "TripleForm COD · الحماية من الروبوتات",
"section5.header.appSubtitle": "IP · الهاتف · البلد · reCAPTCHA · honeypot — لحجب طلبات الروبوتات دون التأثير على العملاء الحقيقيين",
"section5.header.pill": "مركز الحماية من السبام",

"section5.rail.title": "الألواح",
"section5.rail.statusTitle": "ملخص الحماية",
"section5.rail.statusNote": "قواعد IP: {ips} · قواعد الهاتف: {phones}",
"section5.rail.panels.overview": "الملخص والاستراتيجية",
"section5.rail.panels.ip": "حجب عناوين IP",
"section5.rail.panels.phone": "حجب الهواتف",
"section5.rail.panels.country": "الحجب حسب البلد",
"section5.rail.panels.recap": "Google reCAPTCHA",
"section5.rail.panels.honeypot": "Honeypot & المؤقت",

"section5.status.on": "مفعل",
"section5.status.off": "معطل",
"section5.status.ready": "جاهز",
"section5.status.notReady": "غير جاهز",

"section5.buttons.save": "حفظ",
"section5.buttons.saveStore": "حفظ (المتجر)",
"section5.buttons.add": "إضافة",
"section5.buttons.addCSV": "إضافة CSV",
"section5.buttons.remove": "حذف",
"section5.buttons.test": "اختبار الاتصال",

"section5.overview.title": "ملخص الحماية من الروبوتات والنصائح",
"section5.overview.description": "هذا القسم يحمي استمارة الدفع عند الاستلام الخاصة بك من الروبوتات والطلبات الوهمية (النصوص، الأرقام المزيفة، عناوين IP المسيئة...). يمكنك تفعيل طبقة أو أكثر حسب احتياجاتك.",
"section5.overview.ip": "IP: يحجب عناوين IP المشبوهة، يحدد عدد المحاولات لكل IP، الحظر التلقائي المؤقت.",
"section5.overview.phone": "الهاتف: يتحكم في الطول، البادئات المسموحة، أنماط الأرقام الوهمية، الحدود لكل رقم/يوم.",
"section5.overview.country": "البلد: يسمح أو يحجب بلدان معينة، أو يفرض تحدي (كابتشا).",
"section5.overview.recaptcha": "reCAPTCHA: طبقة جوجل (v2/v3) للكشف عن الروبوتات عند الإرسال.",
"section5.overview.honeypot": "Honeypot & المؤقت: حقل مخفي + الحد الأدنى للوقت على الصفحة، فعال جداً ضد النصوص البسيطة.",

"section5.ipBlock.title": "الحجب حسب عنوان IP",
"section5.ipBlock.enable": "تفعيل حجب IP",
"section5.ipBlock.trustProxy": "الثقة بالبروكسي (استخدام X-Forwarded-For)",
"section5.ipBlock.clientIpHeader": "رأس IP العميل",
"section5.ipBlock.allowList": "القائمة المسموحة — عناوين IP المسموحة",
"section5.ipBlock.denyList": "القائمة المحجوبة — عناوين IP المحجوبة",
"section5.ipBlock.cidrList": "نطاقات CIDR — المحجوبة",
"section5.ipBlock.cidrHelp": "الصق نطاقاً أو أكثر، مفصولة بفاصلة أو سطر جديد.",
"section5.ipBlock.autoBanFails": "الحظر التلقائي بعد X فشل",
"section5.ipBlock.autoBanMinutes": "مدة الحظر التلقائي (دقائق)",
"section5.ipBlock.maxOrdersPerDay": "الحد الأقصى للطلبات / IP / يوم",

"section5.phoneBlock.title": "الحجب حسب رقم الهاتف",
"section5.phoneBlock.enable": "تفعيل حجب الهاتف",
"section5.phoneBlock.minDigits": "الحد الأدنى للأرقام",
"section5.phoneBlock.requirePrefix": "اشتراط البادئة (+212...)",
"section5.phoneBlock.allowedPrefixes": "البادئات المسموحة",
"section5.phoneBlock.blockedNumbers": "الأرقام المحجوبة (دقيقة)",
"section5.phoneBlock.blockedPatterns": "الأنماط المحجوبة (RegExp بسيط)",
"section5.phoneBlock.maxOrdersPerDay": "الحد الأقصى للطلبات / رقم / يوم",

"section5.countryBlock.title": "الحجب حسب البلد",
"section5.countryBlock.enable": "تفعيل الحجب حسب البلد",
"section5.countryBlock.defaultAction": "الإجراء الافتراضي",
"section5.countryBlock.defaultActionOptions.allow": "السماح",
"section5.countryBlock.defaultActionOptions.block": "الحجب",
"section5.countryBlock.defaultActionOptions.challenge": "التحدي (كابتشا)",
"section5.countryBlock.allowList": "البلدان المسموحة (رموز ISO2)",
"section5.countryBlock.denyList": "البلدان المحجوبة (رموز ISO2)",

"section5.recaptcha.title": "Google reCAPTCHA",
"section5.recaptcha.enable": "تفعيل reCAPTCHA",
"section5.recaptcha.version": "الإصدار",
"section5.recaptcha.versionOptions.v2_checkbox": "v2 (صندوق اختيار)",
"section5.recaptcha.versionOptions.v2_invisible": "v2 (غير مرئي)",
"section5.recaptcha.versionOptions.v3": "v3 (نتيجة)",
"section5.recaptcha.siteKey": "مفتاح الموقع",
"section5.recaptcha.secretKey": "المفتاح السري (الخادم)",
"section5.recaptcha.minScore": "الحد الأدنى للنتيجة (v3)",
"section5.recaptcha.helpText": "لـ v2، تعرض الودجت في الواجهة الأمامية. لـ v3، ترسل الرمز إلى الخادم وتتحقق من النتيجة باستخدام API reCAPTCHA قبل إنشاء الطلب.",

"section5.honeypot.title": "Honeypot & الحد الأدنى للوقت على الصفحة",
"section5.honeypot.enable": "تفعيل honeypot (الحقل المخفي)",
"section5.honeypot.blockIfFilled": "الحجب إذا تم ملء الحقل المخفي",
"section5.honeypot.checkMouseMove": "مراقبة حركات الماوس / التمرير",
"section5.honeypot.fieldName": "اسم حقل honeypot",
"section5.honeypot.minTime": "الحد الأدنى للوقت قبل الإرسال (مللي ثانية)",
"section5.honeypot.timeHelp": "مثال: 3000ms = 3 ثوان. إذا تم إرسال النموذج بسرعة كبيرة، نعتبر أنه روبوت.",
"section5.honeypot.description": "سهل جداً للتنفيذ في كتلة الدفع عند الاستلام: تضيف حقل مخفي ومؤقت JavaScript. العديد من الروبوتات تملأ جميع الحقول أو ترسل الطلب فوراً، مما يجعل حظرها سهلاً.",

"section5.empty": "لا توجد عناصر",
"section5.placeholder": "إضافة…",

"section5.save.success": "تم حفظ إعدادات الحماية من الروبوتات ✔️",
"section5.save.error": "فشل: {error}",
"section5.save.unknownError": "خطأ غير معروف",

"section5.guide.title": "دليل · الحماية من الروبوتات TripleForm COD",
"section5.guide.step1": "• ابدأ بخفة (honeypot + حدود الهاتف) ثم أضف IP / البلد إذا رأيت الكثير من السبام.",
"section5.guide.step2": "• القائمة المسموحة تأتي دائماً قبل الحجب: مفيدة لـ IP الخاص بك أو فريقك.",
"section5.guide.step3": "• احتفظ بقيم معقولة للحدود (مثال: 40 طلب / IP / يوم) لتجنب حجب عميل حقيقي.",
"section5.guide.step4": "• reCAPTCHA مفيد إذا كنت تتلقى الكثير من الروبوتات «الذكية» التي تتخطى المرشحات الأخرى.",
"section5.guide.step5": "عندما تكون جاهزاً، يمكنك استخدام هذه الإعدادات في مسارات Remix /api/antibot/* وفي كتلة استمارة الدفع عند الاستلام.",
// ===== Section 6 — Geo / Shipping =====
"section6.header.appTitle": "TripleForm COD · أسعار الشحن حسب البلد/المدينة",
"section6.header.appSubtitle": "اضبط أسعار الشحن للمغرب، الجزائر، تونس — حسب الولاية، المدينة أو شرائح الأسعار.",
"section6.header.pill": "آلة حاسبة الشحن · المدن/الولايات",

"section6.rail.title": "الألواح",
"section6.rail.panels.province": "أسعار حسب الولاية",
"section6.rail.panels.city": "أسعار حسب المدينة",
"section6.rail.panels.price": "شرائح الأسعار",
"section6.rail.panels.advanced": "خيارات متقدمة",
"section6.rail.summaryTitle": "ملخص الشحن",
"section6.rail.type": "النوع",
"section6.rail.free": "مجاني",
"section6.rail.paid": "مدفوع",
"section6.rail.mode": "الوضع",
"section6.rail.priceBrackets": "شرائح الأسعار",
"section6.rail.provinces": "الولايات",
"section6.rail.cities": "المدن",
"section6.rail.countryCurrency": "البلد: {country} | العملة: {currency}",

"section6.buttons.saveStore": "حفظ (المتجر)",
"section6.buttons.deleteProvince": "حذف الولاية",
"section6.buttons.addProvince": "إضافة ولاية",
"section6.buttons.deleteCity": "حذف مدينة",
"section6.buttons.addCity": "إضافة مدينة",
"section6.buttons.deleteBracket": "حذف شريحة",
"section6.buttons.addBracket": "إضافة شريحة",
"section6.buttons.save": "حفظ الخيارات المتقدمة",

"section6.general.title": "الإعدادات العامة للشحن",
"section6.general.shippingType": "نوع الشحن",
"section6.general.freeOption": "شحن مجاني",
"section6.general.paidOption": "شحن مدفوع",
"section6.general.mainCountry": "البلد الرئيسي",
"section6.general.countries.MA": "المغرب",
"section6.general.countries.DZ": "الجزائر",
"section6.general.countries.TN": "تونس",
"section6.general.countryHelp": "البلد الرئيسي لحسابات الشحن والمناطق.",
"section6.general.currency": "العملة",
"section6.general.currencyHelp": "العملة المستخدمة للأسعار (MAD, DZD, TND, إلخ).",
"section6.general.pricingMode": "وضع التسعير",
"section6.general.modeProvince": "حسب الولاية/المنطقة",
"section6.general.modeCity": "حسب المدينة",
"section6.general.modePrice": "حسب مبلغ الطلب",
"section6.general.freeShippingInfo": "طلبات الدفع عند الاستلام الخاصة بك ستكون بشحن مجاني (بدون رسوم إضافية).",
"section6.general.freeShippingDetails": "الشحن مجاني لجميع الطلبات. يمكنك مع ذلك ضبط الخيارات المتقدمة (الحد الأدنى للطلب، رسوم COD، إلخ).",

"section6.province.title": "أسعار الشحن حسب الولاية — {country}",
"section6.province.description": "حدد رسوم الشحن لكل ولاية/ولاية. إذا لم تكن الولاية مدرجة، سيتم تطبيق السعر الافتراضي.",
"section6.province.provinceLabel": "الولاية/الولاية",
"section6.province.provinceHelp": "اختر ولاية أو أدخل اسم مخصص",
"section6.province.codeLabel": "الرمز",
"section6.province.codeHelp": "رمز اختياري (مثال: MA-01, DZ-16)",
"section6.province.rateLabel": "السعر ({currency})",
"section6.province.rateHelp": "رسوم الشحن لهذه الولاية",

"section6.city.title": "أسعار الشحن حسب المدينة — {country}",
"section6.city.description": "حدد رسوم الشحن لكل مدينة. اختر أولاً الولاية، ثم اختر المدينة.",
"section6.city.provinceLabel": "الولاية/الولاية",
"section6.city.provinceHelp": "اختر الولاية أولاً لرؤية مدنها",
"section6.city.cityLabel": "المدينة",
"section6.city.cityHelpEnabled": "المدن المتاحة للولاية المختارة",
"section6.city.cityHelpDisabled": "اختر ولاية أولاً",
"section6.city.rateLabel": "السعر ({currency})",
"section6.city.rateHelp": "رسوم الشحن لهذه المدينة",

"section6.select.provincePlaceholder": "اختر ولاية…",
"section6.select.cityPlaceholder": "اختر مدينة…",

"section6.price.title": "أسعار الشحن حسب مبلغ الطلب",
"section6.price.description": "حدد شرائح الأسعار. مثال: 0-299 درهم = 29 درهم شحن، ≥300 درهم = مجاني.",
"section6.price.minAmount": "الحد الأدنى للمبلغ ({currency})",
"section6.price.maxAmount": "الحد الأقصى للمبلغ ({currency})",
"section6.price.maxHelp": "اترك فارغًا أو 0 لـ'غير محدود' (بدون حد أقصى)",
"section6.price.rateLabel": "السعر ({currency})",

"section6.advanced.title": "خيارات شحن متقدمة",
"section6.advanced.defaultRate": "السعر الافتراضي ({currency})",
"section6.advanced.defaultRateHelp": "يطبق إذا لم تطابق أي قاعدة محددة",
"section6.advanced.freeThreshold": "حد المجانية ({currency})",
"section6.advanced.freeThresholdHelp": "مبلغ الطلب الذي فوقه الشحن مجاني",
"section6.advanced.minOrderAmount": "الحد الأدنى لمبلغ الطلب ({currency})",
"section6.advanced.codExtraFee": "رسوم COD إضافية ({currency})",
"section6.advanced.codExtraFeeHelp": "رسوم إضافية لطلبات COD (اختياري)",
"section6.advanced.note": "ملاحظة للعميل",
"section6.advanced.noteHelp": "تعرض بجانب إجمالي الشحن",

"section6.save.success": "تم حفظ إعدادات الشحن ✔️",
"section6.save.error": "فشل الحفظ: {error}",
"section6.save.unknownError": "خطأ غير معروف",

"section6.mode.price": "حسب السعر",
"section6.mode.province": "حسب الولاية",
"section6.mode.city": "حسب المدينة",

"section6.status.enabled": "مفعّل",
"section6.status.disabled": "معطّل",

"section6.guide.title": "دليل · الشحن حسب البلد/المدينة",
"section6.guide.step1": "1. اختر شحنًا مجانيًا أو مدفوعًا. إذا كان مدفوعًا، اختر الوضع: ولاية، مدينة أو شرائح أسعار.",
"section6.guide.step2": "2. اختر بلدك الرئيسي (المغرب، الجزائر، تونس) والعملة (MAD, DZD, TND).",
"section6.guide.step3": "3. اضبط الأسعار: أضف ولايات/مدن مع رسوم، أو أنشئ شرائح أسعار (0-299 = X، 300+ = مجاني).",
"section6.guide.step4": "4. استخدم الخيارات المتقدمة للسعر الافتراضي، حد المجانية، الحد الأدنى للطلب، رسوم COD الإضافية.",
"section6.guide.step5": "5. احفظ → سيتم حساب الأسعار تلقائيًا في استمارة الدفع عند الاستلام الخاصة بك.",

"section1.preview.shippingToCalculate": "التوصيل لحسابه",
"section3.sheetsConfiguration.chooseTab": "اختر علامة التبويب",
"section3.connection.refresh": "تحديث الاتصال",
"section1.cart.freeShipping": "شحن مجاني",
// ===== Section WhatsApp — Automation =====
"whatsapp.title": "أتمتة واتساب",
"whatsapp.subtitle": "قم بتوصيل واتساب وأتمت اتصالاتك",
"whatsapp.connected": "متصل",
"whatsapp.disconnected": "غير متصل",
"whatsapp.connectedTo": "متصل بـ",
"whatsapp.lastConnected": "آخر اتصال",
"whatsapp.refreshStatus": "تحديث الحالة",
"whatsapp.testConnection": "اختبار الاتصال",
"whatsapp.disconnect": "قطع الاتصال",
"whatsapp.qr.placeholder": "رمز QR واتساب",
"whatsapp.qr.generate": "إنشاء رمز QR",
"whatsapp.qr.regenerate": "إعادة إنشاء رمز QR",
"whatsapp.qr.instructions": "افتح واتساب > الإعدادات > الأجهزة المرتبطة > ربط جهاز > امسح هذا الرمز",
"whatsapp.stats.messagesSent": "الرسائل المرسلة",
"whatsapp.stats.successful": "ناجحة",
"whatsapp.stats.recoveryRate": "معدل الاسترجاع",
"whatsapp.stats.avgResponse": "متوسط وقت الرد",
"whatsapp.features.afterCOD.title": "بعد طلب COD",
"whatsapp.features.afterCOD.description": "إرسال رسالة تلقائية بعد تأكيد طلب COD",
"whatsapp.features.afterCOD.enable": "تفعيل الرسائل بعد الطلب",
"whatsapp.features.afterCOD.buttonText": "نص الزر",
"whatsapp.features.afterCOD.position": "موقع الزر",
"whatsapp.features.afterCOD.autoSend": "إرسال تلقائي",
"whatsapp.features.afterCOD.delay": "تأخير الإرسال",
"whatsapp.features.recovery.title": "استعادة السلة",
"whatsapp.features.recovery.description": "إرسال تذكير واتساب للسلع المتروكة",
"whatsapp.features.recovery.enable": "تفعيل الاسترجاع",
"whatsapp.features.recovery.delay": "تأخير قبل الإرسال",
"whatsapp.features.recovery.discount": "خصم الاسترجاع",
"whatsapp.features.recovery.code": "رمز الاسترجاع",
"whatsapp.features.templates.title": "قوالب الرسائل",
"whatsapp.features.templates.description": "خصّص رسائل واتساب",
"whatsapp.features.templates.orderMessage": "رسالة بعد الطلب",
"whatsapp.features.templates.recoveryMessage": "رسالة الاسترجاع",
"whatsapp.variables.available": "المتغيرات المتاحة",
"whatsapp.variables.orderId": "رقم الطلب",
"whatsapp.variables.customerName": "اسم العميل",
"whatsapp.variables.customerPhone": "هاتف العميل",
"whatsapp.variables.productName": "اسم المنتج",
"whatsapp.variables.orderTotal": "إجمالي الطلب",
"whatsapp.variables.deliveryDate": "تاريخ التسليم",
"whatsapp.variables.shopName": "اسم المتجر",
"whatsapp.variables.trackingUrl": "رابط التتبع",
"whatsapp.variables.supportNumber": "رقم الدعم",
"whatsapp.variables.recoveryCode": "رمز الاسترجاع",
"whatsapp.delays.immediate": "فوراً",
"whatsapp.delays.5min": "5 دقائق",
"whatsapp.delays.30min": "30 دقيقة",
"whatsapp.delays.1h": "ساعة واحدة",
"whatsapp.delays.2h": "ساعتان",
"whatsapp.delays.6h": "6 ساعات",
"whatsapp.delays.24h": "24 ساعة",
"whatsapp.positions.below": "أسفل",
"whatsapp.positions.right": "يمين",
"whatsapp.positions.replace": "استبدال",
"whatsapp.advanced.title": "الإعدادات المتقدمة",
"whatsapp.advanced.description": "تهيئة واتساب المتقدمة",
"whatsapp.advanced.autoConnect": "اتصال تلقائي",
"whatsapp.advanced.analytics": "تفعيل التحليلات",
"whatsapp.advanced.readReceipts": "إيصالات القراءة",
"whatsapp.advanced.businessHours": "ساعات العمل فقط",
"whatsapp.advanced.startTime": "وقت البدء",
"whatsapp.advanced.endTime": "وقت الانتهاء",
"whatsapp.advanced.maxRetries": "أقصى محاولات",
"whatsapp.advanced.mediaMessages": "رسائل وسائط",
"whatsapp.advanced.mediaUrl": "رابط الوسائط",
"whatsapp.advanced.buttons": "أزرار تفاعلية",
"whatsapp.preview.title": "معاينة الرسالة",
"whatsapp.preview.description": "كيف ستظهر رسالتك",
"whatsapp.sendTest": "إرسال اختبار",
"whatsapp.saveConfig": "حفظ الإعدادات",
"whatsapp.configSaved": "تم حفظ الإعدادات!",
"whatsapp.testSuccess": "اختبار الاتصال ناجح!",
"whatsapp.testError": "خطأ في الاختبار: {error}",
"whatsapp.testMessageSent": "تم إرسال الرسالة الاختبار بنجاح!",
"whatsapp.confirmDisconnect": "هل أنت متأكد من قطع اتصال واتساب؟",
"whatsapp.confirmTestMessage": "إرسال رسالة اختبار لرقم واتساب؟",
"whatsapp.errors.qrGeneration": "خطأ في إنشاء رمز QR",
"whatsapp.errors.disconnect": "خطأ في قطع الاتصال",
"whatsapp.errors.saveConfig": "خطأ في الحفظ",
"whatsapp.errors.testMessage": "خطأ في إرسال الاختبار: {error}",
 /* ===== Icônes et sélecteurs ===== */
  "section1.fieldEditor.iconLabel": "أيقونة",
  "section1.iconSelector.title": "اختر أيقونة",
  "section1.cart.cartIcon": "أيقونة السلة",

  /* ===== Libellés d'icônes ===== */
  "icon.label.CartIcon": "عربة التسوق",
  "icon.label.BagIcon": "حقيبة",
  "icon.label.ProductsIcon": "المنتجات",
  "icon.label.CheckoutIcon": "الدفع",
  "icon.label.ReceiptIcon": "إيصال",
  "icon.label.NoteIcon": "ملاحظة",
  "icon.label.ProfileIcon": "الملف الشخصي",
  "icon.label.PersonIcon": "شخص",
  "icon.label.UserIcon": "مستخدم",
  "icon.label.CustomersIcon": "العملاء",
  "icon.label.PhoneIcon": "هاتف",
  "icon.label.MobileIcon": "جوال",
  "icon.label.CallIcon": "مكالمة",
  "icon.label.ChatIcon": "دردشة",
  "icon.label.HashtagIcon": "هاشتاغ",
  "icon.label.NumberIcon": "رقم",
  "icon.label.CirclePlusIcon": "زائد",
  "icon.label.LocationIcon": "موقع",
  "icon.label.PinIcon": "دبوس",
  "icon.label.HomeIcon": "منزل",
  "icon.label.StoreIcon": "متجر",
  "icon.label.CityIcon": "مدينة",
  "icon.label.GlobeIcon": "كرة أرضية",
  "icon.label.MapIcon": "خريطة",
  "icon.label.RegionIcon": "منطقة",
  "icon.label.ClipboardIcon": "الحافظة",
  "icon.label.DocumentIcon": "مستند",
  "icon.label.TextIcon": "نص",
  "icon.label.TruckIcon": "شاحنة",
  "icon.label.CheckCircleIcon": "تحقق",
  "icon.label.PlayIcon": "تشغيل",
  "icon.label.ArrowRightIcon": "سهم يمين",
  "icon.label.SendIcon": "إرسال",
  // Rail navigation
"section2.rail.title": "التنقل",
"section2.rail.offers": "العروض (الشروط)",
"section2.rail.upsells": "الهدايا / البيع الإضافي",

// Groups
"section2.group.conditions.title": "شروط التطبيق",
"section2.group.display.title": "العرض",

// Global settings
"section2.global.rounding.label": "تقريب الأسعار",

// Display settings
"section2.display.showOrderSummary": "عرض ملخص الطلب",
"section2.display.showOffersSection": "عرض قسم العروض",

// Offer settings (individual offers)
"section2.offer.title": "العرض {{number}}",
"section2.offer.titleField": "عنوان العرض",
"section2.offer.description": "الوصف",
"section2.offer.enable": "تفعيل هذا العرض",
"section2.offer.type": "نوع الخصم",
"section2.offer.type.percent": "نسبة مئوية",
"section2.offer.type.fixed": "مبلغ ثابت",
"section2.offer.percent": "النسبة المئوية",
"section2.offer.fixedAmount": "المبلغ الثابت",
"section2.offer.product": "المنتج المعني",
"section2.offer.selectProduct": "اختر منتجًا",
"section2.offer.minQuantity": "الحد الأدنى للكمية",
"section2.offer.minSubtotal": "الحد الأدنى للمجموع الفرعي",
"section2.offer.maxDiscount": "الحد الأقصى للخصم (0 = غير محدود)",
"section2.offer.requiresCode": "يتطلب رمزًا",
"section2.offer.code": "رمز الترويج",
"section2.offer.imageUrl": "رابط الصورة",
"section2.offer.icon": "الأيقونة",
"section2.offer.showInPreview": "عرض في المعاينة",

// Upsell settings (individual)
"section2.upsell.title": "الهدية {{number}}",
"section2.upsell.titleField": "عنوان الهدية",
"section2.upsell.description": "الوصف",
"section2.upsell.enable": "تفعيل هذه الهدية",
"section2.upsell.product": "منتج الهدية",
"section2.upsell.triggerType": "شرط التنشيط",
"section2.upsell.trigger.subtotal": "الحد الأدنى للمجموع الفرعي",
"section2.upsell.trigger.product": "منتج محدد",
"section2.upsell.minSubtotal": "الحد الأدنى للمجموع الفرعي",
"section2.upsell.productHandle": "معرف المنتج",
"section2.upsell.imageUrl": "رابط الصورة",
"section2.upsell.icon": "الأيقونة",
"section2.upsell.showInPreview": "عرض في المعاينة",

// Gift details
"section2.gift.originalPrice": "السعر الأصلي",

// Buttons
"section2.button.addOffer": "إضافة عرض",
"section2.button.addUpsell": "إضافة هدية",

// Preview
"section2.preview.active": "نشط",
"section2.preview.inactive": "غير نشط",
"section2.preview.offerStrip.offer": "عرض",
"section2.preview.offerStrip.gift": "هدية",
"section2.preview.defaultOfferTitle": "عرض خاص",
"section2.preview.defaultUpsellTitle": "هدية مفاجئة",
"section2.preview.discountPercent": "خصم {{percent}}%",
"section2.preview.discountFixed": "خصم {{amount}} {{currency}}",
"section2.preview.giftDescription": "مجاني مع طلبك",
"section2.preview.orderSummary.title": "ملخص الطلب",
"section2.preview.orderSummary.subtotal": "المجموع الفرعي",
"section2.preview.orderSummary.shipping": "الشحن",
"section2.preview.orderSummary.total": "المجموع",
"section1.preview.shippingTo": "الشحن إلى",
"section1.newFieldPlaceholder": "مؤشر موضع الحقل الجديد",
"section1.newFieldLabel": "تسمية الحقل الجديد",
"section1.addNewField": "إضافة حقل جديد",
"section1.rail.fieldsTitle": "حقول النموذج",
"section3.statsCard.title": "إحصائيات الطلبات",
"section3.errors.sessionExpired": "انتهت الجلسة، يرجى تحديث الصفحة",
"whatsapp.defaults.orderMessage": "مرحبًا {customer.name}، شكرًا لطلبك #{order.id}. سنتصل بك قريبًا.",
"whatsapp.header.title": "أتمتة واتساب",
"whatsapp.header.subtitle": "إرسال رسائل تلقائية بعد طلبات الدفع عند الاستلام",
"whatsapp.status.connectedTo": "متصل بـ",
"whatsapp.status.notConnected": "غير متصل",
"whatsapp.mode.title": "وضع الاتصال",
"whatsapp.mode.simple.title": "الوضع البسيط (رقم الهاتف)",
"whatsapp.mode.simple.subtitle": "اتصل عبر رقم هاتفك",
"whatsapp.mode.simple.b1": "إعداد سريع",
"whatsapp.mode.simple.b2": "لا حاجة لرمز API",
"whatsapp.mode.simple.b3": "مسح رمز QR يدويًا",
"whatsapp.mode.simple.b4": "ميزات أساسية",
"whatsapp.mode.advanced.title": "الوضع المتقدم (API)",
"whatsapp.mode.advanced.subtitle": "اتصل عبر واتساب بيزنس API",
"whatsapp.mode.advanced.b1": "اتصال آلي",
"whatsapp.mode.advanced.b2": "حدود رسائل أعلى",
"whatsapp.mode.advanced.b3": "تحليلات متقدمة",
"whatsapp.mode.advanced.b4": "دعم Webhook",
"whatsapp.fields.phone.label": "رقم الهاتف",
"whatsapp.fields.phone.placeholder": "أدخل رقم واتساب (مع رمز الدولة)",
"whatsapp.fields.phone.help": "مثال: +212612345678",
"whatsapp.fields.businessName.label": "اسم النشاط التجاري",
"whatsapp.fields.businessName.placeholder": "اسم نشاطك التجاري",
"whatsapp.fields.businessName.help": "يظهر في الرسائل",
"whatsapp.warning.title": "ملاحظات مهمة",
"whatsapp.warning.b1": "حافظ على فتح واتساب ويب/سطح المكتب",
"whatsapp.warning.b2": "يجب أن يكون الهاتف متصلًا بالإنترنت",
"whatsapp.warning.b3": "رمز QR ينتهي كل بضع دقائق",
"whatsapp.warning.b4": "اختبر أولاً برقم حقيقي",
"whatsapp.fields.token.label": "رمز API",
"whatsapp.fields.token.placeholder": "أدخل رمز واتساب بيزنس API الخاص بك",
"whatsapp.fields.token.help": "احصل عليه من مزود واتساب بيزنس API",
"whatsapp.noteApi": "ملاحظة: واتساب بيزنس API يتطلب موافقة وقد يكون له تكاليف.",
"whatsapp.fields.message.label": "قالب الرسالة",
"whatsapp.fields.message.placeholder": "أدخل رسالتك مع المتغيرات...",
"whatsapp.fields.message.help": "استخدم {customer.name}, {order.id}, إلخ.",
"whatsapp.fields.autoSend.label": "إرسال تلقائيًا",
"whatsapp.qr.title": "اتصال برمز QR",
"whatsapp.qr.subtitle": "امسح رمز QR بواسطة واتساب للاتصال",
"whatsapp.qr.empty": "لم يتم إنشاء رمز QR بعد",
"whatsapp.qr.howTo": "كيفية الاتصال:",
"whatsapp.qr.step1": "1. افتح واتساب على هاتفك",
"whatsapp.qr.step2": "2. اذهب إلى الإعدادات → الأجهزة المرتبطة",
"whatsapp.qr.step3": "3. اضغط على 'ربط جهاز' وامسح رمز QR",
"whatsapp.qr.generate": "إنشاء رمز QR",
"whatsapp.qr.regenerate": "إعادة إنشاء رمز QR",
"whatsapp.qr.refresh": "تحديث رمز QR",
"whatsapp.connected.title": "حالة الاتصال",
"whatsapp.connected.last": "آخر اتصال:",
"whatsapp.connected.sent": "الرسائل المرسلة:",
"whatsapp.connected.ready": "جاهز لإرسال الرسائل",
"common.save": "حفظ",
"common.disconnect": "قطع الاتصال",
"section1.fieldEditor.titlePrefix.birthday": "تاريخ الميلاد",
"section1.fieldEditor.titlePrefix.company": "الشركة",
"section1.fieldEditor.titlePrefix.pincode": "الرمز البريدي",
"section1.fieldEditor.titlePrefix.email": "البريد الإلكتروني",
"section2.ui.header.subtitle": "العروض و الـUpsells — إعدادات احترافية",
"section2.ui.status.dirty": "تغييرات غير محفوظة",
"section2.ui.status.saved": "تم الحفظ",
"section2.ui.status.loading": "جاري التحميل...",

"section2.ui.tabs.global": "عام",
"section2.ui.tabs.offers": "عروض",
"section2.ui.tabs.upsells": "Upsells",

"section2.ui.hero.badge": "{offers} عروض • {upsells} Upsells",
"section2.ui.hero.title": "العروض و الـUpsells",
"section2.ui.hero.subtitle": "إعدادات واضحة + معاينة ممتازة",
"section2.ui.hero.currentTab": "{tab}",

"section2.ui.modal.unsaved.title": "تغييرات غير محفوظة",
"section2.ui.modal.unsaved.body": "لديك تغييرات غير محفوظة. هل تريد الحفظ أو التجاهل قبل تغيير القسم؟",
"section2.ui.modal.unsaved.primary": "حفظ والمتابعة",
"section2.ui.modal.unsaved.primaryLoading": "جاري الحفظ...",
"section2.ui.modal.unsaved.cancel": "إلغاء",
"section2.ui.modal.unsaved.discard": "تجاهل",

"section2.ui.preview.title": "معاينة",
"section2.ui.preview.badge.active": "نشط",
"section2.ui.preview.badge.inactive": "غير نشط",
"section2.ui.preview.subtitle": "معاينة سريعة (ما سيراه العميل).",
"section2.ui.preview.offers.title": "العروض",
"section2.ui.preview.offers.none": "لا توجد عروض نشطة في المعاينة.",
"section2.ui.preview.upsells.title": "Upsells",
"section2.ui.preview.upsells.none": "لا يوجد Upsell نشط في المعاينة.",
"section2.ui.preview.productLabel": "المنتج:",
"section2.ui.preview.product.none": "لا يوجد",
"section2.ui.preview.product.selected": "تم اختيار منتج",
"section2.ui.offers.title": "العروض ({count}/3)",
"section2.ui.upsells.title": "Upsells ({count}/3)",

"section2.ui.badge.proSettings": "إعدادات احترافية",
"section2.ui.badge.noButton": "بدون زر",

"section2.ui.offer.cardTitle": "عرض {n}",
"section2.ui.upsell.cardTitle": "Upsell {n}",
"section2.ui.field.enable": "تفعيل",

"section2.ui.group.content": "المحتوى",
"section2.ui.group.iconDesign": "الأيقونة والتصميم",
"section2.ui.group.button": "الزر (العرض)",
"section2.ui.group.preview": "المعاينة",

"section2.ui.field.title": "العنوان",
"section2.ui.field.description": "النص",
"section2.ui.field.product": "منتج Shopify",
"section2.ui.field.image": "الصورة",
"section2.ui.field.imageMode.product": "صورة المنتج (تلقائي)",
"section2.ui.field.imageMode.custom": "صورة مخصصة (URL)",
"section2.ui.field.imageUrl": "رابط الصورة",

"section2.ui.field.icon": "الأيقونة",
"section2.ui.field.iconBg": "خلفية الأيقونة",
"section2.ui.field.cardBg": "الخلفية",
"section2.ui.field.borderColor": "الحدود",

"section2.ui.field.buttonText": "نص الزر",
"section2.ui.field.buttonBg": "خلفية الزر",
"section2.ui.field.buttonTextColor": "لون نص الزر",
"section2.ui.field.buttonBorder": "حدود الزر",

"section2.ui.field.showInPreview": "عرض في المعاينة",

"section2.ui.helper.noImagesDetected": "لم يتم العثور على صور لهذا المنتج (حسب الفورمات المُرجع).",

"section2.ui.action.addOffer": "إضافة عرض",
"section2.ui.action.addUpsell": "إضافة Upsell",
"section2.ui.action.remove": "حذف",

// ======================= Section2 — Thank You Page (AR) =======================

"section2.ui.tabs.thankyou": "صفحة الشكر",

"section2.ui.thankyou.title": "صفحة الشكر",
"section2.ui.thankyou.subtitle": "تخصيص التجربة بعد تأكيد الطلب",
"section2.ui.thankyou.enable": "تفعيل صفحة الشكر",
"section2.ui.thankyou.mode.label": "الوضع",
"section2.ui.thankyou.mode.simple": "بسيط (زر / تحويل)",
"section2.ui.thankyou.mode.popup": "نافذة منبثقة (صورة + محتوى)",
"section2.ui.thankyou.mode.help": "اختيار طريقة العرض بعد الطلب",

"section2.ui.thankyou.popup.enable": "تفعيل النافذة",
"section2.ui.thankyou.popup.title": "عنوان النافذة",
"section2.ui.thankyou.popup.text": "نص النافذة",
"section2.ui.thankyou.popup.showClose": "إظهار زر الإغلاق",
"section2.ui.thankyou.popup.closeLabel": "إغلاق",
"section2.ui.thankyou.popup.delayMs": "تأخير الفتح (مللي ثانية)",
"section2.ui.thankyou.popup.autoCloseMs": "إغلاق تلقائي (مللي ثانية)",
"section2.ui.thankyou.popup.overlay": "خلفية معتمة",
"section2.ui.thankyou.popup.overlayOpacity": "شفافية الخلفية",
"section2.ui.thankyou.popup.animation": "الحركة",
"section2.ui.thankyou.popup.animation.none": "بدون",
"section2.ui.thankyou.popup.animation.zoom": "تكبير",
"section2.ui.thankyou.popup.animation.slideUp": "سحب للأعلى",
"section2.ui.thankyou.popup.position": "المكان",
"section2.ui.thankyou.popup.position.center": "وسط",
"section2.ui.thankyou.popup.position.bottom": "أسفل",

"section2.ui.thankyou.editor.title": "المحرر",
"section2.ui.thankyou.editor.hint": "أضف صورة، أيقونة، نص وأزرار مثل Canva",
"section2.ui.thankyou.editor.addBlock": "إضافة عنصر",
"section2.ui.thankyou.editor.block.text": "نص",
"section2.ui.thankyou.editor.block.image": "صورة",
"section2.ui.thankyou.editor.block.icon": "أيقونة",
"section2.ui.thankyou.editor.block.button": "زر",
"section2.ui.thankyou.editor.block.divider": "فاصل",

"section2.ui.thankyou.insert.title": "إدراج",
"section2.ui.thankyou.insert.image": "إدراج صورة",
"section2.ui.thankyou.insert.imageUrl": "رابط الصورة",
"section2.ui.thankyou.insert.iconUrl": "رابط الأيقونة",
"section2.ui.thankyou.insert.linkUrl": "رابط",
"section2.ui.thankyou.insert.shopifyImage": "اختيار صورة من Shopify",

"section2.ui.thankyou.style.title": "التصميم",
"section2.ui.thankyou.style.bg": "الخلفية",
"section2.ui.thankyou.style.textColor": "لون النص",
"section2.ui.thankyou.style.borderColor": "لون الإطار",
"section2.ui.thankyou.style.radius": "تدوير الحواف",
"section2.ui.thankyou.style.shadow": "ظل",
"section2.ui.thankyou.style.padding": "المسافات",
"section2.ui.thankyou.style.align": "المحاذاة",
"section2.ui.thankyou.style.align.left": "يسار",
"section2.ui.thankyou.style.align.center": "وسط",
"section2.ui.thankyou.style.align.right": "يمين",
"section2.ui.thankyou.style.fontSize": "حجم الخط",
"section2.ui.thankyou.style.fontWeight": "سُمك الخط",

"section2.ui.thankyou.palette.title": "لوحات الألوان",
"section2.ui.thankyou.palette.apply": "تطبيق اللوحة",
"section2.ui.thankyou.palette.custom": "ألوان مخصصة",

"section2.ui.thankyou.button.primaryText": "نص الزر الرئيسي",
"section2.ui.thankyou.button.primaryUrl": "رابط الزر الرئيسي",
"section2.ui.thankyou.button.secondaryText": "نص الزر الثانوي",
"section2.ui.thankyou.button.secondaryUrl": "رابط الزر الثانوي",

"section2.ui.thankyou.preview.title": "معاينة صفحة الشكر",
"section2.ui.thankyou.preview.openPopup": "فتح معاينة النافذة",
"section2.ui.thankyou.preview.empty": "لا توجد عناصر بعد. أضف محتوى للبدء."


};

/// ===== Country labels for Section 1 =====

// EN
Object.assign(EN, {
  "countries.MA": "Morocco",
  "countries.DZ": "Algeria",
  "countries.TN": "Tunisia",
  "countries.FR": "France",
  "countries.ES": "Spain",
  "countries.SA": "Saudi Arabia",
  "countries.AE": "United Arab Emirates",
  "countries.EG": "Egypt",
  "countries.US": "United States",
  "countries.NG": "Nigeria",
  "countries.PK": "Pakistan",
  "countries.IN": "India",
  "countries.ID": "Indonesia",
  "countries.TR": "Turkey",
  "countries.BR": "Brazil",
});

// FR
Object.assign(FR, {
  "countries.MA": "Maroc",
  "countries.DZ": "Algérie",
  "countries.TN": "Tunisie",
  "countries.FR": "France",
  "countries.ES": "Espagne",
  "countries.SA": "Arabie Saoudite",
  "countries.AE": "Émirats Arabes Unis",
  "countries.EG": "Égypte",
  "countries.US": "États-Unis",
  "countries.NG": "Nigéria",
  "countries.PK": "Pakistan",
  "countries.IN": "Inde",
  "countries.ID": "Indonésie",
  "countries.TR": "Turquie",
  "countries.BR": "Brésil",
});

// ES
Object.assign(ES, {
  "countries.MA": "Marruecos",
  "countries.DZ": "Argelia",
  "countries.TN": "Túnez",
  "countries.FR": "Francia",
  "countries.ES": "España",
  "countries.SA": "Arabia Saudita",
  "countries.AE": "Emiratos Árabes Unidos",
  "countries.EG": "Egipto",
  "countries.US": "Estados Unidos",
  "countries.NG": "Nigeria",
  "countries.PK": "Pakistán",
  "countries.IN": "India",
  "countries.ID": "Indonesia",
  "countries.TR": "Turquía",
  "countries.BR": "Brasil",
});

// AR / Darija
Object.assign(AR, {
  "countries.MA": "المغرب",
  "countries.DZ": "الجزائر",
  "countries.TN": "تونس",
  "countries.FR": "فرنسا",
  "countries.ES": "إسبانيا",
  "countries.SA": "السعودية",
  "countries.AE": "الإمارات",
  "countries.EG": "مصر",
  "countries.US": "الولايات المتحدة",
  "countries.NG": "نيجيريا",
  "countries.PK": "باكستان",
  "countries.IN": "الهند",
  "countries.ID": "إندونيسيا",
  "countries.TR": "تركيا",
  "countries.BR": "البرازيل",
});

/* ========================================================================
 * Export
 * ===================================================================== */

// Alias pour locales longues
const LOCALE_ALIASES = {
  "en-US": "en",
  "en-GB": "en",
  "fr-FR": "fr",
  "fr-CA": "fr",
  "es-ES": "es",
  "es-MX": "es",
  ar: "ar",
  "ar-SA": "ar",
};

export const DICTIONARIES = {
  en: EN,
  fr: FR,
  es: ES,
  ar: AR,
};

export function resolveLocale(locale) {
  if (!locale) {
    return { code: DEFAULT_LANGUAGE, dict: DICTIONARIES[DEFAULT_LANGUAGE] };
  }

  // 1) alias exact
  const alias = LOCALE_ALIASES[locale];
  if (alias && DICTIONARIES[alias]) return { code: alias, dict: DICTIONARIES[alias] };

  // 2) code complet ou short
  const short = locale.split("-")[0];
  if (DICTIONARIES[locale]) return { code: locale, dict: DICTIONARIES[locale] };
  if (DICTIONARIES[short]) return { code: short, dict: DICTIONARIES[short] };

  // 3) fallback
  return { code: DEFAULT_LANGUAGE, dict: DICTIONARIES[DEFAULT_LANGUAGE] };
}

/**
 * translate(dict, key, vars)   -> ancien usage
 * translate("fr", key, vars)   -> nouveau usage
 */
export function translate(localeOrDict, key, vars) {
  let dict;

  if (typeof localeOrDict === "string") {
    dict = resolveLocale(localeOrDict).dict;
  } else if (localeOrDict && typeof localeOrDict === "object") {
    dict = localeOrDict;
  } else {
    dict = resolveLocale(DEFAULT_LANGUAGE).dict;
  }

  let text = dict[key] ?? key;

  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }

  return text;
}
