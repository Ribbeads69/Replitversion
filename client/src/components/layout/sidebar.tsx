import { useState } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { BarChart3, Users, FileText, Zap, TargetIcon } from "lucide-react";
import EmailSetupDialog from "@/components/email-setup-dialog";

const navigationItems = [
  {
    name: "Mission Control",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Targets",
    href: "/contacts",
    icon: Users,
  },
  {
    name: "Arsenal",
    href: "/templates",
    icon: FileText,
  },
  {
    name: "Sequences",
    href: "/sequences",
    icon: Zap,
  },
  {
    name: "Operations",
    href: "/campaigns",
    icon: TargetIcon,
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [showEmailSetup, setShowEmailSetup] = useState(false);

  return (
    <aside className="w-64 sidebar-bg border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🎯</span>
          </div>
          <span className="text-xl font-semibold text-slate-100">Sniper App</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary-500 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div 
          className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
          onClick={() => setShowEmailSetup(true)}
        >
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">OPR</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-100">Operator Connected</p>
            <p className="text-xs text-slate-400">agent@sniper.ops</p>
          </div>
        </div>
      </div>

      <EmailSetupDialog 
        open={showEmailSetup}
        onOpenChange={setShowEmailSetup}
      />
    </aside>
  );
}
