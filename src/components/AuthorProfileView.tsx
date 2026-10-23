import React from 'react';
import { ArrowLeft, MapPin, Globe, BookOpen, Eye, Share2, Calendar, Users } from 'lucide-react';
import { Article, User } from '../data/akeaData';
import { AuthorAvatar, EditorialVisual } from './EditorialVisual';
import { SocialShareBar } from './SocialShareBar';

interface AuthorProfileViewProps {
  selectedAuthorId: string | null;
  users: User[];
  articles: Article[];
  onSelectAuthor: (authorId: string) => void;
  onSelectArticle: (articleId: string) => void;
  onShare: (articleId: string, network: string) => void;
  onBackHome: () => void;
}

export const AuthorProfileView: React.FC<AuthorProfileViewProps> = ({
  selectedAuthorId,
  users,
  articles,
  onSelectAuthor,
  onSelectArticle,
  onShare,
  onBackHome,
}) => {
  const authors = users.filter((u) => u.role === 'admin' || u.role === 'author');
  const activeAuthor =
    authors.find((a) => a.id === selectedAuthorId) || authors[0] || users[0];

  // Include articles where activeAuthor is the main author OR a collaborating co-author
  const authorArticles = articles.filter(
    (art) =>
      art.status === 'published' &&
      (art.authorId === activeAuthor.id ||
        (Array.isArray(art.coAuthorIds) && art.coAuthorIds.includes(activeAuthor.id)))
  );

  const totalViews = authorArticles.reduce((acc, a) => acc + a.views, 0);
  const totalShares = authorArticles.reduce((acc, a) => acc + a.shares, 0);

  return (
    <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-10">
      {/* Top Breadcrumb */}
      <div className="mb-8 flex items-center justify-between border-b border-[#dcdfe7] pb-4">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#4b546e] hover:text-[#FF2C54] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Kayleen Home 03</span>
        </button>

        <div className="text-xs text-[#595F71]">
          <span>Autores Kayleen</span>
          <span className="mx-1.5" aria-hidden="true">
            ·
          </span>
          <span className="text-[#171920] font-semibold">{activeAuthor.name}</span>
        </div>
      </div>

      {/* Author Switcher Tabs */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="rivax-divider-heading mb-1">
            <div className="divider-1" />
            <div className="divider-2" />
            <span className="text-xs uppercase tracking-wider text-[#FF2C54] font-semibold">
              Equipo Editorial Kayleen
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#171920]">Perfiles de Autores</h1>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#f7f8fc] rounded-[10px] border border-[#dcdfe7]">
          {authors.map((aut) => (
            <button
              key={aut.id}
              type="button"
              onClick={() => onSelectAuthor(aut.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-[7px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                aut.id === activeAuthor.id
                  ? 'bg-[#5960FF] text-white'
                  : 'text-[#595F71] hover:text-[#171920]'
              }`}
            >
              {aut.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Author Hero Profile Card (Kayleen Rounded 15px Box) */}
      <section className="bg-white border border-[#dcdfe7] rounded-[15px] p-8 sm:p-10 mb-12 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-start gap-6">
            <AuthorAvatar user={activeAuthor} size="xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#FF2C54] font-semibold mb-1.5">
                <span>
                  {activeAuthor.role === 'admin' ? 'Editor-in-Chief' : 'Autor Kayleen'}
                </span>
                <span className="text-[#9497AE]" aria-hidden="true">
                  ·
                </span>
                <span className="text-[#595F71] font-normal">
                  Desde {activeAuthor.joinedAt}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-[#171920] mb-1.5">
                {activeAuthor.name}
              </h2>

              <p className="text-sm font-medium text-[#5960FF] mb-4">
                {activeAuthor.specialty}
              </p>

              <p className="text-sm text-[#4b546e] leading-relaxed max-w-2xl mb-6">
                {activeAuthor.bio}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#595F71]">
                {activeAuthor.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF2C54]" />
                    <span>{activeAuthor.location}</span>
                  </span>
                )}
                {activeAuthor.website && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#5960FF]" />
                      <span>{activeAuthor.website}</span>
                    </span>
                  </>
                )}
                {activeAuthor.twitter && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>X: {activeAuthor.twitter}</span>
                  </>
                )}
                {activeAuthor.instagram && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>IG: {activeAuthor.instagram}</span>
                  </>
                )}
                {activeAuthor.linkedin && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>IN: {activeAuthor.linkedin}</span>
                  </>
                )}
                {activeAuthor.youtube && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>YT: {activeAuthor.youtube}</span>
                  </>
                )}
                {activeAuthor.github && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>GH: {activeAuthor.github}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#dcdfe7] pt-6 lg:pt-0 lg:pl-8 grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#595F71] mb-1">
                <BookOpen className="w-3.5 h-3.5 text-[#FF2C54]" />
                <span>Posts</span>
              </div>
              <div className="font-mono text-2xl font-bold text-[#171920] tabular-nums">
                {authorArticles.length}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#595F71] mb-1">
                <Eye className="w-3.5 h-3.5 text-[#5960FF]" />
                <span>Vistas</span>
              </div>
              <div className="font-mono text-2xl font-bold text-[#171920] tabular-nums">
                {totalViews.toLocaleString('es-ES')}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#595F71] mb-1">
                <Share2 className="w-3.5 h-3.5 text-[#FF2C54]" />
                <span>Shares</span>
              </div>
              <div className="font-mono text-2xl font-bold text-[#171920] tabular-nums">
                {totalShares.toLocaleString('es-ES')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Written or Co-Authored by This Author */}
      <section>
        <div className="rivax-divider-heading mb-8">
          <div className="divider-1" />
          <div className="divider-2" />
          <h3 className="text-2xl font-bold text-[#171920]">
            Artículos y Colaboraciones de {activeAuthor.name} ({authorArticles.length})
          </h3>
          <div className="divider-3" />
        </div>

        {authorArticles.length === 0 ? (
          <div className="p-12 text-center border border-[#dcdfe7] rounded-[15px] bg-[#f7f8fc]">
            <p className="text-sm text-[#4b546e]">
              Este autor aún no tiene artículos publicados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {authorArticles.map((art) => {
              const isCoAuthor = art.authorId !== activeAuthor.id;
              const mainAuthor = users.find((u) => u.id === art.authorId);

              return (
                <article
                  key={art.id}
                  onClick={() => onSelectArticle(art.id)}
                  className="group border border-[#dcdfe7] rounded-[15px] overflow-hidden bg-white flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
                >
                  <div>
                    <EditorialVisual
                      preset={art.visualPreset}
                      customImageUrl={art.customImageUrl}
                      alt={art.title}
                      aspectRatio="4:3"
                    />
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#595F71] mb-2.5">
                        <span className="text-[#FF2C54] font-semibold">{art.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#FF2C54]" />
                          {art.publishedAt}
                        </span>
                        {isCoAuthor && mainAuthor && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 text-[#5960FF] font-medium">
                              <Users className="w-3 h-3" />
                              Colab. con {mainAuthor.name}
                            </span>
                          </>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-[#171920] group-hover:text-[#FF2C54] transition-colors leading-snug mb-3">
                        <span className="title-animation-underline-in-out">{art.title}</span>
                      </h4>

                      <p className="text-sm text-[#4b546e] line-clamp-3 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-3.5 border-t border-[#dcdfe7] flex items-center justify-between">
                    <span className="text-xs font-mono tabular-nums text-[#595F71]">
                      {art.views.toLocaleString('es-ES')} vistas
                    </span>
                    <SocialShareBar article={art} onShare={onShare} compact />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
