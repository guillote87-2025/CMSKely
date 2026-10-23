import { DatabaseState } from '../data/akeaData';

export interface PhpFileExport {
  filename: string;
  language: 'sql' | 'php' | 'css';
  description: string;
  content: string;
}

export function generatePhpMysqlPackage(db: DatabaseState): PhpFileExport[] {
  const sqlUsers = db.users
    .map(
      (u, idx) =>
        `(${idx + 1}, '${escapeSql(u.name)}', '${escapeSql(u.email)}', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '${u.role}', '${escapeSql(u.specialty)}', '${escapeSql(u.bio)}', '${escapeSql(u.location)}', ${u.active ? 1 : 0}, '${u.joinedAt}')`
    )
    .join(',\n');

  const sqlArticles = db.articles
    .map((a, idx) => {
      const authorIdx = Math.max(1, db.users.findIndex((u) => u.id === a.authorId) + 1);
      return `(${idx + 1}, '${escapeSql(a.slug)}', '${escapeSql(a.title)}', '${escapeSql(a.subtitle)}', '${escapeSql(a.excerpt)}', '${escapeSql(a.content.join('\n\n'))}', '${escapeSql(a.pullQuote)}', '${escapeSql(a.category)}', ${authorIdx}, ${a.featuredHero ? 1 : 0}, '${a.akeaSection}', ${a.readTimeMinutes}, ${a.views}, ${a.shares}, '${a.status}', NOW())`;
    })
    .join(',\n');

  const sqlComments = db.comments
    .map((c, idx) => {
      const artIdx = Math.max(1, db.articles.findIndex((a) => a.id === c.articleId) + 1);
      return `(${idx + 1}, ${artIdx}, '${escapeSql(c.authorName)}', '${escapeSql(c.authorEmail)}', '${escapeSql(c.content)}', '${c.status}', NOW())`;
    })
    .join(',\n');

  return [
    {
      filename: 'database.sql',
      language: 'sql',
      description: 'Esquema relacional MySQL 8.0 completo con tablas users, articles, comments (con moderación previa) y datos iniciales de Akea Homepage 2.',
      content: `-- ============================================================================
-- AKEA EDITORIAL BLOG & CMS (HOMEPAGE 2) - ESQUEMA MYSQL
-- Compatible con MySQL 8.0+ / MariaDB 10.6+ (UTF8MB4)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS akea_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE akea_blog;

-- 1. Tabla de Usuarios y Autores
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'author', 'reader') NOT NULL DEFAULT 'reader',
  specialty VARCHAR(180) DEFAULT '',
  bio TEXT,
  location VARCHAR(120) DEFAULT '',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabla de Artículos (Estructura Akea Homepage 2)
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(220) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(320) DEFAULT '',
  excerpt TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  pull_quote TEXT,
  category ENUM('Tecnología', 'Moda', 'Viajes', 'Fotografía', 'Estilo de Vida') NOT NULL,
  author_id INT NOT NULL,
  featured_hero TINYINT(1) NOT NULL DEFAULT 0,
  akea_section VARCHAR(40) NOT NULL DEFAULT 'recent',
  read_time_minutes INT NOT NULL DEFAULT 5,
  views INT NOT NULL DEFAULT 0,
  shares INT NOT NULL DEFAULT 0,
  status ENUM('published', 'draft') NOT NULL DEFAULT 'published',
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_article_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabla de Comentarios (Con aprobación obligatoria de administración)
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  author_name VARCHAR(120) NOT NULL,
  author_email VARCHAR(160) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Volcado de Usuarios Iniciales
INSERT INTO users (id, name, email, password_hash, role, specialty, bio, location, is_active, created_at) VALUES
${sqlUsers};

-- Volcado de Artículos Iniciales
INSERT INTO articles (id, slug, title, subtitle, excerpt, content, pull_quote, category, author_id, featured_hero, akea_section, read_time_minutes, views, shares, status, published_at) VALUES
${sqlArticles};

-- Volcado de Comentarios Iniciales
INSERT INTO comments (id, article_id, author_name, author_email, content, status, created_at) VALUES
${sqlComments};
`,
    },
    {
      filename: 'config/database.php',
      language: 'php',
      description: 'Conexión PDO segura a MySQL con soporte de sesiones, helpers de autenticación y protección CSRF.',
      content: `<?php
// config/database.php - Conexión PDO MySQL y Funciones de Sesión
declare(strict_types=1);
session_start();

define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'akea_blog');
define('DB_USER', 'root');
define('DB_PASS', '');

function getPDO(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

function currentUser(): ?array {
    return $_SESSION['akea_user'] ?? null;
}

function requireAdmin(): void {
    $user = currentUser();
    if (!$user || ($user['role'] !== 'admin' && $user['role'] !== 'author')) {
        header('Location: /login.php');
        exit;
    }
}

function e(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}
?>`,
    },
    {
      filename: 'index.php',
      language: 'php',
      description: 'Plantilla principal PHP basada 100% en Akea Homepage 2: Hero Slider, Artículos Recientes (3 col), Tecnología Asimétrica, Moda (2 col) y Viajes.',
      content: `<?php
require_once __DIR__ . '/config/database.php';
$pdo = getPDO();

// 1. Artículos destacados para Hero Slider (Wrapper 1)
$heroSlides = $pdo->query("
    SELECT a.*, u.name AS author_name
    FROM articles a JOIN users u ON u.id = a.author_id
    WHERE a.status = 'published' AND a.featured_hero = 1
    ORDER BY a.published_at DESC LIMIT 3
")->fetchAll();

// 2. Artículos Recientes (Wrapper 2 - Grid 3 columnas)
$recentArticles = $pdo->query("
    SELECT a.*, u.name AS author_name
    FROM articles a JOIN users u ON u.id = a.author_id
    WHERE a.status = 'published'
    ORDER BY a.published_at DESC LIMIT 6
")->fetchAll();

// 3. Sección Tecnología (Wrapper 3 - Lead + Stack)
$techArticles = $pdo->query("
    SELECT a.*, u.name AS author_name
    FROM articles a JOIN users u ON u.id = a.author_id
    WHERE a.status = 'published' AND a.category = 'Tecnología'
    ORDER BY a.published_at DESC LIMIT 5
")->fetchAll();

// 4. Sección Moda y Fotografía (Wrapper 5 - 2 columnas Medium Left Thumbnail)
$fashionArticles = $pdo->query("
    SELECT a.*, u.name AS author_name
    FROM articles a JOIN users u ON u.id = a.author_id
    WHERE a.status = 'published' AND a.category IN ('Moda', 'Fotografía')
    ORDER BY a.published_at DESC LIMIT 4
")->fetchAll();

// 5. Sección Consejos de Viaje (Wrapper 7 - 2 Top + 3 Bottom)
$travelArticles = $pdo->query("
    SELECT a.*, u.name AS author_name
    FROM articles a JOIN users u ON u.id = a.author_id
    WHERE a.status = 'published' AND a.category = 'Viajes'
    ORDER BY a.published_at DESC LIMIT 5
")->fetchAll();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Akea. — Editorial Blog Homepage 2</title>
  <link rel="stylesheet" href="/assets/akea.css">
</head>
<body>
  <header class="akea-header">
    <a href="index.php" class="akea-brand">Akea<span>.</span></a>
    <nav class="akea-nav">
      <a href="index.php">Inicio</a>
      <a href="index.php?cat=Tecnología">Tecnología</a>
      <a href="index.php?cat=Moda">Moda</a>
      <a href="index.php?cat=Viajes">Viajes</a>
      <a href="author.php">Autores</a>
    </nav>
    <?php if (currentUser()): ?>
      <a href="admin/dashboard.php" class="akea-cta">Panel Editorial</a>
    <?php else: ?>
      <a href="login.php" class="akea-cta">Iniciar Sesión</a>
    <?php endif; ?>
  </header>

  <!-- Wrapper 1: Hero Post Slider -->
  <section class="akea-hero-slider">
    <?php foreach ($heroSlides as $slide): ?>
      <article class="akea-hero-slide">
        <div class="akea-hero-meta">
          <?= e($slide['category']) ?> · <?= e($slide['published_at']) ?> · <?= e($slide['author_name']) ?>
        </div>
        <h1><a href="article.php?slug=<?= e($slide['slug']) ?>"><?= e($slide['title']) ?></a></h1>
      </article>
    <?php endforeach; ?>
  </section>

  <!-- Wrapper 2: Recent Articles (3-Column Grid) -->
  <main class="akea-container">
    <h2 class="akea-section-title">Artículos Recientes</h2>
    <div class="akea-grid-3">
      <?php foreach ($recentArticles as $post): ?>
        <article class="akea-card">
          <div class="akea-meta"><?= e($post['category']) ?> · <?= e($post['author_name']) ?> · <?= (int)$post['read_time_minutes'] ?> min</div>
          <h3><a href="article.php?slug=<?= e($post['slug']) ?>"><?= e($post['title']) ?></a></h3>
          <p><?= e($post['excerpt']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </main>
</body>
</html>`,
    },
    {
      filename: 'article.php',
      language: 'php',
      description: 'Vista de artículo individual con botones de compartir en redes sociales, tarjeta de autor y sistema de comentarios con estado pending para aprobación administrativa.',
      content: `<?php
require_once __DIR__ . '/config/database.php';
$pdo = getPDO();

$slug = $_GET['slug'] ?? '';
$stmt = $pdo->prepare("
    SELECT a.*, u.name AS author_name, u.bio AS author_bio, u.specialty AS author_specialty
    FROM articles a JOIN users u ON u.id = a.author_id
    WHERE a.slug = :slug LIMIT 1
");
$stmt->execute(['slug' => $slug]);
$article = $stmt->fetch();

if (!$article) {
    http_response_code(404);
    exit('Artículo no encontrado');
}

// Procesar envío de comentario (Queda en estado 'pending' hasta aprobación del administrador)
$commentNotice = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_comment'])) {
    $name = trim($_POST['author_name'] ?? '');
    $email = trim($_POST['author_email'] ?? '');
    $content = trim($_POST['content'] ?? '');

    if ($name !== '' && $email !== '' && $content !== '') {
        $insert = $pdo->prepare("
            INSERT INTO comments (article_id, author_name, author_email, content, status)
            VALUES (:article_id, :name, :email, :content, 'pending')
        ");
        $insert->execute([
            'article_id' => $article['id'],
            'name'       => $name,
            'email'      => $email,
            'content'    => $content,
        ]);
        $commentNotice = 'Tu comentario ha sido recibido y será visible tras su aprobación por la administración.';
    }
}

// Obtener únicamente comentarios APROBADOS por la administración
$commentsStmt = $pdo->prepare("
    SELECT * FROM comments
    WHERE article_id = :article_id AND status = 'approved'
    ORDER BY created_at DESC
");
$commentsStmt->execute(['article_id' => $article['id']]);
$approvedComments = $commentsStmt->fetchAll();
?>`,
    },
    {
      filename: 'admin/dashboard.php',
      language: 'php',
      description: 'Dashboard minimalista de administración en PHP: aprobación/rechazo de comentarios en 1 clic, CRUD de artículos y gestión simplificada de usuarios.',
      content: `<?php
require_once __DIR__ . '/../config/database.php';
requireAdmin();
$pdo = getPDO();

// Aprobar o rechazar comentarios pendientes
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['comment_action'])) {
    $commentId = (int)$_POST['comment_id'];
    $newStatus = $_POST['comment_action'] === 'approve' ? 'approved' : 'rejected';
    $stmt = $pdo->prepare("UPDATE comments SET status = :status WHERE id = :id");
    $stmt->execute(['status' => $newStatus, 'id' => $commentId]);
    header('Location: dashboard.php?tab=comments');
    exit;
}

// Crear o actualizar artículo
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_article'])) {
    $stmt = $pdo->prepare("
        INSERT INTO articles (slug, title, subtitle, excerpt, content, category, author_id, status)
        VALUES (:slug, :title, :subtitle, :excerpt, :content, :category, :author_id, :status)
    ");
    $stmt->execute([
        'slug'      => strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $_POST['title'])),
        'title'     => $_POST['title'],
        'subtitle'  => $_POST['subtitle'],
        'excerpt'   => $_POST['excerpt'],
        'content'   => $_POST['content'],
        'category'  => $_POST['category'],
        'author_id' => currentUser()['id'],
        'status'    => $_POST['status'] ?? 'published',
    ]);
    header('Location: dashboard.php?tab=articles');
    exit;
}

$pendingComments = $pdo->query("
    SELECT c.*, a.title AS article_title
    FROM comments c JOIN articles a ON a.id = c.article_id
    WHERE c.status = 'pending'
    ORDER BY c.created_at DESC
")->fetchAll();
?>`,
    },
  ];
}

function escapeSql(val: string): string {
  return val.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n');
}
