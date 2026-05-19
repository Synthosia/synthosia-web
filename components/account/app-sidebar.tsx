"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Server, 
  Database, 
  HardDrive, 
  Activity, 
  Globe, 
  TerminalSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Layers,
  ChevronDown
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const mainNavItems = [
  { name: "Overview", href: "/account", icon: LayoutDashboard },
  { name: "Activity", href: "/account/activity", icon: Activity },
];

const infraNavItems = [
  { name: "Servers", href: "/account/servers", icon: Server },
  { name: "Databases", href: "/account/databases", icon: Database },
  { name: "Storage", href: "/account/storage", icon: HardDrive },
  { name: "Network", href: "/account/network", icon: Globe },
];

const opsNavItems = [
  { name: "Terminal", href: "/account/terminal", icon: TerminalSquare },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderNavGroup = (items: typeof mainNavItems, label?: string) => (
    <div className="mb-6">
      {label && !isCollapsed && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-3 mb-2 text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase font-semibold"
        >
          {label}
        </motion.div>
      )}
      <div className="flex flex-col gap-[2px]">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "nav-item relative flex items-center h-8 px-3 rounded-md text-[13px] group",
                isActive ? "nav-item-active" : "text-[var(--text-secondary)]",
                isCollapsed && "justify-center px-0 w-8 mx-auto"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute left-0 w-[3px] h-[18px] bg-[var(--accent)] rounded-r-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn(
                "w-4 h-4 shrink-0 transition-colors", 
                isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]",
                !isCollapsed && "mr-3"
              )} />
              
              {!isCollapsed && (
                <span className="font-medium tracking-tight truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isCollapsed ? "68px" : "240px",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className="flex-shrink-0 h-screen border-r border-[var(--border-subtle)] bg-[var(--console-rail-bg)] flex flex-col relative z-20"
    >
      {/* Workspace Selector */}
      <div className="h-14 flex items-center px-3 border-b border-[var(--border-subtle)]">
        <button className={cn(
          "w-full h-8 flex items-center rounded-md hover:bg-[var(--surface-interactive)] transition-colors",
          isCollapsed ? "justify-center px-0" : "px-2 justify-between"
        )}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[var(--accent)] to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
              <Layers className="w-3 h-3 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-display text-[13px] font-semibold tracking-tight truncate text-[var(--text-primary)]">
                Personal Workspace
              </span>
            )}
          </div>
          {!isCollapsed && <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto custom-scrollbar">
        {renderNavGroup(mainNavItems)}
        {renderNavGroup(infraNavItems, "Infrastructure")}
        {renderNavGroup(opsNavItems, "Operations")}
      </nav>

      {/* Footer / User */}
      <div className="p-2 border-t border-[var(--border-subtle)]">
        <button className={cn(
          "nav-item w-full flex items-center h-8 rounded-md text-[13px] text-[var(--text-secondary)]",
          isCollapsed ? "justify-center px-0" : "px-3 gap-3"
        )} title={isCollapsed ? "Settings" : undefined}>
          <Settings className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          {!isCollapsed && <span className="font-medium tracking-tight">Settings</span>}
        </button>
        
        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button className={cn(
            "flex items-center hover:bg-[var(--surface-interactive)] rounded-md transition-colors",
            isCollapsed ? "w-8 h-8 justify-center mx-auto" : "flex-1 h-8 px-2 gap-2"
          )}>
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
              JD
            </div>
            {!isCollapsed && (
              <div className="flex flex-col items-start truncate">
                <span className="text-[11px] font-semibold text-[var(--text-primary)] leading-none">Jane Doe</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[var(--surface-panel)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] shadow-sm z-30 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
