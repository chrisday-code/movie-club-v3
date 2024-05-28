import { createTheme } from "@mui/material/styles";
import "@fontsource/space-mono";
import "@fontsource/open-sans";
import "@fontsource/alegreya-sans";

declare module "@mui/material/styles" {
  //these are called as partials so you don't need to make them optional ( I think )
  interface TypeBackground {
    navbar: string;
    filter: string;
    default: string;
    footer: string;
    settings: string;
    stats: string;
    ranks: string;
  }
}

export const darkTheme = createTheme({
  typography: {
    fontFamily: "Open Sans",
    h1: {
      fontFamily: "Open Sans",
      fontSize: "4em",
      textAlign: "center",
    },
    h2: {
      fontSize: "3em",
      fontFamily: "Open Sans",
      fontWeight: "600",
    },
    h3: {
      fontSize: "1.2em",
      fontFamily: "Open Sans",
      fontWeight: "400",
    },
    h4: {
      fontFamily: "Space Mono",
      fontSize: "1.5em",
      color: "#F5F5F5",
    },
    h5: {
      fontFamily: "Open Sans",
      fontSize: "0.8em",
      color: "#F5F5F5",
    },
    caption: {
      fontFamily: "Space Mono",
      fontSize: "0.9em",
      color: "#F5F5F5",
    },
    body1: {
      fontFamily: "Open Sans",
      fontSize: "1em",
      color: "#F5F5F5",
    },
    body2: {
      fontFamily: "Open Sans",
      fontSize: "0.7em",
      color: "#F5F5F5",
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#F5F5F5",
    },
    background: {
      navbar: "#030B11",
      filter: "#030B11",
      default: "#030B11",
      footer: "#030B11",
      settings: "#030B11",
      stats: "#030B11",
      ranks: "#030B11",
    },
  },
});
