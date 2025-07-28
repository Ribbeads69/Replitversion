import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const pageConfig = {
  "/": {
    title: "Dashboard",
    subtitle: "Monitor your email outreach performance",
  },
  "/contacts": {
    title: "Contact Management",
    subtitle: "Manage your contact lists and import new prospects",
  },
  "/templates": {
    title: "Email Templates",
    subtitle: "Create and manage your email templates",
  },
  "/sequences": {
    title: "Email Sequences",
    subtitle: "Build automated email sequences and follow-ups",
  },
  "/campaigns": {
    title: "Campaign Management",
    subtitle: "Launch and monitor your email campaigns",
  },
};

export default function Header() {
  const [location] = useLocation();
  const config = pageConfig[location as keyof typeof pageConfig] || pageConfig["/"];

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{config.title}</h1>
          <p className="text-sm text-slate-400 mt-1">{config.subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {location === "/" && (
            <Button className="bg-primary-500 hover:bg-primary-600">
              New Campaign
            </Button>
          )}
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-slate-600 text-slate-200">
              JD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
