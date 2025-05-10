import { createContext, useContext } from "react";

import { useSearch, useRouter } from "@tanstack/react-router";
import { useHealth } from "@/hooks/chat";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/status-badge";
import { Chat } from "@/components/chat-form";
export const ToggleMiragContext = createContext<{
  toggleMirag: boolean;
  setToggleMirag: (val: boolean) => void;
}>({
  toggleMirag: false,
  setToggleMirag: () => { },
});

export function useToggleMirag() {
  return useContext(ToggleMiragContext);
}
const IndexPage = () => {
  const { data: health } = useHealth();

  const search = useSearch({ strict: false });
  const router = useRouter();
  const toggleMirag = !!search["toggle-mirag"];
  const setToggleMirag = (val: boolean) => {
    function isToggled(val: any) {
      return {
        ...val,
        "toggle-mirag": val ? true : undefined, // remove the key if false
      }
    }
    router.navigate({
      search: isToggled(val),
      replace: true,
    })
  };
  return (
    <ToggleMiragContext.Provider value={{ toggleMirag, setToggleMirag }}>
      <header className="p-4 border-b">
        <div className="flex justify-between">
          <div className="flex items-center gap-x-2">
            <SidebarTrigger />
            <span className="font-semibold">Chat</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center">
              <Switch
                id="toggle-mirag"
                checked={toggleMirag}
                onCheckedChange={setToggleMirag}
              />
              <Label htmlFor="toggle-mirag" className="text-xs font-medium">
                Toggle MiRAG
              </Label>
            </div>
            <StatusBadge status="gpt-4o-mini" />
            <StatusBadge status={health.status} />
          </div>
        </div>
      </header>
      <Chat />
    </ToggleMiragContext.Provider>
  );
};

export default IndexPage;
