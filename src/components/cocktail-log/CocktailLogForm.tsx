"use client";

import { useState, useEffect, ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cocktailLogService } from "@/services/cocktail-log-service";
import { cocktailService } from "@/services/cocktail-service";
import { CocktailLog } from "@/types/cocktail-log";
import { useToast } from "@/components/ui/use-toast";
import { translations } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Star, Calendar, Check, X, Search, ImagePlus } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, normalizeText, formatBilingualText } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomCocktailModal } from "./CustomCocktailModal";
import { useNavigate } from "react-router-dom";
import { LocationSelector } from "./LocationSelector";
import { AuthService } from "@/services/auth-service";
import { Loading } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mutate } from "swr";
import { CACHE_KEYS } from "@/lib/swr-config";

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
}

interface CocktailLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onLogSaved?: (log: CocktailLog) => void;
  existingLog?: CocktailLog | null;
  isFromCocktailPage?: boolean;
  onLogDeleted?: (logId: string) => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
  onSuccess: () => void;
}

export function CocktailLogForm({ 
  isOpen, 
  onClose,
  onLogSaved,
  existingLog,
  isFromCocktailPage = false,
  onLogDeleted,
  onLogsChange,
  onSuccess
}: CocktailLogFormProps) {
  const navigate = useNavigate();
  const [cocktailNameInput, setCocktailNameInput] = useState("");
  const [open, setOpen] = useState(false);
  const [filteredCocktails, setFilteredCocktails] = useState<SearchItem[]>([]);
  const [selectedCocktail, setSelectedCocktail] = useState<SearchItem | null>(null);
  const [comments, setComments] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCocktails, setIsLoadingCocktails] = useState(false);
  const [drinkDate, setDrinkDate] = useState<Date | undefined>(new Date());
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customCocktailValues, setCustomCocktailValues] = useState<CustomCocktailValues | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'private'>(
    (existingLog?.visibility === 'private' ? 'private' : 'public')
  );
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Reset all form states
  const resetForm = () => {
    setCocktailNameInput("");
    setOpen(false);
    setFilteredCocktails([]);
    setSelectedCocktail(null);
    setComments("");
    setLocation(null);
    setDrinkDate(new Date());
    setMedia([]);
    setCustomCocktailValues(null);
    setVisibility('public');
  };

  // Handle form close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (existingLog) {
      const displayName = formatBilingualText(existingLog.cocktail.name, language);
      setCocktailNameInput(displayName);
      setSelectedCocktail({ 
        value: existingLog.cocktail.id, 
        label: displayName, 
        name: displayName, 
        slug: existingLog.cocktail.slug 
      });
      setComments(existingLog.comments || "");
      if (existingLog.location) {
        try {
          const locationData = JSON.parse(existingLog.location);
          setLocation(locationData);
        } catch (error) {
          console.error("Error parsing location data:", error);
          setLocation(null);
        }
      } else {
        setLocation(null);
      }
      setDrinkDate(existingLog.drinkDate ? new Date(existingLog.drinkDate) : undefined);
      setMedia(existingLog.media || []);
      setVisibility(existingLog.visibility === 'private' ? 'private' : 'public');
    } else {
      resetForm();
    }
  }, [existingLog, language]);

  useEffect(() => {
    const loadCocktails = async () => {
      try {
        setIsLoadingCocktails(true);
        const cocktails = cocktailService.getAllCocktails();
        const filtered = cocktails
          .filter(cocktail => {
            const normalizedSearch = normalizeText(cocktailNameInput);
            const normalizedName = normalizeText(formatBilingualText(cocktail.name, language));
            return normalizedName.includes(normalizedSearch);
          })
          .map(cocktail => ({
            name: formatBilingualText(cocktail.name, language),
            value: cocktail.id,
            slug: cocktail.slug,
            label: formatBilingualText(cocktail.name, language)
          }));
        setFilteredCocktails(filtered);
      } catch (error) {
        console.error("Error loading cocktails:", error);
        toast({
          description: t.errorLoadingCocktail,
          variant: "destructive",
        });
      } finally {
        setIsLoadingCocktails(false);
      }
    };

    // Add a small delay to prevent too many API calls while typing
    const timeoutId = setTimeout(() => {
      loadCocktails();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [cocktailNameInput, language, t]);

  // Reset form when opened for a new log
  useEffect(() => {
    if (isOpen && !existingLog) {
      resetForm();
    }
  }, [isOpen, existingLog]);

  const handleSave = async () => {
    if (!selectedCocktail) return;

    try {
      setIsLoading(true);

      // Get user ID first
      const user = await AuthService.getCurrentSession();
      if (!user) {
        toast({
          description: t.notAuthenticated,
          variant: "destructive",
        });
        return;
      }

      // Use the existing cocktail ID, whether it's a custom cocktail or not
      const cocktailId = selectedCocktail.value;

      // If this is an existing log, handle media deletion
      if (existingLog) {
        // Find media items that were removed (items in existingLog.media but not in new media)
        const removedMedia = existingLog.media
          ?.filter((existing: { url: string; type: 'image' | 'video' }) => 
            !media.some(newItem => newItem.url === existing.url)
          ) || [];

        // Media deletion is now handled in the service layer
        if (removedMedia.length > 0) {
          console.log('Media items to be removed:', removedMedia);
        }
      }

      // Create or update the log
      try {
        let savedLog;
        if (existingLog) {
          savedLog = await cocktailLogService.updateLog(
            existingLog.id,
            cocktailId,
            comments || null,
            location,
            drinkDate || null,
            media.length > 0 ? media : null,
            visibility
          );
        } else {
          savedLog = await cocktailLogService.createLog(
            cocktailId,
            user.id,
            comments || null,
            location,
            drinkDate || null,
            media.length > 0 ? media : null,
            visibility
          );
        }

        toast({
          description: existingLog ? t.updateLog : t.saveLog,
          variant: "default",
        });

        // Invalidate relevant cache keys
        if (visibility === 'public') {
          // Invalidate public logs cache
          await mutate(CACHE_KEYS.PUBLIC_LOGS());
        }
        // Always invalidate own logs cache
        await mutate(CACHE_KEYS.OWN_LOGS());
        // Invalidate user stats
        await mutate(CACHE_KEYS.USER_STATS);

        onClose();
        onLogSaved?.(savedLog);
        await handleLogSaved();
        onSuccess();

        // Redirect to journal page after successful creation
        if (!existingLog) {
          navigate(`/${language}/feeds`);
        }
      } catch (error) {
        console.error("Error saving log:", error);
        toast({
          description: t.errorSavingLog,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        description: t.errorSavingLog,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingLog) return;
    
    try {
      setIsLoading(true);
      await cocktailLogService.deleteLog(existingLog.id);
      
      // Invalidate relevant cache keys
      if (existingLog.visibility === 'public') {
        // Invalidate public logs cache
        await mutate(CACHE_KEYS.PUBLIC_LOGS());
      }
      // Always invalidate own logs cache
      await mutate(CACHE_KEYS.OWN_LOGS());
      // Invalidate user stats
      await mutate(CACHE_KEYS.USER_STATS);

      toast({
        description: t.logDeleted,
        variant: "default",
      });
      onClose();
      onLogDeleted?.(existingLog.id);
      await handleLogDeleted();
    } catch (error) {
      console.error("Error deleting log:", error);
      toast({
        description: t.errorDeletingLog,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogSaved = async () => {
    try {
      if (!selectedCocktail?.value) return;
      const { logs } = await cocktailLogService.getLogsByCocktailId(selectedCocktail.value);
      onLogsChange?.(logs);
    } catch (error) {
      console.error("Error refreshing logs:", error);
      toast({
        description: t.errorRefreshingLogs,
        variant: "destructive",
      });
    }
  };

  const handleLogDeleted = async () => {
    try {
      if (!selectedCocktail?.value) return;
      const { logs } = await cocktailLogService.getLogsByCocktailId(selectedCocktail.value);
      onLogsChange?.(logs);
    } catch (error) {
      console.error("Error refreshing logs:", error);
      toast({
        description: t.errorRefreshingLogs,
        variant: "destructive",
      });
    }
  };

  const handleMediaUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Reset error message
    setMediaError(null);

    // Check if adding new media would exceed the limit
    if (media.length + files.length > 5) {
      setMediaError(t.maxMediaExceeded);
      return;
    }

    // Check each file's size
    const oversizedFiles = Array.from(files).filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setMediaError(t.maxFileSizeExceeded);
      return;
    }

    // Create media items for valid files
    const newMedia = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' as const : 'image' as const
    }));
    setMedia([...media, ...newMedia]);
  };

  const handleRemoveMedia = (index: number) => {
    const updatedMedia = media.filter((_, i) => i !== index);
    setMedia(updatedMedia);
  };

  const handleMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleCustomCocktailValues = (values: CustomCocktailValues) => {
    setCustomCocktailValues(values);
    // Update the cocktail name input with the custom cocktail names
    setCocktailNameInput(`${values.nameEn} / ${values.nameZh}`);
    // Set the selected cocktail with the ID from the created custom cocktail
    setSelectedCocktail({ 
      value: values.id,
      label: `${values.nameEn} / ${values.nameZh}`,
      name: `${values.nameEn} / ${values.nameZh}`,
      slug: values.id // Using ID as slug for custom cocktails
    });
    setIsCreatingCustom(false);
    setOpen(false); // Close the dropdown
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
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
                    {existingLog ? t.editLog : t.addLog}
                  </h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-4 space-y-4">
                  <div className="space-y-2">
                    <Label>{t.drinkDate} <span className="text-destructive">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !drinkDate && "text-muted-foreground border-destructive"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {drinkDate ? format(drinkDate, "PPP") : <span>{t.drinkDate}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={drinkDate}
                          onSelect={setDrinkDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {!drinkDate && (
                      <span className="text-xs text-destructive">{t.required}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-2 top-2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder={t.cocktailName}
                          value={cocktailNameInput}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setCocktailNameInput(e.target.value);
                            setOpen(true);
                          }}
                          onClick={() => setOpen(true)}
                          onFocus={() => setOpen(true)}
                          className={cn(
                            "pl-9 pr-9",
                            !cocktailNameInput && "border-destructive"
                          )}
                          disabled={isFromCocktailPage}
                        />
                        {cocktailNameInput && (
                          <button
                            onClick={() => {
                              setCocktailNameInput('');
                              setOpen(true);
                            }}
                            className="absolute right-2 top-2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      {!cocktailNameInput && (
                        <span className="text-xs text-destructive mt-1">{t.required}</span>
                      )}
                      {open && (
                        <div className="absolute z-50 w-full mt-1 bg-popover rounded-md shadow-md">
                          <ScrollArea className="h-[200px]">
                            <div className="p-2">
                              {isLoadingCocktails ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loading size="sm" />
                                </div>
                              ) : filteredCocktails.length > 0 ? (
                                <>
                                  {filteredCocktails.map((cocktail) => (
                                    <button
                                      key={cocktail.value}
                                      onClick={() => {
                                        setSelectedCocktail(cocktail);
                                        setCocktailNameInput(cocktail.name);
                                        setOpen(false);
                                      }}
                                      className={cn(
                                        "w-full text-left p-2 rounded-md hover:bg-accent transition-colors",
                                        "flex items-center gap-2",
                                        selectedCocktail?.value === cocktail.slug && "bg-accent"
                                      )}
                                    >
                                      <Check
                                        className={cn(
                                          "h-4 w-4",
                                          selectedCocktail?.value === cocktail.slug ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {cocktail.name}
                                    </button>
                                  ))}
                                  <div className="pt-2 border-t" />
                                </>
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
                      )}
                    </div>
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
                          // Limit to 500 characters
                          if (e.target.value.length <= 500) {
                            setComments(e.target.value);
                          }
                        }}
                        placeholder={t.notePlaceholder}
                        className="min-h-[200px] resize-none pr-20"
                      />
                      <div className="absolute bottom-2 right-2">
                        <span className="text-xs text-muted-foreground">
                          {comments.length}/500
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.media}</Label>
                    <div className="overflow-x-auto">
                      <div className="grid grid-flow-col auto-cols-[200px] gap-2">
                        {media.map((item, index) => (
                          <div key={index} className="relative aspect-square">
                            {item.type === 'image' ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={item.url}
                                  alt={`Media ${index + 1}`}
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
                              onClick={() => handleRemoveMedia(index)}
                              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        ))}
                        {media.length < 5 && (
                          <button
                            onClick={handleMediaClick}
                            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                          >
                            <ImagePlus className="h-6 w-6 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    {mediaError && (
                      <p className="text-sm text-destructive mt-2">{mediaError}</p>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t mt-auto">
                <div className="flex w-full gap-2 items-center">
                  <Select
                    value={visibility}
                    onValueChange={(value: 'public' | 'private') => setVisibility(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t.visibility} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{t.visibilityPublic}</SelectItem>
                      <SelectItem value="private">{t.visibilityPrivate}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading || !drinkDate || !cocktailNameInput}
                    className="flex-1"
                  >
                    {isLoading ? t.saving : (existingLog ? t.updateLog : t.saveLog)}
                  </Button>
                  {existingLog && (
                    <Button 
                      variant="ghost" 
                      onClick={handleDelete} 
                      disabled={isLoading}
                      className="w-auto"
                    >
                      {t.delete}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {isCreatingCustom && (
            <>
              <CustomCocktailModal
                isOpen={isCreatingCustom}
                onClose={() => setIsCreatingCustom(false)}
                onCustomCocktailValues={handleCustomCocktailValues}
                initialName={cocktailNameInput}
              />
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
} 