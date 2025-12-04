import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PWAInstallButton = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Check if app is already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isInstalled) {
            toast.info("L'application est déjà installée!", {
                description: "Vous pouvez y accéder depuis votre écran d'accueil.",
            });
            return;
        }

        if (!deferredPrompt) {
            // Show manual installation instructions
            toast.info("Installation manuelle requise", {
                description: "Utilisez le menu de votre navigateur pour installer cette application (Ajouter à l'écran d'accueil).",
                duration: 5000,
            });
            return;
        }

        try {
            // Show the install prompt
            await deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === "accepted") {
                toast.success("Application installée avec succès!");
                setIsInstalled(true);
            } else {
                toast.info("Installation annulée");
            }

            // Clear the deferredPrompt for next time
            setDeferredPrompt(null);
        } catch (error) {
            console.error("Error during installation:", error);
            toast.error("Erreur lors de l'installation");
        }
    };

    // Always show the button
    return (
        <Button
            onClick={handleInstallClick}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all"
        >
            {isInstalled ? (
                <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Application installée</span>
                </>
            ) : deferredPrompt ? (
                <>
                    <Download className="h-5 w-5" />
                    <span>Installer l'application</span>
                </>
            ) : (
                <>
                    <Info className="h-5 w-5" />
                    <span>Installer l'application</span>
                </>
            )}
        </Button>
    );
};
