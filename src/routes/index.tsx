import { createContext, useContext } from "react";
import { useSearch, useRouter } from "@tanstack/react-router";
import { useHealth } from "@/hooks/chat";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/status-badge";
import { Chat } from "@/components/chat-form";
import { useAuthContext } from "@/contexts/auth-context";
import { LoginButton } from "@/components/auth/login-button";
import { UserProfile } from "@/components/auth/user-profile";

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
  const { user, loading, isInitialized } = useAuthContext();

  const search = useSearch({ strict: false });
  const router = useRouter();
  const toggleMirag = !!search["toggle-mirag"];
  const setToggleMirag = (val: boolean) => {
    function isToggled(val: any) {
      return {
        ...val,
        "toggle-mirag": val ? true : undefined,
      };
    }
    router.navigate({
      search: isToggled(val),
      replace: true,
    });
  };

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ToggleMiragContext.Provider value={{ toggleMirag, setToggleMirag }}>
      <header className="p-4 border-b">
        <div className="flex justify-between">
          <div className="flex items-center gap-x-2">
            <SidebarTrigger />
            <span className="font-semibold">Chat</span>
          </div>
          <div className="flex items-center gap-x-4">
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
            <StatusBadge status={health?.status || "unknown"} />

            {/* Authentication Section */}
            <div className="flex items-center">
              {loading ? (
                <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
              ) : user ? (
                <UserProfile />
              ) : (
                <LoginButton variant="outline" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Show authentication notice for anonymous users */}
      {!loading && !user && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You're browsing as a guest. <strong>Sign in with Google</strong> to use custom corpus.
              </p>
            </div>
          </div>
        </div>
      )}

      <Chat />
    </ToggleMiragContext.Provider>
  );
};

export default IndexPage;
