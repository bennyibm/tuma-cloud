import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  X,
  Play,
  Pause,
  Trash2,
  Download,
  Filter,
  Activity,
  Zap,
  CheckCircle2,
  Radio,
  Send,
} from 'lucide-react';
import { api } from '../services/api';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INGEST' | 'QUEUE' | 'DKIM' | 'SMTP' | 'TRACK';
  message: string;
  details?: Record<string, any>;
  color: string;
}

interface LiveTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveTerminalModal: React.FC<LiveTerminalModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [speedPerSec, setSpeedPerSec] = useState(14);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial seed logs & live streaming generator
  useEffect(() => {
    if (!isOpen) return;

    const initialSeed: LogEntry[] = [
      {
        id: 'log_01',
        timestamp: new Date(Date.now() - 6000).toISOString().split('T')[1].slice(0, 12),
        level: 'INGEST',
        message: 'POST /v1/emails HTTP/1.1 202 Accepted • ID: 6a9045a6bc0e26339110bca7',
        color: 'text-[#10B981]',
        details: { latency: '1.8ms', endpoint: '/v1/emails', idempotency: 'HIT' },
      },
      {
        id: 'log_02',
        timestamp: new Date(Date.now() - 5000).toISOString().split('T')[1].slice(0, 12),
        level: 'QUEUE',
        message: 'BullMQ: email-send-job push to Redis 7.2 cluster [Shard-01-Kinshasa]',
        color: 'text-[#06B6D4]',
        details: { queue: 'email-send-queue', priority: 'HIGH', attempts: 1 },
      },
      {
        id: 'log_03',
        timestamp: new Date(Date.now() - 4000).toISOString().split('T')[1].slice(0, 12),
        level: 'DKIM',
        message: 'RSA 2048-bit Signature generated for domain: startup-kinshasa.cd (Selector: tuma1)',
        color: 'text-yellow-400',
        details: { algorithm: 'rsa-sha256', canonicalization: 'relaxed/relaxed' },
      },
      {
        id: 'log_04',
        timestamp: new Date(Date.now() - 3000).toISOString().split('T')[1].slice(0, 12),
        level: 'SMTP',
        message: '250 2.0.0 OK: Message queued 1025 for delivery to Vodacom MX [mx1.vodacom.cd]',
        color: 'text-[#10B981]',
        details: { response: '250 2.0.0 OK', provider: 'Vodacom RDC (M-Pesa)', rtt: '24ms' },
      },
      {
        id: 'log_05',
        timestamp: new Date(Date.now() - 1000).toISOString().split('T')[1].slice(0, 12),
        level: 'TRACK',
        message: 'Pixel Open 1x1 GIF loaded by client User-Agent: Mozilla/5.0 (Android; Mobile)',
        color: 'text-purple-400',
        details: { ip: '197.234.218.42', location: 'Kinshasa Gombe, CD', isp: 'Orange RDC' },
      },
    ];

    setLogs(initialSeed);

    const isps = ['Vodacom RDC', 'Orange RDC', 'Airtel Africa', 'Liquid Telecom', 'Starlink DRC'];
    const levels: LogEntry['level'][] = ['INGEST', 'QUEUE', 'DKIM', 'SMTP', 'TRACK'];

    const interval = setInterval(() => {
      if (isPaused) return;

      const randomIsp = isps[Math.floor(Math.random() * isps.length)];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      const randomId = 'log_' + Math.random().toString(36).substring(2, 7);
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);

      let msg = '';
      let color = 'text-[#10B981]';
      let details: Record<string, any> = {};

      switch (randomLevel) {
        case 'INGEST':
          msg = `POST /v1/emails 202 Accepted • Recipient: ${randomIsp.toLowerCase().replace(' ', '')}@tuma.dev`;
          color = 'text-[#10B981]';
          details = { client: 'SDK-NodeJS-v1.2', status: 202, latencyMs: 1.4 };
          break;
        case 'QUEUE':
          msg = `BullMQ Job Processed on Worker-Thread-#${Math.floor(Math.random() * 4) + 1}`;
          color = 'text-[#06B6D4]';
          details = { memory: '42.1MB', cpu: '0.4%' };
          break;
        case 'DKIM':
          msg = `DKIM Header verified: v=1; a=rsa-sha256; c=relaxed/relaxed; d=tuma.dev; s=tuma1`;
          color = 'text-yellow-400';
          details = { header_bytes: 512, status: 'PASS' };
          break;
        case 'SMTP':
          msg = `TLS 1.3 Handshake completed with ${randomIsp} Gateway • 250 Delivered`;
          color = 'text-[#10B981]';
          details = { cipher: 'TLS_AES_256_GCM_SHA384', rtt: `${Math.floor(Math.random() * 18) + 16}ms` };
          break;
        case 'TRACK':
          msg = `Tracking Pixel fired: Email opened by customer (${randomIsp})`;
          color = 'text-purple-400';
          details = { event: 'open', device: 'Mobile' };
          break;
      }

      const newEntry: LogEntry = {
        id: randomId,
        timestamp,
        level: randomLevel,
        message: msg,
        color,
        details,
      };

      setLogs((prev) => [...prev.slice(-80), newEntry]);
    }, 1800);

    return () => clearInterval(interval);
  }, [isOpen, isPaused]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((l) => selectedFilter === 'ALL' || l.level === selectedFilter);

  const handleTestInject = async () => {
    try {
      await api.sendEmail({
        from: 'Tuma Terminal Stream <stream@tuma.dev>',
        to: ['terminal-debug@startup-kinshasa.cd'],
        subject: '⚡ Test Stream Live Ingestion',
        html: '<h2>Live Stream Test Event</h2>',
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-[#080C14] border border-[#10B981]/40 rounded-2xl shadow-glow-emerald overflow-hidden flex flex-col h-[680px]">
        {/* Top Terminal Bar */}
        <div className="bg-[#0B0F19] border-b border-[#1F2937] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#10B981] inline-block animate-pulse" />
            </div>
            <div className="h-4 w-px bg-[#1F2937]" />
            <div className="flex items-center gap-2 font-mono text-xs">
              <TerminalIcon className="w-4 h-4 text-[#10B981]" />
              <span className="font-bold text-white">tuma-cluster-stream</span>
              <span className="text-[#10B981] text-[11px] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                LIVE SSE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Inject Test Event Button */}
            <button
              type="button"
              onClick={handleTestInject}
              className="px-3 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-xs font-mono text-white border border-[#374151] flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Injecter un Envoi</span>
            </button>

            {/* Pause / Resume */}
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ${
                isPaused
                  ? 'bg-[#10B981] text-white shadow-glow-emerald'
                  : 'bg-[#1F2937] text-[#9CA3AF] hover:text-white border border-[#374151]'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Reprendre' : 'Pause'}</span>
            </button>

            {/* Clear */}
            <button
              type="button"
              onClick={() => setLogs([])}
              className="p-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-[#9CA3AF] hover:text-white border border-[#374151]"
              title="Effacer le flux"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1F2937] hover:bg-red-500/20 text-[#9CA3AF] hover:text-red-400 border border-[#374151]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#0B0F19]/60 px-5 py-2.5 border-b border-[#1F2937] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
            <span className="text-[#6B7280]">Filtrer:</span>
            {['ALL', 'INGEST', 'QUEUE', 'DKIM', 'SMTP', 'TRACK'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFilter(f)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  selectedFilter === f
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#9CA3AF]">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Débit : ~{speedPerSec} msg/sec</span>
            </span>
            <span>Total : {logs.length} events</span>
          </div>
        </div>

        {/* Terminal Log Console */}
        <div
          ref={scrollRef}
          className="flex-1 bg-[#05070B] p-5 overflow-y-auto font-mono text-xs space-y-1.5 selection:bg-[#10B981]/30 selection:text-white"
        >
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="flex items-start gap-3 p-1 rounded hover:bg-[#111827] cursor-pointer group transition-colors"
            >
              <span className="text-[#6B7280] select-none shrink-0">{log.timestamp}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 border ${
                  log.level === 'INGEST'
                    ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                    : log.level === 'QUEUE'
                    ? 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30'
                    : log.level === 'DKIM'
                    ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                    : log.level === 'SMTP'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                }`}
              >
                {log.level}
              </span>
              <span className={`flex-1 break-all ${log.color}`}>{log.message}</span>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="py-24 text-center text-[#6B7280]">Aucun événement pour ce filtre.</div>
          )}
        </div>

        {/* Selected Log JSON Details Drawer Footer */}
        {selectedLog && (
          <div className="bg-[#0B0F19] border-t border-[#1F2937] p-4 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-[#10B981] font-bold">Inspecteur JSON :</span>
              <pre className="text-white text-[11px] bg-[#05070B] px-3 py-1 rounded border border-[#1F2937]">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLog(null)}
              className="text-[#9CA3AF] hover:text-white text-xs underline"
            >
              Fermer l'inspecteur
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
