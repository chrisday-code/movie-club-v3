import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Grow,
  IconButton,
  Button,
} from "@mui/material";
import { Score } from "./Score";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import {
  ReviewType,
  MovieDetailsFromApi,
  MovieClubDataType,
  GenreType,
  MoviePage,
  Director,
  Result,
} from "../types";
import { useParams } from "react-router-dom";
import { JWT } from "google-auth-library";
import { options } from "../.config/tmdb-options";
import creds from "../.config/movie-club-394513-ccb57476d1f7.json";
import { GOOGLE_SHEET_ID } from "../.config/google-sheets";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { FaTrophy } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { IconContext } from "react-icons";
import AddIcon from "@mui/icons-material/Add";

import { PiSpinnerBall } from "react-icons/pi";
import PieChartIcon from "@mui/icons-material/PieChart";
import PlaylistAdd from "@mui/icons-material/PlaylistAdd";
import { Loader } from "./Loader";
import { ReviewerComponent } from "./ReviewerComponent";

import { useContext } from "react";
import { AuthContext } from "../AuthContext";

// context

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export const Movie = () => {
  const authContext = useContext(AuthContext);
  const theme = useTheme();
  const params = useParams();
  const [sheetsLoading, setSheetsLoading] = useState(true);
  const [tmdbLoading, setTmdbLoading] = useState(true);
  const [nextWeek, setNextWeek] = useState("");
  const [loading, setLoading] = useState(true);
  const [movieId, setMovieId] = useState(0); // TODO remove this to make the next week thingy work 414906
  const [movieFromApi, setMovieDetailsApi] = useState<MovieDetailsFromApi>();
  const initialized = useRef(false);
  // this should probably be a map
  const [movieClubMovies, setMovieClubMovies] = useState<
    Array<MovieClubDataType>
  >([]);
  const [movieDetails, setMovieDetails] = useState<MoviePage>();
  const jwt = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES,
  });
  //some sort of combined type

  // get the sheets the first time the thing is loaded
  // idk do I want to make this a map with tmdb as key?

  useEffect(() => {
    if (params.id) {
      setMovieId(Number(params.id));
    }
    if (!initialized.current) {
      initialized.current = true;
      // const jwt = new JWT({
      //   email: creds.client_email,
      //   key: creds.private_key,
      //   scopes: SCOPES,
      // });

      const getDataFromSheets = async () => {
        setSheetsLoading(true);
        const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
        await doc.loadInfo(); // loads document properties and worksheets
        if (!movieId && !params.id) {
          const movieSheet = doc.sheetsByTitle["Movies"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
          const movieRows = await movieSheet.getRows({ limit: 18 });
          await movieSheet.loadCells("N1:N18");
          for (const [index, row] of movieRows.entries()) {
            // console.log("row: ", row);
            if (index < 5) {
              continue;
            }
            if (
              row.get("Suggestions") === "" ||
              row.get("Suggestions") === undefined ||
              row.get("Next Month") === "" ||
              row.get("Next Month") === undefined
            ) {
              continue;
            }
            // console.log("in");
            const cell = await movieSheet.getCell(index + 1, 13);
            if (cell.textFormat.bold === true) {
              // console.log(cell.value);
              setNextWeek(cell.value ? cell.value.toString() : "");
            }
          }
        }
        const sheet = doc.sheetsByTitle["computer"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
        const rows = await sheet.getRows();
        const sheetData: MovieClubDataType[] = [];
        for (const [index, row] of rows.entries()) {
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
        setMovieClubMovies(sheetData);
        // setLoading(false);
        setSheetsLoading(false);
        return;
      };
      getDataFromSheets();
    }
  }, []);

  useEffect(() => {
    // console.log("params", params);
    if (params.id) {
      setMovieId(Number(params.id));
    }
  }, [params]);

  useEffect(() => {
    const getMovie = async () => {
      setTmdbLoading(true);
      const url = `https://api.themoviedb.org/3/movie/${movieId}`;
      const movieFromApi = await fetch(url, options).then((data) =>
        data.json()
      );
      setMovieDetailsApi(movieFromApi);
      setTmdbLoading(false);
    };
    if (movieId != 0) {
      getMovie();
    }
  }, [movieId]);

  const searchApi = async (combinedTitle: string) => {
    const regex = /(.*) \((\d{4})\)/;
    // Execute the regex on the input string
    const match = combinedTitle.match(regex);
    if (!match) {
      return;
    }
    // Return the matched title and year as an array
    const title = match[1];
    const year = match[2];

    const url = `https://api.themoviedb.org/3/search/movie?query=${title}&include_adult=false&language=en-USprimary_release_year=${year}&page=1`;
    const results = await fetch(url, options).then((data) => data.json());
    if (results.results[0].id) {
      setMovieId(Number(results.results[0].id));
    }
  };

  useEffect(() => {
    if (!nextWeek || nextWeek === "") return;
    searchApi(nextWeek);
  }, [nextWeek]);

  //when you have both look for this
  const findMoviesData = async () => {
    if (movieClubMovies.length === 0) return;
    if (!movieFromApi || !movieFromApi.id) return;

    // const reviews:Array<ReviewType>

    const movieClubData = movieClubMovies.find((movie) => movie.id === movieId);
    // TODO add director and release date

    // tmdb_id: number;
    // title: string;
    // score: number;
    // rank: number;
    // poster_path?: string;
    // director?: string;
    // budget: number;
    // genres: Genre[];
    // release_date: string;
    // revenue: number;
    // runtime: number;
    // backdrop_path?: string;
    // reviews?: Array<ReviewType>;
    const directorCredits = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits`,
      options
    )
      .then((response) => response.json())
      .then((jsonData) =>
        jsonData.crew
          .filter((person: any) => person.job === "Director")
          .map((director: Director) => director.name)
      );
    // console.log("director:", directorCredits);

    const providers = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers`,
      options
    )
      .then((response) => response.json())
      .then((all) => all.results.AU);

    const newMovieDetails: MoviePage = {
      tmdb_id: movieFromApi.id,
      title: movieFromApi.title,
      poster_path: movieFromApi.poster_path,
      reviews: movieClubData ? movieClubData.reviews : [],
      rank: movieClubData ? movieClubData.rank : 0,
      score: movieClubData ? movieClubData.score : 0,
      director: directorCredits,
      suggestor: movieClubData ? movieClubData.suggestor : "",
      budget: movieFromApi.budget,
      genres: movieFromApi.genres,
      release_date: movieFromApi.release_date,
      revenue: movieFromApi.revenue,
      runtime: movieFromApi.runtime,
      backdrop_path: movieFromApi.backdrop_path,
      overview: movieFromApi.overview,
      providers: providers,
      imdb_id: movieFromApi.imdb_id ? movieFromApi.imdb_id : "",
    };
    // director?: string,
    // reviews?: Array<ReviewType>}
    // console.log(newMovieDetails);

    setMovieDetails(newMovieDetails);
  };

  useEffect(() => {
    if (movieClubMovies.length === 0 || !movieFromApi) return;
    // console.log("both are heree");
    findMoviesData();
  }, [movieFromApi, movieClubMovies]);

  useEffect(() => {
    if (tmdbLoading || sheetsLoading) {
      setLoading(true);
      return;
    }
    setLoading(false);
  }, [tmdbLoading, sheetsLoading]);

  // TODO make another one of these that adds to the id list
  const addSuggestionToSheet = async (id: number) => {
    if (!movieDetails) return;
    const newSuggestion = `${movieDetails.title} (${
      movieDetails.release_date.split("-")[0]
    })`;
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["Movies"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    const movieRows = await sheet.getRows({ limit: 18 });
    await sheet.loadCells("N1:N18");
    for (const [index, row] of movieRows.entries()) {
      if (index < 5) {
        continue;
      }
      if (
        row.get("Suggestions") === "" ||
        row.get("Suggestions") === undefined
      ) {
        continue;
      }
      if (row.get("Suggestions") === authContext.user) {
        const cell = await sheet.getCell(index + 1, 13);
        cell.value = newSuggestion;
      }
    }
    sheet.saveUpdatedCells();
    // this one adds it to the list
  };

  // TODO add to the computer sheet as well
  const addMovieToList = async () => {
    if (!movieDetails) return;
    const title = `${movieDetails.title} (${
      movieDetails.release_date.split("-")[0]
    })`;
    // read the list incase someone else has added a row inbetween
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo(); // loads document properties and worksheets
    const movieSheet = doc.sheetsByTitle["Movies"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    const movieRows = await movieSheet.getRows({ limit: 300 });
    await movieSheet.loadCells("A1:C300");
    for (const [index, row] of movieRows.entries()) {
      if (index < 2) {
        continue;
      }
      if (row.get("Title") === "" || row.get("Title") === undefined) {
        const userCell = await movieSheet.getCell(index + 1, 0);
        userCell.value = authContext.user;
        const titleCell = await movieSheet.getCell(index + 1, 1);
        titleCell.value = title;
        titleCell.textFormat = { bold: true };
        const imdbCell = await movieSheet.getCell(index + 1, 2);
        imdbCell.value = `https://www.imdb.com/title/${movieDetails.imdb_id}/`;
        break;
      }
    }
    movieSheet.saveUpdatedCells();

    //does the computer bit
    const sheet = doc.sheetsByTitle["computer"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    const rows = await sheet.getRows();
    let i = 1;
    await sheet.loadCells("A1:Z300");
    // do the [object, index ] of array.entries() here instead
    for (const row of rows) {
      if (i === 1) {
        i++;
        continue;
      }
      if (row.get("Poster")) {
        i++;
        continue;
      }
      let tmdbId = row.get("Tmdb");
      const imdburl = row.get("Imdb");
      if (tmdbId === "" && imdburl === "") {
        i++;
        continue;
      }
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
        // console.log(row.get("Title"));
        // console.log(movies.movie_results[0].id);
        tmdbId = movies.movie_results[0].id;
        const tmdbCell = await sheet.getCell(i, 3);
        tmdbCell.value = movies.movie_results[0].id;
      }

      const url = `https://api.themoviedb.org/3/movie/${tmdbId}`;
      const movie = await fetch(url, options).then((data) => data.json());
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
        return `{"id": ${val.id}, "name": "${val.name}"}`;
      });
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
    sheet.saveUpdatedCells();
    return;
  };

  const reviewMovie = async (name: string, review: string) => {
    // TODO think about processing the string
    // add this as a review
    if (!movieDetails) return;
    // const title = `${movieDetails.title} (${
    //   movieDetails.release_date.split("-")[0]
    // })`;
    // console.log("clicked: ", title);
    const reviewerOrder = new Map<string, number>();

    reviewerOrder.set("Chris", 4);
    reviewerOrder.set("Reuben", 5);
    reviewerOrder.set("Abhinav", 6);
    reviewerOrder.set("Hamish", 7);
    reviewerOrder.set("Mystery", 8);

    // read the list incase someone else has added a row inbetween
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo(); // loads document properties and worksheets
    const movieSheet = doc.sheetsByTitle["Movies"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    const movieRows = await movieSheet.getRows({ limit: 300 });
    await movieSheet.loadCells("A1:I300");
    const reviewerIndex = reviewerOrder.get(authContext.user)
      ? reviewerOrder.get(authContext.user)
      : 0;
    if (!reviewerIndex) {
      // console.log("index wrong");
      return;
    }
    for (const [index, row] of movieRows.entries()) {
      if (index < 2) {
        continue;
      }
      // imdbCell.value = `https://www.imdb.com/title/${movieDetails.imdb_id}/`;
      if (
        row.get("Imdb") ===
        `https://www.imdb.com/title/${movieDetails.imdb_id}/`
      ) {
        // console.log("found the movie", row.get("Title"));
        const reviewCell = await movieSheet.getCell(index + 1, reviewerIndex);
        reviewCell.value = review;
        break;
      }
    }
    movieSheet.saveUpdatedCells();
    // console.log("done movies");
  };

  const renderReviews = (reviews?: Array<ReviewType>, title?: string) => {
    if (!reviews || reviews.length === 0) {
      return <Box>no reviews</Box>;
    }
    //the length of the array doesn't change so nothing changes
    return (
      <Box
        sx={{
          width: "100%",
          marginTop: "1em",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          flexWrap: "wrap",
          rowGap: "1em",
          columnGap: "0em",
        }}
      >
        {reviews.map((review: ReviewType, index: number) => {
          return (
            <ReviewerComponent
              title={movieDetails?.title ?? ""}
              key={index}
              review={review}
              movieDetails={movieDetails}
            />
          );
        })}
      </Box>
    );
  };

  const renderSubtitle = (
    directors: string[],
    release_date: string,
    runtime: number,
    suggestor: string
  ) => {
    return (
      <Typography variant="h3" sx={{ marginBottom: "5px" }}>
        {directors.map((director: string) => director)} -{" "}
        {release_date.split("-")[0]} -{" "}
        {`${Math.floor(runtime / 60)}h ${runtime % 60}m`} - {suggestor}
      </Typography>
    );
  };

  const StreamingOption = ({ service }: any) => {
    return (
      <Box
        component="img"
        src={"https://image.tmdb.org/t/p/original/" + service.logo_path}
        alt={service.provider_name}
        title={service.provider_name}
        sx={{
          width: { xs: "40px", sm: "40px" },
          borderRadius: "3px",
          margin: "2px",
        }}
      ></Box>
    );
  };

  const renderBuying = (providers: any) => {
    // console.log("providers:", providers);
    if (!providers) {
      return <Box>no clue where to buy</Box>;
    }
    if (!providers.buy || providers.buy.length === 0) {
      return <Box> can't buy?</Box>;
    }
    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h4" fontSize="1em">
          Buy
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            margin: "5px 5px 5px 0px",
          }}
        >
          {providers.buy.map((service: any, key: number) => {
            return <StreamingOption key={key} service={service} />;
          })}
        </Box>
      </Box>
    );
  };

  //TODO there's no way these can't be combined
  const renderStreaming = (providers: any) => {
    // console.log("providers:", providers);
    if (!providers) {
      return <Box>no clue where to rent</Box>;
    }
    if (!providers.flatrate || providers.flatrate.length === 0) {
      return <Box> can't stream?</Box>;
    }
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Typography variant="h4" fontSize="1em">
          Stream
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            margin: "5px 5px 5px 0px",
          }}
        >
          {providers.flatrate.map((service: any, key: number) => {
            return <StreamingOption key={key} service={service} />;
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "5vh",
        // marginBottom: "10vh",
        minHeight: "90vh",
        color: `${theme.palette.primary.main}`,
        backgroundColor: `${theme.palette.background.default}`,
      }}
    >
      {/* box for the images and the streaming locations */}
      {loading && <Loader />}
      {movieDetails && !loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            border: "2px solid",
            borderRadius: "5px",
            padding: "1rem",
            marginBottom: "10vh",
            background: `linear-gradient(
        rgba(0, 0, 0, 0.8), 
        rgba(0, 0, 0, 0.8)
      ),url(
        'https://image.tmdb.org/t/p/original/${movieDetails.backdrop_path}')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            maxWidth: "900px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", sm: "row" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Box
                component="img"
                src={
                  "https://image.tmdb.org/t/p/original/" +
                  movieDetails.poster_path
                }
                alt={movieDetails.title}
                sx={{
                  borderRadius: "2%",
                  marginRight: { xs: "10px", sm: "20px" },
                  marginBottom: "10px",
                  height: { xs: "200px", sm: "200px", md: "300px" },
                }}
              ></Box>

              {renderStreaming(movieDetails.providers)}
              {renderBuying(movieDetails.providers)}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography variant="h2" sx={{ marginBottom: "5px" }}>
                  {movieDetails.title}
                </Typography>
                <Box>
                  <IconButton
                    aria-label="delete"
                    size="large"
                    disabled={!authContext.isAuthenticated}
                    onClick={() => {
                      addSuggestionToSheet(movieDetails.tmdb_id);
                    }}
                  >
                    <PiSpinnerBall fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    size="large"
                    disabled={!authContext.isAuthenticated}
                    onClick={() => {
                      addMovieToList();
                    }}
                  >
                    <PlaylistAdd fontSize="inherit" />
                  </IconButton>
                </Box>
              </Box>

              {/* <Typography variant="h3"> */}
              {renderSubtitle(
                movieDetails.director,
                movieDetails.release_date,
                movieDetails.runtime,
                movieDetails.suggestor
              )}
              {/* </Typography> */}
              {movieDetails.rank !== 0 && movieDetails.rank !== -1 && (
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  gap={0.5}
                  marginTop={"5px"}
                >
                  <IconContext.Provider value={{ color: "gold" }}>
                    <FaTrophy />
                  </IconContext.Provider>
                  <Typography variant="caption" sx={{ marginRight: "5%" }}>
                    {movieDetails.rank}
                  </Typography>
                  <IconContext.Provider value={{ color: "white" }}>
                    <FaStar />
                  </IconContext.Provider>
                  <Typography variant="caption">
                    {movieDetails.score.toFixed(2)}
                  </Typography>
                </Box>
              )}
              <Typography variant="body1">{movieDetails.overview}</Typography>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                {renderReviews(movieDetails.reviews, movieDetails.title)}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            {renderReviews(movieDetails.reviews, movieDetails.title)}
          </Box>
        </Box>
      )}
    </Box>
  );
};
