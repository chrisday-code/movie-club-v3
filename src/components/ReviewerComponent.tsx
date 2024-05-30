import {
  ReviewType,
  MovieDetailsFromApi,
  MovieClubDataType,
  GenreType,
  MoviePage,
  Director,
  Result,
} from "../types";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Grow,
  IconButton,
  Button,
} from "@mui/material";
import { JWT } from "google-auth-library";
import { options } from "../.config/tmdb-options";
import creds from "../.config/movie-club-394513-ccb57476d1f7.json";
import { GOOGLE_SHEET_ID } from "../.config/google-sheets";
import { GoogleSpreadsheet } from "google-spreadsheet";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckIcon from "@mui/icons-material/Check";
import { useContext } from "react";
import { AuthContext } from "../AuthContext";
import { authkey, validUsers } from "../.config/auth";
// import { useEffect } from "react";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

interface ReviewerProps {
  title?: string;
  review: ReviewType;
  movieDetails?: MoviePage;
}

export const ReviewerComponent = ({
  title,
  review,
  movieDetails,
}: ReviewerProps) => {
  const authContext = useContext(AuthContext);
  const [reviewField, setReviewField] = useState(review.rating);

  const jwt = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES,
  });

  useEffect(() => {
    setReviewField(review.rating);
  }, [title]);

  // TODO move all of these into helper functions for the library
  const reviewMovie = async (reviewString: string) => {
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
    const reviewerIndex = reviewerOrder.get(review.reviewer)
      ? reviewerOrder.get(review.reviewer)
      : 0;
    if (!reviewerIndex) {
      // console.log("index wrong");
      return;
    }
    for (const [index, row] of movieRows.entries()) {
      if (index < 2) {
        continue;
      }
      if (
        row.get("Imdb") ===
        `https://www.imdb.com/title/${movieDetails.imdb_id}/`
      ) {
        // console.log("found the movie", row.get("Title"));
        const reviewCell = await movieSheet.getCell(index + 1, reviewerIndex);
        reviewCell.value = reviewString;
        break;
      }
    }
    movieSheet.saveUpdatedCells();
    // console.log("done movies");
  };
  // Make this uneditable by default and then click some icon to switch it to edit mode, only available when logged in
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: { xs: "180px", md: "250px" },
      }}
    >
      {/* TODO maybe these get bigger on click */}
      <TextField
        id="options"
        label={review.reviewer}
        variant="outlined"
        value={reviewField}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setReviewField(event.target.value);
        }}
      />
      <IconButton
        aria-label="delete"
        size="medium"
        disabled={!authContext.isAuthenticated}
        onClick={() => {
          reviewMovie(reviewField);
          console.log(reviewField);
        }}
      >
        <CheckIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
};
