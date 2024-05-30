import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material";
import { WorldMapJson } from "../utils/MapData";
import { Country, MovieClubDataType } from "../types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface MovieListItemProps {
  movie: MovieClubDataType;
}

const MovieListItem = ({ movie }: MovieListItemProps) => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const navigateToMovie = (id: number) => {
    navigate(`/movies/${id}`);
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        backgroundColor: hovered ? "gray" : "inherit",
        alignItems: "center",
        margin: "5px",
        padding: "5px",
        cursor: "pointer",
        width: "100%",
      }}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      onClick={() => {
        navigateToMovie(movie.id);
      }}
    >
      <Box
        component="img"
        src={"https://image.tmdb.org/t/p/original/" + movie.poster_path}
        alt={movie.title}
        sx={{
          borderRadius: "2%",
          marginRight: { xs: "200px", sm: "20px" },
          // marginBottom: "10px",
          height: "80px",
        }}
      ></Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h3">{movie.title}</Typography>
        <Typography variant="body2">Rank: {movie.rank}</Typography>
        <Typography variant="body2">Score: {movie.score.toFixed(2)}</Typography>
      </Box>
    </Box>
  );
};

interface MovieMapDetailsProps {
  // keys are iso-3 country ids
  country: Country;
}

const MovieMapDetails = ({ country }: MovieMapDetailsProps) => {
  const [loadingNumber, setLoadingNumber] = useState(10);
  const [showMovies, setShowMovies] = useState(false);
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="h4">{country.name}</Typography>
      <Typography variant="body1">Movies - {country.count}</Typography>
      <Typography variant="body1">
        Avg Score - {country.avg_score.toFixed(2)}
      </Typography>
      <Typography variant="body1">
        Best Genre - {country.best_genre.name} -{" "}
        {country.best_genre.avg_review.toFixed(2)}
      </Typography>
      {/* Average score */}
      {/* Country Rank? */}
      {/* a map of movies just showing titles and rankings */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {" "}
        <Button
          variant="outlined"
          sx={{
            alignSelf: "center",
            marginTop: "1vh",
            marginBottom: showMovies ? "1vh" : "0vh",
          }}
          onClick={() => {
            setShowMovies(!showMovies);
          }}
        >
          {showMovies ? "Hide Movies" : "Show Movies"}
        </Button>
        {showMovies &&
          country.movies.map((movie: MovieClubDataType, index: number) => {
            if (index < loadingNumber) {
              return <MovieListItem movie={movie} key={index} />;
            }
          })}
        {showMovies && country.movies.length > loadingNumber && (
          <Button
            variant="outlined"
            sx={{ alignSelf: "center" }}
            onClick={() => {
              setLoadingNumber(loadingNumber + 10);
            }}
          >
            show more
          </Button>
        )}
      </Box>
    </Box>
  );
};

interface MovieLocationMapProps {
  // keys are iso-3 country ids
  countryList: Map<string, Country>;
}
// Rate each country and display it on the map, then decide which country makes the best movies (it's brazil lol)
export const MovieLocationMap = ({ countryList }: any) => {
  // TODO add colours to theme
  const theme = useTheme();
  // Composable map is a wrapper component that determines the maps context, determines the type of projection
  // get passed the list of countries
  // make the usa a country

  // set a state variable for active countries
  // add to the state when you click

  const [selectedCountries, setSelectedCountries] = useState<
    Map<string, Country>
  >(new Map());

  useEffect(() => {}, [countryList]);

  useEffect(() => {
    console.log("selected:", selectedCountries);
  }, [selectedCountries]);

  // add countries in as markers OR
  // try to make one a different colours
  // TODO add labels and show movies
  // show a table underneath that has all the movies from that country or whatever
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "center", md: "flex-start" },
        gap: "2em",
      }}
    >
      <Box
        sx={{
          width: { xs: "80vw", md: "60vw" },
          maxHeight: "80vh",
          backgroundColor: "#A9A9A9",
        }}
      >
        <ComposableMap>
          <Geographies geography={WorldMapJson}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // console.log("geo:", geo);
                //
                return (
                  <Geography
                    key={geo.rsmKey}
                    fill={countryList.has(geo.id) ? "#02002e" : "#F5F5F5"}
                    stroke={selectedCountries.has(geo.id) ? "red" : "#A9A9A9"}
                    strokeWidth={selectedCountries.has(geo.id) ? "1" : "0.3"}
                    geography={geo}
                    style={{
                      default: {
                        outline: "none",
                      },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                    onClick={(e) => {
                      console.log(geo.id);
                      if (countryList.has(geo.id)) {
                        const newMap = new Map(selectedCountries);
                        if (newMap.has(geo.id)) {
                          newMap.delete(geo.id);
                        } else {
                          newMap.set(geo.id, countryList.get(geo.id));
                        }
                        setSelectedCountries(newMap);
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </Box>
      <Box
        color={theme.palette.primary.main}
        sx={{
          width: { xs: "80vw", md: "20vw" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h3"
          fontSize="1.8em"
          // color={theme.palette.primary.main}
          sx={{ textAlign: "center" }}
        >
          Country Stats
        </Typography>
        <Box
          sx={{ display: "flex", flexDirection: "column", paddingTop: "2vh" }}
        >
          {Array.from(selectedCountries.values()).map(
            (country: Country, index: number) => (
              <MovieMapDetails key={index} country={country} />
            )
          )}
        </Box>
      </Box>
    </Box>
  );
};
