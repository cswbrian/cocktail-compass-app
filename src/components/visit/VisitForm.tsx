'use client';

import {
  useState,
  useEffect,
  ChangeEvent,
  useRef,
} from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Visit } from '@/types/visit';

// Form schema
const mediaSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
  type: z.enum(['image', 'video']),
});

const cocktailEntrySchema = z.object({
  id: z.string().optional(),
  cocktailId: z.string(),
  cocktailName: z.string(),
  comments: z.string(),
  media: z.array(mediaSchema),
  isSearchOpen: z.boolean().optional(),
});

const visitFormSchema = z.object({
  visitDate: z.date(),
  location: z
    .object({
      name: z.string(),
      place_id: z.string(),
      lat: z.number(),
      lng: z.number(),
      main_text: z.string(),
      secondary_text: z.string(),
    })
    .nullable(),
  comments: z.string().max(500),
  visibility: z.enum(['public', 'private']),
  cocktailEntries: z
    .array(cocktailEntrySchema)
    .min(1, 'At least one cocktail is required'),
});

type VisitFormData = z.infer<typeof visitFormSchema>;

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
  existingVisit?: Visit | null;
}

export function VisitForm({
  isOpen,
  onClose,
  onSuccess,
  existingVisit,
}: VisitFormProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const t =
    translations[language as keyof typeof translations];
  const { cocktailDetails } = useCocktailDetails();
  const [isLoading, setIsLoading] = useState(false);
  const [currentCocktailInput, setCurrentCocktailInput] =
    useState('');
  const [entrySearchStates, setEntrySearchStates] =
    useState<{ [key: number]: boolean }>({});
  const [filteredCocktails, setFilteredCocktails] =
    useState<SearchItem[]>([]);
  const [isLoadingCocktails, setIsLoadingCocktails] =
    useState(false);
  const [mediaError, setMediaError] = useState<
    string | null
  >(null);
  const [isCreatingCustom, setIsCreatingCustom] =
    useState(false);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const fileInputRefs = useRef<{
    [key: number]: HTMLInputElement | null;
  }>({});

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      visitDate: existingVisit?.visitDate
        ? new Date(existingVisit.visitDate)
        : new Date(),
      location: existingVisit?.location
        ? {
            name: existingVisit.location.name,
            place_id: existingVisit.location.place_id,
            lat: 0,
            lng: 0,
            main_text: existingVisit.location.name,
            secondary_text: '',
          }
        : null,
      comments: existingVisit?.comments || '',
      visibility:
        existingVisit?.visibility === 'private'
          ? 'private'
          : 'public',
      cocktailEntries:
        existingVisit?.logs.map(log => ({
          id: log.id,
          cocktailId: log.cocktail.id,
          cocktailName: formatBilingualText(
            log.cocktail.name,
            language,
          ),
          comments: log.comments || '',
          media: (log.media || []).map(m => ({
            id: m.id,
            url: m.url,
            type: m.type as 'image' | 'video',
          })),
        })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'cocktailEntries',
  });

  // Reset form
  const resetForm = () => {
    form.reset({
      visitDate: new Date(),
      location: null,
      comments: '',
      visibility: 'public',
      cocktailEntries: [],
    });
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
            const normalizedSearch = normalizeText(
              currentCocktailInput,
            );
            const normalizedName = normalizeText(
              formatBilingualText(cocktail.name, language),
            );
            return normalizedName.includes(
              normalizedSearch,
            );
          })
          .map(cocktail => ({
            name: formatBilingualText(
              cocktail.name,
              language,
            ),
            value: cocktail.id,
            slug: cocktail.slug,
            label: formatBilingualText(
              cocktail.name,
              language,
            ),
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

  const handleAddEmptyCocktail = () => {
    append({
      cocktailId: '',
      cocktailName: '',
      comments: '',
      media: [],
      isSearchOpen: true,
    });
  };

  const handleSelectCocktail = (
    index: number,
    cocktail: SearchItem,
  ) => {
    const currentEntries = form.getValues(
      'cocktailEntries',
    );
    currentEntries[index] = {
      ...currentEntries[index],
      cocktailId: cocktail.value,
      cocktailName: cocktail.name,
      isSearchOpen: false,
    };
    form.setValue('cocktailEntries', currentEntries);
    setEntrySearchStates(prev => ({
      ...prev,
      [index]: false,
    }));
    setCurrentCocktailInput('');
  };

  const handleAddCocktail = (
    index: number,
    cocktail: SearchItem,
  ) => {
    handleSelectCocktail(index, cocktail);
  };

  const handleMediaUpload = (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files) return;

    // Reset error message
    setMediaError(null);

    // Check if adding new media would exceed the limit
    const currentMedia = form.getValues(`cocktailEntries.${index}.media`);
    if (currentMedia.length + files.length > 5) {
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
    }));

    // Use useFieldArray to append new media items
    const mediaArray = form.getValues(`cocktailEntries.${index}.media`);
    form.setValue(`cocktailEntries.${index}.media`, [...mediaArray, ...newMedia], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleRemoveMedia = (
    cocktailIndex: number,
    mediaIndex: number,
  ) => {
    const mediaArray = form.getValues(`cocktailEntries.${cocktailIndex}.media`);
    form.setValue(
      `cocktailEntries.${cocktailIndex}.media`,
      mediaArray.filter((_, i) => i !== mediaIndex),
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );
  };

  const handleMediaClick = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const handleCustomCocktailValues = (
    values: CustomCocktailValues,
  ) => {
    append({
      cocktailId: values.id,
      cocktailName: `${values.nameEn} / ${values.nameZh}`,
      comments: '',
      media: [],
      isSearchOpen: false,
    });
    setCurrentCocktailInput('');
    setIsCreatingCustom(false);
  };

  const onSubmit = async (data: VisitFormData) => {
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

      let savedVisit: Visit;
      if (existingVisit) {
        // Update existing visit
        const updatedVisit = await visitService.updateVisit(
          existingVisit.id,
          data.visitDate,
          data.location,
          data.comments,
          data.visibility,
        );
        savedVisit = {
          ...updatedVisit,
          visitDate: updatedVisit.visitDate.toISOString(),
          createdAt: updatedVisit.createdAt.toISOString(),
          updatedAt: updatedVisit.updatedAt.toISOString(),
          deletedAt:
            updatedVisit.deletedAt?.toISOString() || null,
          logs: updatedVisit.logs.map(log => ({
            id: log.id,
            cocktail: {
              id: log.cocktail.id,
              name: {
                en: log.cocktail.name,
                zh: null,
              },
              slug: log.cocktail.slug,
              is_custom: false,
            },
            userId: user.id,
            location: data.location
              ? JSON.stringify(data.location)
              : null,
            comments: log.comments,
            createdAt: log.createdAt,
            updatedAt: log.updatedAt,
            drinkDate: log.drinkDate,
            media:
              log.mediaUrls?.map(m => ({
                id: m.id,
                url: m.url,
                type: 'image' as const,
                contentType: 'image/jpeg',
                fileSize: 0,
                originalName: '',
                createdAt: new Date(),
                status: 'active',
              })) || null,
            deletedAt: null,
            visibility: log.visibility as
              | 'public'
              | 'private'
              | 'friends',
          })),
        };

        // Update existing logs
        await Promise.all(
          data.cocktailEntries.map(entry =>
            entry.id
              ? cocktailLogService.updateLog(
                  entry.id,
                  entry.cocktailId,
                  entry.comments,
                  data.location,
                  data.visitDate,
                  entry.media.map(m => ({
                    id: m.id || '',
                    url: m.url,
                    type: m.type,
                  })),
                  data.visibility,
                )
              : cocktailLogService.createLog(
                  entry.cocktailId,
                  user.id,
                  entry.comments,
                  data.location,
                  data.visitDate,
                  entry.media.map(m => ({
                    id: m.id || '',
                    url: m.url,
                    type: m.type,
                  })),
                  data.visibility,
                  existingVisit.id,
                ),
          ),
        );
      } else {
        // Create new visit
        const newVisit = await visitService.createVisit(
          user.id,
          data.visitDate,
          data.location,
          data.comments,
          data.visibility,
        );
        savedVisit = {
          ...newVisit,
          visitDate: newVisit.visitDate.toISOString(),
          createdAt: newVisit.createdAt.toISOString(),
          updatedAt: newVisit.updatedAt.toISOString(),
          deletedAt:
            newVisit.deletedAt?.toISOString() || null,
          logs: newVisit.logs.map(log => ({
            id: log.id,
            cocktail: {
              id: log.cocktail.id,
              name: {
                en: log.cocktail.name,
                zh: null,
              },
              slug: log.cocktail.slug,
              is_custom: false,
            },
            userId: user.id,
            location: data.location
              ? JSON.stringify(data.location)
              : null,
            comments: log.comments,
            createdAt: log.createdAt,
            updatedAt: log.updatedAt,
            drinkDate: log.drinkDate,
            media:
              log.mediaUrls?.map(m => ({
                id: m.id,
                url: m.url,
                type: 'image' as const,
                contentType: 'image/jpeg',
                fileSize: 0,
                originalName: '',
                createdAt: new Date(),
                status: 'active',
              })) || null,
            deletedAt: null,
            visibility: log.visibility as
              | 'public'
              | 'private'
              | 'friends',
          })),
        };

        // Create new logs
        await Promise.all(
          data.cocktailEntries.map(entry =>
            cocktailLogService.createLog(
              entry.cocktailId,
              user.id,
              entry.comments,
              data.location,
              data.visitDate,
              entry.media.map(m => ({
                id: m.id || '',
                url: m.url,
                type: m.type,
              })),
              data.visibility,
              savedVisit.id,
            ),
          ),
        );
      }

      toast({
        description: existingVisit
          ? t.updateLog
          : t.saveLog,
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
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="h-full flex flex-col"
            >
              <div className="px-4 py-3 border-b">
                <div className="flex items-center relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-0"
                    onClick={handleClose}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <h2 className="flex-1 text-center text-lg font-semibold">
                    {existingVisit ? t.editLog : t.addLog}
                  </h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-4 space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label>
                      {t.drinkDate}{' '}
                      <span className="text-destructive">
                        *
                      </span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !form.getValues('visitDate') &&
                              'text-muted-foreground border-destructive',
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {form.getValues('visitDate') ? (
                            format(
                              form.getValues('visitDate'),
                              'PPP',
                            )
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
                          selected={form.getValues(
                            'visitDate',
                          )}
                          onSelect={date =>
                            date &&
                            form.setValue('visitDate', date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <LocationSelector
                    value={form.getValues('location')}
                    onChange={location =>
                      form.setValue('location', location)
                    }
                  />

                  <div className="space-y-2">
                    <div className="relative">
                      <Textarea
                        {...form.register('comments')}
                        placeholder={t.notePlaceholder}
                        className="min-h-[100px] resize-none pr-20"
                      />
                      <div className="absolute bottom-2 right-2">
                        <span className="text-xs text-muted-foreground">
                          {
                            form.getValues('comments')
                              .length
                          }
                          /500
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Popover
                            open={entrySearchStates[index]}
                            onOpenChange={open =>
                              setEntrySearchStates(
                                prev => ({
                                  ...prev,
                                  [index]: open,
                                }),
                              )
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-start text-left font-normal"
                              >
                                {field.cocktailId ? (
                                  <span className="font-medium">
                                    {field.cocktailName}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    {t.selectCocktail}
                                  </span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[300px] p-0"
                              align="start"
                            >
                              <div className="p-2">
                                <div className="relative">
                                  <Search className="absolute left-2 top-2 h-5 w-5 text-muted-foreground" />
                                  <Input
                                    placeholder={
                                      t.searchCocktail
                                    }
                                    value={
                                      currentCocktailInput
                                    }
                                    onChange={e => {
                                      setCurrentCocktailInput(
                                        e.target.value,
                                      );
                                    }}
                                    className="pl-9"
                                  />
                                </div>
                                <ScrollArea className="h-[200px]">
                                  {isLoadingCocktails ? (
                                    <div className="flex items-center justify-center py-4">
                                      <Loading size="sm" />
                                    </div>
                                  ) : filteredCocktails.length >
                                    0 ? (
                                    <div className="mt-2">
                                      {filteredCocktails.map(
                                        cocktail => (
                                          <button
                                            key={
                                              cocktail.value
                                            }
                                            type="button"
                                            onClick={() =>
                                              handleSelectCocktail(
                                                index,
                                                cocktail,
                                              )
                                            }
                                            className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
                                          >
                                            {cocktail.name}
                                          </button>
                                        ),
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-center text-sm text-muted-foreground py-4">
                                      {t.noCocktailsFound}
                                    </div>
                                  )}
                                </ScrollArea>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full mt-2"
                                  onClick={() =>
                                    setIsCreatingCustom(
                                      true,
                                    )
                                  }
                                >
                                  {t.createCustomCocktail}
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {field.cocktailId && (
                          <>
                            <Textarea
                              {...form.register(
                                `cocktailEntries.${index}.comments`,
                              )}
                              placeholder={
                                t.notePlaceholder
                              }
                              className="min-h-[80px] resize-none"
                            />

                            <div className="space-y-2">
                              <div className="overflow-x-auto">
                                <div className="grid grid-flow-col auto-cols-[200px] gap-2">
                                  {field.media.map((mediaItem, mediaIndex) => (
                                    <div
                                      key={mediaIndex}
                                      className="relative aspect-square"
                                    >
                                      <div className="relative w-full h-full">
                                        <img
                                          src={mediaItem.id
                                            ? `${import.meta.env.VITE_R2_BUCKET_URL}/${mediaItem.url}`
                                            : mediaItem.url}
                                          alt={`Media ${mediaIndex + 1}`}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveMedia(index, mediaIndex)}
                                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                      >
                                        <X className="h-4 w-4 text-white" />
                                      </button>
                                    </div>
                                  ))}
                                  {field.media.length < 5 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMediaClick(index)}
                                      className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                                    >
                                      <ImagePlus className="h-6 w-6 text-gray-400" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <input
                                ref={el => {
                                  fileInputRefs.current[
                                    index
                                  ] = el;
                                }}
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={e =>
                                  handleMediaUpload(
                                    index,
                                    e,
                                  )
                                }
                                className="hidden"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddEmptyCocktail}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t.addCocktail}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t mt-auto">
                <div className="flex w-full gap-2 items-center">
                  <Select
                    value={form.watch('visibility')}
                    onValueChange={(
                      value: 'public' | 'private',
                    ) => form.setValue('visibility', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue
                        placeholder={t.visibility}
                      />
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
                    type="submit"
                    disabled={
                      isLoading ||
                      !form.getValues('visitDate')
                    }
                    className="flex-1"
                  >
                    {isLoading ? t.saving : t.saveLog}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>

          {isCreatingCustom && (
            <CustomCocktailModal
              isOpen={isCreatingCustom}
              onClose={() => setIsCreatingCustom(false)}
              onCustomCocktailValues={
                handleCustomCocktailValues
              }
              initialName={currentCocktailInput}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
