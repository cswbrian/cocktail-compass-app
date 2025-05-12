import { Metadata } from "next";
import { placeService } from "@/services/place-service";
import { translations } from "@/translations";
import { validLanguages } from "@/lib/utils";
import { MapPin, BadgeCheck, AlertCircle } from "lucide-react";
import { PlaceLogs } from "@/components/place/place-logs";

// Revalidate every hour
export const revalidate = 3600;

type Props = {
  params: Promise<{ language: string; id: string }>;
};

export default async function PlacePage({ params }: Props) {
  const { language, id } = await params;

  if (!validLanguages.includes(language)) {
    return <div>Invalid language</div>;
  }

  const place = await placeService.getPlaceByPlaceId(id);

  if (!place) {
    return <div>Place not found</div>;
  }

  const t = translations[language as keyof typeof translations];

  return (
    <div>
      <div className="p-6 mb-6">
        <h1 className="text-4xl mb-2">{place.name}</h1>
        <div className="flex items-center gap-2 mb-2">
          {place.is_verified ? (
            <div className="flex items-center text-primary">
              <BadgeCheck className="w-5 h-5 mr-1" />
              <span className="text-sm">{t.placeVerified}</span>
            </div>
          ) : (
            <div className="flex items-center text-muted-foreground">
              <AlertCircle className="w-5 h-5 mr-1" />
              <span className="text-sm">{t.placeUnverified}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {place.is_verified 
            ? t.placeVerifiedDescription
            : t.placeUnverifiedDescription}
        </p>
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {place.secondary_text && (
            <span className="ml-1"><a
            href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary inline-block"
          >{place.secondary_text}</a></span>
          )}
        </div>
      </div>

      <PlaceLogs placeId={place.id} />
    </div>
  );
}

export async function generateStaticParams() {
  const { data: places } = await placeService.getAllPlaces();
  const params = [];

  for (const place of places) {
    params.push(
      { language: "en", id: place.place_id },
      { language: "zh", id: place.place_id }
    );
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language, id } = await params;
  const place = await placeService.getPlaceByPlaceId(id);

  if (!place) {
    return {
      title: translations[language as keyof typeof translations].appName,
    };
  }

  return {
    title: `${place.name} | ${
      translations[language as keyof typeof translations].appName
    }`,
    description: `${place.main_text}${
      place.secondary_text ? ` - ${place.secondary_text}` : ""
    }`,
    openGraph: {
      title: `${place.name} | ${
        translations[language as keyof typeof translations].appName
      }`,
      description: `${place.main_text}${
        place.secondary_text ? ` - ${place.secondary_text}` : ""
      }`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${place.name} - ${
        translations[language as keyof typeof translations].appName
      }`,
      description: `${place.main_text}${
        place.secondary_text ? ` - ${place.secondary_text}` : ""
      }`,
    },
  };
}
