import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const pageConfig = {
  "/": {
    title: "Mission Control",
    subtitle: "Real-time operational intelligence and target metrics",
  },
  "/contacts": {
    title: "Target Database",
    subtitle: "Manage contact lists and import new targets",
  },
  "/templates": {
    title: "Communication Arsenal",
    subtitle: "Craft and deploy persuasive message templates",
  },
  "/sequences": {
    title: "Operation Sequences",
    subtitle: "Build automated multi-stage engagement protocols",
  },
  "/campaigns": {
    title: "Active Operations",
    subtitle: "Deploy and monitor live engagement campaigns",
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
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Deploy Operation
            </Button>
          )}
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-red-600 text-white">
              OPR
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
