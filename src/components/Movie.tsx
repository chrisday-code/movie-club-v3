import { motion, AnimatePresence } from "framer-motion";
import { Box, Paper, Typography, Grid, Grow } from "@mui/material";
import { Score } from "./Score";
import { useState } from "react";
import { ReviewType } from "../types";

export const Movie = ({ movie }: any) => {
  const [expanded, setExpanded] = useState(false);
  // might have to call the movie api in here

  const renderReviews = (reviews: ReviewType[]) => {
    return reviews.map((review: ReviewType, index) => {
      return (
        <Grid container key={index}>
          <Grid item xs={6}>
            <Typography variant="body1">{review.reviewer}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">{review.rating}</Typography>
          </Grid>
        </Grid>
      );
    });
  };

  return (
    <Grid
      item
      xs={expanded ? 16 : 8}
      sm={expanded ? 16 : 8}
      md={expanded ? 16 : 4}
      component={motion.div}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      layout
      sx={
        {
          // height: expanded ? "400px" : "350px",
        }
      }
    >
      <Paper
        onClick={() => {
          setExpanded(!expanded);
          console.log("clicked", expanded);
        }}
        elevation={8}
        component={motion.div}
        sx={{
          position: "relative",
          padding: "0.1%",
          height: "100%",
          cursor: "pointer",
        }}
      >
        {/* <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            backgroundImage: `url(https://image.tmdb.org/t/p/w500/${movie.backdrop_path})`,
            backgroundSize: "cover",
            opacity: expanded ? 1 : 0, // Adjust opacity here
            zIndex: 1,
          }}
        /> */}
        <Grid
          component={motion.div}
          container
          direction={expanded ? "row" : "column"}
          sx={{ zindex: 3 }}
          // direction="column"
        >
          <Grid component={motion.div} layout item xs={expanded ? 6 : 8}>
            <Box
              component={motion.div}
              sx={{
                margin: 0,
                padding: 0,
              }}
              layout
            >
              {" "}
              {/* <motion.div style={{ height: "200px" }}> content </motion.div> */}
              <motion.img
                src={"https://image.tmdb.org/t/p/w500/" + movie.poster_path}
                alt=""
                width={expanded ? "70%" : "100%"}
                layout
                transition={{ layout: { duration: 1, type: "spring" } }}
                // height={expanded ? "350px" : "200px"}
                // animate={{ scale: 1 }}
                style={{
                  margin: expanded ? "15px" : "0%",
                }}
                // height="100%"
              />
              <AnimatePresence>
                {!expanded && <Score score={movie.movieClub.score}></Score>}
              </AnimatePresence>
              <AnimatePresence>
                {!expanded && (
                  <Box
                    // layout="opacity"
                    component={motion.div}
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    sx={{
                      position: "absolute",
                      backgroundColor: "white",
                      marginTop: "-20px",
                      marginLeft: "10px",
                      border: "1px solid",
                      width: "34px",
                      height: "34px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight={800}
                      sx={{ padding: "0", margin: "0" }}
                    >
                      {" "}
                      {movie.movieClub.rank}
                    </Typography>
                  </Box>
                )}
              </AnimatePresence>
            </Box>
          </Grid>
          {!expanded && (
            <Grid component={motion.div} layout="position" item xs={4}>
              <Box
                sx={{
                  minHeight: { xs: "60px" },
                  padding: "2rem 1rem 0rem 1rem",
                }}
              >
                <Typography variant="subtitle2" fontWeight={800}>
                  {" "}
                  {movie.title}
                </Typography>
              </Box>
            </Grid>
          )}
          {expanded && (
            <Grid item xs={6}>
              {/* <Grow in={expanded}>
                <p>wow</p>
              </Grow> */}
              <Box
                component={motion.div}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5em",
                  // margin: "0 0 0 1rem",
                  alignItems: "flex-start",
                }}
              >
                <Typography variant="h3">{movie.title}</Typography>
                <Box sx={{ display: "flex" }}>
                  <Box
                    sx={{
                      backgroundColor: "white",
                      marginTop: "0px",
                      marginLeft: "10px",
                      border: "1px solid",
                      width: "34px",
                      height: "34px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight={800}
                      sx={{ padding: "0", margin: "0" }}
                    >
                      {" "}
                      {movie.movieClub.rank}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: "white",
                      marginTop: "0px",
                      marginLeft: "10px",
                      border: "1px solid",
                      width: "34px",
                      height: "34px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight={800}
                      sx={{ padding: "0", margin: "0" }}
                    >
                      {" "}
                      {movie.movieClub.score.toPrecision(3)}
                    </Typography>
                  </Box>
                </Box>
                {/* display reviews */}
                {renderReviews(movie.movieClub.reviews)}
              </Box>
            </Grid>
          )}

          {/* little circle thingy */}
          {/* circle with score this is going to be an svg component */}
        </Grid>
      </Paper>
    </Grid>
    // <motion.div

    // >
    //   {/* <h2>{movie.title}</h2> */}

    // </motion.div>
  );
};
