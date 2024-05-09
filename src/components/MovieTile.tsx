import { motion } from "framer-motion";
import { Grid, Typography, Box } from "@mui/material";
import { MovieClubDataType, GenreType, SuggestorsFilter } from "../types";
import { FaTrophy } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { IconContext } from "react-icons";

interface TileProps {
  movie: MovieClubDataType;
}

export const MovieTile = ({ movie }: TileProps) => {
  return (
    <Grid
      item
      xs={4}
      component={motion.div}
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
      exit={{ scale: 0 }}
      layout
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <img
        src={"https://image.tmdb.org/t/p/w500/" + movie.poster_path}
        alt=""
        width="100%"
        // height="350px"
        style={{
          margin: "",
          borderRadius: "2%",
        }}
      />
      <Box display="flex" gap={0.5} marginTop={"5%"}>
        <IconContext.Provider value={{ color: "gold" }}>
          <FaTrophy />
        </IconContext.Provider>
        <Typography variant="caption" sx={{ marginRight: "5%" }}>
          {movie.rank}
        </Typography>
        <IconContext.Provider value={{ color: "black" }}>
          <FaStar />
        </IconContext.Provider>
        <Typography variant="caption">{movie.score.toFixed(2)}</Typography>
      </Box>
      <Typography variant="h5">{movie.tmdb_title}</Typography>
    </Grid>
  );
};
