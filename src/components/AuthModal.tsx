import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  Crown,
  UserCheck,
  Lock,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { User, UserRole } from '../data/akeaData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  initialMode?: 'login' | 'register';
  initialAccessGroup?: 'all' | 'admin' | 'reader';
  onLogin: (email: string, password?: string) => Promise<{ ok: boolean; error?: string }>;
  onRegister: (payload: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    specialty?: string;
    bio?: string;
    location?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  onOpenFullReaderRegister?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  initialMode = 'login',
  initialAccessGroup = 'all',
  onLogin,
  onRegister,
  onOpenFullReaderRegister,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loginGroup, setLoginGroup] = useState<'all' | 'admin' | 'reader'>(initialAccessGroup);
  const [email, setEmail] = useState('alice@kayleen-studio.com');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('reader');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('Madrid, España');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLoginGroup(initialAccessGroup);
      setError('');
      if (initialMode === 'login') {
        if (initialAccessGroup === 'reader') {
          const readerAccount = users.find((u) => u.role === 'reader');
          setEmail(readerAccount?.email || 'elena@kayleen-studio.com');
          setPassword('reader123');
        } else {
          const adminAccount = users.find((u) => u.role === 'admin') || users[0];
          setEmail(adminAccount?.email || 'alice@kayleen-studio.com');
          setPassword('admin123');
        }
      } else {
        setEmail('');
        setPassword('');
        setRole(initialAccessGroup === 'admin' ? 'author' : 'reader');
      }
    }
  }, [isOpen, initialMode, initialAccessGroup, users]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await onLogin(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || 'Error al iniciar sesión. Verifica tu correo y contraseña.');
    } else {
      onClose();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await onRegister({
      name,
      email,
      password,
      role,
      specialty:
        specialty ||
        (role === 'reader'
          ? 'Lector & Suscriptor Kayleen'
          : role === 'admin'
          ? 'Administrador Editorial'
          : 'Autor Colaborador'),
      bio:
        bio ||
        (role === 'reader'
          ? 'Lector registrado en la comunidad de Kayleen Magazine.'
          : 'Colaborador editorial en Kayleen Magazine.'),
      location,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error || 'Error al registrar la cuenta.');
    } else {
      onClose();
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setError('');
    setLoading(true);
    const res = await onLogin(demoEmail);
    setLoading(false);
    if (res.ok) onClose();
  };

  const adminAndEditorialUsers = users.filter(
    (u) => u.role === 'admin' || u.role === 'editor' || u.role === 'moderator' || u.role === 'author'
  );
  const generalReaderUsers = users.filter((u) => u.role === 'reader');

  const getRoleBadge = (u: User) => {
    if (u.role === 'admin') {
      return {
        label: 'Administración',
        className: 'bg-[#FF2C54] text-white',
      };
    }
    if (u.role === 'editor' || u.role === 'moderator') {
      return {
        label: u.role === 'editor' ? 'Editor Jefe' : 'Moderador',
        className: 'bg-[#5960FF] text-white',
      };
    }
    if (u.role === 'author') {
      return {
        label: 'Autor Editorial',
        className: 'bg-[#171920] text-white',
      };
    }
    if (u.isPremium) {
      return {
        label: 'Lector Premium ★',
        className: 'bg-amber-500 text-white',
      };
    }
    return {
      label: 'Usuario Lector (Free)',
      className: 'bg-emerald-600 text-white',
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#dcdfe7] rounded-[18px] w-full max-w-xl p-6 sm:p-8 relative shadow-2xl my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#595F71] hover:text-[#171920] hover:bg-[#f7f8fc] transition-colors cursor-pointer"
          aria-label="Cerrar ventana de acceso"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF2C54]/10 text-[#FF2C54] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3" />
            <span>Sistema Central de Cuentas Kayleen</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171920]">
              Kayleen<span className="text-[#FF2C54]">.</span>
            </span>
            <span className="text-xs font-semibold text-[#595F71]">
              Acceso para Usuarios, Suscriptores y Administración
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs (Login vs Register) */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#f7f8fc] border border-[#dcdfe7] rounded-[12px] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2.5 px-4 rounded-[8px] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#171920] text-white shadow-xs'
                : 'text-[#4b546e] hover:text-[#171920]'
            }`}
          >
            <LogIn className="w-4 h-4 text-[#FF2C54]" />
            <span>Iniciar Sesión (Usuarios / Admin)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              setEmail('');
              setPassword('');
            }}
            className={`py-2.5 px-4 rounded-[8px] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-[#FF2C54] text-white shadow-xs'
                : 'text-[#4b546e] hover:text-[#171920]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Nuevo Usuario</span>
          </button>
        </div>

        {mode === 'login' ? (
          <>
            {/* Quick Filter Pill for Account Type: Todos | Usuarios Generales | Administración */}
            <div className="mb-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#595F71] mb-2">
                Selecciona tu tipo de acceso o ingresa tus credenciales:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLoginGroup('all')}
                  className={`py-2 px-3 rounded-[8px] text-xs font-semibold border transition-colors cursor-pointer ${
                    loginGroup === 'all'
                      ? 'bg-[#171920] text-white border-[#171920]'
                      : 'bg-white text-[#4b546e] border-[#dcdfe7] hover:border-[#171920]'
                  }`}
                >
                  Todas las Cuentas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginGroup('reader');
                    const readerAcc = generalReaderUsers[0];
                    if (readerAcc) {
                      setEmail(readerAcc.email);
                      setPassword('reader123');
                    }
                  }}
                  className={`py-2 px-3 rounded-[8px] text-xs font-semibold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginGroup === 'reader'
                      ? 'bg-[#5960FF] text-white border-[#5960FF]'
                      : 'bg-white text-[#4b546e] border-[#dcdfe7] hover:border-[#5960FF]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Usuarios / Lectores</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginGroup('admin');
                    const adminAcc = adminAndEditorialUsers[0];
                    if (adminAcc) {
                      setEmail(adminAcc.email);
                      setPassword('admin123');
                    }
                  }}
                  className={`py-2 px-3 rounded-[8px] text-xs font-semibold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginGroup === 'admin'
                      ? 'bg-[#FF2C54] text-white border-[#FF2C54]'
                      : 'bg-white text-[#4b546e] border-[#dcdfe7] hover:border-[#FF2C54]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Administración</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 bg-[#f7f8fc] p-4 sm:p-5 rounded-[14px] border border-[#dcdfe7]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#171920] mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171920] mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-xs text-[#DC2626] font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-[10px] text-xs font-bold uppercase tracking-wider text-white bg-[#FF2C54] hover:bg-[#171920] transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Iniciando sesión...' : 'Entrar con esta Cuenta'}</span>
              </button>
            </form>

            {/* Quick 1-Click Account Switcher Separated by Role */}
            <div className="mt-6 pt-5 border-t border-[#dcdfe7] space-y-4">
              {(loginGroup === 'all' || loginGroup === 'admin') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#171920]">
                      <ShieldCheck className="w-4 h-4 text-[#FF2C54]" />
                      <span>Acceso Directo Administración y Equipo Editorial (1 clic):</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {adminAndEditorialUsers.map((u) => {
                      const badge = getRoleBadge(u);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleQuickDemoLogin(u.email)}
                          className="p-2.5 rounded-[10px] text-left text-xs border border-[#dcdfe7] bg-white hover:border-[#FF2C54] hover:bg-[#FF2C54]/5 transition-all flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-[#171920] truncate">{u.name}</div>
                            <div className="text-[11px] text-[#595F71] truncate">{u.email}</div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(loginGroup === 'all' || loginGroup === 'reader') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#171920]">
                      <UserCheck className="w-4 h-4 text-[#5960FF]" />
                      <span>Acceso Directo Usuarios / Lectores (Premium y Free):</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {generalReaderUsers.map((u) => {
                      const badge = getRoleBadge(u);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleQuickDemoLogin(u.email)}
                          className="p-2.5 rounded-[10px] text-left text-xs border border-[#dcdfe7] bg-white hover:border-[#5960FF] hover:bg-[#5960FF]/5 transition-all flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-[#171920] truncate">{u.name}</div>
                            <div className="text-[11px] text-[#595F71] truncate">{u.email}</div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Selector visual de tipo de registro */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7]">
              <button
                type="button"
                onClick={() => setRole('reader')}
                className={`p-2.5 rounded-[8px] text-left border transition-all cursor-pointer ${
                  role === 'reader'
                    ? 'bg-white border-[#5960FF] ring-2 ring-[#5960FF]/20'
                    : 'bg-white/60 border-[#dcdfe7]'
                }`}
              >
                <div className="text-xs font-bold text-[#171920] flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#5960FF]" />
                  <span>Usuario / Lector</span>
                </div>
                <p className="text-[10px] text-[#595F71] mt-0.5">
                  Comentar, guardar lecturas y suscribirse
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('author')}
                className={`p-2.5 rounded-[8px] text-left border transition-all cursor-pointer ${
                  role === 'author'
                    ? 'bg-white border-[#FF2C54] ring-2 ring-[#FF2C54]/20'
                    : 'bg-white/60 border-[#dcdfe7]'
                }`}
              >
                <div className="text-xs font-bold text-[#171920] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF2C54]" />
                  <span>Autor / Redactor</span>
                </div>
                <p className="text-[10px] text-[#595F71] mt-0.5">
                  Publicar artículos en Modo Escritura
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-2.5 rounded-[8px] text-left border transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-white border-[#171920] ring-2 ring-[#171920]/20'
                    : 'bg-white/60 border-[#dcdfe7]'
                }`}
              >
                <div className="text-xs font-bold text-[#171920] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#171920]" />
                  <span>Administrador</span>
                </div>
                <p className="text-[10px] text-[#595F71] mt-0.5">
                  Gestión total del CMS, SEO y Políticas
                </p>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171920] mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Clara Valdés"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171920] mb-1">
                  Ciudad / País
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Madrid, España"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171920] mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="clara@ejemplo.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171920] mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171920] mb-1">
                Especialidad / Intereses de Lectura
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder={
                  role === 'reader'
                    ? 'Ej. Fotografía documental, Viajes y Arquitectura'
                    : 'Ej. Crítica de Arquitectura & Diseño'
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171920] mb-1">
                Biografía breve (opcional)
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Breve presentación para tu perfil en la revista..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
              />
            </div>

            {error && (
              <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-xs text-[#DC2626] font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[10px] text-xs font-bold uppercase tracking-wider text-white bg-[#FF2C54] hover:bg-[#171920] transition-colors cursor-pointer shadow-xs"
            >
              {loading ? 'Creando cuenta...' : 'Completar Registro y Entrar Ahora'}
            </button>

            {onOpenFullReaderRegister && (
              <div className="pt-3 border-t border-[#dcdfe7] text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFullReaderRegister();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5960FF] hover:text-[#FF2C54] transition-colors cursor-pointer"
                >
                  <span>Ir a la Página Completa de Registro con Preferencias de Categorías</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
