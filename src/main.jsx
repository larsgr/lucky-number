import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RandomDraw from "../random-draw.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RandomDraw />
  </StrictMode>
);
