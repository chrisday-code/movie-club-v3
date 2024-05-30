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
  Country,
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
import { MovieLocationMap } from "./MovieLocationMap";
import { useContext } from "react";
import { AuthContext } from "../AuthContext";
import { getCountryISO3 } from "../utils/iso-2-to-3";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
countries.registerLocale(enLocale);

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export const Stats = () => {
  const authContext = useContext(AuthContext);
  const theme = useTheme();
  const initialized = useRef(false);
  const [movies, setMovies] = useState<Array<MovieClubDataType>>([]);
  const [rows, setRows] = useState<Array<Reviewer>>([]);
  const [genres, setGenres] = useState<Array<GenreType>>([]);
  const [countriesMap, setcountriesMap] = useState<Map<string, Country>>(
    new Map()
  );
  const [countriesList, setCountriesList] = useState<Array<Country>>([]);
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
            origin_country: row.get("Country").split(","),
          });
        }
        // console.log("sheetData: ", sheetData);
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
      // make a map of genres and names and
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
    //todo combine these
    const findTopGenre = (movies: MovieClubDataType[]) => {
      if (genres.length === 0) return { name: "", reviews: [], avg_review: 0 };
      // get the genres
      // make a big map of genres and whatever
      // make a map of genres and names and
      const genreMap = new Map<number, GenreReview>();
      for (const genre of genres) {
        genreMap.set(genre.id, {
          name: genre.name,
          reviews: [],
          avg_review: 0,
        });
      }
      // const reviewsByGenre = [];
      for (const movie of movies) {
        for (const genre of movie.genres) {
          // update the map with the review
          if (genreMap.has(genre.id)) {
            const curGenreMapVal = genreMap.get(genre.id);
            if (curGenreMapVal) {
              curGenreMapVal.reviews.push(movie.score);
            }
          }
        }
      }
      // find the highest average rating
      // const max = data.reduce(function(prev, current) {
      //   return (prev && prev.y > current.y) ? prev : current
      // })

      const maxGenres: GenreReview[] = [];
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
      return max;
    };

    const sortMovies = (movieList: MovieClubDataType[]) => {
      return movieList.sort((a, b) => {
        if (a.rank === undefined || b.rank === undefined) {
          return a.runtime - b.runtime; //lol why
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

    const myCountries = new Map<string, Country>(); // should be a map

    for (const movie of movies) {
      for (const shortCountryCode of movie.origin_country) {
        // console.log("country:", country);
        const iso3CountryCode = getCountryISO3(shortCountryCode);
        if (myCountries.has(iso3CountryCode)) {
          //trust me its not null
          const currentVal: Country = myCountries.get(iso3CountryCode)!;
          currentVal.count += 1;
          currentVal.movies = sortMovies([...currentVal.movies, movie]);
          if (currentVal.name !== "ignore") {
            myCountries.set(iso3CountryCode, currentVal);
          }
        } else {
          myCountries.set(iso3CountryCode, {
            id: iso3CountryCode,
            name: countries.getName(iso3CountryCode, "en", {
              select: "official",
            }),
            movies: [movie],
            count: 1,
            avg_score: -1,
            rank: -1,
            best_genre: { name: "", reviews: [], avg_review: 0 },
          } as Country);
        }
      }
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

    // sort all the movies

    // loop through mycountries

    // lol this is so dodgy, I should definitely like set the values and get them with the keys
    for (const [key, countryWithStats] of myCountries) {
      countryWithStats.avg_score =
        countryWithStats.movies.reduce((acc, movie) => acc + movie.score, 0) /
        countryWithStats.movies.length;
      countryWithStats.best_genre = findTopGenre(countryWithStats.movies);
    }
    // const entries = Array.from(myCountries.entries());
    const sortedEntries = Array.from(myCountries.entries()).sort(
      ([, country1], [, country2]) => country2.avg_score - country1.avg_score
    );

    sortedEntries.forEach(([key, player], index) => {
      myCountries.set(key, { ...player, rank: index + 1 });
    });

    // console.log("myCountries", myCountries);

    setcountriesMap(myCountries);

    setCountriesList(
      Array.from(myCountries.values()).sort(
        (country1, country2) => country2.avg_score - country1.avg_score
      )
    );
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
      // console.log("reviewerName: ", reviewerName);
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
    // rank
    // get the ranks for each map entry

    // set the rows to the values
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "89vh",
        alignItems: "center",
        paddingTop: "10px",
        gap: "1em",
        backgroundColor: theme.palette.background.stats,
      }}
    >
      <Typography
        variant="h3"
        fontSize="1.8em"
        color={theme.palette.primary.main}
      >
        {" "}
        Movie Map
      </Typography>
      <MovieLocationMap countryList={countriesMap} />
      <Typography
        variant="h3"
        fontSize="1.8em"
        color={theme.palette.primary.main}
      >
        Country Stats
      </Typography>
      <TableContainer component={Paper} sx={{ width: "90vw" }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Rank </TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="center">Watched</TableCell>
              <TableCell align="center">Avg Review</TableCell>
              <TableCell align="center">Fav Genre</TableCell>
              {/* <TableCell align="right">Avg Suggested</TableCell> */}
              {/* <TableCell align="right">Streak</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {countriesList.map((row) => (
              <TableRow
                key={row.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="left">{row.rank}</TableCell>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="center">{row.count}</TableCell>
                <TableCell align="center">{row.avg_score.toFixed(2)}</TableCell>
                <TableCell align="center">{row.best_genre.name}</TableCell>
                {/* <TableCell align="right">
                  {row..toFixed(2)}
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography
        variant="h3"
        fontSize="1.8em"
        color={theme.palette.primary.main}
      >
        Member Stats
      </Typography>
      <TableContainer component={Paper} sx={{ width: "90vw" }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Rank </TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="center">Watched</TableCell>
              <TableCell align="center">Avg Review</TableCell>
              <TableCell align="center">Fav Genre</TableCell>
              <TableCell align="center">Avg Suggested</TableCell>
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
                <TableCell align="center">{row.watched}</TableCell>
                <TableCell align="center">
                  {row.avg_review.toFixed(2)}
                </TableCell>
                <TableCell align="center">{row.fav_genre}</TableCell>
                <TableCell align="center">
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
