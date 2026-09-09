import React, { useState } from 'react';
import {
  Settings,
  Users,
  Bell,
  Shield,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Globe,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, organization } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'alerts'>('general');
  const [orgName, setOrgName] = useState(organization?.name || 'Mon Organisation');
  const [timezone, setTimezone] = useState('Africa/Kinshasa (GMT+1)');
  const [saved, setSaved] = useState(false);

  const [teamMembers, setTeamMembers] = useState([
    {
      id: user?.id || 'usr_1',
      name: user?.name || 'Administrateur',
      email: user?.email || 'admin@entreprise.cd',
      role: 'Owner / Administrateur',
      badge: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
    },
  ]);

  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('developer');

  const [quota80, setQuota80] = useState(true);
  const [quota95, setQuota95] = useState(true);
  const [alertEmail, setAlertEmail] = useState(user?.email || 'alertes@entreprise.cd');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberName) return;

    const newMember = {
      id: 'usr_' + Math.random().toString(36).substring(2, 7),
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole === 'developer' ? 'Développeur' : newMemberRole === 'admin' ? 'Administrateur' : 'Lecteur',
      badge: newMemberRole === 'admin'
        ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
        : 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30',
    };

    setTeamMembers([...teamMembers, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const handleRemoveMember = (id: string) => {
    if (id === user?.id) {
      alert('Vous ne pouvez pas supprimer votre propre compte administrateur.');
      return;
    }
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Paramètres de l'Organisation & Équipe</h2>
          <p className="text-xs text-[#9CA3AF]">
            Configurez votre espace de travail, gérez vos collaborateurs et vos seuils d'alerte.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-xl border border-[#1F2937]">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'general' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Général</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'team' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Équipe ({teamMembers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'alerts' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Alertes Quotas</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl text-xs text-[#10B981] font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Paramètres enregistrés avec succès !</span>
        </div>
      )}

      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6 space-y-5 max-w-2xl">
          <h3 className="text-sm font-bold text-white">Profil de l'Organisation</h3>

          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Nom de l'Organisation</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full bg-[#0B0F19] text-xs text-white px-3.5 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Slug Unique (Identifiant API)</label>
            <input
              type="text"
              disabled
              value={organization?.slug || 'acme-fintech'}
              className="w-full bg-[#0B0F19] text-xs text-[#6B7280] font-mono px-3.5 py-2.5 rounded-lg border border-[#1F2937] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Fuseau Horaire</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-[#0B0F19] text-xs text-white px-3.5 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
            >
              <option value="Africa/Kinshasa (GMT+1)">Africa/Kinshasa (GMT+1)</option>
              <option value="Africa/Lubumbashi (GMT+2)">Africa/Lubumbashi (GMT+2)</option>
              <option value="Europe/Paris (GMT+2)">Europe/Paris (GMT+2)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold text-xs shadow-glow-emerald transition-all"
          >
            Sauvegarder les Modifications
          </button>
        </form>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6 max-w-3xl">
          {/* Add member form */}
          <form onSubmit={handleAddMember} className="bg-[#111827] rounded-2xl border border-[#1F2937] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#10B981]" />
              <span>Inviter un Nouveau Collaborateur</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nom complet"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="bg-[#0B0F19] text-xs text-white px-3 py-2 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                required
              />
              <input
                type="email"
                placeholder="email@entreprise.cd"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="bg-[#0B0F19] text-xs text-white px-3 py-2 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                required
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="bg-[#0B0F19] text-xs text-white px-3 py-2 rounded-lg border border-[#1F2937] focus:outline-none"
              >
                <option value="developer">Développeur (Clés & Logs)</option>
                <option value="admin">Administrateur</option>
                <option value="viewer">Lecteur (Lecture seule)</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-white text-xs font-semibold border border-[#374151] flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Envoyer l'Invitation</span>
            </button>
          </form>

          {/* Members list */}
          <div className="bg-[#111827] rounded-2xl border border-[#1F2937] divide-y divide-[#1F2937] overflow-hidden">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10B981] to-[#06B6D4] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {member.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-white">{member.name}</h4>
                    <p className="text-[11px] text-[#9CA3AF]">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${member.badge}`}>
                    {member.role}
                  </span>
                  {member.id !== user?.id && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                      title="Retirer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6 space-y-5 max-w-2xl">
          <h3 className="text-sm font-bold text-white">Seuils d'Alerte de Consommation</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-[#0B0F19] rounded-xl border border-[#1F2937] cursor-pointer">
              <input
                type="checkbox"
                checked={quota80}
                onChange={(e) => setQuota80(e.target.checked)}
                className="rounded bg-[#111827] border-[#1F2937] text-[#10B981] focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="text-xs font-semibold text-white block">Alerte à 80% du quota mensuel</span>
                <span className="text-[11px] text-[#9CA3AF]">Recommandé pour anticiper les recharges de crédits</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#0B0F19] rounded-xl border border-[#1F2937] cursor-pointer">
              <input
                type="checkbox"
                checked={quota95}
                onChange={(e) => setQuota95(e.target.checked)}
                className="rounded bg-[#111827] border-[#1F2937] text-[#FF6B00] focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="text-xs font-semibold text-white block">Alerte Critique à 95% du quota</span>
                <span className="text-[11px] text-[#9CA3AF]">Alerte urgente par email avant mise en pause de l'ingestion</span>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Email Destinataire des Alertes</label>
            <input
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              className="w-full bg-[#0B0F19] text-xs text-white px-3.5 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveGeneral}
            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-glow-emerald transition-all"
          >
            Enregistrer les Règles d'Alerte
          </button>
        </div>
      )}
    </div>
  );
};
