import { PageClient } from "@/components/express/page-client"
import { CocktailProvider } from "@/context/CocktailContext"

export default function ExpressPage() {
  return (
    <CocktailProvider>
      <PageClient />
    </CocktailProvider>
  );
}

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
} 