import React, { useState } from 'react';
import { VisualPreset, User } from '../data/akeaData';

interface EditorialVisualProps {
  preset: VisualPreset;
  customImageUrl?: string;
  alt: string;
  className?: string;
  aspectRatio?: '16:9' | '4:3' | '16:10' | '1:1' | '2:3' | 'fill';
  zoomOnHover?: boolean;
}

const PRESET_TO_REAL_IMAGE: Record<VisualPreset, string> = {
  summer_coast: '/images/kayleen/ben-masora-7GJr-Zxs-IY-unsplash-700x500.jpg',
  alpine_lake: '/images/kayleen/noah-buscher-1-kPytLsVkY-unsplash-400x600.jpg',
  vr_headset: '/images/kayleen/benjamin-massello-BVNhd4c7rqg-unsplash-700x500.jpg',
  smartphone_era: '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg',
  xe_entertainment: '/images/kayleen/ayo-ogunseinde-RrD8ypt8cjY-unsplash-700x500.jpg',
  tropical_beach: '/images/kayleen/brooke-lark-atzWFItRHy8-unsplash-1000x600.jpg',
  tech_hq: '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg',
  minimal_gadgets: '/images/kayleen/divine-effiong-ovMPeGM3W-s-unsplash-400x600.jpg',
  voice_privacy: '/images/kayleen/cleyton-ewerton-N3JngnkuyRs-unsplash-1000x600.jpg',
  travel_apps: '/images/kayleen/very-petty-girl-WRotPmZiXZQ-unsplash-400x300.jpg',
  usbc_future: '/images/kayleen/v-t-UxLcRkhw0yM-unsplash-400x300.jpg',
  photo_mistakes: '/images/kayleen/jordan-whitfield-qODM8pfwRO4-unsplash-1000x600.jpg',
  winter_fashion: '/images/kayleen/nantu-das-08SgCUfxSoE-unsplash-400x600.jpg',
  madrid_runway: '/images/kayleen/mihai-stefan-658815-unsplash-1000x600.jpg',
  friday_attire: '/images/kayleen/jeferson-gomes-CO5DDUO8BWY-unsplash-400x300.jpg',
  travel_pro: '/images/kayleen/noah-buscher-ru6ONpVluQs-unsplash-400x300.jpg',
  breathtaking_cliffs: '/images/kayleen/najla-cam-F71ZHHBYs3w-unsplash-1000x600.jpg',
};

export const EditorialVisual: React.FC<EditorialVisualProps> = ({
  preset,
  customImageUrl,
  alt,
  className = '',
  aspectRatio = '4:3',
  zoomOnHover = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const aspectClass =
    aspectRatio === '16:9'
      ? 'aspect-video'
      : aspectRatio === '16:10'
      ? 'aspect-[16/10]'
      : aspectRatio === '2:3'
      ? 'aspect-[2/3]'
      : aspectRatio === '1:1'
      ? 'aspect-square'
      : aspectRatio === 'fill'
      ? 'w-full h-full'
      : 'aspect-[4/3]';

  const resolvedSrc =
    customImageUrl && customImageUrl.trim() !== ''
      ? customImageUrl
      : PRESET_TO_REAL_IMAGE[preset] || '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg';

  if (!imgError) {
    return (
      <div className={`relative overflow-hidden bg-[#f1f3f8] ${aspectClass} ${className}`}>
        <img
          src={resolvedSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
            zoomOnHover ? 'group-hover:scale-105' : ''
          }`}
        />
      </div>
    );
  }

  // Resilient CSS/SVG fallback if a custom external URL fails
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative overflow-hidden select-none bg-[#171920] flex items-center justify-center p-6 text-center ${aspectClass} ${className}`}
    >
      <span className="text-xs font-medium text-white/80 line-clamp-2">{alt}</span>
    </div>
  );
};

export const AuthorAvatar: React.FC<{
  user: Pick<User, 'name' | 'avatarTheme' | 'avatarUrl'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ user, size = 'md' }) => {
  const [avatarError, setAvatarError] = useState(false);

  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-lg',
    xl: 'w-28 h-28 text-2xl',
  }[size];

  const defaultAvatars: Record<string, string> = {
    terracotta: '/images/kayleen/nora-hutton-tCJ44OIqceU-unsplash.jpg',
    slate: '/images/kayleen/brooke-lark-atzWFItRHy8-unsplash-150x150.jpg',
    forest: '/images/kayleen/cleyton-ewerton-N3JngnkuyRs-unsplash-150x150.jpg',
    navy: '/images/kayleen/mihai-stefan-658815-unsplash-150x150.jpg',
    ochre: '/images/kayleen/jordan-whitfield-qODM8pfwRO4-unsplash-150x150.jpg',
  };

  const photoSrc = user.avatarUrl || defaultAvatars[user.avatarTheme || 'terracotta'];

  if (photoSrc && !avatarError) {
    return (
      <img
        src={photoSrc}
        alt={user.name}
        referrerPolicy="no-referrer"
        onError={() => setAvatarError(true)}
        className={`${sizeClasses} rounded-full object-cover shrink-0 select-none shadow-sm border-2 border-white`}
      />
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${sizeClasses} bg-[#FF2C54] text-white rounded-full flex items-center justify-center font-semibold tracking-wider shrink-0 select-none shadow-xs`}
      aria-label={`Avatar de ${user.name}`}
    >
      {initials}
    </div>
  );
};
