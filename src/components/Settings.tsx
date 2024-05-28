import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { MovieTile } from "./MovieTile";
import { Filter } from "./Filter";
import { motion, AnimatePresence } from "framer-motion";
import { MovieClubDataType, GenreType } from "../types";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { useTheme } from "@mui/material/styles";
import { JWT } from "google-auth-library";
import { options } from "../.config/tmdb-options";
import creds from "../.config/movie-club-394513-ccb57476d1f7.json";
import { GOOGLE_SHEET_ID } from "../.config/google-sheets";
import { useContext } from "react";
import { AuthContext } from "../AuthContext";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export const Settings = () => {
  const authContext = useContext(AuthContext);
  const theme = useTheme();
  // TODO Figure out threads or something for this
  const getTMDBData = async () => {
    const jwt = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: SCOPES,
    });
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["computer"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    const rows = await sheet.getRows();
    let i = 1;
    await sheet.loadCells("A1:Z300");
    for (const row of rows) {
      // if (i === 4) {
      //   break;
      // }
      if (i === 1) {
        i++;
        continue;
      }
      if (row.get("Country")) {
        i++;
        continue;
      }
      let tmdbId = row.get("Tmdb");
      const imdburl = row.get("Imdb");
      if (tmdbId === "" && imdburl === "") {
        i++;
        continue;
      }
      // console.log("tmdbId", tmdbId);
      if (tmdbId === "") {
        if (imdburl === "") {
          i++;
          continue;
        }
        const imdbId = imdburl.match(/tt\d+/)[0];
        const url =
          "https://api.themoviedb.org/3/find/" +
          imdbId +
          "?external_source=imdb_id";
        const movies = await fetch(url, options).then((data) => data.json());
        console.log(row.get("Title"));
        console.log(movies.movie_results[0].id);
        tmdbId = movies.movie_results[0].id;
        const tmdbCell = await sheet.getCell(i, 3);
        tmdbCell.value = movies.movie_results[0].id;
      }

      const url = `https://api.themoviedb.org/3/movie/${tmdbId}`;
      const movie = await fetch(url, options).then((data) => data.json());
      console.log("movie: ", movie);
      const country = await sheet.getCell(i, 22);
      country.value = movie.origin_country.join();

      console.log("origin_country", movie.origin_country.join());

      i++;
      continue;

      // return;

      const tmdb_title = await sheet.getCell(i, 20);
      tmdb_title.value = movie.title;

      const release_date = await sheet.getCell(i, 21);
      release_date.value = movie.release_date;

      const directorCredits = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbId}/credits`,
        options
      )
        .then((response) => response.json())
        .then((jsonData) =>
          jsonData.crew.filter((person: any) => person.job === "Director")
        );

      //genre
      const genre = await sheet.getCell(i, 14);
      const genreContent = movie.genres.map((val: any) => {
        console.log("id: ", val.id, "name: ", val.name);
        return `{"id": ${val.id}, "name": "${val.name}"}`;
      });
      console.log(genreContent.join("|"));
      genre.value = genreContent.join("|");

      //poster
      const poster = await sheet.getCell(i, 12);
      poster.value = movie.poster_path;
      //background
      const backdrop_path = await sheet.getCell(i, 13);
      backdrop_path.value = movie.backdrop_path;

      const director = await sheet.getCell(i, 15);
      director.value = directorCredits[0]?.name;

      const budget = await sheet.getCell(i, 16);
      budget.value = movie.budget;

      const revenue = await sheet.getCell(i, 17);
      revenue.value = movie.revenue;

      const runtime = await sheet.getCell(i, 18);
      runtime.value = movie.runtime;

      const tmdbScore = await sheet.getCell(i, 19);
      tmdbScore.value = movie.vote_average;

      //genres

      i++;
    }
    console.log("ending");
    sheet.saveUpdatedCells();
    return;
  };

  //get the origin countries

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: theme.palette.background.settings,
        minHeight: "89vh",
      }}
    >
      <Typography variant="h1"> Settings</Typography>
      <Button
        variant="outlined"
        // disabled={!authContext.isAuthenticated}
        onClick={getTMDBData}
      >
        {" "}
        Update Data
      </Button>
    </Box>
  );
};
