import { createContext, useContext, useState } from "react";

import { useSearch, useRouter } from "@tanstack/react-router";
import { useHealth, useUploadPDF } from "@/hooks/chat";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/status-badge";
import { Chat } from "@/components/chat-form";
import { ToggleMiragContext } from ".";
import { MAX_FILE_SIZE_MB } from "@/lib/constants";


const CorpusPage = () => {
  const { data: health } = useHealth();
  const upload = useUploadPDF();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (selected.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }

    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError('File exceeds 10MB limit.');
      return;
    }

    setError(null);
    setFile(selected);
  };

  const handleUpload = () => {
    if (file) upload.mutate(file);
  };
  return (
    <ToggleMiragContext.Provider value={{ toggleMirag, setToggleMirag }}>
      <header className="p-4 border-b">
        <div className="flex justify-between">
          <div className="flex items-center gap-x-2">
            <SidebarTrigger />
            <span className="font-semibold">Custom Corpus</span>
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
      {/* file upload */}
      <div className="p-4 space-y-4 max-w-md">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <button
          onClick={handleUpload}
          disabled={!file || upload.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {upload.isPending ? 'Uploading...' : 'Upload PDF'}
        </button>

        {error && <p className="text-red-500">{error}</p>}
        {upload.isSuccess && (
          <p className="text-green-600">Uploaded: {upload.data.file}</p>
        )}
      </div>
    </ToggleMiragContext.Provider>
  );
}

export default CorpusPage;
