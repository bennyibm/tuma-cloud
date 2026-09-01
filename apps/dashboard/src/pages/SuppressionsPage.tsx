import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  ShieldCheck,
} from 'lucide-react';
import { api, SuppressionRecord } from '../services/api';

export const SuppressionsPage: React.FC = () => {
  const [suppressions, setSuppressions] = useState<SuppressionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newReason, setNewReason] = useState('manual_block');

  const fetchSuppressions = async () => {
    setLoading(true);
    const data = await api.getSuppressions();
    setSuppressions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppressions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    try {
      await api.addSuppression(newEmail, newReason);
      setNewEmail('');
      setShowAddModal(false);
      fetchSuppressions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Voulez-vous vraiment débloquer cette adresse email ?')) return;
    try {
      await api.removeSuppression(id);
      fetchSuppressions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = suppressions.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'hard_bounce':
        return (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-medium">
            Hard Bounce
          </span>
        );
      case 'spam_complaint':
        return (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 font-medium">
            Plainte Spam
          </span>
        );
      case 'unsubscribe':
        return (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium">
            Désinscription
          </span>
        );
      default:
        return (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 font-medium">
            Blocage Manuel
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Liste de Suppression & Rebonds</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
              Shield O(1)
            </span>
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Protégez votre réputation d'expéditeur : TUMA bloque instantanément les adresses en hard bounce ou plainte spam.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold text-xs shadow-glow-emerald flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Bloquer une Adresse</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827] rounded-xl p-4 border border-[#1F2937] flex items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher une adresse bloquée..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0F19] text-xs text-white placeholder-[#6B7280] pl-9 pr-4 py-2 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
          />
        </div>

        <button
          type="button"
          onClick={fetchSuppressions}
          className="p-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-[#9CA3AF] hover:text-white border border-[#374151] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden">
        <table className="w-full text-left text-xs text-[#9CA3AF]">
          <thead className="bg-[#0B0F19] uppercase tracking-wider text-[#6B7280] border-b border-[#1F2937]">
            <tr>
              <th className="py-3 px-4 font-semibold">Email Bloqué</th>
              <th className="py-3 px-4 font-semibold">Motif du Blocage</th>
              <th className="py-3 px-4 font-semibold">Date d'Ajout</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {filtered.map((s) => (
              <tr key={s._id} className="hover:bg-[#1F2937]/50 transition-colors">
                <td className="py-3 px-4 font-medium text-white">{s.email}</td>
                <td className="py-3 px-4">{getReasonBadge(s.reason)}</td>
                <td className="py-3 px-4 text-[#9CA3AF]">
                  {new Date(s.createdAt).toLocaleDateString()} à {new Date(s.createdAt).toLocaleTimeString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemove(s._id)}
                    className="px-2.5 py-1 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 transition-colors flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Débloquer</span>
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-xs text-[#6B7280]">
                  {loading ? 'Chargement...' : 'Aucune adresse dans la liste de suppression. Votre réputation est intacte ! 🛡️'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Ajouter à la Liste de Suppression</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Email à Bloquer</label>
                <input
                  type="email"
                  placeholder="spam@domaine.cd"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#0B0F19] text-xs text-white px-3 py-2 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Motif</label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full bg-[#0B0F19] text-xs text-white px-3 py-2 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                >
                  <option value="manual_block">Blocage Manuel</option>
                  <option value="hard_bounce">Hard Bounce (Boîte Inexistante)</option>
                  <option value="spam_complaint">Plainte Spam</option>
                  <option value="unsubscribe">Désinscription Client</option>
                </select>
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
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700"
                >
                  Bloquer l'Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
