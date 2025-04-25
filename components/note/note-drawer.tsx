"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notesService } from "@/services/notes-service";
import { Note, GooglePlace } from "@/types/note";
import { useToast } from "@/components/ui/use-toast";
import { translations } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Timestamp } from "firebase/firestore";
import { Star, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import LocationInput from '@/components/note/location-input';

interface NoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cocktailSlug: string;
  cocktailName: string;
  onNoteSaved?: (note: Note) => void;
  existingNote?: Note | null;
  isFromCocktailPage?: boolean;
  onNoteDeleted?: (noteId: string) => void;
}

export function NoteDrawer({ 
  isOpen, 
  onClose, 
  cocktailSlug, 
  cocktailName,
  onNoteSaved,
  existingNote,
  isFromCocktailPage = false,
  onNoteDeleted
}: NoteDrawerProps) {
  const [rating, setRating] = useState(0);
  const [cocktailNameInput, setCocktailNameInput] = useState("");
  const [specialIngredients, setSpecialIngredients] = useState("");
  const [comments, setComments] = useState("");
  const [location, setLocation] = useState("");
  const [bartender, setBartender] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [drinkDate, setDrinkDate] = useState<Date | undefined>(undefined);
  const [googlePlace, setGooglePlace] = useState<GooglePlace | undefined>(undefined);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    if (existingNote) {
      setRating(existingNote.rating);
      setCocktailNameInput(existingNote.cocktailName);
      setSpecialIngredients(existingNote.specialIngredients);
      setComments(existingNote.comments);
      setLocation(existingNote.location);
      setBartender(existingNote.bartender);
      setTags(existingNote.tags);
      setDrinkDate(existingNote.drinkDate?.toDate());
      setGooglePlace(existingNote.googlePlace);
    } else {
      setRating(0);
      setCocktailNameInput(cocktailName);
      setSpecialIngredients("");
      setComments("");
      setLocation("");
      setBartender("");
      setTags([]);
      setDrinkDate(undefined);
      setGooglePlace(undefined);
    }
  }, [existingNote, cocktailName]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      let savedNote: Note;
      
      if (existingNote) {
        await notesService.updateNote(
          existingNote.id,
          rating,
          specialIngredients,
          comments,
          location,
          bartender,
          tags,
          drinkDate ? Timestamp.fromDate(drinkDate) : undefined,
          googlePlace
        );
        savedNote = {
          ...existingNote,
          rating,
          specialIngredients,
          comments,
          location,
          bartender,
          tags,
          drinkDate: drinkDate ? Timestamp.fromDate(drinkDate) : undefined,
          googlePlace,
          lastModified: new Timestamp(Math.floor(Date.now() / 1000), 0)
        };
      } else {
        savedNote = await notesService.createNote(
          cocktailSlug,
          cocktailNameInput,
          rating,
          specialIngredients,
          comments,
          location,
          bartender,
          tags,
          drinkDate ? Timestamp.fromDate(drinkDate) : undefined,
          googlePlace
        );
      }

      toast({
        title: t.success,
        description: existingNote ? t.noteUpdated : t.noteSaved,
      });
      onClose();
      onNoteSaved?.(savedNote);
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: t.error,
        description: t.errorSavingNote,
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
    if (!existingNote) return;
    
    try {
      setIsLoading(true);
      await notesService.deleteNote(existingNote.id);
      toast({
        title: t.success,
        description: t.noteDeleted,
      });
      onClose();
      onNoteDeleted?.(existingNote.id);
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: t.error,
        description: t.errorDeletingNote,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[100vh]">
        <DrawerHeader>
          <DrawerTitle>{existingNote ? t.editNote : t.addNote}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="p-4 space-y-4">
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
              <Label htmlFor="cocktailName">{t.cocktailName}</Label>
              <Input
                id="cocktailName"
                value={cocktailNameInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCocktailNameInput(e.target.value)}
                placeholder={t.cocktailName}
                className="w-full"
                disabled={isFromCocktailPage}
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
              <Label>{t.location}</Label>
              <LocationInput
                value={googlePlace?.name || location}
                googlePlace={googlePlace}
                onChange={(location, googlePlace) => {
                  setLocation(googlePlace?.name || location);
                  setGooglePlace(googlePlace);
                }}
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
              {isLoading ? t.saving : (existingNote ? t.updateNote : t.saveNote)}
            </Button>
            {existingNote && (
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