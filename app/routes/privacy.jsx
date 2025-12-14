import { Page, Layout, TextContainer } from "@shopify/polaris";

export default function PrivacyPolicy() {
  return (
    <Page title="Politique de Confidentialité">
      <Layout>
        <Layout.Section>
          <TextContainer>
            <h2>1. Collecte des informations</h2>
            <p>
              TripleForm COD collecte les informations nécessaires au fonctionnement de l'application :
              données de produits, commandes, et paramètres de configuration.
              Nous ne collectons jamais d'informations personnelles sensibles.
            </p>
            
            <h2>2. Utilisation des informations</h2>
            <p>
              Les informations sont utilisées uniquement pour :
              - Gérer les formulaires COD
              - Afficher les offres complémentaires
              - Synchroniser avec Google Sheets
              - Tracker les conversions via les pixels
            </p>
            
            <h2>3. Protection des données</h2>
            <p>
              Toutes les données sont chiffrées en transit (HTTPS) et au repos.
              Nous ne partageons aucune donnée avec des tiers.
              Les données sont stockées uniquement dans ta base de données PostgreSQL.
            </p>
            
            <h2>4. Droits des utilisateurs</h2>
            <p>
              Tu as le droit de :
              - Accéder à tes données
              - Les modifier
              - Les supprimer
              - Exporter tes données
            </p>
            
            <h2>5. Contact</h2>
            <p>
              Pour toute question sur la confidentialité :
              <br />
              Email : support@tripleform.com
              <br />
              Site : https://tripleform.com
            </p>
          </TextContainer>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
