'use client';

import {
  useState,
  useEffect,
  ChangeEvent,
  useRef,
} from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { visitService } from '@/services/visit-service';
import { useToast } from '@/components/ui/use-toast';
import { translations } from '@/translations';
import { useLanguage } from '@/context/LanguageContext';
import {
  Calendar,
  Check,
  X,
  Search,
  Plus,
  ImagePlus,
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  cn,
  normalizeText,
  formatBilingualText,
} from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { LocationSelector } from '../cocktail-log/LocationSelector';
import { AuthService } from '@/services/auth-service';
import { Loading } from '@/components/ui/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCocktailDetails } from '@/hooks/useCocktailDetails';
import { cocktailLogService } from '@/services/cocktail-log-service';
import { CustomCocktailModal } from '../cocktail-log/CustomCocktailModal';

interface LocationData {
  name: string;
  place_id: string;
  lat: number;
  lng: number;
  main_text: string;
  secondary_text: string;
}

interface SearchItem {
  name: string;
  value: string;
  slug: string;
  label: string;
}

interface CustomCocktailValues {
  id: string;
  nameEn: string;
  nameZh?: string;
  ingredients: {
    id: string;
    type: 'base_spirit' | 'liqueur' | 'ingredient';
    nameEn: string;
    nameZh: string;
  }[];
}

interface VisitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CocktailEntry {
  id?: string;
  cocktailId: string;
  cocktailName: string;
  comments: string;
  media: { id?: string; url: string; type: 'image' | 'video' }[];
}

