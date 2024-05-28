import { Box, Typography, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DetailedSearchResult } from "../types";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

//TODO understand why this should take any
export const SearchResult = ({ result }: any) => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const navigateToMovie = (id: number) => {
    navigate(`/movies/${id}`);
  };

  // hover and higlight
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        backgroundColor: hovered ? "gray" : "inherit",
        alignItems: "center",
        margin: "2px",
        cursor: "pointer",
      }}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      onClick={() => {
        navigateToMovie(result.id);
      }}
    >
      <Box
        component="img"
        src={"https://image.tmdb.org/t/p/original/" + result.poster_path}
        alt={result.title}
        sx={{
          borderRadius: "2%",
          marginRight: { xs: "200px", sm: "20px" },
          // marginBottom: "10px",
          height: "100px",
        }}
      ></Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h3">{result.title}</Typography>
        <Typography variant="h5">{result.release_date}</Typography>
      </Box>
    </Box>
    // <Grid
    //   container
    //   sx={{ width: "100%", cursor: "pointer" }}
    //   onClick={() => {
    //     console.log("id:", result.id);
    //     navigateToMovie(result.id);
    //   }}
    // >
    //   <Grid item xs={8}>
    //     <Typography variant="h3">{result.title}</Typography>
    //   </Grid>
    //   <Grid item xs={4}>
    //     <Typography variant="h3">{result.release_date}</Typography>
    //   </Grid>
    //   {/* <Grid item xs={4}>
    //     <Typography variant="h3">{result.title}</Typography>
    //   </Grid> */}
    // </Grid>
  );
};
