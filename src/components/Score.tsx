import React from "react";
// import { useEffect, useState, useRef } from "react";
// import { MovieTile } from "./MovieTile";
// import { Filter } from "./Filter";
import { motion, AnimatePresence } from "framer-motion";
// import { MovieClubDataType, GenreType } from "../types";
// import { GoogleSpreadsheet } from "google-spreadsheet";
// import { useTheme } from "@mui/material/styles";
// import { JWT } from "google-auth-library";
import { Grid, Box, Typography, Button } from "@mui/material";
// import { options } from "../.config/tmdb-options";
// import creds from "../.config/movie-club-394513-ccb57476d1f7.json";
// import { GOOGLE_SHEET_ID } from "../.config/google-sheets";

// const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export const Score = (props: any) => {
  return (
    <Box
      component={motion.div}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      // layout="opacity"
      sx={{
        position: "absolute",
        // backgroundColor: "white",
        marginTop: "-20px",
        marginLeft: "55px",
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
        {props.score.toPrecision(3)}
      </Typography>
    </Box>
  );
};
