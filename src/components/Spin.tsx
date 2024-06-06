import { Box, Typography, TextField } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import anime from "animejs";
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { JWT } from "google-auth-library";
import creds from "../.config/movie-club-394513-ccb57476d1f7.json";
import { GOOGLE_SHEET_ID } from "../.config/google-sheets";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { Login } from "./Login";
import {
  ReviewType,
  MovieDetailsFromApi,
  MovieClubDataType,
  GenreType,
  MoviePage,
  Director,
  Suggestion,
  BaseMovie,
  DetailedSearchResult,
} from "../types";

import { SearchResult } from "./SearchResult";

import { useContext } from "react";
import { options } from "../.config/tmdb-options";
import { AuthContext } from "../AuthContext";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

//set a textrotation in this spinner
interface Segment {
  color: string;
  radius: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  text: string;
  textAngle: number;
}

interface Center {
  rx: number;
  ry: number;
}

interface SpinnerProps {
  segments: number;
  winner: string;
  setWinner: React.Dispatch<React.SetStateAction<string>>;
  movieSuggestions: Array<string>;
  width: number;
  height: number;
  circleRadius: number;
}

const Spinner = ({
  segments,
  winner,
  setWinner,
  movieSuggestions,
  width,
  height,
  circleRadius,
}: SpinnerProps) => {
  const spinnerRef = useRef(null); // Renamed from svgRef to spinnerRef
  const [rotation, setRotation] = useState(0);
  // const circleRadius = 200;
  const centre: Center = { rx: width / 2, ry: height / 2 };
  const theme = useTheme();
  // const width = 600;
  // const height = 600;

  const cursor = {
    x: centre.rx + (7 * circleRadius) / 8,
    y: centre.rx - circleRadius / 8,
  };

  const findWinner = (degrees: number) => {
    if (segments === 0) {
      // setWinner();
      return;
    }
    const winningAngle =
      (Math.atan((cursor.y - centre.ry) / (cursor.x - centre.rx)) * 180) /
      Math.PI;
    const segmentSize = 360 / segments;
    const angleRotated = degrees % 360;
    // console.log("over!", degrees % 360);
    const segmentSelected =
      segments - Math.floor((angleRotated - winningAngle) / segmentSize) - 1;
    // console.log("winner is: ", movieSuggestions[segmentSelected]);
    // so we go round the circle backwards in radians..........
    // this means that
    // "#e6194B", // Red
    // "#3cb44b", // Green
    // "#ffe119", // Yellow
    setWinner(movieSuggestions[segmentSelected]);

    return movieSuggestions[segmentSelected];
  };

  const spinTheWheel = () => {
    if (segments === 0) {
      // console.log("why are you spinning this");
      return;
    }
    const degrees = 360 * 3 + rotation + Math.random() * 360;
    setRotation(degrees);
    // setIsRotating(true);
    anime({
      targets: spinnerRef.current,
      rotate: `${degrees}deg`,
      duration: 3000,
      easing: "easeOutQuad",
      loop: false, // Ensure the animation does not loop
      autoplay: false,
      complete: function () {
        findWinner(degrees);
      },
    }).play(); // Play the animation immediately
  };
  const segmentCoords: Segment[] = [];

  const getCircleX = (radians: number) => {
    return Math.round(Math.cos(radians) * circleRadius);
  };

  const getCircleY = (radians: number) => {
    return Math.round(Math.sin(radians) * circleRadius);
  };

  const getColor = (value: number) => {
    const colors = [
      "#02253B", // Prussian blue
      "#6B0504", // Blood red
      "#006DA3", // Bice Blue
      "#800020", // Brunswick green
      "#400A4C", // Russian Violet
      "#654321", // Dark Brown
      "#301934", // Deep Purple
      "#191970", // Midnight Blue
      "#556B2F", // Olive Green
      "#6A5ACD", // Slate Blue
      "#800000", // Maroon
    ];
    if (value < colors.length) {
      return colors[value];
    }
    //otherwise random
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };

  for (let i = 0; i < segments; i++) {
    const circleX = getCircleX((i * 2 * Math.PI) / segments);
    const circleY = getCircleY((i * 2 * Math.PI) / segments);
    const newSegment: Segment = {
      color: getColor(i),
      radius: circleRadius,
      startX: centre.rx + getCircleX((i * 2 * Math.PI) / segments),
      startY: centre.ry + getCircleY((i * 2 * Math.PI) / segments),
      endX: centre.rx + getCircleX(((i + 1) * 2 * Math.PI) / segments),
      endY: centre.rx + getCircleY(((i + 1) * 2 * Math.PI) / segments),
      text: movieSuggestions[i],
      textAngle: 360 / segments / 2 + i * (360 / segments),
    };
    segmentCoords.push(newSegment);
  }

  return (
    <svg
      width={width}
      height={height}
      style={{
        cursor: "pointer",
      }}
      onClick={() => {
        spinTheWheel();
      }}
    >
      <g id="spinner" ref={spinnerRef} style={{ transformOrigin: "50% 50%" }}>
        {segments > 1 ? (
          segmentCoords.map((segment: Segment, key: number) => {
            return (
              <g key={key}>
                <path
                  d={`M ${segment.startX} ${segment.startY} A ${circleRadius} ${circleRadius} 1 0 1 ${segment.endX} ${segment.endY} L ${centre.rx} ${centre.ry} Z`}
                  fill={segment.color}
                />
                {/* TODO move this to the outside */}
                <text
                  x={centre.rx + centre.rx / 10}
                  y={centre.ry}
                  fill={theme.palette.primary.main}
                  transform={`rotate(${segment.textAngle}, ${centre.rx}, ${centre.ry})`}
                  dominantBaseline="central"
                >
                  {segment.text}
                </text>
              </g>
            );
          })
        ) : (
          <g>
            <circle
              cx={centre.rx}
              cy={centre.ry}
              r={circleRadius}
              fill={getColor(0)}
            />
            <text
              x="330"
              y="300"
              // transform={`rotate(${segment.textAngle}, ${centre.rx}, ${centre.ry})`}
              dominantBaseline="central"
            >
              {movieSuggestions.length === 1 ? movieSuggestions[0] : ""}
            </text>
          </g>
        )}
      </g>
      {/* radius is 300, 300 */}
      {/* rx + 7 * radius/ 8 * */}
      {/* 275 */}
      <path
        d={`M${cursor.x} ${cursor.y} l ${(3 * circleRadius) / 8} -25 v ${
          circleRadius / 4
        } Z`}
        fill="gray"
        stroke="black"
        strokeWidth="1"
      />
    </svg>
  );
};

