import { VisitDetail } from '@/components/visit/VisitDetail';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { visitService } from '@/services/visit-service';
import { Button } from '@/components/ui/button';
import { Visit } from '@/types/visit';
import { useLanguage } from '@/context/LanguageContext';

export default function VisitDetailPage() {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    const fetchVisit = async () => {
      if (!visitId) return;

      try {
        setIsLoading(true);
        setError(null);
        const fetchedVisit = await visitService.getVisitById(visitId);
        if (fetchedVisit) {
          setVisit(fetchedVisit);
        } else {
          setError('Visit not found');
        }
      } catch (err) {
        setError('Failed to load visit');
        console.error('Error fetching visit:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisit();
  }, [visitId]);

  const handleClose = () => {
    navigate(`/${language}/feeds`);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading...
          </p>
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

  if (!visit) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50"
    >
      <VisitDetail
        visit={visit}
        onVisitSaved={(updatedVisit: Visit) => setVisit(updatedVisit)}
        onVisitDeleted={handleClose}
        onClose={handleClose}
      />
    </motion.div>
  );
} 