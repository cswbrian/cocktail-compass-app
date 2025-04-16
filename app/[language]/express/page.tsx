import { ExpressPageClient } from "@/components/express/page-client"
import { CocktailProvider } from "@/context/CocktailContext"
import { GradientBackground } from "@/components/GradientBackground"

export default function ExpressPage() {
  return (
    <CocktailProvider>
      <GradientBackground />
      <ExpressPageClient />
    </CocktailProvider>
  );
}

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
} 