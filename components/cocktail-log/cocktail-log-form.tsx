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
import { cn, normalizeText, formatCocktailName } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { customCocktailService } from "@/services/custom-cocktail-service";
import { CustomCocktailModal } from "./custom-cocktail-modal";
import { useRouter } from "next/navigation";
import { LocationSelector } from "./location-selector";
import { AuthService } from "@/services/auth-service";
import { Loading } from "@/components/ui/loading";
import { cocktailLogsMediaService } from "@/services/media-service";

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
  nameEn: string;
  nameZh: string;
}

interface CocktailLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  cocktailSlug: string;
  cocktailName: string;
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
  cocktailSlug, 
  cocktailName,
  onLogSaved,
  existingLog,
  isFromCocktailPage = false,
  onLogDeleted,
  onLogsChange,
  onSuccess
}: CocktailLogFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [cocktailNameInput, setCocktailNameInput] = useState("");
  const [open, setOpen] = useState(false);
  const [filteredCocktails, setFilteredCocktails] = useState<SearchItem[]>([]);
  const [selectedCocktail, setSelectedCocktail] = useState<SearchItem | null>(null);
  const [specialIngredients, setSpecialIngredients] = useState("");
  const [comments, setComments] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [bartender, setBartender] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [drinkDate, setDrinkDate] = useState<Date | undefined>(new Date());
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customCocktailValues, setCustomCocktailValues] = useState<CustomCocktailValues | null>(null);

  // Reset all form states
  const resetForm = () => {
    setRating(0);
    setCocktailNameInput("");
    setOpen(false);
    setFilteredCocktails([]);
    setSelectedCocktail(null);
    setSpecialIngredients("");
    setComments("");
    setLocation(null);
    setBartender("");
    setTags([]);
    setNewTag("");
    setDrinkDate(new Date());
    setMedia([]);
    setCustomCocktailValues(null);
  };

  // Handle form close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (existingLog) {
      setRating(existingLog.rating || 0);
      const cocktail = cocktailService.getCocktailById(existingLog.cocktailId);
      const displayName = cocktail ? formatCocktailName(cocktail.name, language) : cocktailName;
      setCocktailNameInput(displayName);
      setSelectedCocktail({ 
        value: existingLog.cocktailId, 
        label: displayName, 
        name: displayName, 
        slug: cocktail?.slug || cocktailSlug 
      });
      setSpecialIngredients(existingLog.specialIngredients || "");
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
      setBartender(existingLog.bartender || "");
      setTags(existingLog.tags || []);
      setDrinkDate(existingLog.drinkDate ? new Date(existingLog.drinkDate) : undefined);
      setMedia(existingLog.media || []);
    } else {
      resetForm();
    }
  }, [existingLog, cocktailName, cocktailSlug, language]);

  useEffect(() => {
    const cocktails = cocktailService.getAllCocktails() || [];
    const filtered = cocktails
      .filter(cocktail => {
        const normalizedSearch = normalizeText(cocktailNameInput);
        const normalizedName = normalizeText(formatCocktailName(cocktail.name, language));
        return normalizedName.includes(normalizedSearch);
      })
      .map(cocktail => ({
        name: formatCocktailName(cocktail.name, language),
        value: cocktail.id,
        slug: cocktail.slug,
        label: formatCocktailName(cocktail.name, language)
      }));
    setFilteredCocktails(filtered);
  }, [cocktailNameInput, language]);

  const handleSave = async () => {
    if (!selectedCocktail) return;

    try {
      setIsLoading(true);

      // Get user ID first
      const user = await AuthService.getCurrentSession();
      if (!user) throw new Error("User not authenticated");

      let cocktailId = selectedCocktail.value;

      // Check if we need to create a custom cocktail
      if (customCocktailValues) {
        try {
          const cocktail = await customCocktailService.createCustomCocktail(
            {
              en: customCocktailValues.nameEn,
              zh: customCocktailValues.nameZh
            },
            user.id
          );
          cocktailId = cocktail.id;
        } catch (error) {
          console.error("Error creating custom cocktail:", error);
          toast({
            title: t.error,
            description: t.errorCreatingCocktail,
            variant: "destructive",
          });
          return;
        }
      }

      // If this is an existing log, handle media deletion
      if (existingLog) {
        // Find media items that were removed (items in existingLog.media but not in new media)
        const removedMedia = existingLog.media
          ?.filter((existing: { url: string; type: 'image' | 'video' }) => 
            !media.some(newItem => newItem.url === existing.url)
          ) || [];

        // Soft delete removed media files
        if (removedMedia.length > 0) {
          await cocktailLogsMediaService.softDeleteMultipleMedia(
            removedMedia.map(item => item.url)
          );
        }
      }

      // Create or update the log
      try {
        if (existingLog) {
          await cocktailLogService.updateLog(
            existingLog.id,
            cocktailId,
            rating || null,
            specialIngredients || null,
            comments || null,
            location,
            bartender || null,
            tags.length > 0 ? tags : null,
            drinkDate || null,
            media.length > 0 ? media : null
          );
        } else {
          await cocktailLogService.createLog(
            cocktailId,
            user.id,
            rating || null,
            specialIngredients || null,
            comments || null,
            location,
            bartender || null,
            tags.length > 0 ? tags : null,
            drinkDate || null,
            media.length > 0 ? media : null
          );
        }

        toast({
          title: t.success,
          description: existingLog ? t.updateLog : t.saveLog,
        });

        onClose();
        onLogSaved?.({
          id: existingLog?.id || '',
          cocktailId,
          rating: rating || null,
          specialIngredients: specialIngredients || null,
          comments: comments || null,
          location: location ? JSON.stringify(location) : null,
          bartender: bartender || null,
          tags: tags.length > 0 ? tags : null,
          drinkDate: drinkDate || null,
          media: media.length > 0 ? media : null,
        } as CocktailLog);
        
        await handleLogSaved();
        onSuccess();

        // Redirect to journal page after successful creation
        if (!existingLog) {
          router.push(`/${language}/journal/feeds`);
        }
      } catch (error) {
        console.error("Error saving log:", error);
        toast({
          title: t.error,
          description: t.errorSavingLog,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: t.error,
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
      toast({
        title: t.success,
        description: t.logDeleted,
      });
      onClose();
      onLogDeleted?.(existingLog.id);
      await handleLogDeleted();
    } catch (error) {
      console.error("Error deleting log:", error);
      toast({
        title: t.error,
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
      const updatedLogs = await cocktailLogService.getLogsByCocktailId(selectedCocktail.value);
      onLogsChange?.(updatedLogs);
    } catch (error) {
      console.error("Error refreshing logs:", error);
      toast({
        title: t.error,
        description: t.errorRefreshingLogs,
        variant: "destructive",
      });
    }
  };

  const handleLogDeleted = async () => {
    try {
      if (!selectedCocktail?.value) return;
      const updatedLogs = await cocktailLogService.getLogsByCocktailId(selectedCocktail.value);
      onLogsChange?.(updatedLogs);
    } catch (error) {
      console.error("Error refreshing logs:", error);
      toast({
        title: t.error,
        description: t.errorRefreshingLogs,
        variant: "destructive",
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleMediaUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Check if adding new media would exceed the limit
    if (media.length + files.length > 5) {
      toast({
        title: t.error,
        description: t.maxMediaExceeded,
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement actual media upload logic
    // For now, we'll just create placeholder URLs
    console.log('Media upload status:', isUploading, setIsUploading); // Temporary fix for unused variable
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
                            {filteredCocktails.length === 0 ? (
                              <div className="p-4 space-y-2">
                                <div className="text-center text-muted-foreground">
                                  {t.noCocktailsFound}
                                </div>
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => setIsCreatingCustom(true)}
                                >
                                  {t.createCustomCocktail}
                                </Button>
                              </div>
                            ) : (
                              <div className="p-2">
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
                              </div>
                            )}
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
                    <div className="max-h-[200px] overflow-x-auto">
                      <div className="grid grid-flow-col auto-cols-[200px] gap-2">
                        {media.map((item, index) => (
                          <div key={index} className="relative aspect-square">
                            {item.type === 'image' ? (
                              <div className="relative w-full h-full">
                                <Image
                                  src={item.url}
                                  alt={`Media ${index + 1}`}
                                  fill
                                  className="object-cover rounded-lg"
                                  sizes="200px"
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.rating}</Label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-hidden"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      value={bartender}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setBartender(e.target.value)}
                      placeholder={t.bartender}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      value={specialIngredients}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setSpecialIngredients(e.target.value)}
                      placeholder={t.specialIngredients}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={newTag}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                        placeholder={t.addTag}
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button onClick={handleAddTag}>{t.add}</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Button
                          key={tag}
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRemoveTag(tag)}
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <span className="text-gray-500 hover:text-gray-700">×</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t mt-auto">
                <div className="flex w-full gap-2">
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
              />
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
} 