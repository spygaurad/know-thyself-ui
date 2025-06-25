import React from "react";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // Make sure this div occupies the entire viewport height
    <div className="flex h-screen bg-gray-100">{children}</div>
  );
};
