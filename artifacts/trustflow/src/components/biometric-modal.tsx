import { useEffect, useState } from "react";
import { ShieldAlert, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BiometricModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export function BiometricModal({ isOpen, onConfirm }: BiometricModalProps) {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScanning(false);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setSuccess(true);
      setTimeout(() => {
        onConfirm();
      }, 1000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-primary/20 shadow-2xl shadow-primary/10 rounded-lg max-w-md w-full p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-xl font-bold mb-2">Identity Verification Required</h2>
        <p className="text-muted-foreground text-sm mb-8">
          Unusual behavior detected. Please confirm your identity to proceed.
        </p>

        <div className="flex justify-center mb-8 relative">
          <button 
            onClick={handleScan}
            disabled={scanning || success}
            className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-500
              ${success ? 'border-green-500 bg-green-500/10 text-green-500' : 
                scanning ? 'border-primary bg-primary/10 text-primary animate-pulse' : 
                'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-muted'}`}
          >
            <Fingerprint className={`w-16 h-16 ${scanning ? 'animate-bounce' : ''}`} />
          </button>
          
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-1 bg-primary/50 shadow-[0_0_8px_2px_theme(colors.primary.DEFAULT)] animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          )}
        </div>

        <div className="text-sm font-mono font-medium h-6">
          {success ? (
            <span className="text-green-500">Identity verified</span>
          ) : scanning ? (
            <span className="text-primary animate-pulse">Scanning biometric signature...</span>
          ) : (
            <span className="text-muted-foreground">Tap to scan fingerprint</span>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-60px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(60px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
