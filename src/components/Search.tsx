import { Box, Typography, Grid } from "@mui/material";
import { SearchResult } from "./SearchResult";
import { useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { searchTMDB } from "../helpers/tmdbapis";
import { DetailedSearchResult } from "../types";
import { options } from "../.config/tmdb-options";
import { Loader } from "./Loader";

import { useState, useEffect, useRef } from "react";

// TODO think about adding suspense
export const Search = () => {
  const theme = useTheme();
  const params = useParams();
  const [searchResults, setSearchResults] = useState<DetailedSearchResult[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // console.log("params", params);
    const searchApi = async (query: string) => {
      if (query === "") {
        setSearchResults([]);
      }
      const url = `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`;
      const results = await fetch(url, options).then((data) => data.json());
      // console.log("movies,", results);
      let i = 0;
      const newSearchResults: DetailedSearchResult[] = [];
      for (const result of results.results) {
        newSearchResults.push({
          id: result.id,
          title: result.title,
          poster_path: result.poster_path,
          release_date: result.release_date,
        });
        // i++;
      }
      console.log("results.results:", results.results);
      setSearchResults([...newSearchResults]);
    };
    if (params.query) {
      searchApi(params.query);
      // setResults(searchTMDB(params.query));
      // console.log(searchTMDB(params.query));
      //call the movies API for the search term
    }
  }, [params]);

  useEffect(() => {
    setLoading(false);
  }, [searchResults]);

  // loop through search results

  return (
    <Box
      bgcolor={theme.palette.background.navbar}
      color={theme.palette.primary.main}
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: "2%",
        minHeight: "89vh",
      }}
    >
      {/* <Typography
        variant="h2"
        color={theme.palette.primary.main}
        sx={{ paddingBottom: "1em" }}
      >
        Search for a movie
      </Typography> */}
      {!loading &&
        searchResults.map((result, index) => {
          return <SearchResult result={result}></SearchResult>;
        })}
      {searchResults.length === 0 && (
        <Typography
          variant="body1"
          color={theme.palette.primary.main}
          sx={{ paddingTop: "1em" }}
        >
          No results
        </Typography>
      )}

      {loading && <Loader />}
    </Box>
  );
};
