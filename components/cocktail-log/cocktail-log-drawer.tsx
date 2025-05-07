"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
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
import { Star, Calendar, Check, ChevronsUpDown, X, Search } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn, normalizeText } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface CocktailLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cocktailSlug: string;
  cocktailName: string;
  onLogSaved?: (log: CocktailLog) => void;
  existingLog?: CocktailLog | null;
  isFromCocktailPage?: boolean;
  onLogDeleted?: (logId: string) => void;
  onLogsChange: (logs: CocktailLog[]) => void;
}

export function CocktailLogDrawer({ 
  isOpen, 
  onClose, 
  cocktailSlug, 
  cocktailName,
  onLogSaved,
  existingLog,
  isFromCocktailPage = false,
  onLogDeleted,
  onLogsChange
}: CocktailLogDrawerProps) {
  const [rating, setRating] = useState(0);
  const [cocktailNameInput, setCocktailNameInput] = useState("");
  const [open, setOpen] = useState(false);
  const [filteredCocktails, setFilteredCocktails] = useState<{ value: string; label: string }[]>([]);
  const [selectedCocktail, setSelectedCocktail] = useState<{ value: string; label: string } | null>(null);
  const [specialIngredients, setSpecialIngredients] = useState("");
  const [comments, setComments] = useState("");
  const [location, setLocation] = useState("");
  const [bartender, setBartender] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [drinkDate, setDrinkDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    if (existingLog) {
      setRating(existingLog.rating);
      setCocktailNameInput(cocktailName);
      setSelectedCocktail({ value: cocktailSlug, label: cocktailName });
      setSpecialIngredients(existingLog.specialIngredients || "");
      setComments(existingLog.comments || "");
      setLocation(existingLog.location || "");
      setBartender(existingLog.bartender || "");
      setTags(existingLog.tags);
      setDrinkDate(existingLog.drinkDate ? new Date(existingLog.drinkDate) : undefined);
    } else {
      setRating(0);
      setCocktailNameInput(cocktailName);
      setSelectedCocktail({ value: cocktailSlug, label: cocktailName });
      setSpecialIngredients("");
      setComments("");
      setLocation("");
      setBartender("");
      setTags([]);
      setDrinkDate(undefined);
    }
  }, [existingLog, cocktailName, cocktailSlug]);

  useEffect(() => {
    const cocktails = cocktailService.getAllCocktails() || [];
    const filtered = cocktails
      .filter(cocktail => {
        const normalizedSearch = normalizeText(cocktailNameInput);
        const normalizedName = normalizeText(`${cocktail.name.en} / ${cocktail.name.zh}`);
        return normalizedName.includes(normalizedSearch);
      })
      .map(cocktail => ({
        value: cocktail.id,
        label: `${cocktail.name.en} / ${cocktail.name.zh}`
      }));
    setFilteredCocktails(filtered);
  }, [cocktailNameInput]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      let savedLog: CocktailLog;
      
      if (existingLog) {
        savedLog = await cocktailLogService.updateLog(
          existingLog.id,
          rating,
          specialIngredients || null,
          comments || null,
          location || null,
          bartender || null,
          tags,
          drinkDate || null
        );
      } else {
        // Get the current user's ID from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        savedLog = await cocktailLogService.createLog(
          cocktailSlug,
          user.id,
          rating,
          specialIngredients || null,
          comments || null,
          location || null,
          bartender || null,
          tags,
          drinkDate || null
        );
      }

      toast({
        title: t.success,
        description: existingLog ? t.updateLog : t.saveLog,
      });
      onClose();
      onLogSaved?.(savedLog);
      await handleLogSaved();
    } catch (error) {
      console.error("Error saving log:", error);
      toast({
        title: t.error,
        description: t.errorSavingLog,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      const updatedLogs = await cocktailLogService.getLogsByCocktailSlug(cocktailSlug);
      onLogsChange(updatedLogs);
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
      const updatedLogs = await cocktailLogService.getLogsByCocktailSlug(cocktailSlug);
      onLogsChange(updatedLogs);
    } catch (error) {
      console.error("Error refreshing logs:", error);
      toast({
        title: t.error,
        description: t.errorRefreshingLogs,
        variant: "destructive",
      });
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[100vh]">
        <DrawerHeader>
          <div className="flex items-center relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            <DrawerTitle className="flex-1 text-center">{existingLog ? t.editLog : t.addLog}</DrawerTitle>
          </div>
        </DrawerHeader>
        <div className="flex flex-col h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>{t.drinkDate}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !drinkDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {drinkDate ? format(drinkDate, "PPP") : <span>Pick a date</span>}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="cocktailName">{t.cocktailName}</Label>
              <div className="relative">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={isFromCocktailPage}
                  onClick={() => setOpen(!open)}
                >
                  {selectedCocktail ? selectedCocktail.label : t.selectCocktail}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                {open && (
                  <div className="absolute z-50 w-full mt-1 bg-popover rounded-md shadow-md">
                    <Command>
                      <div className="relative">
                        <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                        <CommandInput 
                          placeholder={t.searchCocktail} 
                          value={cocktailNameInput}
                          onValueChange={setCocktailNameInput}
                          className="pl-8"
                        />
                        {cocktailNameInput && (
                          <button
                            onClick={() => setCocktailNameInput('')}
                            className="absolute right-2 top-2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <CommandEmpty>{t.noCocktailsFound}</CommandEmpty>
                      <CommandGroup>
                        {filteredCocktails.map((cocktail) => (
                          <CommandItem
                            key={cocktail.value}
                            value={cocktail.value}
                            onSelect={() => {
                              setSelectedCocktail(cocktail);
                              setCocktailNameInput(cocktail.label);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCocktail?.value === cocktail.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cocktail.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.rating}</Label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
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
              <Label htmlFor="location">{t.location}</Label>
              <Input
                id="location"
                value={location}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                placeholder={t.location}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bartender">{t.bartender}</Label>
              <Input
                id="bartender"
                value={bartender}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setBartender(e.target.value)}
                placeholder={t.bartender}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialIngredients">{t.specialIngredients}</Label>
              <Input
                id="specialIngredients"
                value={specialIngredients}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSpecialIngredients(e.target.value)}
                placeholder={t.specialIngredients}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">{t.notePlaceholder}</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)}
                placeholder={t.notePlaceholder}
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label>{t.tags}</Label>
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
        <DrawerFooter className="mt-auto">
          <div className="flex w-full gap-2">
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
} 