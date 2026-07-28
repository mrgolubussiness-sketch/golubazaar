import { useState } from "react";
import { X, Megaphone } from "lucide-react";
import { useGetStoreSettings } from "@workspace/api-client-react";

export default function AnnouncementBanner() {
  const { data: settings } = useGetStoreSettings();
  const [dismissed, setDismissed] = useState(false);

  if (!settings?.announcementActive || !settings?.announcementText || dismissed) {
    return null;
  }

  return (
    <div className="relative z-50 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border-b border-primary/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3">
        <Megaphone className="w-4 h-4 text-primary shrink-0" />
        <p className="text-sm font-mono text-center text-foreground/90 leading-tight">
          {settings.announcementText}
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="ml-auto shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
