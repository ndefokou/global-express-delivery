import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegisterSW } from "virtual:pwa-register/react";

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: " + r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (offlineReady || needRefresh) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <Card>
          <CardHeader>
            <CardTitle>{offlineReady ? "App ready to work offline" : "New content available, click on reload button to update."}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            {needRefresh && (
              <Button onClick={() => updateServiceWorker(true)}>
                Reload
              </Button>
            )}
            <Button variant="outline" onClick={() => close()}>
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

export default ReloadPrompt;