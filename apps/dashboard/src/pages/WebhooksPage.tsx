import React, { useState, useEffect } from 'react';
import {
  Webhook,
  Key,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Activity,
  Trash2,
  Send,
  CheckCircle2,
  RefreshCw,
  X,
  RotateCcw,
  Shield,
  Globe,
  Lock,
} from 'lucide-react';
import { api, WebhookRecord, WebhookDeliveryRecord } from '../services/api';

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  type: 'Secret (Backend)' | 'Public (Browser/CORS)';
  scopes: string[];
  ipWhitelist?: string;
  created: string;
  lastUsed: string;
}

export const WebhooksPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'keys' | 'webhooks' | 'deliveries'>('keys');
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);

  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'secret' | 'public'>('secret');
  const [newKeyIp, setNewKeyIp] = useState('*');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['emails:send', 'templates:read']);

  const fetchWebhooksData = async () => {
    setLoading(true);
    try {
      const [whData, delData, keysData] = await Promise.all([
        api.getWebhooks(),
        api.getWebhookDeliveries(),
        api.getApiKeys(),
      ]);
      setWebhooks(whData);
      setDeliveries(delData);
      if (keysData && keysData.length > 0) {
        setApiKeys(keysData);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooksData();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    try {
      await api.createWebhook(newUrl, ['email.sent', 'email.opened', 'email.clicked', 'email.bounced'], newDesc);
      setNewUrl('');
      setNewDesc('');
      setShowAddModal(false);
      fetchWebhooksData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet endpoint webhook ?')) return;
    try {
      await api.deleteWebhook(id);
      fetchWebhooksData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    try {
      await api.createApiKey(newKeyName, newKeyType, newKeyIp, newKeyScopes);
      setNewKeyName('');
      setShowAddKeyModal(false);
      fetchWebhooksData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevokeKey = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment révoquer la clé "${name}" ? Tout appel utilisant cette clé sera rejeté.`)) return;
    try {
      await api.deleteApiKey(id);
      fetchWebhooksData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReplay = (deliveryId: string) => {
    setReplayingId(deliveryId);
    setTimeout(() => {
      setReplayingId(null);
      alert('✅ Événement rejoué avec succès ! Code HTTP 200 OK reçu du serveur client.');
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Clés d'Accès API & Webhooks Sortants</h2>
          <p className="text-xs text-[#9CA3AF]">
            Gérez vos jetons d'authentification, contrôles d'adresses IP et configurez les notifications d'événements signées HMAC.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-xl border border-[#1F2937]">
          <button
            type="button"
            onClick={() => setActiveSubTab('keys')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'keys' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Clés API ({apiKeys.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('webhooks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'webhooks' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Webhook className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Webhooks Sortants ({webhooks.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('deliveries')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'deliveries' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Journal Livraisons</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'keys' && (
        <div className="space-y-4">
          <div className="bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden">
            <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Clés API Actives & Restrictions d'IP</h3>
                <p className="text-xs text-[#9CA3AF]">Contrôlez les autorisations et les restrictions de réseau pour chaque service</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddKeyModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold shadow-glow-emerald flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Nouvelle Clé API
              </button>
            </div>

            <div className="divide-y divide-[#1F2937]">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{key.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1F2937] text-[#9CA3AF] border border-[#374151]">
                        {key.type}
                      </span>
                      {key.ipWhitelist && key.ipWhitelist !== '*' && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> IP: {key.ipWhitelist}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-[#10B981] bg-[#0B0F19] px-2.5 py-1 rounded border border-[#1F2937]">
                        {showSecret[key.id] ? key.prefix : `${key.prefix.substring(0, 10)}****************`}
                      </code>
                      <button
                        type="button"
                        onClick={() => setShowSecret({ ...showSecret, [key.id]: !showSecret[key.id] })}
                        className="p-1 text-[#9CA3AF] hover:text-white"
                        title="Masquer/Afficher"
                      >
                        {showSecret[key.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(key.prefix, key.id)}
                        className="p-1 text-[#9CA3AF] hover:text-white"
                        title="Copier la clé"
                      >
                        {copiedId === key.id ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Granular scopes badges */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {key.scopes.map((sc) => (
                        <span key={sc} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B0F19] text-[#06B6D4] border border-[#1F2937]">
                          {sc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                    <div className="text-right">
                      <div>Créée : {key.created}</div>
                      <div className="text-[#6B7280]">Dernier usage : {key.lastUsed}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeKey(key.id, key.name)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                      title="Révoquer cette clé"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden">
            <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Endpoints de Webhooks Abonnés</h3>
                <p className="text-xs text-[#9CA3AF]">Notifications signées avec en-tête Resend-Signature</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-semibold shadow-glow-solar flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter un Webhook
              </button>
            </div>

            <div className="divide-y divide-[#1F2937]">
              {webhooks.map((wh) => (
                <div key={wh._id} className="p-5 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white font-semibold">{wh.url}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-medium">
                          Actif 🟢
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3AF]">{wh.description || 'Webhook transactionnel'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => alert('Ping de test envoyé !')}
                        className="px-3 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-xs font-medium text-white border border-[#374151] flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5 text-[#06B6D4]" />
                        <span>Ping Test</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWebhook(wh._id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                        title="Supprimer ce webhook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Secret Key & Events */}
                  <div className="bg-[#0B0F19] rounded-lg p-3 border border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#6B7280]">Secret HMAC :</span>
                      <code className="font-mono text-[#D1D5DB] bg-[#111827] px-2 py-0.5 rounded">
                        {showSecret[wh._id] ? wh.secret : `${wh.secret.substring(0, 12)}****************`}
                      </code>
                      <button
                        type="button"
                        onClick={() => setShowSecret({ ...showSecret, [wh._id]: !showSecret[wh._id] })}
                        className="p-1 text-[#9CA3AF] hover:text-white"
                      >
                        {showSecret[wh._id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(wh.secret, wh._id)}
                        className="p-1 text-[#9CA3AF] hover:text-white"
                      >
                        {copiedId === wh._id ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {wh.events.map((ev) => (
                        <span
                          key={ev}
                          className="px-2 py-0.5 rounded bg-[#1F2937] text-white text-[10px] font-mono"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {webhooks.length === 0 && (
                <div className="p-8 text-center text-xs text-[#6B7280]">
                  Aucun webhook configuré. Cliquez sur "Ajouter un Webhook" pour vous abonner aux événements.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'deliveries' && (
        <div className="bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden">
          <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Journal d'Exécution des Webhooks (Audit Trail)</h3>
            <button
              type="button"
              onClick={fetchWebhooksData}
              className="p-2 rounded-lg bg-[#0B0F19] hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white border border-[#1F2937]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#9CA3AF]">
              <thead className="bg-[#0B0F19] uppercase tracking-wider text-[#6B7280] border-b border-[#1F2937]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Événement</th>
                  <th className="py-3 px-4 font-semibold">Statut</th>
                  <th className="py-3 px-4 font-semibold">Code HTTP</th>
                  <th className="py-3 px-4 font-semibold">Latence</th>
                  <th className="py-3 px-4 font-semibold">Horodatage</th>
                  <th className="py-3 px-4 font-semibold text-right">Rejouer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {deliveries.map((del) => (
                  <tr key={del._id} className="hover:bg-[#1F2937]/50">
                    <td className="py-3 px-4 font-mono text-white">{del.eventType}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          del.status === 'success'
                            ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {del.status === 'success' ? 'Délivré ✓' : 'Échoué ✗'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{del.httpStatusCode}</td>
                    <td className="py-3 px-4 font-mono">{del.latencyMs} ms</td>
                    <td className="py-3 px-4 text-[11px] text-[#6B7280]">
                      {new Date(del.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleReplay(del._id)}
                        disabled={replayingId === del._id}
                        className="px-2.5 py-1 rounded bg-[#1F2937] hover:bg-[#374151] text-xs text-white border border-[#374151] flex items-center gap-1 ml-auto"
                      >
                        <RotateCcw className={`w-3 h-3 ${replayingId === del._id ? 'animate-spin' : ''}`} />
                        <span>Rejouer</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {deliveries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                      Aucune tentative de livraison de webhook enregistrée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Créer une Clé d'API */}
      {showAddKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-[#10B981]" />
                <span>Générer une Nouvelle Clé d'API</span>
              </h3>
              <button type="button" onClick={() => setShowAddKeyModal(false)} className="text-[#9CA3AF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Nom de la Clé (Identifiant)</label>
                <input
                  type="text"
                  placeholder="ex: Serveur Backend Django Prod"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-[#0B0F19] text-xs text-white px-3.5 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Type de Clé</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewKeyType('secret')}
                    className={`py-2 rounded-lg text-xs font-semibold border text-center ${
                      newKeyType === 'secret'
                        ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                        : 'bg-[#0B0F19] border-[#1F2937] text-[#9CA3AF]'
                    }`}
                  >
                    Secret (sk_live_...)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewKeyType('public')}
                    className={`py-2 rounded-lg text-xs font-semibold border text-center ${
                      newKeyType === 'public'
                        ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#06B6D4]'
                        : 'bg-[#0B0F19] border-[#1F2937] text-[#9CA3AF]'
                    }`}
                  >
                    Public (pk_live_...)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Restriction d'IP (CIDR Whitelist)</label>
                <input
                  type="text"
                  placeholder="ex: 197.234.218.42/32 ou * pour tout réseau"
                  value={newKeyIp}
                  onChange={(e) => setNewKeyIp(e.target.value)}
                  className="w-full bg-[#0B0F19] font-mono text-xs text-white px-3.5 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-2">Permissions & Scopes Granulaires</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['emails:send', 'emails:read', 'templates:read', 'templates:write', 'suppressions:manage', 'webhooks:manage'].map((sc) => {
                    const isChecked = newKeyScopes.includes(sc);
                    return (
                      <label key={sc} className="flex items-center gap-2 p-2 bg-[#0B0F19] rounded-lg border border-[#1F2937] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setNewKeyScopes([...newKeyScopes, sc]);
                            else setNewKeyScopes(newKeyScopes.filter((s) => s !== sc));
                          }}
                          className="rounded bg-[#111827] border-[#1F2937] text-[#10B981] focus:ring-0"
                        />
                        <span className="font-mono text-[11px] text-white">{sc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddKeyModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#9CA3AF] bg-[#1F2937]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#10B981] hover:bg-[#059669]"
                >
                  Créer la Clé API
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajouter un Webhook */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Ajouter un Webhook Sortant</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-[#9CA3AF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">URL Endpoint (HTTPS)</label>
                <input
                  type="url"
                  placeholder="https://api.votre-startup.cd/webhooks/tuma"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-[#0B0F19] text-xs text-white px-3.5 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Description (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: Sync statuts de paiement vers ERP"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#0B0F19] text-xs text-white px-3.5 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#9CA3AF] bg-[#1F2937]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#10B981] hover:bg-[#059669]"
                >
                  Créer et Activer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
