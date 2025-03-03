import { CocktailExplorer } from "@/components/cocktail-explorer";
import { CocktailProvider } from "@/context/CocktailContext";

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
}

export default function Home() {
  return (
    <CocktailProvider>
      <CocktailExplorer />
    </CocktailProvider>
  );
} 