import { Typography } from "@mui/material";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ReactComponent as TmdbLogo } from "../img/tmdb-logo.svg";

export const Footer = (props: any) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height: "3vh",
        // paddingTop: "3vh",
        paddingLeft: "5vw",
        paddingRight: "5vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      bgcolor={theme.palette.background.footer}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.5em",
        }}
      >
        <Typography variant="body2">
          Movie data from{" "}
          <a href="https://www.themoviedb.org/">
            <TmdbLogo height="0.8vh" />
          </a>{" "}
        </Typography>{" "}
      </Box>
    </Box>
  );
};
