import { useEffect, useState, useRef } from "react";
import { MovieTile } from "./MovieTile";
import { Filter } from "./Filter";
import { motion, AnimatePresence } from "framer-motion";
import {
  MovieClubDataType,
  GenreType,
  PersonalReview,
  Reviewer,
  GenreReview,
} from "../types";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { useTheme } from "@mui/material/styles";
import { JWT } from "google-auth-library";
import { Grid, Box, Typography, Button } from "@mui/material";
import { options } from "../.config/tmdb-options";
import creds from "../.config/movie-club-394513-ccb57476d1f7.json";
import { GOOGLE_SHEET_ID } from "../.config/google-sheets";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export const Stats = () => {
  const initialized = useRef(false);
  const [movies, setMovies] = useState<Array<MovieClubDataType>>([]);
  const [rows, setRows] = useState<Array<Reviewer>>([]);
  const [genres, setGenres] = useState<Array<GenreType>>([]);
  //TODO get these from the google sheet
  const Light = -0.25;
  const Strong = 0.25;

  const getGenres = async () => {
    const genresFromAPI = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list`,
      options
    ).then((response) => response.json());

    setGenres(
      genresFromAPI.genres.map((genres: GenreType) => {
        return genres;
      })
    );
  };

  useEffect(() => {
    if (!initialized.current) {
      getGenres();
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
              { reviewer: "Mystery", rating: row.get("Mystery") },
            ],
            genres: genreCell,
            poster_path: row.get("Poster"),
            backdrop_path: row.get("backdrop_path"),
            director: row.get("Director"),
            runtime: Number(row.get("Runtime")),
            tmdb_score: Number(row.get("Tmdb Score")),
          });
        }
        console.log("sheetData: ", sheetData);
        setMovies(sheetData);
        return;
      };
      getDataFromSheets();
    }
  }, []);

  const createReviewer = (name: string) => {
    return {
      name: name,
      rank: 0,
      watched: 0,
      avg_review: 0,
      fav_genre: "action",
      suggested: [],
      avg_suggested: 0,
      total_suggested: 0,
      reviews: [],
    };
  };

  // this should recognise the type of thing
  // Light or Strong
  // 4.5

  const containsOnlyDigits = (str: string): boolean => {
    return /^\d+$/.test(str);
  };

  const convertReviewScore = (reviewScore?: string) => {
    let rating = 0;
    if (reviewScore === undefined) {
      return -1;
    }
    if (containsOnlyDigits(reviewScore)) {
      return parseInt(reviewScore);
    }
    const lightScore = reviewScore.match(/^Light\s?(\d+)/i);
    if (lightScore) {
      rating = parseInt(lightScore[1]) + Light;
    }
    const strongScore = reviewScore.match(/^Strong\s?(\d+)/i);
    if (strongScore) {
      rating = parseInt(strongScore[1]) + Strong;
    }
    // const regex = /(\d+\.\d+)|(\d+)/(\d+)/;
    const abhinavScore = reviewScore.match(/(\d+(?:\.\d+)?\/\d+)/);
    if (abhinavScore) {
      const scoreParts = abhinavScore[0].split("/");
      rating = (parseFloat(scoreParts[0]) * 10) / parseFloat(scoreParts[1]);
    }

    const decimalScore = reviewScore.match(/(\d+(?:\.\d+)?\.\d+)/);
    if (decimalScore) {
      rating = parseFloat(decimalScore[0]);
    }

    // if its already a number then just return it
    // check if it only contains strings
    // if its got a word out the front then convert bit that too
    return rating;
  };

  // map of like genre and then id or something

  useEffect(() => {
    if (movies.length === 0) return;

    const reviewerMap = new Map<string, Reviewer>();
    reviewerMap.set("Chris", createReviewer("Chris"));
    reviewerMap.set("Hamish", createReviewer("Hamish"));
    reviewerMap.set("Reuben", createReviewer("Reuben"));
    reviewerMap.set("Abhinav", createReviewer("Abhinav"));
    reviewerMap.set("Mystery", createReviewer("Mystery"));

    //count all the genres
    const findFavouriteGenre = (reviews: PersonalReview[]) => {
      if (genres.length === 0) return "";
      // get the genres
      // make a big map of genres and whatever
      // console.log("reviews:", reviews);
      // console.log("genres:", genres);

      //make a map of genres and names and
      const genreMap = new Map<number, GenreReview>();
      for (const genre of genres) {
        genreMap.set(genre.id, {
          name: genre.name,
          reviews: [],
          avg_review: 0,
        });
      }
      // const reviewsByGenre = [];
      for (const review of reviews) {
        for (const genre of review.genres) {
          // update the map with the review
          if (genreMap.has(genre.id)) {
            const curGenreMapVal = genreMap.get(genre.id);
            if (curGenreMapVal) {
              curGenreMapVal.reviews.push(review.rating);
            }
          }
        }
      }
      // find the highest average rating
      // const max = data.reduce(function(prev, current) {
      //   return (prev && prev.y > current.y) ? prev : current
      // })

      const maxGenres = [];
      for (const [key, value] of genreMap) {
        if (value.reviews.length === 0) {
          continue;
        }
        value.avg_review =
          value.reviews.reduce((acc: number, cur: number) => acc + cur, 0) /
          value.reviews.length;
        maxGenres.push(value);
      }

      const max = maxGenres.reduce((prev, cur) => {
        return prev && prev.avg_review > cur.avg_review ? prev : cur;
      });

      // find the highest number
      return max.name;
    };

    for (const movie of movies) {
      // find and add the reviews
      // add the titles to each value
      for (const [reviewerName, value] of reviewerMap) {
        // console.log("reviewer", reviewerMap.get(key));
        // find review type
        if (movie.suggestor === reviewerName) {
          value.suggested.push(movie);
        }
        const rating = movie.reviews.find(
          (review) => review.reviewer === reviewerName
        )?.rating;
        if (!rating || rating === "" || rating === "-") {
          continue;
        }
        const review: PersonalReview = {
          title: movie.title,
          genres: movie.genres,
          rating: convertReviewScore(rating),
        };
        value.reviews.push(review);
      }
    }
    // add all these to an row object
    const ranks = [];
    // add the number watched to each entry
    // TODO there's gotta be a better way lol
    for (const [reviewerName, value] of reviewerMap) {
      // avg review
      // fav genre ??
      // find the average rating for each genre
      // loop through reviews and add up scores
      let totalRating = 0;
      for (const review of value.reviews) {
        totalRating += review.rating;
      }
      let suggestedRating = 0;
      for (const movie of value.suggested) {
        suggestedRating += movie.score;
      }
      value.watched = value.reviews.length;
      value.avg_review = totalRating / value.watched;
      console.log("reviewerName: ", reviewerName);
      value.fav_genre = findFavouriteGenre(value.reviews);
      if (reviewerName !== "Mystery") {
        value.avg_suggested = suggestedRating / value.suggested.length;
      }
      ranks.push({ name: reviewerName, watched: value.reviews.length });
    }
    ranks.sort((a, b) => b.watched - a.watched);

    const tableRows: Reviewer[] = [];
    for (const [reviewerName, value] of reviewerMap) {
      ranks.forEach((rank, index) => {
        if (rank.name === reviewerName) {
          value.rank = index + 1;
        }
      });
      tableRows.push(value);
    }
    tableRows.sort((a, b) => a.rank - b.rank);
    //rank
    // get the ranks for each map entry

    //set the rows to the values
    // tricks js lol
    setRows([...tableRows]);

    // console.log("reviewerMap:", reviewerMap);
  }, [movies, genres]);

  // maybe I'll add these
  // rank: number,
  // name: string,
  // watched: number,
  // avg_review: string,
  // fav_genre: string,
  // avg_suggested: number,
  // streak: Array<number>
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "89vh" }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Rank </TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Watched</TableCell>
              <TableCell align="right">Avg Review</TableCell>
              <TableCell align="right">Fav Genre</TableCell>
              <TableCell align="right">Avg Suggested</TableCell>
              {/* <TableCell align="right">Streak</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="left">{row.rank}</TableCell>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.watched}</TableCell>
                <TableCell align="right">{row.avg_review.toFixed(2)}</TableCell>
                <TableCell align="right">{row.fav_genre}</TableCell>
                <TableCell align="right">
                  {row.avg_suggested.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
