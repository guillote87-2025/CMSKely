import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_DATABASE,
  INITIAL_CATEGORIES,
  INITIAL_HASHTAGS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_MESSAGES,
  INITIAL_USERS,
  INITIAL_ARTICLES,
  INITIAL_SITE_CONFIG,
  INITIAL_SUBSCRIBER_RECORDS,
  INITIAL_CAMPAIGNS,
  INITIAL_PUSH_NOTIFICATIONS,
  DatabaseState,
  Article,
  BlogComment,
  User,
  CategoryItem,
  HashtagItem,
  SubscriptionPlan,
  PrivateMessage,
  ArticleApprovalStatus,
  ArticlePublishMode,
  SiteConfig,
  SubscriberItem,
  MarketingCampaign,
  PushNotificationItem,
} from './src/data/akeaData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'akea_db.json');

function loadDatabase(): DatabaseState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf-8');
      return structuredClone(INITIAL_DATABASE);
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseState;
    if (!Array.isArray(parsed.categories) || parsed.categories.length === 0) {
      parsed.categories = structuredClone(INITIAL_CATEGORIES);
    }
    if (!Array.isArray(parsed.hashtags) || parsed.hashtags.length === 0) {
      parsed.hashtags = structuredClone(INITIAL_HASHTAGS);
    }
    if (!Array.isArray(parsed.subscriptionPlans) || parsed.subscriptionPlans.length === 0) {
      parsed.subscriptionPlans = structuredClone(INITIAL_SUBSCRIPTION_PLANS);
    }
    if (!Array.isArray(parsed.messages)) {
      parsed.messages = structuredClone(INITIAL_MESSAGES);
    }
    // Backfill siteConfig legal fields
    parsed.siteConfig = {
      ...structuredClone(INITIAL_SITE_CONFIG),
      ...(parsed.siteConfig || {}),
    };
    // Backfill missing seeded users and premium fields on existing users
    if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = structuredClone(INITIAL_USERS);
    } else {
      parsed.users = parsed.users.map((u) => {
        const seedUser = INITIAL_USERS.find((su) => su.id === u.id);
        return {
          ...(seedUser ? structuredClone(seedUser) : {}),
          ...u,
          isPremium: u.isPremium !== undefined ? u.isPremium : seedUser?.isPremium ?? false,
          subscriptionPlanId: u.subscriptionPlanId ?? seedUser?.subscriptionPlanId ?? 'free',
          subscriptionStatus: u.subscriptionStatus ?? seedUser?.subscriptionStatus ?? 'free',
          subscriptionStart: u.subscriptionStart ?? seedUser?.subscriptionStart,
          subscriptionEnd: u.subscriptionEnd ?? seedUser?.subscriptionEnd,
          billingCycle: u.billingCycle ?? seedUser?.billingCycle ?? 'none',
          autoRenew: u.autoRenew !== undefined ? u.autoRenew : seedUser?.autoRenew ?? false,
        };
      });
      for (const seedUser of INITIAL_USERS) {
        if (!parsed.users.some((u) => u.id === seedUser.id || u.email === seedUser.email)) {
          parsed.users.push(structuredClone(seedUser));
        }
      }
    }
    // Backfill missing seeded articles and premium/approval fields
    if (!Array.isArray(parsed.articles) || parsed.articles.length === 0) {
      parsed.articles = structuredClone(INITIAL_ARTICLES);
    } else {
      parsed.articles = parsed.articles.map((art) => {
        const seedArt = INITIAL_ARTICLES.find((sa) => sa.id === art.id);
        return {
          ...art,
          isPremium: art.isPremium !== undefined ? art.isPremium : seedArt?.isPremium ?? false,
          approvalStatus:
            art.approvalStatus ?? seedArt?.approvalStatus ?? 'approved',
          publishMode: art.publishMode ?? seedArt?.publishMode ?? 'immediate',
          scheduledPublishAt: art.scheduledPublishAt ?? seedArt?.scheduledPublishAt,
          reviewedBy: art.reviewedBy ?? seedArt?.reviewedBy,
          reviewedAt: art.reviewedAt ?? seedArt?.reviewedAt,
          reviewNotes: art.reviewNotes ?? seedArt?.reviewNotes,
        };
      });
      for (const seedArt of INITIAL_ARTICLES) {
        if (!parsed.articles.some((a) => a.id === seedArt.id)) {
          parsed.articles.push(structuredClone(seedArt));
        }
      }
    }
    if (!Array.isArray(parsed.subscriberRecords) || parsed.subscriberRecords.length === 0) {
      parsed.subscriberRecords = structuredClone(INITIAL_SUBSCRIBER_RECORDS);
    }
    if (!Array.isArray(parsed.campaigns)) {
      parsed.campaigns = structuredClone(INITIAL_CAMPAIGNS);
    }
    if (!Array.isArray(parsed.pushNotifications)) {
      parsed.pushNotifications = structuredClone(INITIAL_PUSH_NOTIFICATIONS);
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    return parsed;
  } catch {
    return structuredClone(INITIAL_DATABASE);
  }
}

