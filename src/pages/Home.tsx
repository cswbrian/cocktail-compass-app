import { Navigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { language } = useLanguage();
  return <Navigate to={`/${language}/journal/feeds`} replace />;
}
