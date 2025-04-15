"use client";

import { useState, useEffect } from "react";
import { Step1 } from "@/components/express/step1";
import { Results } from "@/components/express/results";
import {
  Step2Strong,
  Step2SweetTart,
  Step2Bubbly,
  Step2Creamy,
} from "@/components/express/step2";

type Category =
  | "Strong & Spirit-Focused"
  | "Sweet & Tart"
  | "Tall & Bubbly"
  | "Rich & Creamy";

export function PageClient() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedPreference, setSelectedPreference] = useState<string | null>(
    null
  );
  const [selectedSpirit, setSelectedSpirit] = useState<string | null>(null);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    window.history.pushState({ step: "step2", category }, "", "");
  };

  const handlePreferenceSelect = (preference: string) => {
    setSelectedPreference(preference);
    window.history.pushState(
      { step: "results", category: selectedCategory, preference },
      "",
      ""
    );
  };

  const handleSpiritSelect = (spirit: string) => {
    setSelectedSpirit(spirit);
    window.history.pushState(
      { step: "results", category: selectedCategory, spirit },
      "",
      ""
    );
  };

  const handleBack = () => {
    if (selectedSpirit) {
      setSelectedSpirit(null);
      window.history.back();
    } else if (selectedPreference) {
      setSelectedPreference(null);
      window.history.back();
    } else if (selectedCategory) {
      setSelectedCategory(null);
      window.history.back();
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.step === "results") {
        setSelectedCategory(event.state.category);
        setSelectedPreference(event.state.preference);
        setSelectedSpirit(event.state.spirit);
      } else if (event.state?.step === "step2") {
        setSelectedCategory(event.state.category);
        setSelectedPreference(null);
        setSelectedSpirit(null);
      } else {
        setSelectedCategory(null);
        setSelectedPreference(null);
        setSelectedSpirit(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Show results if we have all necessary selections
  if (selectedCategory && (selectedSpirit || selectedPreference)) {
    return (
      <Results
        category={selectedCategory}
        spirit={selectedSpirit || undefined}
        preference={selectedPreference || undefined}
        onBack={handleBack}
      />
    );
  }

  // Show appropriate step 2 based on category
  if (selectedCategory) {
    switch (selectedCategory) {
      case "Strong & Spirit-Focused":
        return (
          <Step2Strong onSelect={handleSpiritSelect} onBack={handleBack} />
        );
      case "Sweet & Tart":
        return (
          <Step2SweetTart
            onSelect={handlePreferenceSelect}
            onBack={handleBack}
          />
        );
      case "Tall & Bubbly":
        return (
          <Step2Bubbly onSelect={handlePreferenceSelect} onBack={handleBack} />
        );
      case "Rich & Creamy":
        return (
          <Step2Creamy onSelect={handlePreferenceSelect} onBack={handleBack} />
        );
    }
  }

  // Show step 1 by default
  return <Step1 onSelect={handleCategorySelect} />;
}
