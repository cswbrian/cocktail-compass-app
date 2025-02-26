import { CocktailExplorer } from "@/components/cocktail-explorer";

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
}

export default function Home() {
  return (
      <main>
        <CocktailExplorer />
      </main>
  );
} 