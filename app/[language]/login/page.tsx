import { LoginPage } from "@/components/login/login-page";

export default function Page() {
  return <LoginPage />;
} 

export async function generateStaticParams() {
    return [
      { language: 'en' },
      { language: 'zh' }
    ];
  }