import { Redirect } from "@/components/redirect";

export default function Home() {
  return <Redirect to="/explorer" />;
}

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
} 