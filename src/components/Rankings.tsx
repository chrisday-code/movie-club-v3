import React from "react";
import { useEffect, useState, useRef } from "react";
import { MovieTile } from "./MovieTile";
import { Filter } from "./Filter";
import { motion, AnimatePresence } from "framer-motion";
import { MovieClubDataType, GenreType } from "../types";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { useTheme } from "@mui/material/styles";
import { JWT } from "google-auth-library";
import { Grid, Box, Typography, Button } from "@mui/material";
import { options } from "../.config/tmdb-options";
import creds from "../.config/movie-club-394513-ccb57476d1f7.json";
import { GOOGLE_SHEET_ID } from "../.config/google-sheets";
import { Loader } from "./Loader";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export const Rankings = () => {
  const theme = useTheme();
  const initialized = useRef(false);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<Array<MovieClubDataType>>([]);
  const [filtered, setFiltered] = useState<Array<MovieClubDataType>>([]);

  const sortMovies = (movieList: MovieClubDataType[]) => {
    return movieList.sort((a, b) => {
      if (a.rank === undefined || b.rank === undefined) {
        return a.runtime - b.runtime;
      }
      if (b.rank === -1) {
        return -1;
      }
      if (a.rank === -1) {
        return 1;
      }
      return a.rank - b.rank;
    });
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const jwt = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: SCOPES,
      });
      // setTMDBIds();
      const getDataFromSheets = async () => {
        const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
        await doc.loadInfo(); // loads document properties and worksheets
        const sheet = doc.sheetsByTitle["computer"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
        const rows = await sheet.getRows();
        const sheetData: MovieClubDataType[] = [];
        for (const row of rows) {
          if (
            row.get("Title") === "" ||
            row.get("Title") === undefined ||
            Number(row.get("Rank")) === -1
          ) {
            continue;
          }
          // fix this for non inputed rows
          const genreCell = row
            .get("Genres")
            .toString()
            .split("|")
            .map((genre: any) => JSON.parse(genre) as GenreType);
          sheetData.push({
            title: row.get("Title"),
            tmdb_title: row.get("Tmdb Title"),
            release_date: new Date(row.get("Release Date")),
            suggestor: row.get("Suggestor"),
            id: Number(row.get("Tmdb")),
            score: Number(row.get("Weighted Average")),
            rank: Number(row.get("Rank")),
            reviews: [
              { reviewer: "Chris", rating: row.get("Chris") },
              { reviewer: "Reuben", rating: row.get("Reuben") },
              { reviewer: "Abhinav", rating: row.get("Abhinav") },
              { reviewer: "Hamish", rating: row.get("Hamish") },
            ],
            genres: genreCell,
            poster_path: row.get("Poster"),
            backdrop_path: row.get("backdrop_path"),
            director: row.get("Director"),
            runtime: Number(row.get("Runtime")),
            tmdb_score: Number(row.get("Tmdb Score")),
            origin_country: row.get("Country").split(","),
          });
        }
        console.log("sheetData: ", sheetData);
        //filter no reviews
        // const reviewedOnly = sheetData.filter((movie) => movie.rank !== -1);
        sortMovies(sheetData);
        setMovies(sheetData);
        setFiltered(sheetData);
        setLoading(false);
        return;
      };
      getDataFromSheets();
    }
  }, []);

  useEffect(() => {}, [movies]);

  return (
    <Box
      sx={{
        minHeight: "90vh",
        // width: "vw",
        // backgroundImage: "linear-gradient(#04213A, #1077D1)",
        // backgroundAttachment: "fixed",
        backgroundColor: `${theme.palette.background.default}`,
        padding: "2% 2% 2% 2%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          paddingTop: "1vh",
        }}
      >
        <Box
          sx={{
            display: !loading ? "flex" : "none",
          }}
        >
          <Filter
            filtered={filtered}
            setFiltered={setFiltered}
            movies={movies}
            setMovies={setMovies}
          />
        </Box>

        {/* <Filter
          filtered={filtered}
          setFiltered={setFiltered}
          movies={movies}
          setMovies={setMovies}
        /> */}
      </Box>

      <Box
        component={motion.div}
        layout
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {!loading && (
          <AnimatePresence mode="sync">
            {filtered.map((movie: MovieClubDataType, index) => {
              return <MovieTile key={movie.id} movie={movie} />;
            })}
          </AnimatePresence>
        )}
        {loading && (
          <Box
            sx={{
              display: "flex",
              minHeight: "50vh",
              justifyContent: "center",
              alignItems: "center",
              minWidth: "100vw",
            }}
          >
            <Loader />
          </Box>
        )}
      </Box>
    </Box>
  );
};