function saveDatabase(state: DatabaseState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

function checkScheduledArticles(db: DatabaseState): boolean {
  let changed = false;
  const now = Date.now();
  for (const art of db.articles) {
    if (
      art.status === 'scheduled' &&
      art.approvalStatus === 'approved' &&
      art.scheduledPublishAt
    ) {
      const scheduledTime = new Date(art.scheduledPublishAt).getTime();
      if (!Number.isNaN(scheduledTime) && scheduledTime <= now) {
        art.status = 'published';
        art.publishedAt = new Date().toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        changed = true;
      }
    }
  }
  if (changed) {
    saveDatabase(db);
  }
  return changed;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support up to 50MB for multi-image local PC uploads (JPG, PNG, WEBP, AVIF, GIF, SVG)
  app.use(express.json({ limit: '50mb' }));

  let db: DatabaseState = loadDatabase();

  // GET full state
  app.get('/api/state', (_req, res) => {
    checkScheduledArticles(db);
    const safeUsers = db.users.map(({ password, ...rest }) => rest);
    res.json({
      ...db,
      users: safeUsers,
    });
  });

  // POST Auth Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const user = db.users.find(
      (u) => u.email.toLowerCase() === (email || '').trim().toLowerCase()
    );
    if (!user) {
      res.status(401).json({ error: 'No existe ninguna cuenta con ese correo electrónico.' });
      return;
    }
    if (!user.active) {
      res.status(403).json({ error: 'Esta cuenta de usuario se encuentra desactivada.' });
      return;
    }
    if (password && user.password && user.password !== password) {
      res.status(401).json({ error: 'Contraseña incorrecta.' });
      return;
    }
    const { password: _p, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  // POST Auth Register
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role, specialty, bio, location } = req.body as Partial<User>;
    if (!name || !email) {
      res.status(400).json({ error: 'Nombre y correo electrónico son obligatorios.' });
      return;
    }
    const exists = db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      res.status(409).json({ error: 'Este correo electrónico ya está registrado.' });
      return;
    }
    const themes: User['avatarTheme'][] = ['terracotta', 'slate', 'forest', 'navy', 'ochre'];
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password || 'user123',
      role: role || 'author',
      specialty: specialty?.trim() || 'Colaborador Editorial',
      bio:
        bio?.trim() ||
        'Autor y colaborador en Kayleen Magazine especializado en ensayo visual, cultura contemporánea y crónicas de diseño.',
      location: location?.trim() || 'Madrid, España',
      website: 'rivaxstudio.com/kayleen',
      twitter: `@${name.trim().toLowerCase().replace(/\s+/g, '')}`,
      instagram: `@${name.trim().toLowerCase().replace(/\s+/g, '.')}`,
      avatarTheme: themes[db.users.length % themes.length],
      active: true,
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    db.users.push(newUser);
    saveDatabase(db);
    const { password: _p, ...safeUser } = newUser;
    res.status(201).json({ user: safeUser });
  });

  // POST Create or Update Category (automatically updates articles if renamed)
  app.post('/api/categories', (req, res) => {
    const { id, name, description, color } = req.body as Partial<CategoryItem>;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
      return;
    }
    const cleanName = name.trim();
    const slug = cleanName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (id) {
      const idx = db.categories.findIndex((c) => c.id === id);
      if (idx !== -1) {
        const oldName = db.categories[idx].name;
        db.categories[idx] = {
          ...db.categories[idx],
          name: cleanName,
          slug,
          description: description?.trim() ?? db.categories[idx].description,
          color: color || db.categories[idx].color,
        };
        // Update articles that used the old category name
        if (oldName !== cleanName) {
          db.articles = db.articles.map((art) =>
            art.category === oldName ? { ...art, category: cleanName } : art
          );
        }
        saveDatabase(db);
        res.json({ categories: db.categories, articles: db.articles });
        return;
      }
    }

    const newCategory: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: cleanName,
      slug,
      description: description?.trim() || `Artículos y publicaciones en ${cleanName}.`,
      color: color || '#FF2C54',
    };
    db.categories.push(newCategory);
    saveDatabase(db);
    res.status(201).json({ categories: db.categories, category: newCategory });
  });

  // DELETE Category (reassigns articles to fallback category)
  app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const target = db.categories.find((c) => c.id === id);
    if (!target) {
      res.status(404).json({ error: 'Categoría no encontrada.' });
      return;
    }
    if (db.categories.length <= 1) {
      res.status(400).json({ error: 'Debe existir al menos una categoría activa en el blog.' });
      return;
    }
    db.categories = db.categories.filter((c) => c.id !== id);
    const fallbackCategory = db.categories[0].name;
    db.articles = db.articles.map((art) =>
      art.category === target.name ? { ...art, category: fallbackCategory } : art
    );
    saveDatabase(db);
    res.json({ categories: db.categories, articles: db.articles });
  });

  // POST Create or Update Hashtag (automatically updates articles if renamed)
  app.post('/api/hashtags', (req, res) => {
    const { id, name, description, featured } = req.body as Partial<HashtagItem>;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'El nombre del hashtag es obligatorio.' });
      return;
    }
    const cleanName = name.trim().replace(/^#+/, '');
    const slug = cleanName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!Array.isArray(db.hashtags)) {
      db.hashtags = [];
    }

    if (id) {
      const idx = db.hashtags.findIndex((h) => h.id === id);
      if (idx !== -1) {
        const oldName = db.hashtags[idx].name || db.hashtags[idx].tag || '';
        db.hashtags[idx] = {
          ...db.hashtags[idx],
          name: cleanName,
          tag: cleanName,
          slug,
          description: description?.trim() ?? db.hashtags[idx].description,
          featured: featured !== undefined ? Boolean(featured) : db.hashtags[idx].featured,
        };
        if (oldName && oldName.toLowerCase() !== cleanName.toLowerCase()) {
          db.articles = db.articles.map((art) => ({
            ...art,
            tags: (art.tags || []).map((t) =>
              t.toLowerCase() === oldName.toLowerCase() ? cleanName : t
            ),
          }));
        }
        saveDatabase(db);
        res.json({ hashtags: db.hashtags, articles: db.articles });
        return;
      }
    }

    const existing = db.hashtags.find(
      (h) => (h.name || h.tag || '').toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) {
      existing.description = description?.trim() || existing.description;
      if (featured !== undefined) existing.featured = Boolean(featured);
      saveDatabase(db);
      res.json({ hashtags: db.hashtags, hashtag: existing, articles: db.articles });
      return;
    }

    const usageCount = db.articles.filter((a) =>
      (a.tags || []).some((t) => t.toLowerCase() === cleanName.toLowerCase())
    ).length;

    const newHashtag: HashtagItem = {
      id: `tag-${Date.now()}`,
      tag: cleanName,
      name: cleanName,
      slug,
      color: '#FF2C54',
      description: description?.trim() || `Publicaciones etiquetadas con #${cleanName}.`,
      usageCount,
      featured: Boolean(featured),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    db.hashtags.unshift(newHashtag);
    saveDatabase(db);
    res.status(201).json({ hashtags: db.hashtags, hashtag: newHashtag, articles: db.articles });
  });

  // DELETE Hashtag (removes tag from articles as well)
  app.delete('/api/hashtags/:id', (req, res) => {
    const { id } = req.params;
    if (!Array.isArray(db.hashtags)) {
      db.hashtags = [];
    }
    const target = db.hashtags.find((h) => h.id === id);
    if (!target) {
      res.status(404).json({ error: 'Hashtag no encontrado.' });
      return;
    }
    const targetName = target.name || target.tag || '';
    db.hashtags = db.hashtags.filter((h) => h.id !== id);
    db.articles = db.articles.map((art) => ({
      ...art,
      tags: (art.tags || []).filter(
        (t) => t.toLowerCase() !== targetName.toLowerCase()
      ),
    }));
    saveDatabase(db);
    res.json({ hashtags: db.hashtags, articles: db.articles });
  });

  // Helper to sync article tags into db.hashtags
  const syncHashtagsFromArticle = (tags: string[]) => {
    if (!Array.isArray(db.hashtags)) db.hashtags = [];
    for (const rawTag of tags) {
      const clean = rawTag.trim().replace(/^#+/, '');
      if (!clean) continue;
      const found = db.hashtags.find((h) => (h.name || h.tag || '').toLowerCase() === clean.toLowerCase());
      if (!found) {
        const slug = clean
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        db.hashtags.push({
          id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          tag: clean,
          name: clean,
          slug,
          color: '#FF2C54',
          description: `Artículos sobre #${clean}`,
          usageCount: 1,
          featured: false,
          createdAt: new Date().toISOString().slice(0, 10),
        });
      }
    }
    // Recalculate usageCounts
    db.hashtags = db.hashtags.map((h) => ({
      ...h,
      usageCount: db.articles.filter((a) =>
        (a.tags || []).some((t) => t.toLowerCase() === (h.name || h.tag || '').toLowerCase())
      ).length,
    }));
  };

  // POST Create or Update Article
  app.post('/api/articles', (req, res) => {
    const payload = req.body as Partial<Article>;
    if (!payload.title || !payload.category || !payload.authorId) {
      res.status(400).json({ error: 'Título, categoría y autor principal son obligatorios.' });
      return;
    }
    const sanitizedCoAuthors = Array.isArray(payload.coAuthorIds)
      ? payload.coAuthorIds.filter((cid) => cid !== payload.authorId)
      : [];

    const sanitizedGallery = Array.isArray(payload.galleryImages)
      ? payload.galleryImages.filter((url) => typeof url === 'string' && url.trim() !== '')
      : [];

    const resolvedCover =
      payload.customImageUrl && payload.customImageUrl.trim() !== ''
        ? payload.customImageUrl.trim()
        : sanitizedGallery[0] || '';

    const sanitizedTags =
      Array.isArray(payload.tags) && payload.tags.length > 0
        ? payload.tags.map((t) => t.trim().replace(/^#+/, '')).filter(Boolean)
        : [payload.category];

    const getPushSubscribersCount = () =>
      Math.max(
        1,
        (db.subscriberRecords || []).filter(
          (s) => s.status === 'active' && s.pushEnabled !== false
        ).length
      );

    // Resolve status from approvalStatus + publishMode
    const resolvedApprovalStatus: ArticleApprovalStatus =
      payload.approvalStatus || 'approved';
    const resolvedPublishMode: ArticlePublishMode =
      payload.publishMode || 'immediate';
    let resolvedStatus: Article['status'] = payload.status || 'published';

    if (resolvedApprovalStatus === 'pending_review' || resolvedApprovalStatus === 'rejected') {
      resolvedStatus = 'draft';
    } else if (resolvedApprovalStatus === 'approved') {
      if (
        resolvedPublishMode === 'scheduled' &&
        payload.scheduledPublishAt &&
        new Date(payload.scheduledPublishAt).getTime() > Date.now()
      ) {
        resolvedStatus = 'scheduled';
      } else if (payload.status !== 'draft') {
        resolvedStatus = 'published';
      }
    }

    if (payload.id) {
      const idx = db.articles.findIndex((a) => a.id === payload.id);
      if (idx !== -1) {
        const previousStatus = db.articles[idx].status;
        db.articles[idx] = {
          ...db.articles[idx],
          ...payload,
          tags: sanitizedTags,
          coAuthorIds: sanitizedCoAuthors,
          galleryImages: sanitizedGallery,
          customImageUrl: resolvedCover,
          isPremium: Boolean(payload.isPremium),
          approvalStatus: resolvedApprovalStatus,
          publishMode: resolvedPublishMode,
          status: resolvedStatus,
        };
        syncHashtagsFromArticle(sanitizedTags);

        let createdPush: PushNotificationItem | null = null;
        if (previousStatus !== 'published' && db.articles[idx].status === 'published') {
          if (!Array.isArray(db.pushNotifications)) db.pushNotifications = [];
          createdPush = {
            id: `push-${Date.now()}`,
            type: 'new_article',
            title: `📰 Nuevo Artículo en ${db.articles[idx].category}: ${db.articles[idx].title}`,
            body: db.articles[idx].excerpt || db.articles[idx].subtitle || db.articles[idx].title,
            imageUrl: db.articles[idx].customImageUrl,
            category: db.articles[idx].category,
            targetArticleId: db.articles[idx].id,
            ctaText: 'Leer artículo ahora',
            segment: 'active',
            recipientCount: getPushSubscribersCount(),
            createdAt: 'Ahora mismo',
          };
          db.pushNotifications.unshift(createdPush);
        }
        saveDatabase(db);
        res.json({
          article: db.articles[idx],
          hashtags: db.hashtags,
          pushNotification: createdPush,
          pushNotifications: db.pushNotifications,
        });
        return;
      }
    }

    const slug =
      payload.slug ||
      payload.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      slug,
      title: payload.title.trim(),
      subtitle: payload.subtitle?.trim() || '',
      excerpt: payload.excerpt?.trim() || payload.title.trim(),
      content:
        Array.isArray(payload.content) && payload.content.length > 0
          ? payload.content
          : ['Contenido del artículo en edición.'],
      richContentHtml: payload.richContentHtml || undefined,
      pullQuote:
        payload.pullQuote?.trim() ||
        'El diseño editorial auténtico prioriza la claridad tipográfica y la pausa reflexiva.',
      category: payload.category,
      authorId: payload.authorId,
      coAuthorIds: sanitizedCoAuthors,
      publishedAt:
        resolvedStatus === 'scheduled' && payload.scheduledPublishAt
          ? `Programado (${payload.scheduledPublishAt.replace('T', ' ')})`
          : payload.publishedAt || 'Hoy, 2026',
      readTimeMinutes: Number(payload.readTimeMinutes) || 5,
      featuredHero: Boolean(payload.featuredHero),
      akeaSection: payload.akeaSection || 'recent',
      visualPreset: payload.visualPreset || 'summer_coast',
      customImageUrl: resolvedCover,
      galleryImages: sanitizedGallery,
      tags: sanitizedTags,
      views: 1,
      likes: 0,
      dislikes: 0,
      shares: 0,
      status: resolvedStatus,
      isPremium: Boolean(payload.isPremium),
      approvalStatus: resolvedApprovalStatus,
      publishMode: resolvedPublishMode,
      scheduledPublishAt: payload.scheduledPublishAt,
      reviewedBy: payload.reviewedBy,
      reviewedAt: payload.reviewedAt,
      reviewNotes: payload.reviewNotes,
      seoTitle: payload.seoTitle,
      seoDescription: payload.seoDescription,
      seoKeywords: payload.seoKeywords,
    };

    db.articles.unshift(newArticle);
    syncHashtagsFromArticle(sanitizedTags);

    let createdPush: PushNotificationItem | null = null;
    if (newArticle.status === 'published') {
      if (!Array.isArray(db.pushNotifications)) db.pushNotifications = [];
      createdPush = {
        id: `push-${Date.now()}`,
        type: 'new_article',
        title: `📰 Nuevo Artículo en ${newArticle.category}: ${newArticle.title}`,
        body: newArticle.excerpt || newArticle.subtitle || newArticle.title,
        imageUrl: newArticle.customImageUrl,
        category: newArticle.category,
        targetArticleId: newArticle.id,
        ctaText: 'Leer artículo ahora',
        segment: 'active',
        recipientCount: getPushSubscribersCount(),
        createdAt: 'Ahora mismo',
      };
      db.pushNotifications.unshift(createdPush);
    }

    saveDatabase(db);
    res.status(201).json({
      article: newArticle,
      hashtags: db.hashtags,
      pushNotification: createdPush,
      pushNotifications: db.pushNotifications,
    });
  });

  // POST Editorial Article Approval Workflow (Approve / Reject / Schedule)
  app.post('/api/articles/:id/approval', (req, res) => {
    const { id } = req.params;
    const {
      approvalStatus,
      publishMode,
      scheduledPublishAt,
      reviewedBy,
      reviewNotes,
    } = req.body as {
      approvalStatus: ArticleApprovalStatus;
      publishMode?: ArticlePublishMode;
      scheduledPublishAt?: string;
      reviewedBy?: string;
      reviewNotes?: string;
    };

    const art = db.articles.find((a) => a.id === id);
    if (!art) {
      res.status(404).json({ error: 'Artículo no encontrado.' });
      return;
    }

    const previousStatus = art.status;
    art.approvalStatus = approvalStatus;
    if (publishMode) art.publishMode = publishMode;
    if (scheduledPublishAt !== undefined) art.scheduledPublishAt = scheduledPublishAt;
    if (reviewedBy) art.reviewedBy = reviewedBy;
    art.reviewedAt = new Date().toISOString().slice(0, 10);
    if (reviewNotes !== undefined) art.reviewNotes = reviewNotes;

    if (approvalStatus === 'approved') {
      if (
        art.publishMode === 'scheduled' &&
        art.scheduledPublishAt &&
        new Date(art.scheduledPublishAt).getTime() > Date.now()
      ) {
        art.status = 'scheduled';
        art.publishedAt = `Programado (${art.scheduledPublishAt.replace('T', ' ')})`;
      } else {
        art.status = 'published';
        art.publishedAt = new Date().toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
    } else if (approvalStatus === 'rejected' || approvalStatus === 'pending_review') {
      art.status = 'draft';
    }

    let createdPush: PushNotificationItem | null = null;
    if (previousStatus !== 'published' && art.status === 'published') {
      if (!Array.isArray(db.pushNotifications)) db.pushNotifications = [];
      const pushCount = Math.max(
        1,
        (db.subscriberRecords || []).filter(
          (s) => s.status === 'active' && s.pushEnabled !== false
        ).length
      );
      createdPush = {
        id: `push-${Date.now()}`,
        type: 'new_article',
        title: `✅ Artículo Aprobado y Publicado: ${art.title}`,
        body: art.excerpt || art.subtitle || art.title,
        imageUrl: art.customImageUrl,
        category: art.category,
        targetArticleId: art.id,
        ctaText: 'Leer artículo ahora',
        segment: 'active',
        recipientCount: pushCount,
        createdAt: 'Ahora mismo',
      };
      db.pushNotifications.unshift(createdPush);
    }

    saveDatabase(db);
    res.json({
      article: art,
      pushNotification: createdPush,
      pushNotifications: db.pushNotifications,
    });
  });

  // PATCH Quick Toggle Article Status (Published <-> Draft)
  app.patch('/api/articles/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status: 'published' | 'draft' | 'scheduled' };
    const art = db.articles.find((a) => a.id === id);
    if (!art) {
      res.status(404).json({ error: 'Artículo no encontrado' });
      return;
    }
    const wasDraft = art.status !== 'published';
    art.status = status;
    if (status === 'published') {
      art.approvalStatus = 'approved';
    }

    let createdPush: PushNotificationItem | null = null;
    if (wasDraft && status === 'published') {
      if (!Array.isArray(db.pushNotifications)) db.pushNotifications = [];
      const pushCount = Math.max(
        1,
        (db.subscriberRecords || []).filter(
          (s) => s.status === 'active' && s.pushEnabled !== false
        ).length
      );
      createdPush = {
        id: `push-${Date.now()}`,
        type: 'new_article',
        title: `📰 Nuevo Artículo Publicado: ${art.title}`,
        body: art.excerpt || art.subtitle || art.title,
        imageUrl: art.customImageUrl,
        category: art.category,
        targetArticleId: art.id,
        ctaText: 'Leer artículo ahora',
        segment: 'active',
        recipientCount: pushCount,
        createdAt: 'Ahora mismo',
      };
      db.pushNotifications.unshift(createdPush);
    }

    saveDatabase(db);
    res.json({
      article: art,
      pushNotification: createdPush,
      pushNotifications: db.pushNotifications,
    });
  });

  // DELETE Article
  app.delete('/api/articles/:id', (req, res) => {
    const { id } = req.params;
    db.articles = db.articles.filter((a) => a.id !== id);
    db.comments = db.comments.filter((c) => c.articleId !== id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  // POST Increment Share / Like / Dislike / View
  app.post('/api/articles/:id/engage', (req, res) => {
    const { id } = req.params;
    const { type } = req.body as { type: 'share' | 'like' | 'dislike' | 'view' };
    const art = db.articles.find((a) => a.id === id);
    if (!art) {
      res.status(404).json({ error: 'Artículo no encontrado' });
      return;
    }
    if (type === 'share') art.shares += 1;
    if (type === 'like') art.likes += 1;
    if (type === 'dislike') art.dislikes = (art.dislikes || 0) + 1;
    if (type === 'view') art.views += 1;
    saveDatabase(db);
    res.json({ article: art });
  });

  // POST Submit Comment (Always created with status = 'pending' for Admin approval)
  app.post('/api/comments', (req, res) => {
    const { articleId, userId, authorName, authorEmail, authorRole, content } =
      req.body as Partial<BlogComment>;
    if (!articleId || !authorName || !authorEmail || !content) {
      res.status(400).json({ error: 'Todos los campos del comentario son obligatorios.' });
      return;
    }
    const newComment: BlogComment = {
      id: `cmt-${Date.now()}`,
      articleId,
      userId,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      authorRole: authorRole || 'reader',
      content: content.trim(),
      createdAt: 'Hace unos instantes',
      status: 'pending',
    };
    db.comments.unshift(newComment);
    saveDatabase(db);
    res.status(201).json({ comment: newComment });
  });

  // PATCH Comment Moderation Status (Approve / Reject)
  app.patch('/api/comments/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status: 'pending' | 'approved' | 'rejected' };
    const cmt = db.comments.find((c) => c.id === id);
    if (!cmt) {
      res.status(404).json({ error: 'Comentario no encontrado' });
      return;
    }
    cmt.status = status;
    saveDatabase(db);
    res.json({ comment: cmt });
  });

  // DELETE Comment
  app.delete('/api/comments/:id', (req, res) => {
    const { id } = req.params;
    db.comments = db.comments.filter((c) => c.id !== id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  // PATCH Update User (Role, Bio, Active status, Premium fields)
  app.patch('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body as Partial<User>;
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    db.users[idx] = { ...db.users[idx], ...updates };
    saveDatabase(db);
    const { password: _p, ...safeUser } = db.users[idx];
    res.json({ user: safeUser });
  });

  // POST Manage User Subscription (Convert Free <-> Premium, Altas, Bajas, Vencimientos, Planes)
  app.post('/api/users/:id/subscription', (req, res) => {
    const { id } = req.params;
    const {
      action,
      planId,
      subscriptionEnd,
      autoRenew,
    } = req.body as {
      action: 'upgrade_premium' | 'downgrade_free' | 'cancel' | 'expire' | 'renew';
      planId?: string;
      subscriptionEnd?: string;
      autoRenew?: boolean;
    };

    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    const user = db.users[idx];
    const selectedPlan =
      (db.subscriptionPlans || []).find((p) => p.id === planId) ||
      (db.subscriptionPlans || [])[0];

    const todayStr = new Date().toISOString().slice(0, 10);

    if (action === 'upgrade_premium' || action === 'renew') {
      const durationDays = selectedPlan?.durationDays || 30;
      const computedEnd =
        subscriptionEnd ||
        new Date(Date.now() + durationDays * 86400000).toISOString().slice(0, 10);

      user.isPremium = true;
      user.subscriptionPlanId = selectedPlan?.id || planId || 'plan-mensual';
      user.subscriptionStatus = 'active';
      user.subscriptionStart = user.subscriptionStart || todayStr;
      user.subscriptionEnd = computedEnd;
      user.billingCycle = selectedPlan?.billingCycle || 'monthly';
      user.autoRenew = autoRenew !== undefined ? autoRenew : true;
    } else if (action === 'downgrade_free') {
      user.isPremium = false;
      user.subscriptionPlanId = 'free';
      user.subscriptionStatus = 'free';
      user.billingCycle = 'none';
      user.autoRenew = false;
      user.subscriptionEnd = undefined;
    } else if (action === 'cancel') {
      user.isPremium = false;
      user.subscriptionStatus = 'cancelled';
      user.autoRenew = false;
      if (subscriptionEnd) user.subscriptionEnd = subscriptionEnd;
    } else if (action === 'expire') {
      user.isPremium = false;
      user.subscriptionStatus = 'expired';
      user.autoRenew = false;
      user.subscriptionEnd = subscriptionEnd || todayStr;
    }

    db.users[idx] = user;
    saveDatabase(db);
    const { password: _p, ...safeUser } = user;
    res.json({ user: safeUser, users: db.users.map(({ password, ...r }) => r) });
  });

  // DELETE User
  app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.users = db.users.filter((u) => u.id !== id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  // POST Create or Update Subscription Plan
  app.post('/api/plans', (req, res) => {
    const payload = req.body as Partial<SubscriptionPlan>;
    if (!payload.name || payload.price === undefined) {
      res.status(400).json({ error: 'Nombre y precio del plan son obligatorios.' });
      return;
    }
    if (!Array.isArray(db.subscriptionPlans)) {
      db.subscriptionPlans = [];
    }
    if (payload.id) {
      const idx = db.subscriptionPlans.findIndex((p) => p.id === payload.id);
      if (idx !== -1) {
        db.subscriptionPlans[idx] = {
          ...db.subscriptionPlans[idx],
          ...payload,
          price: Number(payload.price),
          durationDays: Number(payload.durationDays) || db.subscriptionPlans[idx].durationDays,
          features: Array.isArray(payload.features)
            ? payload.features
            : db.subscriptionPlans[idx].features,
        };
        saveDatabase(db);
        res.json({ subscriptionPlans: db.subscriptionPlans, plan: db.subscriptionPlans[idx] });
        return;
      }
    }

    const newPlan: SubscriptionPlan = {
      id: `plan-${Date.now()}`,
      name: payload.name.trim(),
      slug: payload.slug || payload.name.trim().toLowerCase().replace(/\s+/g, '-'),
      badge: payload.badge?.trim() || 'PLAN PREMIUM',
      badgeColor: '#D97706',
      price: Number(payload.price),
      currency: payload.currency || 'USD',
      billingCycle: payload.billingCycle || 'monthly',
      durationDays: Number(payload.durationDays) || 30,
      description:
        payload.description?.trim() ||
        'Acceso ilimitado a todos los artículos Premium y mensajería directa.',
      features:
        Array.isArray(payload.features) && payload.features.length > 0
          ? payload.features
          : ['Acceso a todos los artículos Premium', 'Mensajería privada editorial'],
      highlighted: Boolean(payload.highlighted),
      active: payload.active !== undefined ? Boolean(payload.active) : true,
    };
    db.subscriptionPlans.push(newPlan);
    saveDatabase(db);
    res.status(201).json({ subscriptionPlans: db.subscriptionPlans, plan: newPlan });
  });

  // DELETE Subscription Plan
  app.delete('/api/plans/:id', (req, res) => {
    const { id } = req.params;
    if (!Array.isArray(db.subscriptionPlans)) {
      db.subscriptionPlans = [];
    }
    if (db.subscriptionPlans.length <= 1) {
      res.status(400).json({ error: 'Debe existir al menos un plan de pago configurado.' });
      return;
    }
    db.subscriptionPlans = db.subscriptionPlans.filter((p) => p.id !== id);
    saveDatabase(db);
    res.json({ subscriptionPlans: db.subscriptionPlans });
  });

  // POST Send Private Message (Between Premium users, Admins, Moderators, Editors, and Writers)
  app.post('/api/messages', (req, res) => {
    const { senderId, recipientId, subject, body, category } =
      req.body as Partial<PrivateMessage>;
    if (!senderId || !recipientId || !subject || !body) {
      res.status(400).json({
        error: 'Remitente, destinatario, asunto y mensaje son obligatorios.',
      });
      return;
    }
    const sender = db.users.find((u) => u.id === senderId);
    const recipient = db.users.find((u) => u.id === recipientId);
    if (!sender || !recipient) {
      res.status(404).json({ error: 'Usuario remitente o destinatario no encontrado.' });
      return;
    }
    // Check permission: Staff (admin, moderator, editor, author) or Premium user
    const isStaff = (u: User) =>
      u.role === 'admin' || u.role === 'moderator' || u.role === 'editor' || u.role === 'author';
    if (!isStaff(sender) && !sender.isPremium) {
      res.status(403).json({
        error:
          'La mensajería privada está reservada para suscriptores Premium, escritores, moderadores y administradores.',
      });
      return;
    }

    if (!Array.isArray(db.messages)) {
      db.messages = [];
    }

    const newMsg: PrivateMessage = {
      id: `msg-${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      senderIsPremium: Boolean(sender.isPremium),
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientRole: recipient.role,
      subject: subject.trim(),
      body: body.trim(),
      createdAt: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: false,
      category: category || 'editorial',
    };

    db.messages.unshift(newMsg);
    saveDatabase(db);
    res.status(201).json({ message: newMsg, messages: db.messages });
  });

  // PATCH Mark Private Message as Read
  app.patch('/api/messages/:id/read', (req, res) => {
    const { id } = req.params;
    if (!Array.isArray(db.messages)) db.messages = [];
    const msg = db.messages.find((m) => m.id === id);
    if (!msg) {
      res.status(404).json({ error: 'Mensaje no encontrado.' });
      return;
    }
    msg.read = true;
    saveDatabase(db);
    res.json({ message: msg, messages: db.messages });
  });

  // DELETE Private Message
  app.delete('/api/messages/:id', (req, res) => {
    const { id } = req.params;
    if (!Array.isArray(db.messages)) db.messages = [];
    db.messages = db.messages.filter((m) => m.id !== id);
    saveDatabase(db);
    res.json({ messages: db.messages });
  });

  // POST Newsletter Subscribe (Public Footer + Subscriber Record Sync + Browser Push Opt-In)
  app.post('/api/newsletter', (req, res) => {
    const { email, name, pushEnabled, pushDeviceLabel } = req.body as {
      email?: string;
      name?: string;
      pushEnabled?: boolean;
      pushDeviceLabel?: string;
    };
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Introduce un correo electrónico válido.' });
      return;
    }
    const clean = email.trim().toLowerCase();
    if (!db.subscribers.includes(clean)) {
      db.subscribers.push(clean);
    }
    if (!Array.isArray(db.subscriberRecords)) {
      db.subscriberRecords = [];
    }
    const existingRecord = db.subscriberRecords.find(
      (s) => s.email.toLowerCase() === clean
    );
    if (existingRecord) {
      existingRecord.status = 'active';
      if (pushEnabled !== undefined) {
        existingRecord.pushEnabled = pushEnabled;
      }
      if (pushDeviceLabel) {
        existingRecord.pushDeviceLabel = pushDeviceLabel;
      }
    } else {
      db.subscriberRecords.unshift({
        id: `sub-${Date.now()}`,
        email: clean,
        name: name?.trim() || clean.split('@')[0],
        status: 'active',
        source: 'Footer Kayleen Home 03',
        tags: ['Semanal'],
        joinedAt: new Date().toISOString().slice(0, 10),
        pushEnabled: pushEnabled !== undefined ? pushEnabled : true,
        pushDeviceLabel: pushDeviceLabel || 'Navegador Web (Push Activo)',
      });
    }
    saveDatabase(db);
    res.json({
      subscribers: db.subscribers,
      subscriberRecords: db.subscriberRecords,
    });
  });

  // PUT Site Configuration (Logo, Colors, Backgrounds, Footer Info, Promo Banner)
  app.put('/api/site-config', (req, res) => {
    const updates = req.body as Partial<SiteConfig>;
    db.siteConfig = {
      ...(db.siteConfig || INITIAL_SITE_CONFIG),
      ...updates,
    };
    saveDatabase(db);
    res.json({ siteConfig: db.siteConfig });
  });

  // POST Create or Update Subscriber Record
  app.post('/api/subscribers', (req, res) => {
    const payload = req.body as Partial<SubscriberItem>;
    if (!payload.email || !payload.email.includes('@')) {
      res.status(400).json({ error: 'El correo electrónico es obligatorio.' });
      return;
    }
    if (!Array.isArray(db.subscriberRecords)) {
      db.subscriberRecords = [];
    }
    const cleanEmail = payload.email.trim().toLowerCase();
    const existingIdx = db.subscriberRecords.findIndex(
      (s) => s.id === payload.id || s.email.toLowerCase() === cleanEmail
    );
    if (existingIdx !== -1) {
      db.subscriberRecords[existingIdx] = {
        ...db.subscriberRecords[existingIdx],
        ...payload,
        email: cleanEmail,
      };
    } else {
      const newSub: SubscriberItem = {
        id: `sub-${Date.now()}`,
        email: cleanEmail,
        name: payload.name?.trim() || cleanEmail.split('@')[0],
        status: payload.status || 'active',
        source: payload.source?.trim() || 'Registro Manual Admin',
        tags: Array.isArray(payload.tags) && payload.tags.length > 0 ? payload.tags : ['Semanal'],
        joinedAt: new Date().toISOString().slice(0, 10),
        pushEnabled: payload.pushEnabled !== undefined ? payload.pushEnabled : true,
        pushDeviceLabel: payload.pushDeviceLabel || 'Navegador Web (Push Activo)',
      };
      db.subscriberRecords.unshift(newSub);
    }
    db.subscribers = db.subscriberRecords
      .filter((s) => s.status === 'active')
      .map((s) => s.email);
    saveDatabase(db);
    res.json({
      subscriberRecords: db.subscriberRecords,
      subscribers: db.subscribers,
    });
  });

  // PATCH Subscriber Status / Details
  app.patch('/api/subscribers/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body as Partial<SubscriberItem>;
    if (!Array.isArray(db.subscriberRecords)) {
      db.subscriberRecords = [];
    }
    const idx = db.subscriberRecords.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Suscriptor no encontrado.' });
      return;
    }
    db.subscriberRecords[idx] = { ...db.subscriberRecords[idx], ...updates };
    db.subscribers = db.subscriberRecords
      .filter((s) => s.status === 'active')
      .map((s) => s.email);
    saveDatabase(db);
    res.json({
      subscriberRecords: db.subscriberRecords,
      subscribers: db.subscribers,
    });
  });

  // DELETE Subscriber
  app.delete('/api/subscribers/:id', (req, res) => {
    const { id } = req.params;
    if (!Array.isArray(db.subscriberRecords)) {
      db.subscriberRecords = [];
    }
    db.subscriberRecords = db.subscriberRecords.filter((s) => s.id !== id);
    db.subscribers = db.subscriberRecords
      .filter((s) => s.status === 'active')
      .map((s) => s.email);
    saveDatabase(db);
    res.json({
      subscriberRecords: db.subscriberRecords,
      subscribers: db.subscribers,
    });
  });

  // POST Create or Update Marketing Campaign (Also triggers Browser Push Notification)
  app.post('/api/campaigns', (req, res) => {
    const payload = req.body as Partial<MarketingCampaign>;
    if (!payload.name || !payload.subject) {
      res.status(400).json({ error: 'Nombre y asunto de la campaña son obligatorios.' });
      return;
    }
    if (!Array.isArray(db.campaigns)) {
      db.campaigns = [];
    }
    if (payload.id) {
      const idx = db.campaigns.findIndex((c) => c.id === payload.id);
      if (idx !== -1) {
        db.campaigns[idx] = { ...db.campaigns[idx], ...payload };
        saveDatabase(db);
        res.json({
          campaigns: db.campaigns,
          campaign: db.campaigns[idx],
          pushNotifications: db.pushNotifications,
        });
        return;
      }
    }
    const newCampaign: MarketingCampaign = {
      id: `cmp-${Date.now()}`,
      name: payload.name.trim(),
      subject: payload.subject.trim(),
      segment: payload.segment || 'active',
      featuredArticleId: payload.featuredArticleId || '',
      customMessage:
        payload.customMessage?.trim() ||
        'Te compartimos las nuevas historias publicadas esta semana en Kayleen Magazine.',
      ctaText: payload.ctaText?.trim() || 'Leer Artículos',
      ctaUrl: payload.ctaUrl?.trim() || 'https://demo.rivaxstudio.com/kayleen/home-03/',
      status: payload.status || 'draft',
      scheduledDate: payload.scheduledDate || new Date().toISOString().slice(0, 10),
      sentCount: payload.sentCount || 0,
      openRate: payload.openRate || 0,
      clickRate: payload.clickRate || 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    db.campaigns.unshift(newCampaign);

    // Automatically create a Browser Push Notification for the new campaign
    if (!Array.isArray(db.pushNotifications)) db.pushNotifications = [];
    const linkedArt = db.articles.find((a) => a.id === newCampaign.featuredArticleId);
    const activeSubs = (db.subscriberRecords || []).filter(
      (s) => s.status === 'active' && s.pushEnabled !== false
    );
    const recipientCount =
      newCampaign.segment === 'vip'
        ? activeSubs.filter((s) => s.tags.includes('VIP')).length || activeSubs.length
        : activeSubs.length;

    const createdPush: PushNotificationItem = {
      id: `push-${Date.now()}`,
      type: 'new_campaign',
      title: `📣 Nueva Campaña: ${newCampaign.subject}`,
      body: newCampaign.customMessage || newCampaign.contentBody || newCampaign.subject,
      imageUrl: linkedArt?.customImageUrl || '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg',
      category: 'Campaña de Marketing',
      targetArticleId: newCampaign.featuredArticleId || undefined,
      targetCampaignId: newCampaign.id,
      ctaText: newCampaign.ctaText || 'Ver campaña ahora',
      segment: newCampaign.segment,
      recipientCount: Math.max(1, recipientCount),
      createdAt: 'Ahora mismo',
    };
    db.pushNotifications.unshift(createdPush);

    saveDatabase(db);
    res.status(201).json({
      campaigns: db.campaigns,
      campaign: newCampaign,
      pushNotification: createdPush,
      pushNotifications: db.pushNotifications,
    });
  });

  // POST Send Marketing Campaign Now (Also broadcasts Browser Push Notification)
  app.post('/api/campaigns/:id/send', (req, res) => {
    const { id } = req.params;
    if (!Array.isArray(db.campaigns)) {
      db.campaigns = [];
    }
    const cmp = db.campaigns.find((c) => c.id === id);
    if (!cmp) {
      res.status(404).json({ error: 'Campaña no encontrada.' });
      return;
    }
    const activeSubs = (db.subscriberRecords || []).filter((s) => s.status === 'active');
    const recipientCount =
      cmp.segment === 'vip'
        ? activeSubs.filter((s) => s.tags.includes('VIP')).length || activeSubs.length
        : activeSubs.length;

    cmp.status = 'sent';
    cmp.sentCount = Math.max(1, recipientCount);
    cmp.openRate = 64.8;
    cmp.clickRate = 22.4;
    cmp.scheduledDate = new Date().toISOString().slice(0, 10);

    if (!Array.isArray(db.pushNotifications)) db.pushNotifications = [];
    const linkedArt = db.articles.find((a) => a.id === cmp.featuredArticleId);
    const createdPush: PushNotificationItem = {
      id: `push-${Date.now()}`,
      type: 'new_campaign',
      title: `🚀 Boletín en Vivo: ${cmp.subject}`,
      body: cmp.customMessage || cmp.contentBody || cmp.subject,
      imageUrl: linkedArt?.customImageUrl || '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg',
      category: cmp.segment === 'vip' ? 'Suscriptores VIP' : 'Newsletter General',
      targetArticleId: cmp.featuredArticleId || undefined,
      targetCampaignId: cmp.id,
      ctaText: cmp.ctaText || 'Leer edición completa',
      segment: cmp.segment,
      recipientCount: cmp.sentCount,
      createdAt: 'Ahora mismo',
    };
    db.pushNotifications.unshift(createdPush);

    saveDatabase(db);
    res.json({
      campaigns: db.campaigns,
      campaign: cmp,
      pushNotification: createdPush,
      pushNotifications: db.pushNotifications,
    });
  });

  // DELETE Marketing Campaign
  app.delete('/api/campaigns/:id', (req, res) => {
    const { id } = req.params;
    if (!Array.isArray(db.campaigns)) {
      db.campaigns = [];
    }
    db.campaigns = db.campaigns.filter((c) => c.id !== id);
    saveDatabase(db);
    res.json({ campaigns: db.campaigns });
  });

  // POST Create & Broadcast Browser Push Notification Manually
  app.post('/api/push-notifications', (req, res) => {
    const payload = req.body as Partial<PushNotificationItem>;
    if (!payload.title || !payload.body) {
      res.status(400).json({ error: 'Título y mensaje de la notificación push son obligatorios.' });
      return;
    }
    if (!Array.isArray(db.pushNotifications)) {
      db.pushNotifications = [];
    }
    const pushSubsCount = Math.max(
      1,
      (db.subscriberRecords || []).filter(
        (s) => s.status === 'active' && s.pushEnabled !== false
      ).length
    );
    const linkedArt = payload.targetArticleId
      ? db.articles.find((a) => a.id === payload.targetArticleId)
      : undefined;

    const newPush: PushNotificationItem = {
      id: `push-${Date.now()}`,
      type: payload.type || 'custom_alert',
      title: payload.title.trim(),
      body: payload.body.trim(),
      imageUrl:
        payload.imageUrl ||
        linkedArt?.customImageUrl ||
        '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg',
      category: payload.category || linkedArt?.category || 'Aviso Editorial',
      targetArticleId: payload.targetArticleId || undefined,
      targetCampaignId: payload.targetCampaignId || undefined,
      ctaText: payload.ctaText || 'Abrir publicación',
      segment: payload.segment || 'active',
      recipientCount: payload.recipientCount || pushSubsCount,
      createdAt: 'Ahora mismo',
    };
    db.pushNotifications.unshift(newPush);
    saveDatabase(db);
    res.status(201).json({
      pushNotification: newPush,
      pushNotifications: db.pushNotifications,
    });
  });

  // DELETE Push Notification from History
  app.delete('/api/push-notifications/:id', (req, res) => {
    const { id } = req.params;
    if (!Array.isArray(db.pushNotifications)) {
      db.pushNotifications = [];
    }
    db.pushNotifications = db.pushNotifications.filter((p) => p.id !== id);
    saveDatabase(db);
    res.json({ pushNotifications: db.pushNotifications });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kayleen Editorial Blog & CMS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
