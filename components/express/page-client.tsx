"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Step1 } from "./step1";
import { Step2Strong, Step2SweetTart, Step2Bubbly, Step2Creamy } from "./step2";
import { Results } from "./results";
import { sendGAEvent } from "@next/third-parties/google";

type Category =
  | "Strong & Spirit-Focused"
  | "Sweet & Tart"
  | "Tall & Bubbly"
  | "Rich & Creamy";

export function ExpressPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<string>(searchParams?.get("step") || "1");
  const [category, setCategory] = useState<Category | null>(
    (searchParams?.get("category") as Category) || null
  );
  const [preference, setPreference] = useState<string | null>(
    searchParams?.get("preference") || null
  );
  const [spirit, setSpirit] = useState<string | null>(
    searchParams?.get("spirit") || null
  );

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (step) params.set("step", step);
    if (category) params.set("category", category);
    if (preference) params.set("preference", preference);
    if (spirit) params.set("spirit", spirit);
    
    router.push(`?${params.toString()}`, { scroll: false });
  }, [step, category, preference, spirit, router]);

  const handleCategorySelect = (selectedCategory: Category) => {
    setCategory(selectedCategory);
    setStep("2");
    sendGAEvent("express_category_selected", { category: selectedCategory });
  };

  const handlePreferenceSelect = (selectedPreference: string) => {
    setPreference(selectedPreference);
    setStep("3");
    sendGAEvent("express_preference_selected", { preference: selectedPreference });
  };

  const handleSpiritSelect = (selectedSpirit: string) => {
    setSpirit(selectedSpirit);
    setStep("3");
    sendGAEvent("express_spirit_selected", { spirit: selectedSpirit });
  };

  const handleBack = () => {
    if (step === "3") {
      if (spirit) {
        setSpirit(null);
      } else if (preference) {
        setPreference(null);
      }
      setStep("2");
    } else if (step === "2") {
      setCategory(null);
      setStep("1");
    }
  };

  const handleRestart = () => {
    setStep("1");
    setCategory(null);
    setPreference(null);
    setSpirit(null);
  };

  return (
    <>
      {step === "1" && <Step1 onSelect={handleCategorySelect} />}
      {step === "2" && category && (
        <>
          {category === "Strong & Spirit-Focused" && (
            <Step2Strong onSelect={handleSpiritSelect} onBack={handleBack} />
          )}
          {category === "Sweet & Tart" && (
            <Step2SweetTart onSelect={handlePreferenceSelect} onBack={handleBack} />
          )}
          {category === "Tall & Bubbly" && (
            <Step2Bubbly onSelect={handlePreferenceSelect} onBack={handleBack} />
          )}
          {category === "Rich & Creamy" && (
            <Step2Creamy onSelect={handlePreferenceSelect} onBack={handleBack} />
          )}
        </>
      )}
      {step === "3" && category && (
        <Results
          category={category}
          preference={preference || undefined}
          spirit={spirit || undefined}
          onBack={handleBack}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
