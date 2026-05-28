import { Film, Clapperboard, Tv, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = "Bollywood" | "Hollywood" | "Series" | "LiveTV";

interface BottomNavProps {
  activeTab: Category;
  onChange: (tab: Category) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const tabs: { id: Category; label: string; icon: React.ElementType }[] = [
    { id: "Bollywood", label: "Bollywood", icon: Film },
    { id: "Hollywood", label: "Hollywood", icon: Clapperboard },
    { id: "Series", label: "Series", icon: Tv },
    { id: "LiveTV", label: "LiveTV", icon: Radio },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/10 px-2 py-2 pb-safe">
      <div className="flex items-center justify-around max-w-[430px] mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200"
            >
              <div
                className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-tr from-red-600 to-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)] scale-110"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1 font-medium transition-all duration-300",
                  isActive ? "text-white" : "text-zinc-500"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
