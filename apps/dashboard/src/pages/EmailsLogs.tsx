import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Eye,
  MousePointer,
  Send,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code,
  Download,
} from 'lucide-react';
import { api, EmailRecord } from '../services/api';

export const EmailsLogs: React.FC = () => {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    const data = await api.getEmails();
    setEmails(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 5000); // Polling toutes les 5s
    return () => clearInterval(interval);
  }, []);

  const filteredEmails = emails.filter((email) => {
    const toStr = Array.isArray(email.to) ? email.to.join(' ') : email.to;
    const matchesSearch =
      toStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email._id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'clicked':
        return (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 font-medium">
            Cliqué
          </span>
        );
      case 'opened':
        return (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 font-medium">
            Ouvert
          </span>
        );
      case 'delivered':
      case 'sent':
        return (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-medium">
            Délivré
          </span>
        );
      case 'failed':
        return (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-medium">
            Échoué
          </span>
        );
      default:
        return (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gray-700 text-gray-300 font-medium capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-[#111827] rounded-xl p-4 border border-[#1F2937] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par email, sujet ou ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0F19] text-xs text-white placeholder-[#6B7280] pl-9 pr-4 py-2 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-[#1F2937] text-xs">
            {['all', 'sent', 'opened', 'clicked', 'failed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                  statusFilter === st ? 'bg-[#1F2937] text-white' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                {st === 'all'
                  ? 'Tous'
                  : st === 'sent'
                  ? 'Délivrés'
                  : st === 'opened'
                  ? 'Ouverts'
                  : st === 'clicked'
                  ? 'Cliqués'
                  : 'Échoués'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchEmails}
            className="p-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-[#9CA3AF] hover:text-white border border-[#374151] transition-colors"
            title="Rafraîchir les logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (emails.length === 0) {
                alert('Aucun log à exporter.');
                return;
              }
              const headers = ['ID', 'Destinataires', 'Expéditeur', 'Sujet', 'Statut', 'Ouvertures', 'Clics', 'Date'];
              const rows = filteredEmails.map((e) => [
                e._id,
                Array.isArray(e.to) ? e.to.join(';') : e.to,
                e.from,
                `"${(e.subject || '').replace(/"/g, '""')}"`,
                e.status,
                e.tracking?.opens || 0,
                e.tracking?.clicks || 0,
                e.createdAt || new Date().toISOString(),
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `tuma-emails-export-${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3 py-2 rounded-lg bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] font-semibold text-xs border border-[#10B981]/30 transition-colors flex items-center gap-1.5"
            title="Télécharger l'historique complet en CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Emails Table */}
      <div className="bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#9CA3AF]">
            <thead className="bg-[#0B0F19] uppercase tracking-wider text-[#6B7280] border-b border-[#1F2937]">
              <tr>
                <th className="py-3 px-4 font-semibold">Destinataire</th>
                <th className="py-3 px-4 font-semibold">Sujet</th>
                <th className="py-3 px-4 font-semibold text-center">Télémétrie</th>
                <th className="py-3 px-4 font-semibold">Statut</th>
                <th className="py-3 px-4 font-semibold">Horodatage</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {filteredEmails.map((email) => (
                <tr
                  key={email._id}
                  onClick={() => setSelectedEmail(email)}
                  className="hover:bg-[#1F2937]/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">
                      {Array.isArray(email.to) ? email.to.join(', ') : email.to}
                    </div>
                    <div className="text-[10px] text-[#6B7280] font-mono">{email._id}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-white">{email.subject}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-[#FF6B00]" title="Ouvertures">
                        <Eye className="w-3.5 h-3.5" /> {email.tracking?.opens || 0}
                      </span>
                      <span className="flex items-center gap-1 text-purple-400" title="Clics">
                        <MousePointer className="w-3.5 h-3.5" /> {email.tracking?.clicks || 0}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(email.status)}</td>
                  <td className="py-3 px-4 text-[11px] text-[#9CA3AF]">
                    {new Date(email.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmail(email);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-[#1F2937] hover:bg-[#374151] text-white rounded border border-[#374151] transition-colors"
                    >
                      Inspecter
                    </button>
                  </td>
                </tr>
              ))}

              {filteredEmails.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#6B7280]">
                    {loading ? 'Chargement des emails en direct...' : 'Aucun email trouvé.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Inspector Drawer */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0B0F19] border-l border-[#1F2937] h-full overflow-y-auto p-6 space-y-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Détail de l'Email</span>
                  {getStatusBadge(selectedEmail.status)}
                </h3>
                <p className="text-xs text-[#9CA3AF] font-mono mt-0.5">{selectedEmail._id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white border border-[#1F2937]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lifecycle Timeline */}
            <div className="bg-[#111827] rounded-xl p-4 border border-[#1F2937] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Timeline du Cycle de Vie
              </h4>
              <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1F2937]">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-4 h-4 rounded-full bg-[#10B981] flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </div>
                  <div className="text-xs">
                    <span className="text-white font-medium">Ingéré & Expédié SMTP</span>
                    <span className="text-[#6B7280] ml-2 font-mono">
                      {new Date(selectedEmail.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {selectedEmail.tracking?.firstOpenedAt && (
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-[#FF6B00] flex items-center justify-center text-[10px] text-white font-bold">
                      <Eye className="w-2.5 h-2.5" />
                    </div>
                    <div className="text-xs">
                      <span className="text-white font-medium">Pixel Ouvert (1x1 GIF)</span>
                      <span className="text-[#6B7280] ml-2 font-mono">
                        {new Date(selectedEmail.tracking.firstOpenedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )}

                {selectedEmail.tracking?.lastClickedAt && (
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                      <MousePointer className="w-2.5 h-2.5" />
                    </div>
                    <div className="text-xs">
                      <span className="text-white font-medium">Lien Cliqué (Proxy 302)</span>
                      <span className="text-[#6B7280] ml-2 font-mono">
                        {new Date(selectedEmail.tracking.lastClickedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Email Metadata */}
            <div className="bg-[#111827] rounded-xl p-4 border border-[#1F2937] space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-[#6B7280]">De :</span>
                <span className="text-white col-span-2 font-medium">{selectedEmail.from}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-[#6B7280]">À :</span>
                <span className="text-white col-span-2 font-medium">
                  {Array.isArray(selectedEmail.to) ? selectedEmail.to.join(', ') : selectedEmail.to}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-[#6B7280]">Objet :</span>
                <span className="text-white col-span-2">{selectedEmail.subject}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-[#6B7280]">Message ID :</span>
                <span className="text-[#10B981] font-mono col-span-2 truncate">
                  {selectedEmail.providerMessageId || 'N/A'}
                </span>
              </div>
            </div>

            {/* HTML Render Preview */}
            {selectedEmail.html && (
              <div className="bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden space-y-2">
                <div className="p-3 bg-[#0B0F19] border-b border-[#1F2937] flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Rendu HTML</span>
                  <span className="text-[10px] text-[#10B981] font-mono">Prévisualisation Sécurisée</span>
                </div>
                <div
                  className="p-4 text-white text-xs"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
