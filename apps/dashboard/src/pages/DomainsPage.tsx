import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  X,
  Trash2,
} from 'lucide-react';
import { api, DomainRecord } from '../services/api';

export const DomainsPage: React.FC = () => {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');

  const fetchDomains = async () => {
    setLoading(true);
    const data = await api.getDomains();
    setDomains(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleVerify = async (domainId: string) => {
    setVerifyingId(domainId);
    try {
      await api.verifyDomain(domainId);
      await fetchDomains();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName) return;

    try {
      await api.createDomain(newDomainName);
      setNewDomainName('');
      setShowAddModal(false);
      fetchDomains();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteDomain = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le domaine ${name} ?`)) return;
    try {
      await api.deleteDomain(id);
      fetchDomains();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Domaines d'Expédition & Cryptographie DNS</h2>
          <p className="text-xs text-[#9CA3AF]">
            Configurez vos clés DKIM RSA 2048, SPF et DMARC pour une délivrabilité maximale (100% Inbox).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDomains}
            className="p-2 rounded-xl bg-[#111827] hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white border border-[#1F2937]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold text-xs shadow-glow-emerald flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Domaine</span>
          </button>
        </div>
      </div>

      {/* Domains List */}
      <div className="space-y-6">
        {domains.map((domain) => (
          <div
            key={domain._id}
            className="bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden space-y-4 p-6"
          >
            {/* Domain Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1F2937]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B0F19] border border-[#1F2937] flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{domain.name}</span>
                    {domain.status === 'verified' ? (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Certifié 100% Inbox
                      </span>
                    ) : (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> En attente de propagation DNS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    {domain.verifiedAt
                      ? `Vérifié le ${new Date(domain.verifiedAt).toLocaleDateString()} à ${new Date(domain.verifiedAt).toLocaleTimeString()}`
                      : 'Enregistrements à ajouter chez votre hébergeur DNS (Cloudflare, GoDaddy, OVH, LWS)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleVerify(domain._id)}
                  disabled={verifyingId === domain._id || domain.status === 'verified'}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    domain.status === 'verified'
                      ? 'bg-[#1F2937] text-[#9CA3AF] cursor-default'
                      : 'bg-[#10B981] hover:bg-[#059669] text-white shadow-glow-emerald'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${verifyingId === domain._id ? 'animate-spin' : ''}`} />
                  <span>{domain.status === 'verified' ? 'Domaine Vérifié' : 'Vérifier le DNS'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDomain(domain._id, domain.name)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                  title="Supprimer ce domaine"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* DNS Records */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Enregistrements DNS Requis (3 entrées)
              </h4>

              <div className="space-y-2">
                {/* 1. DKIM */}
                <div className="bg-[#0B0F19] rounded-lg p-3 border border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-[#1F2937] text-white font-mono font-bold">
                      TXT
                    </span>
                    <div>
                      <div className="font-semibold text-white">DKIM (Signature RSA 2048)</div>
                      <div className="text-[#9CA3AF] font-mono text-[11px] truncate max-w-sm">
                        {domain.dkim?.host}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#111827] px-3 py-1.5 rounded border border-[#1F2937] font-mono text-[11px] text-[#D1D5DB] truncate max-w-xs">
                      {domain.dkim?.value}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(domain.dkim?.value, `dkim-${domain._id}`)}
                      className="p-1.5 bg-[#1F2937] hover:bg-[#374151] rounded text-[#9CA3AF] hover:text-white"
                    >
                      {copiedKey === `dkim-${domain._id}` ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 2. SPF */}
                <div className="bg-[#0B0F19] rounded-lg p-3 border border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-[#1F2937] text-white font-mono font-bold">
                      CNAME
                    </span>
                    <div>
                      <div className="font-semibold text-white">SPF (Return-Path)</div>
                      <div className="text-[#9CA3AF] font-mono text-[11px]">{domain.spf?.host}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#111827] px-3 py-1.5 rounded border border-[#1F2937] font-mono text-[11px] text-[#D1D5DB]">
                      {domain.spf?.value}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(domain.spf?.value, `spf-${domain._id}`)}
                      className="p-1.5 bg-[#1F2937] hover:bg-[#374151] rounded text-[#9CA3AF] hover:text-white"
                    >
                      {copiedKey === `spf-${domain._id}` ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 3. DMARC */}
                <div className="bg-[#0B0F19] rounded-lg p-3 border border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-[#1F2937] text-white font-mono font-bold">
                      TXT
                    </span>
                    <div>
                      <div className="font-semibold text-white">DMARC (Anti-Spoofing)</div>
                      <div className="text-[#9CA3AF] font-mono text-[11px]">{domain.dmarc?.host}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#111827] px-3 py-1.5 rounded border border-[#1F2937] font-mono text-[11px] text-[#D1D5DB]">
                      {domain.dmarc?.value}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(domain.dmarc?.value, `dmarc-${domain._id}`)}
                      className="p-1.5 bg-[#1F2937] hover:bg-[#374151] rounded text-[#9CA3AF] hover:text-white"
                    >
                      {copiedKey === `dmarc-${domain._id}` ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {domains.length === 0 && (
          <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mx-auto border border-[#10B981]/30">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-sm">Aucun domaine configuré</h3>
            <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
              Ajoutez votre domaine d'envoi pour générer vos clés cryptographiques DKIM RSA 2048, SPF et DMARC.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-colors"
            >
              + Ajouter votre premier domaine
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Ajouter un Domaine</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
                  Nom du Domaine (FQDN)
                </label>
                <input
                  type="text"
                  placeholder="mail.entreprise.cd"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  className="w-full bg-[#0B0F19] text-xs text-white px-3.5 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                  required
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
                  Générer Clés DKIM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
