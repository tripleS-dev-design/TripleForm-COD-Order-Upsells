export default function DataDeletionPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Demande de Suppression des Données Personnelles</h1>
      <p>
        Conformément au RGPD, vous avez le droit de demander la suppression des données personnelles associées à votre boutique Shopify que notre application a collectées.
      </p>
      
      <h2>Procédure de demande</h2>
      <p>
        Pour demander la suppression de vos données, veuillez nous envoyer un email à l'adresse suivante :<br />
        <strong>ktami.sami@icloud.com</strong>
      </p>
      <p>
        Veuillez inclure dans votre demande :<br />
        - Le nom de votre boutique Shopify<br />
        - L'adresse email associée à votre compte
      </p>
      
      <h2>Données concernées</h2>
      <p>La suppression portera sur toutes les données stockées par notre service pour votre boutique, y compris :</p>
      <ul>
        <li>Les paramètres de configuration de l'application</li>
        <li>Les identifiants et configurations WhatsApp (le cas échéant)</li>
        <li>L'historique des messages et des commandes synchronisées</li>
        <li>Toute autre métadonnée associée</li>
      </ul>
      
      <h2>Délai de traitement</h2>
      <p>
        Nous nous engageons à traiter votre demande dans un délai maximum de <strong>30 jours</strong> après réception et vérification de votre identité.
      </p>
      
      <p><em>Dernière mise à jour : Décembre 2024</em></p>
    </div>
  );
}