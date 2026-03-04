import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/router";
import { MissionStageProvider } from "@/lib/mission-stage";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MissionStageProvider>
      <RouterProvider router={router} />
    </MissionStageProvider>
  </StrictMode>
);
