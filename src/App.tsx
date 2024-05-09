import React from "react";
import "./App.css";
import { useEffect, useState, useRef } from "react";
// import { Movie } from "./components/Movie";
import { MovieTile } from "./components/MovieTile";
import { Filter } from "./components/Filter";
import { motion, AnimatePresence } from "framer-motion";
import { MovieClubDataType, GenreType } from "../src/types";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { Grid, Box, Typography, Button } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "./theme";
import { options } from "../src/.config/tmdb-options";
import creds from "../src/.config/movie-club-394513-ccb57476d1f7.json";

const GOOGLE_SHEET_ID = "190YS0RIcaaYuBnFImkt2ygX9Sh2XF1fL52GM-YivZFI";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function App() {
  // const [popular, setPopular] = useState<Array<MovieType>>([]);
  const initialized = useRef(false);
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

  //TODO put this in the other function
  const setTMDBIds = async () => {
    const jwt = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: SCOPES,
    });
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    const rows = await sheet.getRows();
    let i = 1;
    await sheet.loadCells("A1:E300");
    for (const row of rows) {
      if (i === 1 || row.get("Tmdb") !== "") {
        i++;
        continue;
      }
      const imdburl = row.get("Imdb");
      if (imdburl === "") {
        i++;
        continue;
      }
      const imdbId = imdburl.match(/tt\d+/)[0];
      const url =
        "https://api.themoviedb.org/3/find/" +
        imdbId +
        "?external_source=imdb_id";
      const data = await fetch(url, options);
      const movies = await data.json();
      console.log(row.get("Title"));
      console.log(movies.movie_results[0].id);
      const cell = await sheet.getCell(i, 3);
      cell.value = movies.movie_results[0].id;
      i++;
    }
    sheet.saveUpdatedCells();
    return;
  };

  //TODO update movie club data, I want to store basically everything you get from the call movie api
  // Figure out threads or something for this
  const getTMDBData = async () => {
    console.log("clicked");
    const jwt = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: SCOPES,
    });
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo(); // loads document properties and worksheets
    console.log("doc");
    const sheet = doc.sheetsByTitle["computer"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    const rows = await sheet.getRows();
    console.log("wow");
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
      const tmdbId = row.get("Tmdb");
      console.log("tmdbId", tmdbId);
      if (tmdbId === "") {
        i++;
        continue;
      }

      const url = `https://api.themoviedb.org/3/movie/${tmdbId}`;
      const movie = await fetch(url, options).then((data) => data.json());
      //TODO use then to get rid of the second call

      console.log("movie: ", movie);
      const tmdb_title = await sheet.getCell(i, 20);
      tmdb_title.value = movie.title;

      const release_date = await sheet.getCell(i, 21);
      release_date.value = movie.release_date;

      i++;
      continue;

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

      // console.log(genre.value);

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

  //TODO remove this because we don't need it
  // const getMovieClubData = async () => {
  //   const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
  //   await doc.loadInfo(); // loads document properties and worksheets
  //   const sheet = doc.sheetsByTitle["computer"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
  //   const rows = await sheet.getRows();
  //   for (const row of rows) {
  //     if (row.get("Title") === "") {
  //       continue;
  //     }
  //     // console.log(row.get("Title"));
  //     // add the ids and the things to an array
  //     movieClubList.push({
  //       title: row.get("Title"),
  //       suggestor: row.get("Suggestor"),
  //       id: Number(row.get("Tmdb")),
  //       score: Number(row.get("Weighted Average")),
  //       rank: Number(row.get("Rank")),
  //       reviews: [
  //         { reviewer: "Chris", rating: row.get("Chris") },
  //         { reviewer: "Reuben", rating: row.get("Reuben") },
  //         { reviewer: "Abhinav", rating: row.get("Abhinav") },
  //         { reviewer: "Hamish", rating: row.get("Hamish") },
  //       ],
  //     });
  //   }
  //   console.log("movieClubList: ", movieClubList);
  //   return;
  // };

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
          if (row.get("Title") === "" || row.get("Title") === undefined) {
            continue;
          }

          // const myGenres: GenreType[] = JSON.parse(row.get("Genres"));
          // TODO get this  using row.get("Genres").split('|').map((genre)=>JSON.parse(genre))
          // const myGenres = "ahhh";
          // JSON.parse(genre) as GenreType)

          //TODO make this an array actually
          const genreCell = row
            .get("Genres")
            .toString()
            .split("|")
            .map((genre: any) => JSON.parse(genre) as GenreType);

          // const myGenres = genreCell.split("|");

          // console.log("Mygenres:", genreCell);
          // console.log("type of myGenres: ", Array.isArray(genreCell));
          // return;
          // add the ids and the things to an array
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
            genres: genreCell, //[{ id: 1, name: "wow" }],
            poster_path: row.get("Poster"),
            backdrop_path: row.get("backdrop_path"),
            director: row.get("Director"),
            runtime: Number(row.get("Runtime")),
            tmdb_score: Number(row.get("Tmdb Score")),
          });
        }
        console.log("sheetData: ", sheetData);
        sortMovies(sheetData);
        setMovies(sheetData);
        setFiltered(sheetData);
        // console.log("movieClubList: ", sheetData);

        return;
      };
      getDataFromSheets();
      // getMovies(8296168);
      // getMovieClubData();
    }
  }, []);

  useEffect(() => {
    // console.log("movies: ", movies);
  }, [movies]);

  return (
    <ThemeProvider theme={darkTheme}>
      <Grid container>
        <Grid
          item
          xs={2}
          sx={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}
        >
          <Button variant="outlined" onClick={setTMDBIds}>
            {" "}
            Update TMDB Ids
          </Button>
          <Button variant="outlined" onClick={getTMDBData}>
            {" "}
            Update Data
          </Button>
          <Filter
            filtered={filtered}
            setFiltered={setFiltered}
            movies={movies}
            setMovies={setMovies}
          />
        </Grid>
        <Grid item xs={10}>
          <Grid
            component={motion.div}
            layout
            container
            spacing={3}
            columns={{ xs: 8, sm: 16, md: 20, lg: 24 }}
            sx={{ padding: "2%" }}
          >
            <AnimatePresence mode="sync">
              {filtered.map((movie: MovieClubDataType, index) => {
                return <MovieTile key={movie.id} movie={movie} />;
              })}
            </AnimatePresence>
          </Grid>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App;
