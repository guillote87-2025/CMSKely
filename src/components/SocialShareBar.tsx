import React, { useState } from 'react';
import { Share2, Check, Link2 } from 'lucide-react';
import { Article } from '../data/akeaData';

interface SocialShareBarProps {
  article: Article;
  onShare: (articleId: string, network: string) => void;
  compact?: boolean;
}

export const SocialShareBar: React.FC<SocialShareBarProps> = ({
  article,
  onShare,
  compact = false,
}) => {
  const [sharedNetwork, setSharedNetwork] = useState<string | null>(null);

  const handleShareClick = (e: React.MouseEvent, network: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?article=${article.slug}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(`${article.title} — ${shareUrl}`).catch(() => {});
    }
    onShare(article.id, network);
    setSharedNetwork(network);
    setTimeout(() => {
      setSharedNetwork(null);
    }, 2400);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs text-[#595F71]">
        <button
          type="button"
          onClick={(e) => handleShareClick(e, 'X / Twitter')}
          className="hover:text-[#FF2C54] transition-colors whitespace-nowrap shrink-0 cursor-pointer font-medium"
          title="Compartir en X / Twitter"
        >
          X
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={(e) => handleShareClick(e, 'Facebook')}
          className="hover:text-[#FF2C54] transition-colors whitespace-nowrap shrink-0 cursor-pointer font-medium"
          title="Compartir en Facebook"
        >
          Fb
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={(e) => handleShareClick(e, 'LinkedIn')}
          className="hover:text-[#FF2C54] transition-colors whitespace-nowrap shrink-0 cursor-pointer font-medium"
          title="Compartir en LinkedIn"
        >
          In
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={(e) => handleShareClick(e, 'Enlace copiado')}
          className="inline-flex items-center gap-1 hover:text-[#FF2C54] transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
          title="Copiar enlace del artículo"
        >
          {sharedNetwork ? (
            <span className="text-[#16A34A] font-medium">¡Copiado!</span>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>{article.shares}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const networks = [
    { id: 'X / Twitter', label: 'X / Twitter' },
    { id: 'Facebook', label: 'Facebook' },
    { id: 'LinkedIn', label: 'LinkedIn' },
    { id: 'WhatsApp', label: 'WhatsApp' },
  ];

  return (
    <div className="border-t border-b border-[#dcdfe7] py-5 my-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-[#595F71] font-semibold">
          Compartir artículo
        </span>
        <span className="text-xs text-[#9497AE]" aria-hidden="true">
          ·
        </span>
        <span className="text-xs font-mono tabular-nums text-[#4b546e]">
          {article.shares} difusiones
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {networks.map((net) => (
          <button
            key={net.id}
            type="button"
            onClick={(e) => handleShareClick(e, net.label)}
            className="px-3.5 py-2 text-xs font-medium text-[#171920] bg-[#f7f8fc] hover:bg-[#171920] hover:text-white transition-colors rounded-[6px] border border-[#dcdfe7] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {net.label}
          </button>
        ))}

        <button
          type="button"
          onClick={(e) => handleShareClick(e, 'Enlace directo')}
          className="px-4 py-2 text-xs font-medium text-white bg-[#FF2C54] hover:bg-[#2c2f3c] transition-colors rounded-[6px] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          {sharedNetwork ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Compartido en {sharedNetwork}</span>
            </>
          ) : (
            <>
              <Link2 className="w-3.5 h-3.5" />
              <span>Copiar Enlace</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
