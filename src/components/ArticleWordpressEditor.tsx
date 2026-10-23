import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  Minus,
  Undo2,
  Redo2,
  Maximize2,
  Minimize2,
  Eye,
  FileText,
  Code2,
  Settings,
  Sparkles,
  Palette,
  Check,
  X,
  Plus,
  Trash2,
  Upload,
  Link2,
  Star,
  UserPlus,
  Crown,
  Lock,
  Hash,
  Clock,
  Calendar,
  Save,
  Send,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FolderKanban,
  Sun,
  Moon,
  Feather,
  BookOpen,
  Sliders,
  ChevronRight,
  ChevronDown,
  Layers,
  Search,
} from 'lucide-react';
import {
  Article,
  ArticleApprovalStatus,
  ArticleCategory,
  ArticlePublishMode,
  CategoryItem,
  DatabaseState,
  HashtagItem,
  User,
  VisualPreset,
} from '../data/akeaData';
import { AuthorAvatar } from './EditorialVisual';

export interface ArticleWordpressEditorProps {
  isOpen: boolean;
  initialArticle: Partial<Article> | null;
  db: DatabaseState;
  currentUser: User | null;
  onClose: () => void;
  onSave: (articleData: Partial<Article>) => Promise<void>;
  onCreateCategory?: (payload: Partial<CategoryItem>) => Promise<void>;
  onQuickCreateAuthor?: (payload: {
    name: string;
    email: string;
    role: User['role'];
    specialty: string;
    bio: string;
    location: string;
  }) => Promise<void>;
}

type EditorViewTab = 'visual' | 'code' | 'preview';
type WritingTheme = 'paper' | 'white' | 'dark';
type WritingWidth = 'compact' | 'normal' | 'wide';

const COLOR_PALETTE = [
  { name: 'Carbón Clásico', value: '#171920' },
  { name: 'Rojo Editorial Kayleen', value: '#FF2C54' },
  { name: 'Azul Índigo', value: '#5960FF' },
  { name: 'Verde Esmeralda', value: '#10B981' },
  { name: 'Ámbar Dorado', value: '#D97706' },
  { name: 'Púrpura Profundo', value: '#7C3AED' },
  { name: 'Gris Pizarra', value: '#64748B' },
];

const HIGHLIGHT_PALETTE = [
  { name: 'Sin Resaltado', value: '' },
  { name: 'Amarillo Canario', value: '#FEF08A' },
  { name: 'Menta Fresca', value: '#A7F3D0' },
  { name: 'Melocotón Pastel', value: '#FED7AA' },
  { name: 'Lavanda Suave', value: '#DDD6FE' },
  { name: 'Azul Hielo', value: '#BAE6FD' },
];

const VISUAL_PRESETS: { value: VisualPreset; label: string }[] = [
  { value: 'summer_coast', label: 'Atardecer Costero (Kayleen Sunset)' },
  { value: 'photo_mistakes', label: 'Fotografía & Geometría Urbana' },
  { value: 'xe_entertainment', label: 'Danza & Cultura Contemporánea' },
  { value: 'alpine_lake', label: 'Naturaleza & Bosque Sereno' },
  { value: 'winter_fashion', label: 'Moda & Retrato Editorial' },
  { value: 'minimal_gadgets', label: 'Estudio Creativo & Minimal' },
  { value: 'tech_hq', label: 'Comunidad & Innovación' },
  { value: 'tropical_beach', label: 'Gastronomía & Aire Libre' },
  { value: 'madrid_runway', label: 'Street Style & Pasarela' },
  { value: 'breathtaking_cliffs', label: 'Viajes & Horizonte Abierto' },
];

