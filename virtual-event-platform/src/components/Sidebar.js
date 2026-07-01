import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  MonitorPlay,
  Users,
  Ticket,
  BarChart2,
  Sparkles,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
  Zap,
  Globe,
} from 'lucide-react';



// ── LOGO ─────────────────────────────────────────────────
function Logo({ collapsed }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 ${collapsed ? 'justify-center' : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0 shadow-lg shadow-brand/30">
        <Zap className="w-4 h-4 text-white" />
      </div>
      {!collapsed && (
        <span className="font-display font-bold text-base text-text-1 tracking-tight">
          Eventify
        </span>
      )}
    </div>
  );
}

// ── SIDEBAR ITEM ─────────────────────────────────────────
function SidebarItem({ to, label, icon: Icon, highlight, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? 'active' : ''} ${
          highlight
            ? 'bg-brand/10 text-brand border border-brand/20 hover:bg-brand/15 hover:text-brand'
            : ''
        }`
      }
      title={collapsed ? label : undefined}
    >
      <Icon
        className={`sidebar-icon w-[18px] h-[18px] shrink-0 ${highlight ? 'text-brand' : ''}`}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

// ── SECTION DIVIDER ───────────────────────────────────────
function SideSection({ label, collapsed }) {
  if (collapsed) return <div className="divider my-2" />;
  return (
    <div className="px-3 mt-5 mb-1.5">
      <span className="text-2xs font-bold uppercase tracking-widest text-text-3">{label}</span>
    </div>
  );
}

// ── MAIN SIDEBAR ─────────────────────────────────────────
export default function Sidebar({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);



  const content = (
    <nav className="flex flex-col h-full py-4 gap-0.5">
      {/* Logo + toggle */}
      {/* Logo + toggle */}
      <div className={`flex items-center mb-6 px-3 ${collapsed ? 'flex-col gap-3 justify-center' : 'justify-between'}`}>
        <Logo collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-text-3 hover:text-text-2 hover:bg-surface-2 transition-all shrink-0"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Main nav */}
      <div className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {user && (
          <>
            <SideSection label="Workspace" collapsed={collapsed} />
            <SidebarItem to="/dashboard"   label="Dashboard"   icon={LayoutDashboard} collapsed={collapsed} />
            <SidebarItem to="/discover"    label="Events"       icon={CalendarDays}    collapsed={collapsed} />
          </>
        )}

        <SideSection label="Discover" collapsed={collapsed} />
        <SidebarItem to="/conferences" label="Conferences" icon={MonitorPlay} collapsed={collapsed} />
        <SidebarItem to="/meetups"     label="Meetups"     icon={Users}       collapsed={collapsed} />

        {user && (
          <>
            <SideSection label="Manage" collapsed={collapsed} />
            <SidebarItem to="/tickets"   label="Tickets"   icon={Ticket}   collapsed={collapsed} />
            <SidebarItem to="/community" label="Community" icon={Globe}     collapsed={collapsed} />
            <SidebarItem to="/analytics" label="Analytics" icon={BarChart2} collapsed={collapsed} />
          </>
        )}
      </div>

      {/* Bottom items */}
      <div className="px-2 flex flex-col gap-0.5 border-t border-border pt-3 mt-2">
        {user ? (
          <>
            <SidebarItem to="/co-creator"    label="AI Copilot"    icon={Sparkles}   highlight collapsed={collapsed} />
            <SidebarItem to="/notifications" label="Notifications" icon={Bell}        collapsed={collapsed} />
            <SidebarItem to="/profile"       label="Profile"       icon={UserCircle}  collapsed={collapsed} />

            <button
              onClick={onLogout}
              className={`sidebar-link text-text-2 hover:text-danger hover:bg-danger/5 mt-1 ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={`sidebar-link font-semibold ${collapsed ? 'justify-center' : ''}`}
            >
              <UserCircle className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && 'Sign In'}
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 glass border-b border-border flex items-center justify-between px-4">
        <Logo collapsed={false} />
        <button
          onClick={() => setMobileOpen(true)}
          className="btn-ghost btn-sm"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-canvas/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-surface border-r border-border transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-3 hover:text-text-2 hover:bg-surface-2 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {content}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-surface border-r border-border transition-all duration-300 z-20 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {content}
      </aside>
    </>
  );
}
