import { Box, Typography, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DetailedSearchResult } from "../types";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

//TODO understand why this should take any
export const SearchResult = ({ result }: any) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const navigateToMovie = (id: number) => {
    navigate(`/movies/${id}`);
  };

  // hover and higlight
  return (
    <Grid
      container
      sx={{ width: "100%", cursor: "pointer" }}
      onClick={() => {
        console.log("id:", result.id);
        navigateToMovie(result.id);
      }}
    >
      <Grid item xs={8}>
        <Typography variant="h3">{result.title}</Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="h3">{result.release_date}</Typography>
      </Grid>
      {/* <Grid item xs={4}>
        <Typography variant="h3">{result.title}</Typography>
      </Grid> */}
    </Grid>
  );
};
