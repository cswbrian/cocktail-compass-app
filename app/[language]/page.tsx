import { Redirect } from "@/components/redirect";

export default function Home() {
  return <Redirect to="/journal/feeds" />;
}

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
} 