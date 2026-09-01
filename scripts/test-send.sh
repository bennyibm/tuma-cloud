#!/usr/bin/env bash
# ==============================================================================
# Script de test d'envoi d'email via l'API TUMA
# ==============================================================================

API_URL="http://localhost:3001/v1/emails"
API_KEY="sk_live_test123456789"
IDEMPOTENCY_KEY="idemp_$(date +%s)_$RANDOM"

echo "📬 Envoi d'un email de test vers l'API TUMA..."
echo "Clé d'Idempotence : $IDEMPOTENCY_KEY"

curl -X POST "$API_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Tuma Notifications <notifications@tuma.dev>",
    "to": ["alexandre@example.com"],
    "subject": "🎉 Bienvenue sur TUMA, {{name}} !",
    "html": "<div style=\"font-family: sans-serif; background: #0B0F19; color: #F9FAFB; padding: 32px; border-radius: 12px;\"><h1 style=\"color: #10B981;\">Bienvenue sur TUMA 🚀</h1><p>Bonjour <strong>{{name}}</strong>,</p><p>Votre premier email transactionnel expédié via l infrastructure <strong>TUMA</strong> est un succès total !</p><div style=\"margin: 24px 0;\"><a href=\"https://tuma.dev/dashboard\" style=\"background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;\">Accéder au Dashboard</a></div><hr style=\"border: 1px solid #1F2937; margin-top: 32px;\"/><p style=\"color: #9CA3AF; font-size: 12px;\">TUMA - Email infrastructure for modern developers</p></div>",
    "variables": {
      "name": "Alexandre"
    },
    "tags": [
      { "name": "environment", "value": "development" },
      { "name": "type", "value": "welcome_email" }
    ]
  }'

echo ""
echo "✅ Requête soumise ! Vérifiez la boîte de réception Mailpit sur http://localhost:8025"
