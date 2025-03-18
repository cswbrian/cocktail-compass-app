import { TwistFinder } from "@/components/twist-finder/twist-finder";
import cocktails from "@/data/cocktails.json";
import { translations } from "@/translations";

type Props = {
  params: Promise<{ language: string }>;
};

export default async function TwistPage({ params }: Props) {
  const { language } = await params;
  const t = translations[language as keyof typeof translations];

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl mb-8">{t.findTwists}</h1>
      <TwistFinder cocktails={cocktails} />
    </div>
  );
}

export async function generateStaticParams() {
    return [
      { language: 'en' },
      { language: 'zh' }
    ];
  }