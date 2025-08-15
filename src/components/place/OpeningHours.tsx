import React from 'react';
import { Clock } from 'lucide-react';
import { Place } from '@/types/place';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { PlaceStatusDisplay } from '@/components/common/PlaceStatusDisplay';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface OpeningHoursProps {
  openingHours: any;
  place: Place;
}

export const OpeningHours: React.FC<OpeningHoursProps> = ({
  openingHours,
  place,
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  // Helper function to format time (e.g., "1700" -> "17:00")
  const formatTime = (timeStr: string) => {
    const hour = timeStr.substring(0, 2);
    const minute = timeStr.substring(2, 4);
    return `${hour}:${minute}`;
  };

  if (!openingHours) return null;

  // Use periods as primary method for better translation support
  if (
    openingHours.periods &&
    Array.isArray(openingHours.periods)
  ) {
    const weekdays = [
      t.sunday,
      t.monday,
      t.tuesday,
      t.wednesday,
      t.thursday,
      t.friday,
      t.saturday,
    ];

    // Get current day (0 = Sunday, 1 = Monday, etc.)
    const today = new Date().getDay();

    // Helper function to get all periods for a specific day
    const getDayPeriods = (dayIndex: number) => {
      return openingHours.periods.filter(
        (period: any) => period.open.day === dayIndex,
      );
    };

    // Helper function to format period display text
    const formatPeriodText = (period: any) => {
      const openTime = formatTime(period.open.time);
      const closeTime = formatTime(period.close.time);
      return `${openTime} - ${closeTime}`;
    };

    // Helper function to get today's hours summary for the trigger
    const getTodayHoursSummary = () => {
      const todayPeriods = getDayPeriods(today);
      if (todayPeriods.length === 0) {
        return `${weekdays[today]}: ${t.closed}`;
      }

      if (todayPeriods.length === 1) {
        return `${weekdays[today]} ${formatPeriodText(todayPeriods[0])}`;
      }

      // For multiple periods, show them in the same row format as expanded version
      return (
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="font-medium">
            {weekdays[today]}{' '}
          </div>
          <div className="">
            {todayPeriods.map(
              (period: any, periodIndex: number) => {
                const openTime = formatTime(
                  period.open.time,
                );
                const closeTime = formatTime(
                  period.close.time,
                );
                return (
                  <div
                    key={periodIndex}
                    className="text-sm"
                  >
                    {openTime} - {closeTime}
                  </div>
                );
              },
            )}
          </div>
        </div>
      );
    };

    return (
      <Accordion
        type="single"
        collapsible
        className="w-full"
      >
        <AccordionItem value="opening-hours">
          <AccordionTrigger className="text-left">
            <div className="flex items-center justify-between gap-3 w-full">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div className="w-full flex gap-2 items-center justify-between grow">
                {/* Place Status Display */}
                <PlaceStatusDisplay
                  place={place}
                  className="ml-2"
                />
                {/* Show today's hours in the trigger */}
                <div>{getTodayHoursSummary()}</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1">
              {weekdays.map((weekday, index) => {
                const periods = getDayPeriods(index);
                const isToday = index === today;

                if (periods.length > 0) {
                  if (periods.length === 1) {
                    // Single period - use original layout
                    const period = periods[0];
                    const openTime = formatTime(
                      period.open.time,
                    );
                    const closeTime = formatTime(
                      period.close.time,
                    );

                    if (
                      period.open.day === period.close.day
                    ) {
                      return (
                        <div
                          key={index}
                          className={`flex justify-between p-1 ${
                            isToday
                              ? 'text-primary bg-primary/10 rounded'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span>{weekday}</span>
                          <span>
                            {openTime} - {closeTime}
                          </span>
                        </div>
                      );
                    } else {
                      // Cross-midnight period
                      const nextDay =
                        weekdays[period.close.day];
                      return (
                        <div
                          key={index}
                          className={`flex justify-between p-1 ${
                            isToday
                              ? 'text-primary bg-primary/10 rounded'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span>{weekday}</span>
                          <span>
                            {openTime} - {closeTime}
                          </span>
                        </div>
                      );
                    }
                  } else {
                    // Multiple periods - show each on a separate row
                    return (
                      <div key={index}>
                        {periods.map(
                          (
                            period: any,
                            periodIndex: number,
                          ) => {
                            const openTime = formatTime(
                              period.open.time,
                            );
                            const closeTime = formatTime(
                              period.close.time,
                            );
                            const isFirstPeriod =
                              periodIndex === 0;

                            return (
                              <div
                                key={periodIndex}
                                className={`flex justify-between p-1 ${
                                  isToday
                                    ? 'text-primary bg-primary/10 rounded'
                                    : 'text-muted-foreground'
                                } ${!isFirstPeriod ? 'ml-4' : ''}`}
                              >
                                <span>
                                  {isFirstPeriod
                                    ? weekday
                                    : ''}
                                </span>
                                <span>
                                  {openTime} - {closeTime}
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>
                    );
                  }
                } else {
                  // No data for this day, show as closed
                  return (
                    <div
                      key={index}
                      className={`flex justify-between p-1 ${
                        isToday
                          ? 'text-primary bg-primary/10 rounded'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <span>{weekday}</span>
                      <span>{t.closed}</span>
                    </div>
                  );
                }
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  // Fallback to weekday_text if periods not available
  if (
    openingHours.weekday_text &&
    Array.isArray(openingHours.weekday_text)
  ) {
    const weekdays = [
      t.sunday,
      t.monday,
      t.tuesday,
      t.wednesday,
      t.thursday,
      t.friday,
      t.saturday,
    ];

    const today = new Date().getDay();

    // Helper function to get today's hours summary from weekday_text
    const getTodayHoursSummary = () => {
      const todayText = openingHours.weekday_text[today];
      if (todayText && !todayText.includes('Closed')) {
        const hours = todayText.split(': ')[1];
        return `${weekdays[today]}: ${hours}`;
      }
      return `${weekdays[today]}: ${t.closed}`;
    };

    return (
      <Accordion
        type="single"
        collapsible
        className="w-full"
      >
        <AccordionItem value="opening-hours">
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {t.openingHours}
              </span>
              {/* Place Status Display */}
              <div className="flex wrap gap-2">
                <PlaceStatusDisplay
                  place={place}
                  className="ml-2"
                />
                {/* Show today's hours in the trigger */}
                <span className="ml-2">
                  {getTodayHoursSummary()}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 pt-2">
              {openingHours.weekday_text.map(
                (dayText: string, index: number) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground"
                  >
                    {dayText}
                  </div>
                ),
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return null;
};