export const Spin = () => {
  const authContext = useContext(AuthContext);
  const [isOpen, setOpen] = React.useState(false);
  const initialized = useRef(false);
  const [winner, setWinner] = useState("");
  const [textFieldSuggestions, setTextFieldSuggestions] = useState("");
  const [nextWeek, setNextWeek] = useState("");
  const [guesses, setGuesses] = useState<DetailedSearchResult[]>([]);
  const theme = useTheme();
  //TODO get rid of this one and use the one below it
  const [movieSuggestions, setmovieSuggestions] = useState<Array<string>>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  //TODO fix the login component to not need this
  const [showLogin, setShowLogin] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const jwt = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES,
  });

  const addMovieToList = async (movieDetails: BaseMovie, suggestor: string) => {
    if (!movieDetails) return;
    const title = `${movieDetails.title} (${
      movieDetails.release_date.split("-")[0]
    })`;

    console.log("movieDetails:", movieDetails);

    // read the list incase someone else has added a row inbetween
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo(); // loads document properties and worksheets
    const movieSheet = doc.sheetsByTitle["Movies"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    const movieRows = await movieSheet.getRows({ limit: 300 });
    await movieSheet.loadCells("A1:C300");
    const url =
      "https://api.themoviedb.org/3/find/" +
      movieDetails.id +
      "?external_source=imdb_id";
    const external_ids = await fetch(url, options).then((data) => data.json());

    for (const [index, row] of movieRows.entries()) {
      if (index < 2) {
        continue;
      }
      if (row.get("Title") === "" || row.get("Title") === undefined) {
        const userCell = await movieSheet.getCell(index + 1, 0);
        userCell.value = suggestor;
        const titleCell = await movieSheet.getCell(index + 1, 1);
        titleCell.value = title;
        titleCell.textFormat = { bold: true };
        const imdbCell = await movieSheet.getCell(index + 1, 2);
        imdbCell.value = `https://www.imdb.com/title/${external_ids.imdb_id}/`;
        break;
      }
    }
    movieSheet.saveUpdatedCells();

    return;

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

  const getNextWeeksMovie = async () => {
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["Movies"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    const rows = await sheet.getRows({ limit: 18 });
    await sheet.loadCells("N1:N18");
    // just load the suggestions row titles
    // console.log("wow");

    //for (const [index, item] of array.entries()) do this at some point
    let i = 1;
    for (const [index, row] of rows.entries()) {
      // console.log("row: ", row);
      if (i === 1) {
        i++;
        continue;
      }
      if (
        row.get("Suggestions") === "" ||
        row.get("Suggestions") === undefined ||
        row.get("Next Month") === "" ||
        row.get("Next Month") === undefined
      ) {
        i++;
        continue;
      }
      console.log("i", i);
      if (i > 7 && i < 20) {
        // console.log("in");
        const cell = await sheet.getCell(i, 13);
        // console.log("cell:", cell.value);
        //if its bold
        if (cell.textFormat.bold === true) {
          // console.log(cell.value);
          setNextWeek(cell.value ? cell.value.toString() : "");
        }
      }
      i++;
    }
    return;
  };

  const getSuggestionsFromSheets = async () => {
    // setSheetsLoading(true);
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["Movies"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    const rows = await sheet.getRows({ limit: 18 });
    const sheetSuggestions: Suggestion[] = [];
    // just load the suggestions row titles

    for (const row of rows) {
      if (
        row.get("Suggestions") === "" ||
        row.get("Suggestions") === undefined ||
        row.get("Next Month") === "" ||
        row.get("Next Month") === undefined
      ) {
        continue;
      }

      sheetSuggestions.push({
        suggestor: row.get("Suggestions"),
        title: row.get("Next Month"),
      });
      // console.log(`row:`, row);
    }
    setSuggestions([...sheetSuggestions]);
    setmovieSuggestions(
      sheetSuggestions.map((suggestion: Suggestion) => suggestion.title)
    );
    setTextFieldSuggestions(
      sheetSuggestions
        .map((suggestion: Suggestion) => suggestion.title)
        .join(`\n`)
    );
    return;
  };

  const getSuggestions = () => {
    getSuggestionsFromSheets();
  };

  const setMovieAsWinner = async () => {
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["Movies"]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    const rows = await sheet.getRows({ limit: 18 });
    await sheet.loadCells("A1:Z30");
    const sheetSuggestions: Suggestion[] = [];
    let i = 1;
    for (const row of rows) {
      if (i === 1) {
        i++;
        continue;
      }
      if (row.get("Next Month") === "" || row.get("Next Month") === undefined) {
        i++;
        continue;
      }
      if (row.get("Next Month") === winner) {
        const nextMonthCell = await sheet.getCell(i, 13);
        nextMonthCell.textFormat = { bold: true };
      } else {
        const loserCell = await sheet.getCell(i, 13);
        loserCell.textFormat = { bold: false };
      }
      i++;
    }
    sheet.saveUpdatedCells();
    // setOpen(false);
    return;
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getSuggestionsFromSheets();
    }
  }, []);
  useEffect(() => {
    if (isOpen === true) return;
    setWinner("");
  }, [isOpen]);
  useEffect(() => {
    if (winner === "") return;
    setOpen(true);
    // call the api and set the guesses here
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
      const newSearchResults: DetailedSearchResult[] = [];
      for (const result of results.results) {
        console.log(result);
        newSearchResults.push({
          id: result.id,
          title: result.title,
          poster_path: result.poster_path,
          release_date: result.release_date,
        });
      }
      setGuesses([...newSearchResults]);
    };
    if (winner) {
      searchApi(winner);
    } else {
      setGuesses([]);
    }
  }, [winner]);

  useEffect(() => {
    console.log("guesses", guesses);
  }, [guesses]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "90vh",
        backgroundColor: theme.palette.background.default,
        color: "whiteSmoke",
        paddingTop: "5vh",
        paddingBottom: { xs: "10vh", md: "0vh" },
      }}
    >
      {" "}
      <Typography variant="h1"> Spin the wheel</Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: "4em",
          // flexWrap: "wrap",
        }}
      >
        {/* hack for a smaller one */}
        <Box
          sx={{ minHeight: "200px", display: { xs: "none", sm: "block" } }}
          onClick={() => {
            setGuesses([]);
          }}
        >
          <Spinner
            segments={movieSuggestions.length}
            movieSuggestions={movieSuggestions}
            winner={winner}
            setWinner={setWinner}
            width={600}
            height={600}
            circleRadius={200}
          ></Spinner>
        </Box>
        <Box sx={{ minHeight: "200px", display: { xs: "block", sm: "none" } }}>
          <Spinner
            segments={movieSuggestions.length}
            movieSuggestions={movieSuggestions}
            winner={winner}
            setWinner={setWinner}
            width={400}
            height={400}
            circleRadius={180}
          ></Spinner>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {/* <Button
            onClick={getNextWeeksMovie}
            sx={{ marginBottom: "2em" }}
            variant="outlined"
          >
            {" "}
            Get Next Week
          </Button> */}
          <Button
            onClick={getSuggestions}
            sx={{ marginBottom: "2em" }}
            variant="outlined"
          >
            {" "}
            Get Suggestions
          </Button>
          <TextField
            id="movieSuggestions"
            label="movieSuggestions"
            variant="outlined"
            value={textFieldSuggestions}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setTextFieldSuggestions(event.target.value);
              setmovieSuggestions(
                event.target.value.split("\n").filter((word) => word !== "")
              );
            }}
            sx={{ minWidth: "400px" }}
            multiline
          />
          <Dialog
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Winner!!"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                <Typography variant="body1">The winner is {winner} </Typography>
                {!authContext.isAuthenticated && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1em",
                    }}
                  >
                    <Typography variant="body1">Login to Add Movie</Typography>
                    <Login setShowLogin={setShowLogin} />
                  </Box>
                )}
                {authContext.isAuthenticated &&
                  guesses.map((result, index) => {
                    return (
                      <Box
                        key={index}
                        onClick={(e) => {
                          setMovieAsWinner();
                          console.log(result);
                          // export interface BaseMovie {
                          //   imdb_id: string;
                          //   title: string;
                          //   release_date: string;
                          // }
                          // console.log(
                          //   suggestions.find(
                          //     (element: Suggestion) => element.title === winner
                          //   )?.suggestor ?? "No Idea"
                          // );
                          addMovieToList(
                            {
                              id: result.id as number,
                              title: result.title as string,
                              release_date: result.release_date as string,
                            } as BaseMovie,
                            suggestions.find(
                              (element: Suggestion) => element.title === winner
                            )?.suggestor ?? "No Idea"
                          );
                          setOpen(false);
                          e.preventDefault();
                        }}
                      >
                        <SearchResult
                          result={result}
                          noNav={true}
                        ></SearchResult>
                      </Box>
                    );
                  })}
              </DialogContentText>
              {/* guesses */}
            </DialogContent>
            <DialogActions>
              {/* <Button
                onClick={setMovieAsWinner}
                // TODO enable this
                // disabled={!authContext.isAuthenticated}
              >
                Add movie
              </Button> */}
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
          {/* showGuesses */}
        </Box>
      </Box>
    </Box>
  );
};