export const ArticleWordpressEditor: React.FC<ArticleWordpressEditorProps> = ({
  isOpen,
  initialArticle,
  db,
  currentUser,
  onClose,
  onSave,
  onCreateCategory,
  onQuickCreateAuthor,
}) => {
  // Primary Article Form State
  const [formData, setFormData] = useState<Partial<Article>>(() => ({
    title: '',
    subtitle: '',
    excerpt: '',
    content: [
      '## Introducción Editorial',
      'Escribe aquí el primer párrafo de tu historia con tipografía y herramientas al estilo Microsoft Word y WordPress.',
      'Desarrolla tus ideas con citas de impacto, listas detalladas, tablas y fotografías de alta resolución.',
    ],
    pullQuote:
      'La narrativa contemporánea florece cuando se combinan imágenes auténticas, diseño limpio y concentración.',
    category: db.categories?.[0]?.name || 'Estilo de Vida',
    authorId: currentUser?.id || db.users[0]?.id || 'usr-1',
    coAuthorIds: [],
    readTimeMinutes: 4,
    featuredHero: false,
    akeaSection: 'recent',
    visualPreset: 'summer_coast',
    customImageUrl: '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg',
    galleryImages: ['/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg'],
    tags: ['Kayleen', 'Editorial'],
    status: currentUser?.role === 'author' ? 'draft' : 'published',
    isPremium: false,
    approvalStatus: currentUser?.role === 'author' ? 'pending_review' : 'approved',
    publishMode: 'immediate',
    scheduledPublishAt: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ...(initialArticle || {}),
  }));

  // Unified Text Buffer (joined by double linebreaks for markdown / word paragraphs)
  const [textBuffer, setTextBuffer] = useState<string>(() => {
    return Array.isArray(initialArticle?.content) && initialArticle.content.length > 0
      ? initialArticle.content.join('\n\n')
      : '## Introducción Editorial\n\nEscribe aquí el primer párrafo con fluidez.';
  });

  // Editor View Mode ('visual' | 'code' | 'preview')
  const [activeTab, setActiveTab] = useState<EditorViewTab>('visual');

  // Distraction-Free "Modo Escritura" State
  const [isFocusWritingMode, setIsFocusWritingMode] = useState<boolean>(false);
  const [writingTheme, setWritingTheme] = useState<WritingTheme>('paper');
  const [writingWidth, setWritingWidth] = useState<WritingWidth>('normal');
  const [typewriterScroll, setTypewriterScroll] = useState<boolean>(false);

  // Inspector Sidebar Open/Closed (like WordPress Gutenberg Settings Panel)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<'document' | 'block' | 'seo'>('document');

  // Multi-image upload and URL states
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Inline Quick Co-Author Creator State
  const [showQuickAuthorForm, setShowQuickAuthorForm] = useState(false);
  const [quickAuthorName, setQuickAuthorName] = useState('');
  const [quickAuthorEmail, setQuickAuthorEmail] = useState('');
  const [quickAuthorSpecialty, setQuickAuthorSpecialty] = useState('');

  // Link Insertion Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');

  // Table Generator Modal State
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Callout Box Modal State
  const [showCalloutModal, setShowCalloutModal] = useState(false);
  const [calloutType, setCalloutType] = useState<'info' | 'tip' | 'warning' | 'quote'>('info');
  const [calloutText, setCalloutText] = useState('');

  // Color picker dropdowns
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightColorPicker, setShowHighlightColorPicker] = useState(false);

  // Hashtags search & add
  const [hashtagInput, setHashtagInput] = useState('');

  // Undo / Redo History Stack
  const [history, setHistory] = useState<string[]>([textBuffer]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Saving indicator
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Textarea Ref
  const editorTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync formData and textBuffer when modal opens with a new or existing article
  useEffect(() => {
    if (isOpen && initialArticle) {
      const nextContent =
        Array.isArray(initialArticle.content) && initialArticle.content.length > 0
          ? initialArticle.content.join('\n\n')
          : '## Introducción Editorial\n\nEscribe aquí el primer párrafo con fluidez.';
      setFormData({
        title: '',
        subtitle: '',
        excerpt: '',
        content: [
          '## Introducción Editorial',
          'Escribe aquí el primer párrafo de tu historia con tipografía y herramientas al estilo Microsoft Word y WordPress.',
        ],
        pullQuote:
          'La narrativa contemporánea florece cuando se combinan imágenes auténticas, diseño limpio y concentración.',
        category: db.categories?.[0]?.name || 'Estilo de Vida',
        authorId: currentUser?.id || db.users[0]?.id || 'usr-1',
        coAuthorIds: [],
        readTimeMinutes: 4,
        featuredHero: false,
        akeaSection: 'recent',
        visualPreset: 'summer_coast',
        customImageUrl: '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg',
        galleryImages: ['/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg'],
        tags: ['Kayleen', 'Editorial'],
        status: currentUser?.role === 'author' ? 'draft' : 'published',
        isPremium: false,
        approvalStatus: currentUser?.role === 'author' ? 'pending_review' : 'approved',
        publishMode: 'immediate',
        scheduledPublishAt: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        ...initialArticle,
      });
      setTextBuffer(nextContent);
      setHistory([nextContent]);
      setHistoryIndex(0);
      setHasUnsavedChanges(false);
    }
  }, [isOpen, initialArticle]);

  // Update history whenever text changes via user action
  const pushToHistory = (newContent: string) => {
    setTextBuffer(newContent);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setHasUnsavedChanges(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setTextBuffer(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setTextBuffer(history[newIdx]);
    }
  };

  // Keep paragraphs in sync with textBuffer
  useEffect(() => {
    if (!isOpen) return;
    const paragraphs = textBuffer
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    const wordCount = textBuffer.trim().split(/\s+/).filter(Boolean).length;
    const computedReadTime = Math.max(1, Math.ceil(wordCount / 180));

    setFormData((prev) => ({
      ...prev,
      content: paragraphs.length > 0 ? paragraphs : [''],
      readTimeMinutes: computedReadTime,
    }));
  }, [textBuffer, isOpen]);

  // Real-time Text Statistics
  const statistics = useMemo(() => {
    const trimmed = textBuffer.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const characters = textBuffer.length;
    const charactersNoSpaces = textBuffer.replace(/\s+/g, '').length;
    const paragraphs = textBuffer
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean).length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 180));
    return { words, characters, charactersNoSpaces, paragraphs, readTimeMinutes };
  }, [textBuffer]);

  // Global Keyboard Shortcuts for Distraction-Free Writing Mode
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveArticle(formData.status || 'draft');
      } else if (e.key === 'Escape' && isFocusWritingMode) {
        setIsFocusWritingMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFocusWritingMode, formData, textBuffer]);

  if (!isOpen || !initialArticle) return null;

  // Formatting Insertion Helpers
  const insertFormatting = (
    prefix: string,
    suffix: string = '',
    defaultText: string = 'texto'
  ) => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textBuffer.slice(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;
    const nextText = textBuffer.slice(0, start) + replacement + textBuffer.slice(end);

    pushToHistory(nextText);

    // Reposition cursor after render
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const insertBlockAtCursor = (blockContent: string) => {
    const textarea = editorTextareaRef.current;
    if (!textarea) {
      pushToHistory(textBuffer + '\n\n' + blockContent);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textBuffer.slice(0, start);
    const after = textBuffer.slice(end);
    const needsLeadingNewline = before.length > 0 && !before.endsWith('\n\n');
    const needsTrailingNewline = after.length > 0 && !after.startsWith('\n\n');

    const insertion =
      (needsLeadingNewline ? '\n\n' : '') +
      blockContent +
      (needsTrailingNewline ? '\n\n' : '\n\n');

    const nextText = before + insertion + after;
    pushToHistory(nextText);

    setTimeout(() => {
      textarea.focus();
      const pos = before.length + insertion.length;
      textarea.setSelectionRange(pos, pos);
    }, 10);
  };

  // Formatting actions
  const applyHeading = (level: 1 | 2 | 3 | 4) => {
    const hashes = '#'.repeat(level);
    insertBlockAtCursor(`${hashes} Título Sección ${level}`);
  };

  const applyBlockquote = () => {
    insertBlockAtCursor('> "Una cita editorial de gran valor que sintetiza la visión del autor."');
  };

  const applyPullquote = () => {
    insertBlockAtCursor(
      `[PULLQUOTE: "${formData.pullQuote || 'Una cita destacada para romper la lectura y aportar elegancia.'}" — ${
        db.users.find((u) => u.id === formData.authorId)?.name || 'Redacción Kayleen'
      }]`
    );
  };

  const applyBulletList = () => {
    insertBlockAtCursor('- Primer punto editorial clave\n- Segundo concepto a considerar\n- Tercer elemento analizado');
  };

  const applyNumberedList = () => {
    insertBlockAtCursor('1. Fase inicial de conceptualización\n2. Desarrollo editorial y producción fotográfica\n3. Revisión crítica y publicación');
  };

  const applyChecklist = () => {
    insertBlockAtCursor('[x] Investigación y fuentes verificadas\n[x] Selección fotográfica en alta resolución\n[ ] Corrección de estilo final');
  };

  const applyHorizontalRule = () => {
    insertBlockAtCursor('---');
  };

  const applyTable = () => {
    let md = '| Elemento | Categoría | Impacto Editorial |\n| :--- | :--- | :---: |\n';
    for (let r = 1; r <= tableRows; r++) {
      md += `| Fila ${r} Dato A | Detalle Técnico | ★★★ |\n`;
    }
    insertBlockAtCursor(md.trim());
    setShowTableModal(false);
  };

  const applyCallout = () => {
    const label =
      calloutType === 'info'
        ? 'NOTA EDITORIAL'
        : calloutType === 'tip'
        ? 'CONSEJO PRÁCTICO'
        : calloutType === 'warning'
        ? 'ADVERTENCIA'
        : 'REFLEXIÓN';
    const text = calloutText.trim() || 'Este contenido complementario resalta información clave para el lector.';
    insertBlockAtCursor(`[CALLOUT:${calloutType.toUpperCase()}: ${label}: ${text}]`);
    setCalloutText('');
    setShowCalloutModal(false);
  };

  const applyLink = () => {
    if (!linkUrl.trim()) return;
    const label = linkText.trim() || linkUrl.replace(/^https?:\/\//, '');
    insertFormatting(`[${label}](`, `)`, linkUrl);
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('https://');
  };

  const applyInlineImage = (imgUrl: string, caption: string = 'Fotografía editorial Kayleen') => {
    insertBlockAtCursor(`![${caption}](${imgUrl})`);
  };

  const applyTextColor = (colorHex: string) => {
    insertFormatting(`<span style="color: ${colorHex}">`, '</span>', 'Texto con color');
    setShowTextColorPicker(false);
  };

  const applyHighlightColor = (bgHex: string) => {
    if (!bgHex) {
      insertFormatting('', '', '');
      setShowHighlightColorPicker(false);
      return;
    }
    insertFormatting(`<mark style="background-color: ${bgHex}; padding: 0.1em 0.3em; border-radius: 4px;">`, '</mark>', 'Texto resaltado');
    setShowHighlightColorPicker(false);
  };

  // Image upload handling from PC
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadNotice(`Subiendo ${files.length} imagen(es) desde tu PC...`);
    const fileArr = Array.from(files);
    let loadedCount = 0;
    const newUrls: string[] = [];

    fileArr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          newUrls.push(reader.result);
        }
        loadedCount++;
        if (loadedCount === fileArr.length) {
          setFormData((prev) => {
            const currentGallery = prev.galleryImages || [];
            const merged = [...currentGallery, ...newUrls];
            return {
              ...prev,
              galleryImages: merged,
              customImageUrl: prev.customImageUrl || merged[0],
            };
          });
          setUploadNotice(`¡${files.length} imagen(es) subidas y vinculadas con éxito!`);
          setTimeout(() => setUploadNotice(''), 3500);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    const urls = trimmed
      .split(',')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http') || u.startsWith('/'));
    if (urls.length === 0) return;

    setFormData((prev) => {
      const currentGallery = prev.galleryImages || [];
      const merged = [...currentGallery, ...urls];
      return {
        ...prev,
        galleryImages: merged,
        customImageUrl: prev.customImageUrl || merged[0],
      };
    });
    setImageUrlInput('');
    setUploadNotice(`¡${urls.length} link(s) de imagen añadido(s) a la galería!`);
    setTimeout(() => setUploadNotice(''), 3000);
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const current = prev.galleryImages || [];
      const updated = current.filter((_, idx) => idx !== indexToRemove);
      const isRemovedCover = prev.customImageUrl === current[indexToRemove];
      return {
        ...prev,
        galleryImages: updated,
        customImageUrl: isRemovedCover ? updated[0] || '' : prev.customImageUrl,
      };
    });
  };

  const handleSetMainCoverImage = (imgUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      customImageUrl: imgUrl,
    }));
  };

  // Co-authors toggle
  const handleToggleCoAuthor = (userId: string) => {
    setFormData((prev) => {
      const current = prev.coAuthorIds || [];
      const exists = current.includes(userId);
      return {
        ...prev,
        coAuthorIds: exists ? current.filter((id) => id !== userId) : [...current, userId],
      };
    });
  };

  // Quick Inline Co-Author Creation
  const handleQuickCreateCoAuthor = async () => {
    if (!quickAuthorName.trim() || !quickAuthorEmail.trim() || !onQuickCreateAuthor) return;
    await onQuickCreateAuthor({
      name: quickAuthorName.trim(),
      email: quickAuthorEmail.trim(),
      role: 'author',
      specialty: quickAuthorSpecialty.trim() || 'Coautor Colaborador',
      bio: 'Colaborador editorial en Kayleen Magazine.',
      location: 'Madrid, España',
    });
    setQuickAuthorName('');
    setQuickAuthorEmail('');
    setQuickAuthorSpecialty('');
    setShowQuickAuthorForm(false);
  };

  // Hashtag adder & suggestions
  const handleAddHashtag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().replace(/^#/, '');
    if (!clean) return;
    setFormData((prev) => {
      const current = prev.tags || [];
      if (current.includes(clean)) return prev;
      return { ...prev, tags: [...current, clean] };
    });
    setHashtagInput('');
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove),
    }));
  };

  // Save handler
  const handleSaveArticle = async (statusOverride?: Article['status']) => {
    setIsSaving(true);
    const finalStatus = statusOverride || formData.status || 'published';
    const isAuthorRole = currentUser?.role === 'author';
    const finalApproval: ArticleApprovalStatus =
      formData.approvalStatus || (isAuthorRole ? 'pending_review' : 'approved');

    const paragraphs = textBuffer
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const payload: Partial<Article> = {
      ...formData,
      content: paragraphs.length > 0 ? paragraphs : ['Texto del artículo.'],
      status: finalStatus,
      approvalStatus: finalApproval,
      title: formData.title?.trim() || 'Nuevo Artículo Editorial',
      excerpt: formData.excerpt?.trim() || formData.title || 'Resumen del artículo...',
      pullQuote: formData.pullQuote || '',
      tags: formData.tags || ['Kayleen'],
      category: formData.category || db.categories[0]?.name || 'Estilo de Vida',
      authorId: formData.authorId || currentUser?.id || db.users[0]?.id || 'usr-1',
      readTimeMinutes: statistics.readTimeMinutes,
    };

    try {
      await onSave(payload);
      setHasUnsavedChanges(false);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // Theming classes for Focus Writing Mode
  const themeStyles = {
    paper: {
      wrapper: 'bg-[#FBF7F0] text-[#2C241D]',
      header: 'bg-[#F3EDE2] border-[#E5DAC8] text-[#2C241D]',
      sheet: 'bg-[#FFFDF9] text-[#2C241D] shadow-xl border border-[#E9DEC9]',
      textarea: 'text-[#2C241D] placeholder-[#9E9080] selection:bg-[#E2D5C3]',
      toolbar: 'bg-[#F3EDE2] border-[#E5DAC8]',
      statusBar: 'bg-[#F3EDE2] border-[#E5DAC8] text-[#6E6356]',
    },
    white: {
      wrapper: 'bg-[#F8FAFC] text-[#0F172A]',
      header: 'bg-white border-[#E2E8F0] text-[#0F172A]',
      sheet: 'bg-white text-[#0F172A] shadow-xl border border-[#E2E8F0]',
      textarea: 'text-[#0F172A] placeholder-[#94A3B8] selection:bg-[#E2E8F0]',
      toolbar: 'bg-white border-[#E2E8F0]',
      statusBar: 'bg-white border-[#E2E8F0] text-[#64748B]',
    },
    dark: {
      wrapper: 'bg-[#0F1117] text-[#E2E8F0]',
      header: 'bg-[#181B26] border-[#262B3D] text-[#F8FAFC]',
      sheet: 'bg-[#181B26] text-[#E2E8F0] shadow-2xl border border-[#262B3D]',
      textarea: 'text-[#F1F5F9] placeholder-[#64748B] selection:bg-[#334155]',
      toolbar: 'bg-[#181B26] border-[#262B3D]',
      statusBar: 'bg-[#181B26] border-[#262B3D] text-[#94A3B8]',
    },
  }[isFocusWritingMode ? writingTheme : 'white'];

  const widthClasses = {
    compact: 'max-w-[720px]',
    normal: 'max-w-[880px]',
    wide: 'max-w-[1100px]',
  }[writingWidth];

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#171920]/75 backdrop-blur-xs">
      {/* ================================================================= */}
      {/* 1. TOP APPLICATION BAR (WORDPRESS / WORD HEADER)                  */}
      {/* ================================================================= */}
      {isFocusWritingMode ? (
        <header
          className={`h-14 px-4 sm:px-8 flex items-center justify-between gap-4 border-b shrink-0 transition-colors duration-200 ${themeStyles.header}`}
        >
          {/* Left: Zen Document Info */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-bold text-xs uppercase tracking-wider text-[#FF2C54] flex items-center gap-1.5 shrink-0">
              <Feather className="w-4 h-4" />
              <span>Modo Escritura Zen</span>
            </span>
            <span className="opacity-30 hidden sm:inline" aria-hidden="true">•</span>
            <span className="text-xs opacity-75 hidden sm:inline truncate max-w-[200px]">
              {formData.title?.trim() || 'Sin título'}
            </span>
            <span className="opacity-30" aria-hidden="true">•</span>
            <span className="text-xs font-mono tabular-nums opacity-80 shrink-0">
              {statistics.words} palabras · {statistics.readTimeMinutes} min
            </span>
            <span className="opacity-30" aria-hidden="true">•</span>
            {hasUnsavedChanges ? (
              <span className="text-amber-500 font-semibold text-[11px] shrink-0">
                ● Sin guardar
              </span>
            ) : (
              <span className="text-emerald-500 font-semibold text-[11px] flex items-center gap-1 shrink-0">
                <Check className="w-3 h-3" />
                Guardado
              </span>
            )}
          </div>

          {/* Center: Theme Selector (Paper / White / Dark) */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-black/5 dark:bg-white/10 text-xs">
            <button
              type="button"
              onClick={() => setWritingTheme('paper')}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                writingTheme === 'paper'
                  ? 'bg-[#E5DAC8] text-[#2C241D] shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              📜 Crema
            </button>
            <button
              type="button"
              onClick={() => setWritingTheme('white')}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                writingTheme === 'white'
                  ? 'bg-white text-black shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              📄 Blanco
            </button>
            <button
              type="button"
              onClick={() => setWritingTheme('dark')}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                writingTheme === 'dark'
                  ? 'bg-[#262B3D] text-white shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              🌙 Noche
            </button>
          </div>

          {/* Right: STRICTLY ONLY Essential Guardar and Salir Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveArticle(formData.status || 'draft')}
              className="px-4 py-1.5 rounded-[8px] text-xs font-bold text-white bg-[#FF2C54] hover:bg-[#e02247] transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Guardar cambios del artículo (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFocusWritingMode(false)}
              className="px-3.5 py-1.5 rounded-[8px] text-xs font-semibold border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1.5 cursor-pointer text-inherit"
              title="Salir del Modo Escritura y volver al editor completo (Esc)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Salir de Modo Escritura</span>
            </button>
          </div>
        </header>
      ) : (
        <header
          className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4 border-b shrink-0 transition-colors duration-200 bg-white border-[#dcdfe7]"
        >
          {/* Left: Document info & Back */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (window.confirm('Tienes cambios no guardados. ¿Deseas salir del editor?')) {
                    onClose();
                  }
                } else {
                  onClose();
                }
              }}
              className="p-2 rounded-[8px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-inherit cursor-pointer shrink-0"
              title="Cerrar editor y volver al panel"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-sm tracking-tight truncate max-w-[200px] sm:max-w-xs">
                {formData.title?.trim() || 'Nuevo Artículo sin título'}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                  formData.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                {formData.status === 'published' ? 'Publicado' : 'Borrador'}
              </span>
              {formData.isPremium && (
                <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 shrink-0">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Premium</span>
                </span>
              )}
            </div>
          </div>

          {/* Center: View Switcher (Visual vs Código vs Vista Previa) */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-[#f7f8fc] rounded-[10px] border border-[#dcdfe7]">
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1.5 rounded-[7px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-[#171920] text-white shadow-xs'
                  : 'text-[#595F71] hover:text-[#171920]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Editor Visual (Word)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-[7px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-[#171920] text-white shadow-xs'
                  : 'text-[#595F71] hover:text-[#171920]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Código / Markdown</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-[7px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-[#171920] text-white shadow-xs'
                  : 'text-[#595F71] hover:text-[#171920]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vista Previa Revista</span>
            </button>
          </div>

          {/* Right: Zen Writing Mode Toggle, Sidebar Toggle & Publish Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Zen Writing Mode Button */}
            <button
              type="button"
              onClick={() => setIsFocusWritingMode(true)}
              className="px-3 py-1.5 rounded-[8px] text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer bg-[#f7f8fc] hover:bg-[#171920] hover:text-white border border-[#dcdfe7] text-[#171920]"
              title="Activar Modo Escritura sin distracciones (oculta barras y paneles)"
            >
              <Feather className="w-4 h-4 text-[#FF2C54]" />
              <span className="hidden sm:inline">Modo Escritura</span>
            </button>

            {/* Settings Inspector Sidebar Toggle (WordPress Gutenberg Gear) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className={`p-2 rounded-[8px] border transition-colors cursor-pointer ${
                isSidebarOpen
                  ? 'bg-[#171920] text-white border-[#171920]'
                  : 'bg-white text-[#595F71] border-[#dcdfe7] hover:text-[#171920]'
              }`}
              title="Ajustes de Publicación y Documento"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Quick Draft Save Button */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveArticle('draft')}
              className="px-3.5 py-1.5 rounded-[8px] text-xs font-semibold border border-[#dcdfe7] bg-white text-[#171920] hover:bg-black/5 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-[#595F71]" />
              <span className="hidden sm:inline">Guardar Borrador</span>
            </button>

            {/* Main Publish / Submit Button */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveArticle('published')}
              className="px-4 py-1.5 rounded-[8px] text-xs font-bold text-white bg-[#FF2C54] hover:bg-[#e02247] transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSaving
                  ? 'Guardando...'
                  : currentUser?.role === 'author'
                  ? 'Enviar a Revisión'
                  : 'Publicar Ahora'}
              </span>
            </button>
          </div>
        </header>
      )}

      {/* ================================================================= */}
      {/* 2. MAIN WORKSPACE WITH TOOLBAR & INSPECTOR SIDEBAR                 */}
      {/* ================================================================= */}
      <div className={`flex-1 flex overflow-hidden ${themeStyles.wrapper}`}>
        {/* Editor Main Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* =============================================================== */}
          {/* WORD & WORDPRESS RICH FORMATTING TOOLBAR (HIDDEN IN FOCUS MODE) */}
          {/* =============================================================== */}
          {!isFocusWritingMode && (
            <div
              className="border-b p-2 px-4 flex flex-wrap items-center gap-1 sm:gap-1.5 shrink-0 select-none overflow-x-auto bg-[#FAFAFB] border-[#dcdfe7]"
            >
            {/* Undo / Redo Group */}
            <div className="flex items-center gap-0.5 border-r border-black/10 dark:border-white/10 pr-1.5 mr-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
                title="Deshacer (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
                title="Rehacer (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Paragraph / Headings Group */}
            <div className="flex items-center gap-0.5 border-r border-black/10 dark:border-white/10 pr-1.5 mr-1">
              <button
                type="button"
                onClick={() => applyHeading(1)}
                className="px-2 py-1 rounded text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Título Principal H1"
              >
                <Heading1 className="w-4 h-4 text-[#FF2C54]" />
                <span className="text-[11px]">H1</span>
              </button>
              <button
                type="button"
                onClick={() => applyHeading(2)}
                className="px-2 py-1 rounded text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Subtítulo H2"
              >
                <Heading2 className="w-4 h-4 text-[#5960FF]" />
                <span className="text-[11px]">H2</span>
              </button>
              <button
                type="button"
                onClick={() => applyHeading(3)}
                className="px-2 py-1 rounded text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Sección H3"
              >
                <Heading3 className="w-4 h-4" />
                <span className="text-[11px]">H3</span>
              </button>
              <button
                type="button"
                onClick={() => applyHeading(4)}
                className="px-1.5 py-1 rounded text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Subsección H4"
              >
                <Heading4 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Word Formatting: Bold, Italic, Underline, Strikethrough, Code */}
            <div className="flex items-center gap-0.5 border-r border-black/10 dark:border-white/10 pr-1.5 mr-1">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**', 'texto en negrita')}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Negrita (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*', 'texto en cursiva')}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Cursiva (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('__', '__', 'texto subrayado')}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Subrayado (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('~~', '~~', 'texto tachado')}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Tachado"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('`', '`', 'código')}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Código en línea"
              >
                <CodeIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Color & Highlight Picker Popups */}
            <div className="flex items-center gap-1 border-r border-black/10 dark:border-white/10 pr-1.5 mr-1 relative">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowTextColorPicker((prev) => !prev);
                    setShowHighlightColorPicker(false);
                  }}
                  className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Color de Texto Editorial"
                >
                  <Palette className="w-4 h-4 text-[#FF2C54]" />
                  <span className="text-[10px] font-bold">A</span>
                </button>
                {showTextColorPicker && (
                  <div className="absolute top-full left-0 mt-2 p-2.5 bg-white dark:bg-[#1E2230] border border-[#dcdfe7] dark:border-[#2D3246] rounded-[10px] shadow-xl z-50 w-44">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">
                      Color de Texto
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => applyTextColor(c.value)}
                          className="w-7 h-7 rounded-full border border-black/15 hover:scale-110 transition-transform cursor-pointer"
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowHighlightColorPicker((prev) => !prev);
                    setShowTextColorPicker(false);
                  }}
                  className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Resaltador de Fondo (Highlight)"
                >
                  <span className="w-3.5 h-3.5 rounded bg-amber-300 border border-amber-400 block" />
                  <span className="text-[10px] font-bold">Resaltar</span>
                </button>
                {showHighlightColorPicker && (
                  <div className="absolute top-full left-0 mt-2 p-2.5 bg-white dark:bg-[#1E2230] border border-[#dcdfe7] dark:border-[#2D3246] rounded-[10px] shadow-xl z-50 w-48">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">
                      Color de Resaltado
                    </span>
                    <div className="space-y-1">
                      {HIGHLIGHT_PALETTE.map((h) => (
                        <button
                          key={h.name}
                          type="button"
                          onClick={() => applyHighlightColor(h.value)}
                          className="w-full text-left px-2 py-1 rounded text-xs hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                        >
                          <span
                            className="w-4 h-4 rounded border border-black/20 shrink-0"
                            style={{ backgroundColor: h.value || '#ffffff' }}
                          />
                          <span className="text-[11px] truncate">{h.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lists: Bullets, Numbered, Checklist */}
            <div className="flex items-center gap-0.5 border-r border-black/10 dark:border-white/10 pr-1.5 mr-1">
              <button
                type="button"
                onClick={applyBulletList}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Lista con viñetas"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={applyNumberedList}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Lista numerada"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={applyChecklist}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Lista de tareas / Checklist"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            </div>

            {/* Block Insertions: Quote, Pullquote, Table, Link, Callout, Divider */}
            <div className="flex items-center gap-1 border-r border-black/10 dark:border-white/10 pr-1.5 mr-1">
              <button
                type="button"
                onClick={applyBlockquote}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Cita editorial (Blockquote)"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={applyPullquote}
                className="px-2 py-1 rounded text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer inline-flex items-center gap-1"
                title="Cita destacada (Pullquote)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF2C54]" />
                <span className="text-[11px]">Pullquote</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCalloutModal(true)}
                className="px-2 py-1 rounded text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer inline-flex items-center gap-1"
                title="Caja de llamada / Nota editorial"
              >
                <Layers className="w-3.5 h-3.5 text-[#5960FF]" />
                <span className="text-[11px]">Caja Nota</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTableModal(true)}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Insertar Tabla formateada"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Insertar Enlace web"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={applyHorizontalRule}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Línea divisoria horizontal (Separador)"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Image Inserter from Article Gallery */}
            {(formData.galleryImages || []).length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-400 mr-1 hidden lg:inline">Insertar Foto:</span>
                {(formData.galleryImages || []).slice(0, 3).map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyInlineImage(url, `Imagen ${i + 1} de ${formData.title}`)}
                    className="w-7 h-7 rounded overflow-hidden border hover:border-[#FF2C54] transition-colors cursor-pointer shrink-0"
                    title={`Insertar imagen ${i + 1} en el texto`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          )}

          {/* =============================================================== */}
          {/* EDITOR BODY VIEWPORT                                            */}
          {/* =============================================================== */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
            {/* TAB 1: VISUAL WYSIWYG & WORD-STYLE TEXT EDITING */}
            {(activeTab === 'visual' || isFocusWritingMode) && (
              <div className={`w-full ${isFocusWritingMode ? 'max-w-3xl' : widthClasses} space-y-6 transition-all duration-300`}>
                {/* Visual Sheet Container */}
                <div className={`rounded-[16px] ${isFocusWritingMode ? 'p-8 sm:p-14 shadow-2xl' : 'p-6 sm:p-12 shadow-xl'} transition-colors ${themeStyles.sheet}`}>
                  {/* Article Title Field in Editor Sheet */}
                  <div className="mb-6 pb-6 border-b border-black/10 dark:border-white/10 space-y-3">
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, title: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Añade el título principal del artículo..."
                      className="w-full text-2xl sm:text-4xl font-extrabold tracking-tight bg-transparent border-none outline-none placeholder:opacity-40"
                    />

                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, subtitle: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Subtítulo editorial descriptivo (opcional)..."
                      className="w-full text-base sm:text-lg font-medium opacity-80 bg-transparent border-none outline-none placeholder:opacity-40"
                    />

                    {/* Metadata pill strip right under title */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs opacity-75">
                      <span className="font-semibold text-[#FF2C54]">
                        📁 {formData.category}
                      </span>
                      <span>•</span>
                      <span>
                        ✍️ Por {db.users.find((u) => u.id === formData.authorId)?.name || 'Autor'}
                      </span>
                      <span>•</span>
                      <span>⏱️ {statistics.readTimeMinutes} min de lectura</span>
                      {formData.isPremium && (
                        <>
                          <span>•</span>
                          <span className="text-amber-500 font-bold inline-flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Artículo Premium
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Main Writing Textarea Surface */}
                  <textarea
                    ref={editorTextareaRef}
                    value={textBuffer}
                    onChange={(e) => pushToHistory(e.target.value)}
                    placeholder="Empieza a escribir aquí o pega tu contenido. En este Modo Escritura tienes la pantalla despejada y tipografía editorial optimizada para concentrarte..."
                    rows={20}
                    className={`w-full bg-transparent border-none outline-none resize-none font-serif text-[18px] sm:text-[21px] leading-[2.0] tracking-[0.015em] min-h-[60vh] ${themeStyles.textarea}`}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: RAW CODE / HTML / MARKDOWN VIEW */}
            {activeTab === 'code' && !isFocusWritingMode && (
              <div className="w-full max-w-4xl space-y-4">
                <div className="p-4 rounded-[12px] bg-[#171920] text-gray-200 shadow-xl border border-gray-800">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-700 text-xs">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#5960FF]" />
                      <span className="font-mono font-bold text-white">
                        Editor de Código Fuente (Markdown & HTML)
                      </span>
                    </div>
                    <span className="text-gray-400 font-mono text-[11px]">
                      {statistics.words} palabras · {statistics.characters} caracteres
                    </span>
                  </div>

                  <textarea
                    ref={editorTextareaRef}
                    value={textBuffer}
                    onChange={(e) => pushToHistory(e.target.value)}
                    rows={22}
                    className="w-full font-mono text-xs sm:text-sm leading-relaxed bg-transparent text-emerald-400 border-none outline-none resize-none selection:bg-gray-700"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: REAL-TIME MAGAZINE PREVIEW VIEW */}
            {activeTab === 'preview' && !isFocusWritingMode && (
              <div className="w-full max-w-3xl bg-white rounded-[16px] p-8 sm:p-12 shadow-2xl border border-[#dcdfe7] text-[#171920]">
                <div className="mb-8 pb-6 border-b border-[#dcdfe7]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FF2C54]/10 text-[#FF2C54]">
                      {formData.category}
                    </span>
                    {formData.isPremium && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5" />
                        Exclusivo Premium
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171920] mb-3">
                    {formData.title || 'Título del Artículo'}
                  </h1>

                  {formData.subtitle && (
                    <p className="text-lg text-[#595F71] font-medium leading-relaxed mb-4">
                      {formData.subtitle}
                    </p>
                  )}

                  {formData.customImageUrl && (
                    <div className="my-6 rounded-[14px] overflow-hidden border border-[#dcdfe7] shadow-sm">
                      <img
                        src={formData.customImageUrl}
                        alt={formData.title}
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  )}

                  {formData.excerpt && (
                    <div className="p-4 bg-[#f7f8fc] rounded-[10px] border-l-4 border-[#FF2C54] text-sm text-[#4b546e] italic">
                      “{formData.excerpt}”
                    </div>
                  )}
                </div>

                {/* Rendered Preview Content */}
                <div className="prose prose-lg max-w-none text-[#333B52] leading-[1.85] space-y-5">
                  {textBuffer
                    .split(/\n\s*\n/)
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((paragraph, idx) => {
                      if (paragraph.startsWith('#### ')) {
                        return (
                          <h4 key={idx} className="text-lg font-bold text-[#171920] mt-6 mb-2">
                            {paragraph.slice(5)}
                          </h4>
                        );
                      }
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h3 key={idx} className="text-xl font-bold text-[#171920] mt-7 mb-2">
                            {paragraph.slice(4)}
                          </h3>
                        );
                      }
                      if (paragraph.startsWith('## ')) {
                        return (
                          <h2 key={idx} className="text-2xl font-bold text-[#171920] mt-8 mb-3">
                            {paragraph.slice(3)}
                          </h2>
                        );
                      }
                      if (paragraph.startsWith('# ')) {
                        return (
                          <h1 key={idx} className="text-3xl font-bold text-[#171920] mt-9 mb-4">
                            {paragraph.slice(2)}
                          </h1>
                        );
                      }
                      if (paragraph.startsWith('> ')) {
                        return (
                          <blockquote
                            key={idx}
                            className="pl-5 border-l-4 border-[#FF2C54] italic font-medium my-5 text-[#171920]"
                          >
                            {paragraph.slice(2)}
                          </blockquote>
                        );
                      }
                      if (paragraph.startsWith('[PULLQUOTE:')) {
                        const clean = paragraph.slice(11, -1).trim();
                        return (
                          <div
                            key={idx}
                            className="my-8 p-6 text-center border-y-2 border-[#171920] bg-[#f7f8fc]"
                          >
                            <p className="text-xl font-serif italic font-bold text-[#171920]">
                              {clean}
                            </p>
                          </div>
                        );
                      }
                      if (paragraph.startsWith('[CALLOUT:')) {
                        const clean = paragraph.slice(9, -1).trim();
                        return (
                          <div
                            key={idx}
                            className="my-6 p-5 rounded-[12px] bg-[#f7f8fc] border-l-4 border-[#5960FF] text-sm"
                          >
                            <p className="font-semibold text-[#171920]">{clean}</p>
                          </div>
                        );
                      }
                      if (paragraph.startsWith('---')) {
                        return <hr key={idx} className="my-8 border-[#dcdfe7]" />;
                      }
                      if (paragraph.startsWith('![') && paragraph.includes('](')) {
                        const match = paragraph.match(/!\[(.*?)\]\((.*?)\)/);
                        if (match) {
                          return (
                            <figure key={idx} className="my-6">
                              <img
                                src={match[2]}
                                alt={match[1]}
                                className="w-full rounded-[10px] object-cover max-h-96"
                              />
                              {match[1] && (
                                <figcaption className="text-center text-xs text-[#595F71] mt-2 italic">
                                  {match[1]}
                                </figcaption>
                              )}
                            </figure>
                          );
                        }
                      }
                      return (
                        <p key={idx} className="text-base text-[#333B52] leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* WORD STATUS BAR (BOTTOM STATS BAR)                              */}
          {/* =============================================================== */}
          <footer
            className={`h-9 px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono border-t shrink-0 select-none ${
              isFocusWritingMode ? themeStyles.statusBar : 'bg-white border-[#dcdfe7] text-[#595F71]'
            }`}
          >
            <div className="flex items-center gap-4">
              <span>{statistics.words} palabras</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">{statistics.characters} caracteres</span>
              <span>|</span>
              <span>{statistics.paragraphs} párrafos</span>
              <span>|</span>
              <span className="text-[#FF2C54] font-semibold">
                ~{statistics.readTimeMinutes} min de lectura
              </span>
            </div>

            <div className="flex items-center gap-3">
              {hasUnsavedChanges ? (
                <span className="text-amber-500 font-semibold inline-flex items-center gap-1">
                  ● Cambios sin guardar
                </span>
              ) : (
                <span className="text-emerald-500 font-semibold inline-flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Sincronizado
                </span>
              )}
            </div>
          </footer>
        </div>

        {/* =============================================================== */}
        {/* 3. GUTENBERG-STYLE INSPECTOR SIDEBAR (AJUSTES DE PUBLICACIÓN)   */}
        {/* =============================================================== */}
        {isSidebarOpen && !isFocusWritingMode && (
          <aside className="w-80 sm:w-88 bg-white border-l border-[#dcdfe7] flex flex-col shrink-0 shadow-lg overflow-y-auto">
            {/* Sidebar Header Tabs */}
            <div className="p-3 border-b border-[#dcdfe7] flex items-center justify-between gap-1 bg-[#FAFAFB]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSidebarTab('document')}
                  className={`px-3 py-1 rounded-[6px] text-xs font-bold transition-colors cursor-pointer ${
                    sidebarTab === 'document'
                      ? 'bg-[#171920] text-white'
                      : 'text-[#595F71] hover:text-[#171920]'
                  }`}
                >
                  Documento
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab('seo')}
                  className={`px-3 py-1 rounded-[6px] text-xs font-bold transition-colors cursor-pointer ${
                    sidebarTab === 'seo'
                      ? 'bg-[#171920] text-white'
                      : 'text-[#595F71] hover:text-[#171920]'
                  }`}
                >
                  SEO & Meta
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded text-[#595F71] hover:text-[#171920] cursor-pointer"
                title="Ocultar barra de ajustes"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Content Body */}
            <div className="p-5 space-y-6 text-xs text-[#171920]">
              {sidebarTab === 'document' ? (
                <>
                  {/* Section 1: Estado y Visibilidad */}
                  <div className="space-y-3 pb-5 border-b border-[#dcdfe7]">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#595F71] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#5960FF]" />
                      <span>Estado y Publicación</span>
                    </h4>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#595F71] mb-1">
                        Estado del Artículo
                      </label>
                      <select
                        value={formData.status || 'published'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as Article['status'],
                          })
                        }
                        className="w-full px-3 py-2 rounded-[8px] border border-[#dcdfe7] bg-white font-semibold text-xs"
                      >
                        <option value="published">Publicado</option>
                        <option value="draft">Borrador</option>
                        <option value="scheduled">Programado con fecha</option>
                        <option value="pending_review">Pendiente de Aprobación</option>
                      </select>
                    </div>

                    {formData.status === 'scheduled' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-[#595F71] mb-1">
                          Fecha y Hora de Publicación Automática
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.scheduledPublishAt || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, scheduledPublishAt: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-[8px] border border-[#dcdfe7] font-mono text-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Section 2: Exclusividad Premium */}
                  <div className="p-3.5 rounded-[12px] bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border border-amber-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-600" />
                        <span>Artículo Premium</span>
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.isPremium)}
                          onChange={(e) =>
                            setFormData({ ...formData, isPremium: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Si se activa, este contenido quedará bloqueado con el Paywall y solo podrán leerlo los usuarios con suscripción de pago activa.
                    </p>
                  </div>

                  {/* Section 3: Categoría */}
                  <div className="space-y-3 pb-5 border-b border-[#dcdfe7]">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#595F71] flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-[#FF2C54]" />
                      <span>Categoría Editorial</span>
                    </h4>

                    <select
                      value={formData.category || db.categories?.[0]?.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as ArticleCategory,
                        })
                      }
                      className="w-full px-3 py-2 rounded-[8px] border border-[#dcdfe7] bg-white font-semibold text-xs"
                    >
                      {db.categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section 4: Autoría y Coautores */}
                  <div className="space-y-3 pb-5 border-b border-[#dcdfe7]">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#595F71]">
                        Autoría Colaborativa
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowQuickAuthorForm((prev) => !prev)}
                        className="text-[11px] font-semibold text-[#5960FF] hover:underline cursor-pointer"
                      >
                        {showQuickAuthorForm ? 'Cerrar' : '+ Nuevo autor'}
                      </button>
                    </div>

                    {showQuickAuthorForm && (
                      <div className="p-3 bg-[#f7f8fc] rounded-[8px] border border-[#dcdfe7] space-y-2">
                        <input
                          type="text"
                          value={quickAuthorName}
                          onChange={(e) => setQuickAuthorName(e.target.value)}
                          placeholder="Nombre autor *"
                          className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-[#dcdfe7]"
                        />
                        <input
                          type="email"
                          value={quickAuthorEmail}
                          onChange={(e) => setQuickAuthorEmail(e.target.value)}
                          placeholder="Email *"
                          className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-[#dcdfe7]"
                        />
                        <input
                          type="text"
                          value={quickAuthorSpecialty}
                          onChange={(e) => setQuickAuthorSpecialty(e.target.value)}
                          placeholder="Especialidad (ej. Fotógrafo)"
                          className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-[#dcdfe7]"
                        />
                        <button
                          type="button"
                          onClick={handleQuickCreateCoAuthor}
                          className="w-full py-1.5 rounded text-xs font-bold text-white bg-[#5960FF] hover:bg-[#171920] transition-colors cursor-pointer"
                        >
                          Guardar y Vincular
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-[#595F71] mb-1">
                        Autor Principal
                      </label>
                      <select
                        value={formData.authorId || db.users[0]?.id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            authorId: e.target.value,
                            coAuthorIds: (formData.coAuthorIds || []).filter((id) => id !== e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-[8px] border border-[#dcdfe7] bg-white font-semibold text-xs"
                      >
                        {db.users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#595F71] mb-1">
                        Coautores / Colaboradores
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-[#f7f8fc] rounded-[8px] border border-[#dcdfe7]">
                        {db.users
                          .filter((u) => u.id !== formData.authorId)
                          .map((u) => {
                            const isSelected = (formData.coAuthorIds || []).includes(u.id);
                            return (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => handleToggleCoAuthor(u.id)}
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                  isSelected
                                    ? 'bg-[#5960FF] text-white'
                                    : 'bg-white text-[#4b546e] border border-[#dcdfe7] hover:border-[#5960FF]'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5" />}
                                <span>{u.name}</span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Imágenes & Portada */}
                  <div className="space-y-3 pb-5 border-b border-[#dcdfe7]">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#595F71]">
                        Imágenes & Portada
                      </h4>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-bold text-[#FF2C54] hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Subir de PC</span>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFilesSelected}
                      className="hidden"
                    />

                    {/* Direct URL input */}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="URL de imagen..."
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-[6px] border border-[#dcdfe7]"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-2.5 py-1.5 rounded-[6px] text-xs font-semibold bg-[#171920] text-white hover:bg-[#FF2C54] transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {uploadNotice && (
                      <p className="text-[11px] font-medium text-emerald-600">{uploadNotice}</p>
                    )}

                    {/* Gallery Thumbnails */}
                    {(formData.galleryImages || []).length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {(formData.galleryImages || []).map((imgUrl, i) => {
                          const isCover = formData.customImageUrl === imgUrl;
                          return (
                            <div
                              key={i}
                              className={`relative rounded-[8px] overflow-hidden border-2 group bg-black/5 ${
                                isCover ? 'border-[#FF2C54]' : 'border-[#dcdfe7]'
                              }`}
                            >
                              <img src={imgUrl} alt="" className="w-full h-16 object-cover" />
                              <div className="p-1 flex items-center justify-between bg-white/90 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => handleSetMainCoverImage(imgUrl)}
                                  className={`px-1 py-0.5 rounded font-bold cursor-pointer ${
                                    isCover ? 'bg-[#FF2C54] text-white' : 'text-[#4b546e]'
                                  }`}
                                  title="Marcar como foto de portada"
                                >
                                  {isCover ? 'Portada' : 'Elegir'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryImage(i)}
                                  className="text-red-500 hover:text-red-700 cursor-pointer p-0.5"
                                  title="Eliminar de galería"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Section 6: Hashtags y Etiquetas */}
                  <div className="space-y-3 pb-5 border-b border-[#dcdfe7]">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#595F71] flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-[#5960FF]" />
                      <span>Hashtags del Artículo</span>
                    </h4>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={hashtagInput}
                        onChange={(e) => setHashtagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddHashtag(hashtagInput);
                          }
                        }}
                        placeholder="Escribe un #hashtag y pulsa Enter..."
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-[6px] border border-[#dcdfe7]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddHashtag(hashtagInput)}
                        className="px-3 py-1.5 rounded-[6px] text-xs font-semibold bg-[#5960FF] text-white cursor-pointer"
                      >
                        Añadir
                      </button>
                    </div>

                    {/* Active tags on this article */}
                    <div className="flex flex-wrap gap-1">
                      {(formData.tags || []).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f7f8fc] border border-[#dcdfe7] text-[#171920] inline-flex items-center gap-1"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={() => handleRemoveHashtag(t)}
                            className="text-[#9497AE] hover:text-red-500 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Quick suggestion chips from stored database hashtags */}
                    <div>
                      <span className="text-[10px] text-[#595F71] block mb-1">
                        Hashtags guardados en el sistema (haz clic para agregar):
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {(db.hashtags || []).map((ht) => {
                          const val = ht.tag || ht.name || '';
                          if (!val) return null;
                          return (
                            <button
                              key={ht.id}
                              type="button"
                              onClick={() => handleAddHashtag(val)}
                              className="px-2 py-0.5 rounded text-[10px] bg-white border border-[#dcdfe7] hover:border-[#5960FF] hover:text-[#5960FF] transition-colors cursor-pointer"
                            >
                              #{val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Section 7: Extracto y Cita Destacada */}
                  <div className="space-y-3 pb-5 border-b border-[#dcdfe7]">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#595F71]">
                      Extracto de Portada
                    </h4>
                    <textarea
                      rows={2}
                      value={formData.excerpt || ''}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Breve resumen para tarjetas del blog..."
                      className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                    />

                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#595F71] pt-2">
                      Cita de Impacto (Pullquote)
                    </h4>
                    <textarea
                      rows={2}
                      value={formData.pullQuote || ''}
                      onChange={(e) => setFormData({ ...formData, pullQuote: e.target.value })}
                      placeholder="Cita editorial destacada..."
                      className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>

                  {/* Section 8: Opciones de Hero Grid & Layout */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.featuredHero)}
                        onChange={(e) => setFormData({ ...formData, featuredHero: e.target.checked })}
                        className="accent-[#FF2C54]"
                      />
                      <span>Destacar en Hero Grid (Kayleen Top Tiles)</span>
                    </label>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#595F71] mb-1">
                        Visual Preset Respaldo
                      </label>
                      <select
                        value={formData.visualPreset || 'summer_coast'}
                        onChange={(e) =>
                          setFormData({ ...formData, visualPreset: e.target.value as VisualPreset })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-[6px] border border-[#dcdfe7] bg-white"
                      >
                        {VISUAL_PRESETS.map((vp) => (
                          <option key={vp.value} value={vp.value}>
                            {vp.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                /* TAB 2: SEO & METADATOS */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#171920] mb-1">
                      Título SEO (Meta Title)
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle ?? formData.title ?? ''}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      placeholder="Título optimizado para Google..."
                      className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                    />
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                      {(formData.seoTitle || formData.title || '').length} / 60 caracteres recomendados
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171920] mb-1">
                      Meta Descripción SEO
                    </label>
                    <textarea
                      rows={3}
                      value={formData.seoDescription ?? formData.excerpt ?? ''}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      placeholder="Descripción atractiva para motores de búsqueda..."
                      className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                    />
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                      {(formData.seoDescription || formData.excerpt || '').length} / 160 caracteres recomendados
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171920] mb-1">
                      Palabras Clave SEO (Keywords)
                    </label>
                    <input
                      type="text"
                      value={formData.seoKeywords ?? (formData.tags || []).join(', ')}
                      onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                      placeholder="Separadas por comas..."
                      className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>

                  {/* Google Search Snippet Live Simulation */}
                  <div className="p-3.5 rounded-[10px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#595F71] block">
                      Simulación Google Search
                    </span>
                    <div className="text-[11px] text-emerald-800 font-mono truncate">
                      https://kayleen.magazine/{formData.category?.toLowerCase()}/
                    </div>
                    <div className="text-xs font-bold text-[#1a0dab] line-clamp-1">
                      {formData.seoTitle || formData.title || 'Título del Artículo en Kayleen'}
                    </div>
                    <div className="text-[11px] text-[#4d5156] line-clamp-2">
                      {formData.seoDescription || formData.excerpt || 'Descripción del artículo para motores de búsqueda...'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ================================================================= */}
      {/* 4. MODALS: TABLE GENERATOR, CALLOUT CREATOR, LINK INSERTER        */}
      {/* ================================================================= */}
      {showTableModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#171920] flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-[#FF2C54]" />
              <span>Insertar Tabla Estilo Word</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#595F71] mb-1">Filas</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#dcdfe7]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#595F71] mb-1">Columnas</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={tableCols}
                  onChange={(e) => setTableCols(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 text-xs rounded border border-[#dcdfe7]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#dcdfe7]">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-3 py-1.5 text-xs rounded border border-[#dcdfe7] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={applyTable}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#FF2C54] rounded cursor-pointer"
              >
                Insertar Tabla
              </button>
            </div>
          </div>
        </div>
      )}

      {showCalloutModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#171920] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#5960FF]" />
              <span>Insertar Caja de Nota Editorial</span>
            </h3>
            <div>
              <label className="block text-xs font-semibold text-[#595F71] mb-1">
                Tipo de Nota
              </label>
              <select
                value={calloutType}
                onChange={(e) => setCalloutType(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded border border-[#dcdfe7] bg-white font-semibold"
              >
                <option value="info">Información / Nota Editorial</option>
                <option value="tip">Consejo Práctico (Tip)</option>
                <option value="warning">Advertencia o Alerta</option>
                <option value="quote">Reflexión Destacada</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#595F71] mb-1">
                Mensaje de la Caja
              </label>
              <textarea
                rows={3}
                value={calloutText}
                onChange={(e) => setCalloutText(e.target.value)}
                placeholder="Escribe el texto de la nota..."
                className="w-full px-3 py-2 text-xs rounded border border-[#dcdfe7]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#dcdfe7]">
              <button
                type="button"
                onClick={() => setShowCalloutModal(false)}
                className="px-3 py-1.5 text-xs rounded border border-[#dcdfe7] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={applyCallout}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#5960FF] rounded cursor-pointer"
              >
                Insertar Caja
              </button>
            </div>
          </div>
        </div>
      )}

      {showLinkModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#171920] flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#FF2C54]" />
              <span>Insertar Enlace Web</span>
            </h3>
            <div>
              <label className="block text-xs font-semibold text-[#595F71] mb-1">Texto Visible</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Ej. Visitar Estudio Rivax"
                className="w-full px-3 py-1.5 text-xs rounded border border-[#dcdfe7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#595F71] mb-1">URL de Destino</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-1.5 text-xs rounded border border-[#dcdfe7]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#dcdfe7]">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 text-xs rounded border border-[#dcdfe7] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={applyLink}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#FF2C54] rounded cursor-pointer"
              >
                Insertar Enlace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
