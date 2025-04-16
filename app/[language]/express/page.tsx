import { ExpressPageClient } from "@/components/express/page-client"
import { CocktailProvider } from "@/context/CocktailContext"
import { GradientBackground } from "@/components/GradientBackground"
import { Suspense } from "react"
import { Loading } from "@/components/ui/loading"

export default function ExpressPage() {
  return (
    <CocktailProvider>
      <GradientBackground />
      <Suspense fallback={<Loading fullScreen size="lg" />}>
        <ExpressPageClient />
      </Suspense>
    </CocktailProvider>
  );
}

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
} 