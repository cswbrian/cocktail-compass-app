import { CocktailExplorer } from "@/components/cocktail-explorer";

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
}

export default function Home() {
  return (
    <div className="grid items-center min-h-screen px-6">
      <main>
        <CocktailExplorer />
      </main>
    </div>
  );
} 