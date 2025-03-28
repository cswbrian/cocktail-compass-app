import { CocktailExplorer } from "@/components/cocktail-explorer"
import { CocktailProvider } from "@/context/CocktailContext"

export default function Home() {
  return (
    <CocktailProvider>
      <CocktailExplorer />
    </CocktailProvider>
  );
}

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
} 