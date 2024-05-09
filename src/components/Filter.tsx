import { useEffect, useState } from "react";
import { MovieClubDataType, GenreType, SuggestorsFilter } from "../types";
import { Button, Box, Chip, Typography } from "@mui/material";
import { BsSliders } from "react-icons/bs";
import { TiTick } from "react-icons/ti";

//this could be like a dropdown or whatever

interface FilterProps {
  setFiltered: React.Dispatch<React.SetStateAction<Array<MovieClubDataType>>>;
  setMovies: React.Dispatch<React.SetStateAction<Array<MovieClubDataType>>>; // Define the type of the onData prop
  movies: MovieClubDataType[];
  filtered: MovieClubDataType[];
}

export const Filter = ({
  filtered,
  setFiltered,
  movies,
  setMovies,
}: FilterProps) => {
  const [genres, setGenres] = useState<Array<GenreType>>([]);
  // const [filterGenres, setFilterGenres] = useState<Array<GenreType>>([]);
  const [expanded, setExpanded] = useState(true);
  const [suggestors, setSuggestors] = useState<Array<SuggestorsFilter>>([
    { name: "Chris", active: false },
    { name: "Reuben", active: false },
    { name: "Abhinav", active: false },
    { name: "Hamish", active: false },
    { name: "Mystery", active: false },
    { name: "Group", active: false },
  ]);
  const getGenres = async () => {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYWJhYmUyYzBlMDc4MDRlOTQ2MzQ4ZjI2NGYxNzQzZiIsInN1YiI6IjY2MGNjNGZjNWFhZGM0MDE2MzY0MjQwZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.bp4isioU5fwnHLfI8FwyKkg99goTbNiJNMA5hQP5IZQ",
      },
    };
    const genresFromAPI = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list`,
      options
    ).then((response) => response.json());

    setGenres(
      genresFromAPI.genres.map((genres: GenreType) => {
        genres.active = false;
        return genres;
      })
    );
    // setActiveGenres(genresFromAPI.genres);
  };
  useEffect(() => {
    // https://api.themoviedb.org/3/genre/movie/list
    //call the api that gets genres
    getGenres();
  }, []);

  //todo fix this old stuff

  // TODO set the active genre state based on this
  const toggleChip = (id: number) => {
    setGenres(
      genres.map((genre) => {
        if (genre.id === id) {
          genre.active = !genre.active;
        }
        return genre;
      })
    );
  };

  const toggleSuggestor = (name: string) => {
    setSuggestors(
      suggestors.map((suggestor) => {
        if (suggestor.name === name) {
          suggestor.active = !suggestor.active;
        }
        return suggestor;
      })
    );
  };

  const applyFilter = () => {
    const filterGenres = genres
      .filter((genre) => genre.active)
      .map((genre) => genre.id);
    if (filterGenres.length === 0) {
      filterGenres.push(...genres.map((genre) => genre.id));
    }
    const filterSuggestors = suggestors
      .filter((suggestor) => suggestor.active)
      .map((suggestor) => suggestor.name);
    if (filterSuggestors.length === 0) {
      filterSuggestors.push(...suggestors.map((suggestor) => suggestor.name));
    }
    // filter the movie and see if any of the genres are included in the
    //TODO put the other filters in here
    const filtered = movies.filter((movie: MovieClubDataType) => {
      return (
        filterSuggestors.some((name) => name === movie.suggestor) &&
        movie.genres.some((genre) => {
          return filterGenres.some(
            (filteredGenre) => filteredGenre === genre.id
          );
        })
      );
    });
    console.log("filtered:", filtered);
    setFiltered(filtered);
    // console.log("filter:", filtered);
    // setFiltered([]);
  };

  return (
    <Box>
      <Button
        variant="outlined"
        endIcon={<BsSliders />}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        Filters
      </Button>
      {/* clicking on filters opens a popup box with a shadow */}
      {/* I also want to add a sort button */}
      {expanded && (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Button
            variant="outlined"
            onClick={() => {
              applyFilter();
            }}
          >
            Apply
          </Button>

          <Typography variant="h5">Suggestor</Typography>
          <Box display="flex" flexWrap="wrap">
            {suggestors.map((suggestor: SuggestorsFilter, key: number) => {
              if (suggestor.active) {
                return (
                  <Chip
                    key={key}
                    label={suggestor.name}
                    color="primary"
                    icon={<TiTick />}
                    sx={{ margin: "2px" }}
                    onClick={() => {
                      toggleSuggestor(suggestor.name);
                    }}
                  />
                );
              } else {
                return (
                  <Chip
                    key={key}
                    label={suggestor.name}
                    sx={{ margin: "2px" }}
                    onClick={() => {
                      toggleSuggestor(suggestor.name);
                    }}
                  />
                );
              }
            })}
          </Box>
          <Typography variant="h5">Genre</Typography>
          <Box display="flex" flexWrap="wrap">
            {genres.map((genre: GenreType, key: number) => {
              if (genre.active) {
                return (
                  <Chip
                    key={key}
                    label={genre.name}
                    color="primary"
                    icon={<TiTick />}
                    sx={{ margin: "2px" }}
                    onClick={() => {
                      toggleChip(genre.id);
                    }}
                  />
                );
              } else {
                return (
                  <Chip
                    key={key}
                    label={genre.name}
                    sx={{ margin: "2px" }}
                    onClick={() => {
                      toggleChip(genre.id);
                    }}
                  />
                );
              }
            })}
          </Box>
        </Box>
      )}
      {/* TODO put a dropdown menu here */}
      {/*  */}
    </Box>
  );
};
