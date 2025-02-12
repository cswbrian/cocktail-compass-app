import { CocktailExplorer } from "@/components/cocktail-explorer"

export default function Home() {
  return (
    <div className="grid items-center justify-items-center min-h-screen px-6">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <CocktailExplorer />
      </main>
    </div>
  );
}
