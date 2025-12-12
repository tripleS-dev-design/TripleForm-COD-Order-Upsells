// app/components/LanguageSelector.jsx
import { Form } from "@remix-run/react";
import { Select } from "@shopify/polaris";
import { useI18n } from "../i18n/react";

export default function LanguageSelector() {
  const { t, locale } = useI18n();

  const options = [
    { label: "English", value: "en" },
    { label: "Français", value: "fr" },
    { label: "Español", value: "es" },
    { label: "العربية", value: "ar" },
  ];

  return (
    <Form method="post" action="/app/lang" id="lang-form" reloadDocument>
      <Select
        label={t("section0.lang.label")}
        labelHidden
        options={options}
        value={locale || "fr"}
        onChange={(value) => {
          const form = document.getElementById("lang-form");
          const input = form.elements.namedItem("locale");
          input.value = value;
          form.submit();
        }}
      />
      <input type="hidden" name="locale" defaultValue={locale || "fr"} />
    </Form>
  );
}
