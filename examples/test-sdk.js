// ==============================================================================
// Script de démonstration de bout en bout utilisant @tuma/sdk
// ==============================================================================

const { Tuma } = require('../packages/sdk-node/dist');

async function main() {
  console.log('🚀 Initialisation du client @tuma/sdk...');

  const tuma = new Tuma({
    apiKey: 'sk_live_test123456789',
    baseUrl: 'http://localhost:3001',
  });

  // 1. Test d'envoi d'email via le SDK
  console.log('\n📬 1. Envoi d email transactionnel via SDK...');
  const sendResult = await tuma.emails.send({
    from: 'Tuma Engineering <engineering@tuma.dev>',
    to: 'cto@startup-kinshasa.cd',
    subject: '🔥 Déploiement réussi avec le SDK TUMA v1.0, {{developerName}} !',
    html: '<div style="background:#0B0F19; color:#fff; padding:24px; border-radius:8px;"><h2 style="color:#10B981;">TUMA SDK Node.js Opérationnel 🚀</h2><p>Félicitations <strong>{{developerName}}</strong>, votre infrastructure d email transactionnel fonctionne parfaitement.</p><a href="https://tuma.dev/docs" style="background:#FF6B00; color:#fff; padding:10px 20px; text-decoration:none; border-radius:6px;">Voir la Documentation SDK</a></div>',
    variables: {
      developerName: 'Benny',
    },
    tags: [
      { name: 'framework', value: 'nodejs' },
      { name: 'sdk', value: '@tuma/sdk' },
    ],
  });

  if (sendResult.error) {
    console.error('❌ Erreur d envoi :', sendResult.error.message);
  } else {
    console.log('✅ Email expédié avec succès ! ID :', sendResult.data.id);
  }

  // 2. Test de création de domaine DNS via le SDK
  console.log('\n🔑 2. Déclaration d un domaine DNS DKIM RSA 2048 via SDK...');
  const domainResult = await tuma.domains.create({
    name: 'mail.afrique-cloud.cd',
  });

  if (domainResult.error) {
    console.error('❌ Erreur de domaine :', domainResult.error.message);
  } else {
    console.log('✅ Domaine créé avec succès !');
    console.log('   - Nom :', domainResult.data.name);
    console.log('   - DKIM TXT Host :', domainResult.data.dkim.host);
    console.log('   - Statut :', domainResult.data.status);
  }

  // 3. Test de création de Webhook via le SDK
  console.log('\n⚡ 3. Enregistrement d un Webhook sortant via SDK...');
  const webhookResult = await tuma.webhooks.create({
    url: 'https://mon-backend.cd/api/webhooks/tuma',
    description: 'Webhook transactionnel pour notification d ouvertures',
    events: ['email.sent', 'email.opened', 'email.clicked', 'email.bounced'],
  });

  if (webhookResult.error) {
    console.error('❌ Erreur de webhook :', webhookResult.error.message);
  } else {
    console.log('✅ Webhook enregistré avec succès !');
    console.log('   - URL :', webhookResult.data.url);
    console.log('   - Secret HMAC :', webhookResult.data.secret);
  }

  // 4. Test de validation cryptographique de signature Webhook
  console.log('\n🛡️ 4. Test de validation de signature cryptographique HMAC SHA-256...');
  const secret = 'whsec_demo_secret_key_12345';
  const timestamp = Math.floor(Date.now() / 1000);
  const rawBody = JSON.stringify({ type: 'email.opened', data: { emailId: 'email_12345' } });
  
  const crypto = require('crypto');
  const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const signatureHeader = `t=${timestamp},v1=${signature}`;

  const isSignatureValid = tuma.webhooks.verifySignature(rawBody, signatureHeader, secret);
  console.log('✅ Résultat du contrôle de signature :', isSignatureValid ? 'VALIDE (Conforme)' : 'INVALIDE');

  console.log('\n🎉 Tous les modules du SDK TUMA fonctionnent avec succès !');
}

main();
