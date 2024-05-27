import { motion } from "framer-motion";
import { Grid, Typography, Box } from "@mui/material";
import { MovieClubDataType, GenreType, SuggestorsFilter } from "../types";
import { FaTrophy } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { IconContext } from "react-icons";
import { useTheme } from "@mui/material/styles";

interface TileProps {
  movie: MovieClubDataType;
}

export const MovieTile = ({ movie }: TileProps) => {
  const theme = useTheme();
  return (
    <Box
      component={motion.div}
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
      exit={{ scale: 0 }}
      layout
      // make this 30% on small screens
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: { xs: "40%", sm: "140px" },
        padding: "6px",
      }}
    >
      <img
        src={"https://image.tmdb.org/t/p/w500/" + movie.poster_path}
        alt=""
        width="100%"
        style={{
          margin: "",
          borderRadius: "2%",
        }}
      />
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={0.5}
        marginTop={"5%"}
      >
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
      <Typography variant="h5" sx={{ fontSize: "0.9em", textAlign: "center" }}>
        {movie.tmdb_title}
      </Typography>
    </Box>
  );
};
