import React from "react";
import { Tabs } from "./components/Tabs/Tabs";
import { useReferenceTabsStore } from "../../../shared/stores/referenceTabs";
import { Customers } from "../Customers/Customers";

export const ReferenceBooks = () => {
  const currentTab = useReferenceTabsStore((state) => state.currentTab);
  const renderContent = () => {
    switch (currentTab) {
      case "customers":
        return <Customers />;
      default:
        return null; // Возвращает null, если нет совпадений
    }
  };
  const currentComponent = renderContent();

  return (
    <>
      <Tabs />
      <div className="w-full">{currentComponent}</div>
    </>
  );
};
