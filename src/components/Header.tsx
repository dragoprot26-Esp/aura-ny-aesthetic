import { TenantConfig } from '../types';
import { Eye, Shield, Users, Layers, Sparkles, LogOut, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  tenants: TenantConfig[];
  currentTenant: TenantConfig;
  onTenantChange: (tenantId: string) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  session: { role: 'admin' | 'collaborator'; name: string; licenseCode: string } | null;
  onLogout: () => void;
  isViewingPanel: boolean;
  setIsViewingPanel: (val: boolean) => void;
  onOpenLoginModal: () => void;
}

export default function Header({
  tenants,
  currentTenant,
  onTenantChange,
  isAdmin,
  setIsAdmin,
  session,
  onLogout,
  isViewingPanel,
  setIsViewingPanel,
  onOpenLoginModal
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-neutral-950 text-white border-b border-neutral-900 backdrop-blur-md bg-opacity-95 shadow-sm transition-all duration-300">
      
      {/* Session Active / Preview Banner */}
      {session && !isViewingPanel && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 text-xs py-2 px-4 font-mono font-bold flex justify-between items-center shadow-inner">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 animate-pulse" />
            <span>SESIÓN ACTIVA ({session.role === 'admin' ? 'ADMINISTRADOR' : 'COLABORADOR'} / {session.name})</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsViewingPanel(true)}
              className="bg-neutral-950 text-amber-400 hover:text-white px-3 py-1 rounded border border-neutral-900 text-[10px] tracking-wider transition-all cursor-pointer uppercase flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Volver al Panel
            </button>
            <button
              onClick={onLogout}
              className="bg-neutral-900/40 hover:bg-neutral-900/60 text-neutral-950 hover:text-white px-2.5 py-1 rounded text-[10px] tracking-wider transition-all cursor-pointer uppercase"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Tenant Switcher & Brand Info */}
          <div className="flex items-center space-x-3">
            <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800 hidden sm:block">
              <Layers className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">TIENDA ACTIVA</span>
                <span className="bg-amber-500/15 text-amber-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-amber-500/30">PWA</span>
              </div>
              <div className="relative group mt-0.5">
                <select
                  id="tenant-selector"
                  value={currentTenant.id}
                  onChange={(e) => onTenantChange(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 text-sm font-semibold rounded-md px-2.5 py-1 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-neutral-100 cursor-pointer transition-all hover:bg-neutral-850"
                >
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Core Applet NY Branding */}
          <div className="hidden md:flex flex-col items-center text-center">
            <h1 className="text-xl font-display font-bold tracking-widest text-white uppercase flex items-center gap-1.5">
              {currentTenant.logo}
            </h1>
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase mt-0.5">
              NYC Premium Salon Network
            </span>
          </div>

          {/* Navigation / Session Controls */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-xs font-mono mr-2">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${currentTenant.stripe.enabled ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' : 'bg-neutral-900 text-neutral-500 border-neutral-800'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${currentTenant.stripe.enabled ? 'bg-emerald-400' : 'bg-neutral-600'}`}></span>
                Stripe
              </span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${currentTenant.whatsapp.enabled ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' : 'bg-neutral-900 text-neutral-500 border-neutral-800'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${currentTenant.whatsapp.enabled ? 'bg-emerald-400' : 'bg-neutral-600'}`}></span>
                WhatsApp
              </span>
            </div>

            {/* Quick Session Actions */}
            {session ? (
              <div className="flex items-center space-x-2">
                {isViewingPanel ? (
                  <button
                    id="back-to-public-from-panel"
                    onClick={() => setIsViewingPanel(false)}
                    className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold tracking-wider uppercase transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Ver Pública</span>
                  </button>
                ) : (
                  <button
                    id="back-to-panel-from-public"
                    onClick={() => setIsViewingPanel(true)}
                    className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs tracking-wider uppercase transition-all"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Ir al Panel</span>
                  </button>
                )}
                
                <button
                  id="header-logout-button"
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-neutral-900 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-900/30 transition-all"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                id="header-login-button"
                onClick={onOpenLoginModal}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-500 hover:text-amber-400 border border-neutral-800 hover:border-amber-500/20 text-xs font-semibold tracking-wider uppercase transition-all"
              >
                <Shield className="h-4 w-4 text-amber-500" />
                <span>Ingresar</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
