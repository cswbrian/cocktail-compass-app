import { CocktailExplorer } from "@/components/cocktail-explorer"

export default function Home() {
  return (
    <div className="grid items-center min-h-screen px-6">
      <main className="">
        <CocktailExplorer />
      </main>
    </div>
  );
}
