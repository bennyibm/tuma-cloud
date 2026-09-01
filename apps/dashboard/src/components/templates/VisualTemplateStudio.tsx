import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Send,
  Monitor,
  Smartphone,
  Code,
  Layout,
  Plus,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  GripVertical,
  Check,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Heading,
  AlignLeft,
  AlignCenter,
  AlignRight,
  SquareCheck,
  Key,
  CreditCard,
  Image as ImageIcon,
  Minus,
  Layers,
  Palette,
  Eye,
  Upload,
  Link as LinkIcon,
  Sliders,
  Type,
  FolderOpen,
  Maximize2,
  AlertTriangle,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';

export interface TemplateBlock {
  id: string;
  type: 'header' | 'hero' | 'text' | 'image' | 'button' | 'receipt' | 'otp' | 'callout' | 'divider' | 'footer';
  content: Record<string, any>;
}

export interface TemplateData {
  id?: string;
  name: string;
  slug: string;
  category: string;
  subject: string;
  backgroundColor?: string;
  blocks: TemplateBlock[];
  testVariables: Record<string, any>;
}

interface VisualTemplateStudioProps {
  initialData: TemplateData;
  onBack: () => void;
  onSave: (data: TemplateData) => void;
}

const STOCK_MEDIA_ASSETS = [
  { label: 'Logo Officiel TUMA', url: '/tuma-icon.jpg' },
  { label: 'Wordmark Lockup TUMA', url: '/tuma-lockup.jpg' },
  { label: 'Origami Supersonique TUMA', url: '/tuma-origami.jpg' },
  { label: 'Badge Mobile Money (M-Pesa)', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80' },
  { label: 'Bannière FinTech Kinshasa', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80' },
];

export const VisualTemplateStudio: React.FC<VisualTemplateStudioProps> = ({
  initialData,
  onBack,
  onSave,
}) => {
  const [template, setTemplate] = useState<TemplateData>({
    ...initialData,
    backgroundColor: initialData.backgroundColor || '#0B0F19',
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    initialData.blocks.length > 0 ? initialData.blocks[0].id : null,
  );
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [rawHtmlCode, setRawHtmlCode] = useState('');
  const [isTestSending, setIsTestSending] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showSpamDetails, setShowSpamDetails] = useState(false);

  // Évaluation Anti-Spam IA & Délivrabilité en temps réel
  const calculateSpamScore = () => {
    let score = 100;
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const fullText = (
      template.subject +
      ' ' +
      template.blocks.map((b) => JSON.stringify(b.content)).join(' ')
    ).toLowerCase();

    // 1. Mots déclencheurs de filtres anti-spam
    const spamWords = ['urgent', 'gratuit', '100% gratuit', 'gagner', 'loterie', 'cliquez ici', 'viagra', 'gagnez vite', 'argent facile'];
    spamWords.forEach((word) => {
      if (fullText.includes(word)) {
        score -= 15;
        warnings.push(`Mot sensible détecté : "${word}"`);
      }
    });

    // 2. Lien de désabonnement légal (obligatoire Inbox)
    const hasFooter = template.blocks.some((b) => b.type === 'footer');
    if (!hasFooter) {
      score -= 20;
      warnings.push('Absence de bloc Pied de Page avec lien de désabonnement légal.');
      suggestions.push('Ajoutez un bloc Footer pour éviter un signalement en spam par Gmail / Outlook.');
    }

    // 3. Présence du logo de marque
    const hasLogo = template.blocks.some((b) => b.type === 'header' && b.content.logoUrl);
    if (!hasLogo) {
      score -= 5;
      suggestions.push('Ajoutez un logo de marque en en-tête pour renforcer l identité visuelle.');
    }

    // 4. Longueur du sujet
    if (template.subject.length < 10) {
      score -= 10;
      warnings.push('Objet trop court (moins de 10 caractères).');
    } else if (template.subject.length > 70) {
      score -= 5;
      warnings.push('Objet un peu long (risque de troncature sur smartphones).');
    }

    const finalScore = Math.max(0, Math.min(100, score));
    return {
      score: finalScore,
      rating: finalScore >= 90 ? 'Délivrabilité Optimale' : finalScore >= 70 ? 'Bonne Délivrabilité' : 'Risque de Spam Élevé',
      color: finalScore >= 90 ? '#10B981' : finalScore >= 70 ? '#FF6B00' : '#EF4444',
      bg: finalScore >= 90 ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' : finalScore >= 70 ? 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30' : 'bg-red-500/15 text-red-400 border-red-500/30',
      warnings,
      suggestions,
    };
  };

  const spamAnalysis = calculateSpamScore();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedCanvasIndex, setDraggedCanvasIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected block
  const selectedIndex = template.blocks.findIndex((b) => b.id === selectedBlockId);
  const selectedBlock = selectedIndex !== -1 ? template.blocks[selectedIndex] : null;

  // Compile blocks to clean, email-safe HTML
  const compileBlocksToHtml = (blocks: TemplateBlock[], bg = '#0B0F19') => {
    let bodyHtml = '';

    blocks.forEach((block) => {
      switch (block.type) {
        case 'header':
          bodyHtml += `
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="${block.content.logoUrl || '/tuma-icon.jpg'}" alt="Logo" style="width: ${
            block.content.logoSize || '48'
          }px; height: ${
            block.content.logoSize || '48'
          }px; border-radius: 12px; display: inline-block; margin-bottom: 10px; object-fit: cover;" />
              <div style="font-size: 15px; font-weight: 800; color: #ffffff; letter-spacing: -0.01em;">${
                block.content.brandName || 'TUMA'
              }</div>
              ${
                block.content.badgeText
                  ? `<div style="display: inline-block; margin-top: 8px; background: rgba(16, 185, 129, 0.15); border: 1px solid ${
                      block.content.badgeColor || '#10B981'
                    }; color: ${
                      block.content.badgeColor || '#10B981'
                    }; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 9999px;">${
                      block.content.badgeText
                    }</div>`
                  : ''
              }
            </div>
          `;
          break;

        case 'image':
          bodyHtml += `
            <div style="text-align: ${block.content.align || 'center'}; margin: 20px 0;">
              ${
                block.content.linkUrl
                  ? `<a href="${block.content.linkUrl}" target="_blank">`
                  : ''
              }
              <img src="${
                block.content.imageUrl || '/tuma-lockup.jpg'
              }" alt="Banner" style="max-width: 100%; width: ${
            block.content.width || '100%'
          }; border-radius: ${
            block.content.radius || '12px'
          }; border: 1px solid #1F2937; display: inline-block;" />
              ${block.content.linkUrl ? `</a>` : ''}
              ${
                block.content.caption
                  ? `<p style="color: #6B7280; font-size: 11px; margin: 6px 0 0 0;">${block.content.caption}</p>`
                  : ''
              }
            </div>
          `;
          break;

        case 'hero':
          bodyHtml += `
            <div style="text-align: ${block.content.align || 'center'}; margin-bottom: 24px;">
              <h1 style="color: ${block.content.titleColor || '#ffffff'}; font-size: ${
            block.content.fontSize || '26px'
          }; font-weight: 800; margin: 0 0 10px 0; line-height: 1.25;">${block.content.title}</h1>
              <p style="color: #9CA3AF; font-size: 14px; margin: 0; line-height: 1.6;">${block.content.subtitle}</p>
            </div>
          `;
          break;

        case 'text':
          bodyHtml += `
            <div style="color: ${block.content.textColor || '#D1D5DB'}; font-size: ${
            block.content.fontSize || '14px'
          }; line-height: 1.65; margin-bottom: 20px; text-align: ${block.content.align || 'left'};">
              ${block.content.body}
            </div>
          `;
          break;

        case 'button':
          bodyHtml += `
            <div style="text-align: ${block.content.align || 'center'}; margin: 26px 0;">
              <a href="${block.content.url || '#'}" style="background: ${
            block.content.bgColor || '#10B981'
          }; color: ${
            block.content.textColor || '#ffffff'
          }; padding: 12px 28px; text-decoration: none; border-radius: ${
            block.content.radius || '8px'
          }; font-weight: 700; font-size: 14px; display: inline-block;">
                ${block.content.text || 'Cliquez ici'}
              </a>
            </div>
          `;
          break;

        case 'callout':
          bodyHtml += `
            <div style="background: #111827; border-left: 4px solid ${
              block.content.borderColor || '#10B981'
            }; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #ffffff; font-size: 14px; font-weight: 700; margin: 0 0 6px 0;">${
                block.content.title || 'Information Importante'
              }</h4>
              <p style="color: #9CA3AF; font-size: 13px; margin: 0; line-height: 1.5;">${
                block.content.text || 'Message d alerte ou de mise en avant.'
              }</p>
            </div>
          `;
          break;

        case 'receipt':
          bodyHtml += `
            <div style="background: #111827; border: 1px solid #1F2937; border-radius: 12px; padding: 22px; margin-bottom: 24px;">
              <h4 style="color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px 0;">Récapitulatif de Paiement</h4>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="color: #9CA3AF; padding: 6px 0;">Client</td>
                  <td style="color: #ffffff; font-weight: 600; text-align: right; padding: 6px 0;">${block.content.customerName}</td>
                </tr>
                <tr>
                  <td style="color: #9CA3AF; padding: 6px 0;">Numéro Mobile</td>
                  <td style="color: #ffffff; font-weight: 600; text-align: right; padding: 6px 0;">${block.content.phoneNumber}</td>
                </tr>
                <tr>
                  <td style="color: #9CA3AF; padding: 6px 0;">Opérateur</td>
                  <td style="color: #ffffff; font-weight: 600; text-align: right; padding: 6px 0;">${block.content.provider}</td>
                </tr>
                <tr style="border-top: 1px solid #1F2937;">
                  <td style="color: #10B981; font-weight: bold; padding: 12px 0 0 0;">Total Réglé</td>
                  <td style="color: #10B981; font-weight: 800; font-size: 16px; text-align: right; padding: 12px 0 0 0;">${block.content.total}</td>
                </tr>
              </table>
            </div>
          `;
          break;

        case 'otp':
          bodyHtml += `
            <div style="background: #111827; border: 1px solid #10B981; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 0.25em; color: #10B981;">${block.content.code}</span>
              <p style="color: #9CA3AF; font-size: 12px; margin: 12px 0 0 0;">Ce code expire dans <strong>${
                block.content.expiresIn || '10 minutes'
              }</strong>.</p>
            </div>
          `;
          break;

        case 'divider':
          bodyHtml += `<hr style="border: 0; height: 1px; background: #1F2937; margin: 24px 0;" />`;
          break;

        case 'footer':
          bodyHtml += `
            <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #1F2937;">
              <p style="color: #6B7280; font-size: 11px; margin: 0 0 6px 0;">${block.content.company || 'TUMA Cloud SAS'}</p>
              <a href="${block.content.unsubscribeUrl || '#'}" style="color: #9CA3AF; font-size: 10px; text-decoration: underline;">Se désabonner de ces notifications</a>
            </div>
          `;
          break;
      }
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #05070B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="background-color: ${bg}; color: #F9FAFB; padding: 36px 24px; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #1F2937;">
    ${bodyHtml}
  </div>
</body>
</html>
    `.trim();
  };

  // Compile with sample test variables
  const getCompiledHtmlWithVariables = () => {
    let raw = compileBlocksToHtml(template.blocks, template.backgroundColor);
    try {
      const vars = template.testVariables;
      Object.keys(vars).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        raw = raw.replace(regex, vars[key]);
      });
    } catch {
      // ignore
    }
    return raw;
  };

  // Factory create block
  const createNewBlock = (type: TemplateBlock['type']): TemplateBlock => {
    let content: Record<string, any> = {};
    switch (type) {
      case 'header':
        content = {
          logoUrl: '/tuma-icon.jpg',
          logoSize: '48',
          brandName: 'Mon Entreprise',
          badgeText: 'Notification Officielle',
          badgeColor: '#10B981',
        };
        break;
      case 'image':
        content = {
          imageUrl: '/tuma-lockup.jpg',
          width: '100%',
          radius: '12px',
          align: 'center',
          caption: 'Plateforme Cloud d Email Transactionnel',
        };
        break;
      case 'hero':
        content = {
          title: 'Nouveau Grand Titre',
          subtitle: 'Sous-titre descriptif pour vos utilisateurs',
          align: 'center',
          titleColor: '#ffffff',
          fontSize: '26px',
        };
        break;
      case 'text':
        content = {
          body: 'Bonjour {{customerName}}, voici un message important concernant votre transaction.',
          align: 'left',
          textColor: '#D1D5DB',
          fontSize: '14px',
        };
        break;
      case 'button':
        content = {
          text: 'Confirmer mon Action',
          url: 'https://tuma.dev',
          bgColor: '#10B981',
          textColor: '#ffffff',
          radius: '8px',
          align: 'center',
        };
        break;
      case 'callout':
        content = {
          title: 'Alerte Système',
          text: 'Votre transaction a été validée avec succès.',
          borderColor: '#10B981',
        };
        break;
      case 'receipt':
        content = {
          customerName: '{{customerName}}',
          phoneNumber: '{{phoneNumber}}',
          provider: 'M-Pesa (Vodacom)',
          total: '{{amount}} {{currency}}',
        };
        break;
      case 'otp':
        content = {
          code: '{{otpCode}}',
          expiresIn: '10 minutes',
        };
        break;
      case 'divider':
        content = {};
        break;
      case 'footer':
        content = {
          company: 'Acme FinTech SAS • Kinshasa Gombe, RDC',
          unsubscribeUrl: 'https://tuma.dev/unsub',
        };
        break;
    }

    return {
      id: 'blk_' + Math.random().toString(36).substring(2, 8),
      type,
      content,
    };
  };

  // Add block to canvas at specific index or at end
  const handleAddBlock = (type: TemplateBlock['type'], insertAtIndex?: number) => {
    const newBlock = createNewBlock(type);
    const newBlocks = [...template.blocks];

    if (insertAtIndex !== undefined) {
      newBlocks.splice(insertAtIndex, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    setTemplate({
      ...template,
      blocks: newBlocks,
    });
    setSelectedBlockId(newBlock.id);
  };

  // Drag start from palette
  const handleDragStartFromPalette = (e: React.DragEvent, type: TemplateBlock['type']) => {
    e.dataTransfer.setData('application/tuma-block-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Drag over drop zone
  const handleCanvasDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverIndex(index);
  };

  // Drop onto canvas
  const handleCanvasDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    const blockType = e.dataTransfer.getData('application/tuma-block-type') as TemplateBlock['type'];

    if (blockType) {
      handleAddBlock(blockType, targetIndex);
      return;
    }

    // Reorder existing
    if (draggedCanvasIndex !== null && draggedCanvasIndex !== targetIndex) {
      const newBlocks = [...template.blocks];
      const [movedItem] = newBlocks.splice(draggedCanvasIndex, 1);
      const insertAt = draggedCanvasIndex < targetIndex ? targetIndex - 1 : targetIndex;
      newBlocks.splice(insertAt, 0, movedItem);
      setTemplate({ ...template, blocks: newBlocks });
      setDraggedCanvasIndex(null);
    }
  };

  // Local file upload for images
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      handleUpdateSelectedContent(targetField, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Re-ordering blocks
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= template.blocks.length) return;

    const newBlocks = [...template.blocks];
    const item = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = item;

    setTemplate({ ...template, blocks: newBlocks });
  };

  const handleDuplicateBlock = (index: number) => {
    const original = template.blocks[index];
    const clone: TemplateBlock = {
      ...original,
      id: 'blk_' + Math.random().toString(36).substring(2, 8),
      content: JSON.parse(JSON.stringify(original.content)),
    };
    const newBlocks = [...template.blocks];
    newBlocks.splice(index + 1, 0, clone);
    setTemplate({ ...template, blocks: newBlocks });
    setSelectedBlockId(clone.id);
  };

  const handleDeleteBlock = (index: number) => {
    const newBlocks = template.blocks.filter((_, i) => i !== index);
    setTemplate({ ...template, blocks: newBlocks });
    if (selectedBlockId === template.blocks[index]?.id) {
      setSelectedBlockId(newBlocks.length > 0 ? newBlocks[0].id : null);
    }
  };

  const handleUpdateSelectedContent = (key: string, value: any) => {
    if (!selectedBlock) return;
    const newBlocks = [...template.blocks];
    newBlocks[selectedIndex].content[key] = value;
    setTemplate({ ...template, blocks: newBlocks });
  };

  // Insert variable token into active text field
  const handleInsertVariable = (varName: string) => {
    if (!selectedBlock) return;
    const token = `{{${varName}}}`;
    if (selectedBlock.type === 'hero') {
      handleUpdateSelectedContent('title', `${selectedBlock.content.title} ${token}`);
    } else if (selectedBlock.type === 'text') {
      handleUpdateSelectedContent('body', `${selectedBlock.content.body} ${token}`);
    } else if (selectedBlock.type === 'button') {
      handleUpdateSelectedContent('text', `${selectedBlock.content.text} ${token}`);
    }
  };

  // Test send to Mailpit
  const handleTestSend = async () => {
    setIsTestSending(true);
    try {
      await api.sendEmail({
        from: 'Tuma Studio <studio@tuma.dev>',
        to: ['developer@startup-kinshasa.cd'],
        subject: template.subject.replace(/{{[a-zA-Z0-9]+}}/g, 'TEST'),
        html: getCompiledHtmlWithVariables(),
        tags: [{ name: 'source', value: 'visual_studio_drag_drop' }],
      });
      setTestSentSuccess(true);
      setTimeout(() => setTestSentSuccess(false), 3000);
    } catch (err: any) {
      alert('Erreur envoi test: ' + err.message);
    } finally {
      setIsTestSending(false);
    }
  };

  // Save template to API
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('http://localhost:3001/v1/templates', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer sk_live_test123456789',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: template.name,
          slug: template.slug,
          subject: template.subject,
          html: compileBlocksToHtml(template.blocks, template.backgroundColor),
          requiredVariables: Object.keys(template.testVariables),
        }),
      });
      onSave(template);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      onSave(template);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 select-none animate-in fade-in duration-150">
      {/* Top Studio Header & Controls */}
      <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Back & Template Name / Slug */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-[#0B0F19] hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white border border-[#1F2937] transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
            title="Retour à la galerie des templates"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Galerie</span>
          </button>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="bg-transparent font-extrabold text-white text-base focus:outline-none focus:border-b border-[#10B981] w-full"
              placeholder="Nom du template..."
            />
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-[#6B7280]">slug:</span>
              <input
                type="text"
                value={template.slug}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                  })
                }
                className="bg-[#0B0F19] text-[11px] font-mono text-[#10B981] px-1.5 py-0.5 rounded border border-[#1F2937] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Center: Viewport & View Mode */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0B0F19] p-1 rounded-xl border border-[#1F2937]">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewport === 'desktop' ? 'bg-[#1F2937] text-white' : 'text-[#9CA3AF]'
              }`}
              title="Aperçu Bureau 600px"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewport === 'mobile' ? 'bg-[#1F2937] text-white' : 'text-[#9CA3AF]'
              }`}
              title="Aperçu Mobile 375px"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-[#0B0F19] p-1 rounded-xl border border-[#1F2937]">
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'visual' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#9CA3AF]'
              }`}
            >
              <Layout className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Canvas Visual Drag & Drop</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRawHtmlCode(compileBlocksToHtml(template.blocks, template.backgroundColor));
                setViewMode('code');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'code' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#9CA3AF]'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Code HTML</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestSend}
            disabled={isTestSending}
            className="px-3.5 py-2 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-white text-xs font-semibold border border-[#374151] flex items-center gap-1.5 transition-colors"
          >
            <Send className={`w-3.5 h-3.5 text-[#FF6B00] ${isTestSending ? 'animate-spin' : ''}`} />
            <span>Tester l'Envoi</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-xs font-semibold shadow-glow-emerald flex items-center gap-1.5 transition-colors"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{saveSuccess ? 'Enregistré ✓' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {testSentSuccess && (
        <div className="p-3 bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl text-xs text-[#10B981] font-semibold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Email de test délivré ! Consultez-le sur Mailpit (8025).</span>
          </span>
          <a
            href="http://localhost:8025"
            target="_blank"
            rel="noreferrer"
            className="underline flex items-center gap-1 text-white font-bold"
          >
            Ouvrir Mailpit (8025) <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Subject Line Bar & Quick Inserters & AI Spam Badge */}
      <div className="bg-[#111827] rounded-xl p-3 border border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs font-semibold text-[#9CA3AF] shrink-0">Objet de l'Email :</span>
          <input
            type="text"
            value={template.subject}
            onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
            className="w-full bg-[#0B0F19] text-xs text-white px-3 py-1.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
            placeholder="Ex: Reçu de paiement {{amount}} {{currency}}"
          />
        </div>

        {/* AI Anti-Spam Score Badge */}
        <button
          type="button"
          onClick={() => setShowSpamDetails(!showSpamDetails)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 shrink-0 transition-all ${spamAnalysis.bg}`}
          title="Cliquez pour voir le rapport de délivrabilité IA"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{spamAnalysis.score}/100</span>
          <span className="hidden md:inline font-medium">({spamAnalysis.rating})</span>
        </button>

        {/* Fast Variable Chips */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-[#6B7280]">Insérer :</span>
          {Object.keys(template.testVariables).slice(0, 3).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleInsertVariable(v)}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B0F19] hover:bg-[#1F2937] text-[#10B981] border border-[#1F2937] transition-colors"
              title={`Ajouter {{${v}}} au bloc sélectionné`}
            >
              + {`{{${v}}}`}
            </button>
          ))}
        </div>
      </div>

      {/* AI Spam Inspector Collapsible Drawer */}
      {showSpamDetails && (
        <div className="p-4 bg-[#0B0F19] rounded-2xl border border-[#1F2937] space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#10B981]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Analyse Anti-Spam IA & Délivrabilité en Direct (Score : {spamAnalysis.score}/100)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowSpamDetails(false)}
              className="text-xs text-[#9CA3AF] hover:text-white"
            >
              Fermer ✕
            </button>
          </div>

          {spamAnalysis.warnings.length > 0 ? (
            <div className="space-y-1.5">
              {spamAnalysis.warnings.map((w, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                  <span>⚠️</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#10B981] bg-[#10B981]/10 p-2 rounded-lg border border-[#10B981]/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>Aucun mot sensible détecté. Structure optimale pour atterrir à 100% en boîte principale !</span>
            </div>
          )}

          {spamAnalysis.suggestions.length > 0 && (
            <div className="pt-2 border-t border-[#1F2937] space-y-1 text-xs text-[#9CA3AF]">
              {spamAnalysis.suggestions.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-[#10B981]">💡</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'visual' ? (
        /* 3-Column Professional Visual Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Draggable Component Palette */}
          <div className="lg:col-span-3 bg-[#111827] rounded-2xl border border-[#1F2937] p-4 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
                <GripVertical className="w-3.5 h-3.5 text-[#10B981]" /> Palette de Composants
              </h3>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                Glissez un bloc sur la feuille ou cliquez pour insérer
              </p>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {[
                { type: 'header', label: 'Logo & En-tête', icon: Layers, color: 'text-[#10B981]', desc: 'Brand logo + badge' },
                { type: 'image', label: 'Bannière / Image', icon: ImageIcon, color: 'text-blue-400', desc: 'Upload ou URL image' },
                { type: 'hero', label: 'Grand Titre Hero', icon: Heading, color: 'text-[#FF6B00]', desc: 'Titre & accroche' },
                { type: 'text', label: 'Paragraphe de Texte', icon: AlignLeft, color: 'text-[#06B6D4]', desc: 'Texte avec variables' },
                { type: 'button', label: 'Bouton d Action CTA', icon: SquareCheck, color: 'text-[#10B981]', desc: 'Bouton avec lien' },
                { type: 'callout', label: 'Encadré d Alerte', icon: Zap, color: 'text-yellow-400', desc: 'Mise en avant stylée' },
                { type: 'receipt', label: 'Facture Mobile Money', icon: CreditCard, color: 'text-purple-400', desc: 'Tableau M-Pesa / CDF' },
                { type: 'otp', label: 'Code OTP 6 Chiffres', icon: Key, color: 'text-emerald-400', desc: 'Boîte sécurité 2FA' },
                { type: 'divider', label: 'Ligne Séparatrice', icon: Minus, color: 'text-[#9CA3AF]', desc: 'Séparateur 1px' },
                { type: 'footer', label: 'Pied de Page & Légal', icon: Layers, color: 'text-[#6B7280]', desc: 'Adresse & désabonnement' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    draggable={true}
                    onDragStart={(e) => handleDragStartFromPalette(e, item.type as TemplateBlock['type'])}
                    onClick={() => handleAddBlock(item.type as TemplateBlock['type'])}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F19] hover:bg-[#1F2937] border border-[#1F2937] hover:border-[#10B981]/50 text-left transition-all group cursor-grab active:cursor-grabbing shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#111827] border border-[#1F2937]">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-white block group-hover:text-[#10B981] transition-colors">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-[#6B7280]">{item.desc}</span>
                      </div>
                    </div>
                    <GripVertical className="w-3.5 h-3.5 text-[#6B7280] group-hover:text-white" />
                  </div>
                );
              })}
            </div>

            {/* Email Background Color Customizer */}
            <div className="pt-3 border-t border-[#1F2937] space-y-2">
              <span className="text-[11px] font-semibold text-[#9CA3AF] block">Fond Global de l'Email</span>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Obsidienne', color: '#0B0F19' },
                  { label: 'Noir Pur', color: '#000000' },
                  { label: 'Bleu Nuit', color: '#0F172A' },
                  { label: 'Blanc Épuré', color: '#FFFFFF' },
                ].map((bgOption) => (
                  <button
                    key={bgOption.color}
                    type="button"
                    onClick={() => setTemplate({ ...template, backgroundColor: bgOption.color })}
                    className={`w-7 h-7 rounded-lg border-2 transition-all ${
                      template.backgroundColor === bgOption.color ? 'border-[#10B981] scale-110' : 'border-[#374151]'
                    }`}
                    style={{ backgroundColor: bgOption.color }}
                    title={bgOption.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Center Column: Live Interactive Canvas Paper */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div
              className="w-full bg-[#05070B] rounded-2xl p-6 border border-[#1F2937] min-h-[660px] flex justify-center overflow-y-auto"
              onDragOver={(e) => handleCanvasDragOver(e, template.blocks.length)}
              onDrop={(e) => handleCanvasDrop(e, template.blocks.length)}
            >
              <div
                className={`rounded-2xl border border-[#1F2937] p-6 space-y-3 shadow-2xl transition-all duration-200 ${
                  viewport === 'mobile' ? 'w-[375px]' : 'w-full max-w-[580px]'
                }`}
                style={{ backgroundColor: template.backgroundColor || '#0B0F19' }}
              >
                {/* Empty State Inserter */}
                {template.blocks.length === 0 && (
                  <div
                    onDragOver={(e) => handleCanvasDragOver(e, 0)}
                    onDrop={(e) => handleCanvasDrop(e, 0)}
                    className="p-12 text-center border-2 border-dashed border-[#374151] rounded-2xl text-xs text-[#9CA3AF] space-y-2"
                  >
                    <GripVertical className="w-6 h-6 text-[#10B981] mx-auto animate-bounce" />
                    <p className="font-semibold text-white">Votre email est vide</p>
                    <p>Glissez et déposez des composants ici pour construire votre email.</p>
                  </div>
                )}

                {/* Canvas Blocks with Magnetic Drop Targets */}
                {template.blocks.map((block, index) => {
                  const isSelected = block.id === selectedBlockId;
                  const isDragTarget = dragOverIndex === index;

                  return (
                    <React.Fragment key={block.id}>
                      {/* Insertion Target Line */}
                      {isDragTarget && (
                        <div className="p-2 border-2 border-dashed border-[#10B981] bg-[#10B981]/10 rounded-xl text-center text-[11px] text-[#10B981] font-bold shadow-glow-emerald animate-pulse">
                          ＋ Déposer le bloc ici
                        </div>
                      )}

                      <div
                        draggable={true}
                        onDragStart={(e) => {
                          setDraggedCanvasIndex(index);
                          e.dataTransfer.setData('text/plain', index.toString());
                        }}
                        onDragOver={(e) => handleCanvasDragOver(e, index)}
                        onDrop={(e) => handleCanvasDrop(e, index)}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`relative group rounded-xl p-3.5 transition-all cursor-pointer border ${
                          isSelected
                            ? 'border-[#10B981] bg-[#111827]/70 ring-2 ring-[#10B981]/30 shadow-glow-emerald'
                            : 'border-transparent hover:border-[#374151] hover:bg-[#111827]/40'
                        }`}
                      >
                        {/* Quick Toolbar on Hover / Focus */}
                        <div
                          className={`absolute -top-3.5 right-3 flex items-center gap-1 bg-[#1F2937] border border-[#374151] rounded-lg px-2 py-0.5 z-20 shadow-xl transition-opacity ${
                            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <div className="cursor-grab text-[#9CA3AF] hover:text-white px-1">
                            <GripVertical className="w-3 h-3" />
                          </div>
                          <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider px-1">
                            {block.type}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(index, 'up');
                            }}
                            disabled={index === 0}
                            className="p-1 text-[#9CA3AF] hover:text-white disabled:opacity-20"
                            title="Monter"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(index, 'down');
                            }}
                            disabled={index === template.blocks.length - 1}
                            className="p-1 text-[#9CA3AF] hover:text-white disabled:opacity-20"
                            title="Descendre"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateBlock(index);
                            }}
                            className="p-1 text-[#9CA3AF] hover:text-white"
                            title="Dupliquer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(index);
                            }}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Live Rendered Canvas Elements */}
                        {block.type === 'header' && (
                          <div className="text-center space-y-2">
                            <img
                              src={block.content.logoUrl || '/tuma-icon.jpg'}
                              className="rounded-xl mx-auto object-cover border border-[#1F2937]"
                              style={{ width: `${block.content.logoSize || 48}px`, height: `${block.content.logoSize || 48}px` }}
                            />
                            <div className="font-extrabold text-sm text-white">{block.content.brandName}</div>
                            {block.content.badgeText && (
                              <span
                                className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                                style={{
                                  color: block.content.badgeColor || '#10B981',
                                  borderColor: `${block.content.badgeColor || '#10B981'}40`,
                                  backgroundColor: `${block.content.badgeColor || '#10B981'}15`,
                                }}
                              >
                                {block.content.badgeText}
                              </span>
                            )}
                          </div>
                        )}

                        {block.type === 'image' && (
                          <div style={{ textAlign: block.content.align || 'center' }} className="py-1">
                            <img
                              src={block.content.imageUrl || '/tuma-lockup.jpg'}
                              className="rounded-xl border border-[#1F2937] display: inline-block object-cover"
                              style={{
                                width: block.content.width || '100%',
                                borderRadius: block.content.radius || '12px',
                              }}
                            />
                            {block.content.caption && (
                              <p className="text-[11px] text-[#6B7280] mt-1.5">{block.content.caption}</p>
                            )}
                          </div>
                        )}

                        {block.type === 'hero' && (
                          <div
                            className="space-y-1.5"
                            style={{ textAlign: block.content.align || 'center' }}
                          >
                            <h2
                              className="font-extrabold tracking-tight"
                              style={{
                                color: block.content.titleColor || '#ffffff',
                                fontSize: block.content.fontSize || '22px',
                              }}
                            >
                              {block.content.title}
                            </h2>
                            <p className="text-xs text-[#9CA3AF] leading-relaxed">
                              {block.content.subtitle}
                            </p>
                          </div>
                        )}

                        {block.type === 'text' && (
                          <div
                            className="text-xs leading-relaxed"
                            style={{
                              color: block.content.textColor || '#D1D5DB',
                              textAlign: block.content.align || 'left',
                              fontSize: block.content.fontSize || '13px',
                            }}
                          >
                            {block.content.body}
                          </div>
                        )}

                        {block.type === 'callout' && (
                          <div
                            className="p-3.5 rounded-xl border-l-4 bg-[#111827] space-y-1 text-xs text-left"
                            style={{ borderLeftColor: block.content.borderColor || '#10B981' }}
                          >
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-[#10B981]" />
                              <span>{block.content.title}</span>
                            </div>
                            <p className="text-[#9CA3AF] text-[11px] leading-relaxed">{block.content.text}</p>
                          </div>
                        )}

                        {block.type === 'button' && (
                          <div style={{ textAlign: block.content.align || 'center' }} className="py-2">
                            <span
                              className="inline-block text-xs font-bold px-6 py-2.5 shadow-md"
                              style={{
                                backgroundColor: block.content.bgColor || '#10B981',
                                color: block.content.textColor || '#ffffff',
                                borderRadius: block.content.radius || '8px',
                              }}
                            >
                              {block.content.text}
                            </span>
                          </div>
                        )}

                        {block.type === 'receipt' && (
                          <div className="bg-[#111827] rounded-xl p-4 border border-[#1F2937] space-y-2.5 text-xs">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                              Facture Mobile Money
                            </div>
                            <div className="flex justify-between text-[#9CA3AF]">
                              <span>Client :</span>
                              <span className="font-semibold text-white">{block.content.customerName}</span>
                            </div>
                            <div className="flex justify-between text-[#9CA3AF]">
                              <span>Téléphone :</span>
                              <span className="font-semibold text-white">{block.content.phoneNumber}</span>
                            </div>
                            <div className="flex justify-between text-[#9CA3AF]">
                              <span>Opérateur :</span>
                              <span className="font-semibold text-white">{block.content.provider}</span>
                            </div>
                            <div className="pt-2 border-t border-[#1F2937] flex justify-between font-bold text-sm text-[#10B981]">
                              <span>Total Réglé :</span>
                              <span>{block.content.total}</span>
                            </div>
                          </div>
                        )}

                        {block.type === 'otp' && (
                          <div className="bg-[#111827] rounded-xl p-5 border border-[#10B981]/50 text-center space-y-1.5">
                            <span className="font-mono text-2xl font-black text-[#10B981] tracking-widest block">
                              {block.content.code}
                            </span>
                            <span className="text-[11px] text-[#9CA3AF]">
                              Expire dans {block.content.expiresIn}
                            </span>
                          </div>
                        )}

                        {block.type === 'divider' && (
                          <hr className="border-t border-[#1F2937] my-2" />
                        )}

                        {block.type === 'footer' && (
                          <div className="text-center space-y-1 pt-2 border-t border-[#1F2937]">
                            <p className="text-[11px] text-[#6B7280]">{block.content.company}</p>
                            <span className="text-[10px] text-[#9CA3AF] underline">Se désabonner</span>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Properties & Image Management Panel */}
          <div className="lg:col-span-3 bg-[#111827] rounded-2xl border border-[#1F2937] p-5 space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#10B981]" /> Inspecteur & Propriétés
              </h3>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                {selectedBlock ? `Bloc actif : ${selectedBlock.type}` : 'Cliquez sur un bloc pour modifier'}
              </p>
            </div>

            {selectedBlock ? (
              <div className="space-y-4 text-xs">
                {/* 1. Image / Banner Properties */}
                {selectedBlock.type === 'image' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Image Bannière</label>
                      <input
                        type="text"
                        value={selectedBlock.content.imageUrl}
                        onChange={(e) => handleUpdateSelectedContent('imageUrl', e.target.value)}
                        placeholder="https://... ou /tuma-lockup.jpg"
                        className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981] font-mono text-[11px]"
                      />
                    </div>

                    {/* Image Upload Button */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => handleImageFileUpload(e, 'imageUrl')}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-white text-xs font-medium border border-[#374151] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>Téléverser depuis mon Ordinateur</span>
                      </button>
                    </div>

                    {/* Stock Presets */}
                    <div>
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase block mb-1.5">
                        Assets de Marque TUMA (1-Clic)
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {STOCK_MEDIA_ASSETS.slice(0, 3).map((asset) => (
                          <div
                            key={asset.url}
                            onClick={() => handleUpdateSelectedContent('imageUrl', asset.url)}
                            className="p-1 rounded-lg bg-[#0B0F19] border border-[#1F2937] hover:border-[#10B981] cursor-pointer"
                            title={asset.label}
                          >
                            <img src={asset.url} className="w-full h-8 object-cover rounded" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Largeur ({selectedBlock.content.width || '100%'})</label>
                      <select
                        value={selectedBlock.content.width || '100%'}
                        onChange={(e) => handleUpdateSelectedContent('width', e.target.value)}
                        className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937]"
                      >
                        <option value="100%">100% (Pleine largeur)</option>
                        <option value="75%">75%</option>
                        <option value="50%">50% (Centrée)</option>
                        <option value="200px">200px</option>
                        <option value="120px">120px</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Lien de redirection</label>
                      <input
                        type="text"
                        value={selectedBlock.content.linkUrl || ''}
                        onChange={(e) => handleUpdateSelectedContent('linkUrl', e.target.value)}
                        placeholder="https://tuma.dev/offre"
                        className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937]"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Header Properties */}
                {selectedBlock.type === 'header' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Logo URL</label>
                      <input
                        type="text"
                        value={selectedBlock.content.logoUrl}
                        onChange={(e) => handleUpdateSelectedContent('logoUrl', e.target.value)}
                        className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Taille du Logo</label>
                      <div className="flex gap-2">
                        {['36', '48', '64'].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleUpdateSelectedContent('logoSize', size)}
                            className={`flex-1 py-1 rounded border ${
                              (selectedBlock.content.logoSize || '48') === size
                                ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                                : 'bg-[#0B0F19] border-[#1F2937] text-white'
                            }`}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Nom de la Marque</label>
                      <input
                        type="text"
                        value={selectedBlock.content.brandName}
                        onChange={(e) => handleUpdateSelectedContent('brandName', e.target.value)}
                        className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Badge Statut</label>
                      <input
                        type="text"
                        value={selectedBlock.content.badgeText}
                        onChange={(e) => handleUpdateSelectedContent('badgeText', e.target.value)}
                        className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937]"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Hero Properties */}
                {selectedBlock.type === 'hero' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Titre Principal</label>
                      <input
                        type="text"
                        value={selectedBlock.content.title}
                        onChange={(e) => handleUpdateSelectedContent('title', e.target.value)}
                        className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Sous-titre</label>
                      <textarea
                        rows={2}
                        value={selectedBlock.content.subtitle}
                        onChange={(e) => handleUpdateSelectedContent('subtitle', e.target.value)}
                        className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Alignement</label>
                      <div className="flex gap-1 bg-[#0B0F19] p-1 rounded-lg border border-[#1F2937]">
                        {[
                          { id: 'left', icon: AlignLeft },
                          { id: 'center', icon: AlignCenter },
                          { id: 'right', icon: AlignRight },
                        ].map((al) => {
                          const Icon = al.icon;
                          return (
                            <button
                              key={al.id}
                              type="button"
                              onClick={() => handleUpdateSelectedContent('align', al.id)}
                              className={`flex-1 py-1 rounded flex justify-center ${
                                (selectedBlock.content.align || 'center') === al.id
                                  ? 'bg-[#1F2937] text-white'
                                  : 'text-[#9CA3AF]'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Text Properties */}
                {selectedBlock.type === 'text' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Contenu Textuel</label>
                      <textarea
                        rows={6}
                        value={selectedBlock.content.body}
                        onChange={(e) => handleUpdateSelectedContent('body', e.target.value)}
                        className="w-full bg-[#0B0F19] text-white p-3 rounded-lg border border-[#1F2937] leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Callout Properties */}
                {selectedBlock.type === 'callout' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Titre de l'Encadré</label>
                      <input
                        type="text"
                        value={selectedBlock.content.title}
                        onChange={(e) => handleUpdateSelectedContent('title', e.target.value)}
                        className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Texte</label>
                      <textarea
                        rows={3}
                        value={selectedBlock.content.text}
                        onChange={(e) => handleUpdateSelectedContent('text', e.target.value)}
                        className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937]"
                      />
                    </div>
                  </div>
                )}

                {/* 6. Button Properties */}
                {selectedBlock.type === 'button' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Libellé du Bouton</label>
                      <input
                        type="text"
                        value={selectedBlock.content.text}
                        onChange={(e) => handleUpdateSelectedContent('text', e.target.value)}
                        className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">URL de Destination</label>
                      <input
                        type="text"
                        value={selectedBlock.content.url}
                        onChange={(e) => handleUpdateSelectedContent('url', e.target.value)}
                        className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9CA3AF] font-semibold mb-1">Couleur d'Action</label>
                      <div className="flex items-center gap-2">
                        {['#10B981', '#FF6B00', '#3B82F6', '#8B5CF6', '#EF4444'].map((color) => (
                          <div
                            key={color}
                            onClick={() => handleUpdateSelectedContent('bgColor', color)}
                            className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                              selectedBlock.content.bgColor === color ? 'border-white scale-110' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Footer Properties */}
                {selectedBlock.type === 'footer' && (
                  <div>
                    <label className="block text-[#9CA3AF] font-semibold mb-1">Mentions Légales & Société</label>
                    <input
                      type="text"
                      value={selectedBlock.content.company}
                      onChange={(e) => handleUpdateSelectedContent('company', e.target.value)}
                      className="w-full bg-[#0B0F19] text-white px-3 py-2 rounded-lg border border-[#1F2937]"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-[#6B7280] text-xs">
                Sélectionnez un bloc sur la feuille centrale pour en ajuster le style.
              </div>
            )}

            {/* Handlebars Variables Assistant */}
            <div className="pt-4 border-t border-[#1F2937] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Variables Handlebars Disponibles
              </span>
              <div className="space-y-1">
                {Object.keys(template.testVariables).map((key) => (
                  <div
                    key={key}
                    onClick={() => handleInsertVariable(key)}
                    className="flex justify-between items-center text-[11px] bg-[#0B0F19] hover:bg-[#1F2937] p-1.5 rounded border border-[#1F2937] cursor-pointer transition-colors"
                    title="Cliquez pour insérer dans le bloc sélectionné"
                  >
                    <code className="text-[#10B981] font-mono">{`{{${key}}}`}</code>
                    <span className="text-[#9CA3AF] truncate max-w-[110px]">{template.testVariables[key]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Raw Code Mode */
        <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
              Code Source HTML5 & Handlebars Compilé
            </span>
            <span className="text-[10px] font-mono text-[#10B981]">Email Client Ready</span>
          </div>
          <textarea
            rows={20}
            value={rawHtmlCode}
            onChange={(e) => setRawHtmlCode(e.target.value)}
            className="w-full bg-[#0B0F19] font-mono text-xs text-[#D1D5DB] p-4 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#10B981] leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
