import { createTheme } from "@mui/material/styles";
import "@fontsource/space-mono";
import "@fontsource/open-sans";

export const darkTheme = createTheme({
  typography: {
    fontFamily: "Space Mono",
    h1: {
      fontFamily: "Alegreya Sans",
      fontSize: "4em",
      textAlign: "center",
    },
    h2: {
      fontSize: "3em",
      paddingTop: "0",
      fontFamily: "Arimo",
      fontWeight: "600",
    },
    h3: {
      fontSize: "2em",
      fontFamily: "Arimo",
      fontWeight: "400",
    },
    h4: {
      fontFamily: "Arimo",
      textAlign: "center",
    },
    h5: {
      fontFamily: "Open Sans",
      fontSize: "0.8em",
    },
    caption: {
      fontFamily: "Space Mono",
      fontSize: "0.7em",
    },
  },
  palette: {
    mode: "light",
    // primary: {
    //   main: "#F5F5F5",
    // },
  },
});