export function VisitForm({
  isOpen,
  onClose,
  onSuccess,
}: VisitFormProps) {
  const navigate = useNavigate();
  const [visitDate, setVisitDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<LocationData | null>(null);
  const [comments, setComments] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isLoading, setIsLoading] = useState(false);
  const [cocktailEntries, setCocktailEntries] = useState<CocktailEntry[]>([]);
  const [currentCocktailInput, setCurrentCocktailInput] = useState('');
  const [open, setOpen] = useState(false);
  const [filteredCocktails, setFilteredCocktails] = useState<SearchItem[]>([]);
  const [isLoadingCocktails, setIsLoadingCocktails] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const { cocktailDetails } = useCocktailDetails();

  // Reset form
  const resetForm = () => {
    setVisitDate(new Date());
    setLocation(null);
    setComments('');
    setVisibility('public');
    setCocktailEntries([]);
    setCurrentCocktailInput('');
    setMediaError(null);
    setIsCreatingCustom(false);
  };

  // Handle form close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Load cocktails for search
  useEffect(() => {
    const loadCocktails = async () => {
      try {
        setIsLoadingCocktails(true);

        const allCocktails = [
          ...(cocktailDetails?.map(cocktail => ({
            id: cocktail.id,
            slug: cocktail.slug,
            name: cocktail.name,
            categories: cocktail.categories,
            flavor_descriptors: cocktail.flavor_descriptors,
          })) || []),
        ];

        const filtered = allCocktails
          .filter(cocktail => {
            const normalizedSearch = normalizeText(currentCocktailInput);
            const normalizedName = normalizeText(
              formatBilingualText(cocktail.name, language),
            );
            return normalizedName.includes(normalizedSearch);
          })
          .map(cocktail => ({
            name: formatBilingualText(cocktail.name, language),
            value: cocktail.id,
            slug: cocktail.slug,
            label: formatBilingualText(cocktail.name, language),
          }));
        setFilteredCocktails(filtered);
      } catch (error) {
        console.error('Error loading cocktails:', error);
        toast({
          description: t.errorLoadingCocktail,
          variant: 'destructive',
        });
      } finally {
        setIsLoadingCocktails(false);
      }
    };

    const timeoutId = setTimeout(() => {
      loadCocktails();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentCocktailInput, language, t, cocktailDetails]);

  const handleAddCocktail = (cocktail: SearchItem) => {
    setCocktailEntries([
      ...cocktailEntries,
      {
        cocktailId: cocktail.value,
        cocktailName: cocktail.name,
        comments: '',
        media: [],
      },
    ]);
    setCurrentCocktailInput('');
    setOpen(false);
  };

  const handleRemoveCocktail = (index: number) => {
    setCocktailEntries(cocktailEntries.filter((_, i) => i !== index));
  };

  const handleCocktailCommentsChange = (
    index: number,
    comments: string,
  ) => {
    const updatedEntries = [...cocktailEntries];
    updatedEntries[index].comments = comments;
    setCocktailEntries(updatedEntries);
  };

  const handleMediaUpload = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Reset error message
    setMediaError(null);

    // Check if adding new media would exceed the limit
    if (cocktailEntries[index].media.length + files.length > 5) {
      setMediaError(t.maxMediaExceeded);
      return;
    }

    // Check each file's size
    const oversizedFiles = Array.from(files).filter(
      file => file.size > MAX_FILE_SIZE,
    );
    if (oversizedFiles.length > 0) {
      setMediaError(t.maxFileSizeExceeded);
      return;
    }

    // Create media items for valid files
    const newMedia = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/')
        ? ('video' as const)
        : ('image' as const),
      id: undefined, // New files won't have an ID until saved
    }));

    const updatedEntries = [...cocktailEntries];
    updatedEntries[index].media = [...updatedEntries[index].media, ...newMedia];
    setCocktailEntries(updatedEntries);
  };

  const handleRemoveMedia = (cocktailIndex: number, mediaIndex: number) => {
    const updatedEntries = [...cocktailEntries];
    updatedEntries[cocktailIndex].media = updatedEntries[cocktailIndex].media.filter(
      (_, i) => i !== mediaIndex,
    );
    setCocktailEntries(updatedEntries);
  };

  const handleMediaClick = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const handleCustomCocktailValues = (values: CustomCocktailValues) => {
    setCocktailEntries([
      ...cocktailEntries,
      {
        cocktailId: values.id,
        cocktailName: `${values.nameEn} / ${values.nameZh}`,
        comments: '',
        media: [],
      },
    ]);
    setCurrentCocktailInput('');
    setOpen(false);
    setIsCreatingCustom(false);
  };

  const handleSave = async () => {
    if (cocktailEntries.length === 0) {
      toast({
        description: t.noLogs,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get user ID first
      const user = await AuthService.getCurrentSession();
      if (!user) {
        toast({
          description: t.notAuthenticated,
          variant: 'destructive',
        });
        return;
      }

      // Create visit first
      const visit = await visitService.createVisit(
        user.id,
        visitDate,
        location,
        comments,
        visibility,
      );


      // Create cocktail logs with visit reference
      await Promise.all(
        cocktailEntries.map(entry =>
          cocktailLogService.createLog(
            entry.cocktailId,
            user.id,
            entry.comments,
            location,
            visitDate,
            entry.media, // Pass media array
            visibility,
            visit.id, // Add visit reference
          ),
        ),
      );

      toast({
        description: t.logSaved,
        variant: 'default',
      });

      onClose();
      onSuccess();

      // Always redirect to /feeds/me
      navigate(`/${language}/feeds/me`);
    } catch (error) {
      toast({
        description: t.errorSavingLog,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className="fixed inset-0 z-50 bg-background"
          >
            {isLoading && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-xs">
                <Loading size="lg" />
              </div>
            )}
            <div className="h-full flex flex-col">
              <div className="px-4 py-3 border-b">
                <div className="flex items-center relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0"
                    onClick={handleClose}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <h2 className="flex-1 text-center text-lg font-semibold">
                    {t.addLog}
                  </h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-4 space-y-4">
                  <div className="space-y-2">
                    <Label>
                      {t.drinkDate}{' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !visitDate &&
                              'text-muted-foreground border-destructive',
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {visitDate ? (
                            format(visitDate, 'PPP')
                          ) : (
                            <span>{t.drinkDate}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="start"
                      >
                        <CalendarComponent
                          mode="single"
                          selected={visitDate}
                          onSelect={(date) => date && setVisitDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <LocationSelector
                    value={location}
                    onChange={setLocation}
                  />

                  <div className="space-y-2">
                    <div className="relative">
                      <Textarea
                        value={comments}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                          if (e.target.value.length <= 500) {
                            setComments(e.target.value);
                          }
                        }}
                        placeholder={t.notePlaceholder}
                        className="min-h-[100px] resize-none pr-20"
                      />
                      <div className="absolute bottom-2 right-2">
                        <span className="text-xs text-muted-foreground">
                          {comments.length}/500
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{t.cocktail}</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOpen(true);
                          setCurrentCocktailInput('');
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t.addCocktail}
                      </Button>
                    </div>

                    {cocktailEntries.map((entry, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">
                            {entry.cocktailName}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCocktail(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={entry.comments}
                          onChange={(e) =>
                            handleCocktailCommentsChange(
                              index,
                              e.target.value,
                            )
                          }
                          placeholder={t.notePlaceholder}
                          className="min-h-[80px] resize-none"
                        />
                        
                        <div className="space-y-2">
                          <Label>{t.media}</Label>
                          <div className="overflow-x-auto">
                            <div className="grid grid-flow-col auto-cols-[200px] gap-2">
                              {entry.media.map((item, mediaIndex) => (
                                <div
                                  key={mediaIndex}
                                  className="relative aspect-square"
                                >
                                  {item.type === 'image' ? (
                                    <div className="relative w-full h-full">
                                      <img
                                        src={item.url}
                                        alt={`Media ${mediaIndex + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </div>
                                  ) : (
                                    <video
                                      src={item.url}
                                      className="w-full h-full object-cover rounded-lg"
                                      controls
                                    />
                                  )}
                                  <button
                                    onClick={() =>
                                      handleRemoveMedia(index, mediaIndex)
                                    }
                                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                  >
                                    <X className="h-4 w-4 text-white" />
                                  </button>
                                </div>
                              ))}
                              {entry.media.length < 5 && (
                                <button
                                  onClick={() => handleMediaClick(index)}
                                  className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                                >
                                  <ImagePlus className="h-6 w-6 text-gray-400" />
                                </button>
                              )}
                            </div>
                          </div>
                          <input
                            ref={(el) => {
                              fileInputRefs.current[index] = el;
                            }}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => handleMediaUpload(index, e)}
                            className="hidden"
                          />
                        </div>
                      </div>
                    ))}

                    {open && (
                      <div className="fixed inset-0 z-[70] flex items-start justify-center pt-20">
                        <div className="w-full max-w-md bg-popover rounded-md shadow-md">
                          <ScrollArea className="h-[200px]">
                            <div className="p-2">
                              <div className="relative">
                                <Search className="absolute left-2 top-2 h-5 w-5 text-muted-foreground" />
                                <Input
                                  placeholder={t.searchCocktail}
                                  value={currentCocktailInput}
                                  onChange={(e) => {
                                    setCurrentCocktailInput(e.target.value);
                                    setOpen(true);
                                  }}
                                  className="pl-9"
                                />
                              </div>
                              {isLoadingCocktails ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loading size="sm" />
                                </div>
                              ) : filteredCocktails.length > 0 ? (
                                <div className="mt-2">
                                  {filteredCocktails.map((cocktail) => (
                                    <button
                                      key={cocktail.value}
                                      onClick={() => handleAddCocktail(cocktail)}
                                      className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
                                    >
                                      {cocktail.name}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center text-sm text-muted-foreground py-4">
                                  {t.noCocktailsFound}
                                </div>
                              )}
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setIsCreatingCustom(true)}
                              >
                                {t.createCustomCocktail}
                              </Button>
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t mt-auto">
                <div className="flex w-full gap-2 items-center">
                  <Select
                    value={visibility}
                    onValueChange={(value: 'public' | 'private') =>
                      setVisibility(value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t.visibility} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        {t.visibilityPublic}
                      </SelectItem>
                      <SelectItem value="private">
                        {t.visibilityPrivate}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || !visitDate}
                    className="flex-1"
                  >
                    {isLoading ? t.saving : t.saveLog}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {isCreatingCustom && (
            <CustomCocktailModal
              isOpen={isCreatingCustom}
              onClose={() => setIsCreatingCustom(false)}
              onCustomCocktailValues={handleCustomCocktailValues}
              initialName={currentCocktailInput}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
} 