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
import {
  ReviewType,
  MovieDetailsFromApi,
  MovieClubDataType,
  GenreType,
  MoviePage,
  Director,
  Suggestion,
} from "../types";
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
  options: Array<string>;
  width: number;
  height: number;
  circleRadius: number;
}

const Spinner = ({
  segments,
  winner,
  setWinner,
  options,
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
    // console.log("winner is: ", options[segmentSelected]);
    // so we go round the circle backwards in radians..........
    // this means that
    // "#e6194B", // Red
    // "#3cb44b", // Green
    // "#ffe119", // Yellow
    setWinner(options[segmentSelected]);

    return options[segmentSelected];
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
      text: options[i],
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
              {options.length === 1 ? options[0] : ""}
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
  const [isOpen, setOpen] = React.useState(false);
  const initialized = useRef(false);
  const [winner, setWinner] = useState("");
  const [textFieldSuggestions, setTextFieldSuggestions] = useState("");
  const [nextWeek, setNextWeek] = useState("");
  const theme = useTheme();
  const [options, setOptions] = useState<Array<string>>([]);

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
    setOptions(
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
    setOpen(false);
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
  }, [winner]);

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
        <Box sx={{ minHeight: "200px", display: { xs: "none", sm: "block" } }}>
          <Spinner
            segments={options.length}
            options={options}
            winner={winner}
            setWinner={setWinner}
            width={600}
            height={600}
            circleRadius={200}
          ></Spinner>
        </Box>
        <Box sx={{ minHeight: "200px", display: { xs: "block", sm: "none" } }}>
          <Spinner
            segments={options.length}
            options={options}
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
            id="options"
            label="Options"
            variant="outlined"
            value={textFieldSuggestions}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setTextFieldSuggestions(event.target.value);
              setOptions(
                event.target.value.split("\n").filter((word) => word !== "")
              );
            }}
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
                The winner is {winner}!
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={setMovieAsWinner}>Set as Next Week</Button>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};
