import { motion } from "framer-motion";
import { Grid, Typography, Box } from "@mui/material";
import {
  MovieClubDataType,
  GenreType,
  SuggestorsFilter,
  ReviewType,
} from "../types";
import { FaTrophy } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { IconContext } from "react-icons";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface TileProps {
  movie: MovieClubDataType;
}

export const MovieTile = ({ movie }: TileProps) => {
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const renderReviews = (reviews: ReviewType[]) => {
    return reviews.map((review: ReviewType) => {
      return (
        <Box>
          <Typography>
            {review.reviewer} - {review.rating}
          </Typography>
        </Box>
      );
    });
  };

  return (
    <Box
      component={motion.div}
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
      exit={{ scale: 0 }}
      layout
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: { xs: "40%", sm: "140px" },
        padding: "6px",
      }}
    >
      {/* <Box
        // component="img"
        src={"https://image.tmdb.org/t/p/w500/" + movie.poster_path}
        alt=""
        width="100%"
        sx={{
          margin: "",
          borderRadius: "2%",
        }}
        onClick={() => {
          setClicked(!clicked);
        }}
      ></Box> */}
      <Box
        onClick={() => {
          setClicked(!clicked);
        }}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "2%",
          //     background: `linear-gradient(
          //   rgba(0, 0, 0, 0.8),
          //   rgba(0, 0, 0, 0.8)
          // ),url(
          //   'https://image.tmdb.org/t/p/original/${movie.poster_path}')`,
          background: `url('https://image.tmdb.org/t/p/original/${movie.poster_path}')`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          height: "200px",
          width: "100%",
        }}
      >
        {clicked && <Box>clicked</Box>}
      </Box>
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
        <IconContext.Provider value={{ color: theme.palette.primary.main }}>
          <FaStar />
        </IconContext.Provider>
        <Typography variant="caption">{movie.score.toFixed(2)}</Typography>
      </Box>
      <Typography
        variant="h5"
        sx={{ fontSize: "0.9em", textAlign: "center", cursor: "pointer" }}
        onClick={() => {
          // console.log("going to: ", movie.id);
          navigate(`/movies/${movie.id}`);
        }}
      >
        {movie.tmdb_title}
      </Typography>
    </Box>
  );
};
