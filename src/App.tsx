import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "./theme";
import { Rankings } from "./components/Rankings";

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Rankings />
    </ThemeProvider>
  );
}

export default App;
