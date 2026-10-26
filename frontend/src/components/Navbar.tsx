import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bike,
  Cpu,
  Activity,
  GraduationCap,
  Zap,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '🛵 Blinkit Fleet Dispatch', icon: Bike },
    { path: '/lab', label: '🔬 DAA Algorithm Lab', icon: Cpu },
    { path: '/benchmark', label: '📊 Benchmark Suite', icon: Activity },
    { path: '/viva', label: '🎓 Viva Defense & Guide', icon: GraduationCap },
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link
            to="/"
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-slate-950 font-black fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">
                  Quick<span className="text-amber-400">Route</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-extrabold uppercase">
                  Blinkit DAA
                </span>
              </div>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide">
                10-Min Dark Store & Fleet Dispatch Optimization
              </span>
            </div>
          </Link>

          {/* Navigation Links (Consolidated 4 High-Impact Tabs) */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Live Engine Status Badge */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">DAA Engine Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
