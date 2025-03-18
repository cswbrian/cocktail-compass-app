import { TwistFinder } from "@/components/twist-finder/twist-finder";
import cocktails from "@/data/cocktails.json";

export default async function TwistPage() {

  return (
    <div className="container mx-auto px-6 py-8">
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