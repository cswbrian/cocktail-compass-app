import { CocktailLogDetail } from "@/components/cocktail-log/CocktailLogDetail";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cocktailLogService } from "@/services/cocktail-log-service";
import { Button } from "@/components/ui/button";
import { CocktailLog } from "@/types/cocktail-log";
import { useLanguage } from "@/context/LanguageContext";

export default function LogDetailPage() {
  const [log, setLog] = useState<CocktailLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    const fetchLog = async () => {
      if (!logId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const fetchedLog = await cocktailLogService.getLogById(logId);
        if (fetchedLog) {
          setLog(fetchedLog);
        } else {
          setError('Log not found');
        }
      } catch (err) {
        setError('Failed to load log');
        console.error('Error fetching log:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLog();
  }, [logId]);

  const handleClose = () => {
    navigate(`/${language}/feeds`);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleClose}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!log) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50"
    >
      <CocktailLogDetail
        log={log}
        onLogSaved={(updatedLog) => setLog(updatedLog)}
        onLogDeleted={handleClose}
        onClose={handleClose}
        variant={log.visibility === 'public' ? 'public' : 'private'}
      />
    </motion.div>
  );
} 