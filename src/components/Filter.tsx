import { useEffect, useState } from "react";
import { MovieClubDataType, GenreType, SuggestorsFilter } from "../types";
import { Button, Box, Chip, Typography } from "@mui/material";
import { BsSliders } from "react-icons/bs";
import { TiTick } from "react-icons/ti";
import { options } from "../.config/tmdb-options";
import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import * as React from "react";

// TODO make this a mui list with dropdown properties so its prettier

interface FilterProps {
  setFiltered: React.Dispatch<React.SetStateAction<Array<MovieClubDataType>>>;
  setMovies: React.Dispatch<React.SetStateAction<Array<MovieClubDataType>>>; // Define the type of the onData prop
  movies: MovieClubDataType[];
  filtered: MovieClubDataType[];
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 10.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const suggestorList = [
  "Chris",
  "Reuben",
  "Abhinav",
  "Hamish",
  "Mystery",
  "Group",
];

const decadeList = [
  2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920,
];

export const Filter = ({
  filtered,
  setFiltered,
  movies,
  setMovies,
}: FilterProps) => {
  const theme = useTheme();
  const [genres, setGenres] = useState<Array<GenreType>>([]);
  const [expanded, setExpanded] = useState(true);

  //todo remove this
  const [suggestors, setSuggestors] = useState<Array<SuggestorsFilter>>([
    { name: "Chris", active: false },
    { name: "Reuben", active: false },
    { name: "Abhinav", active: false },
    { name: "Hamish", active: false },
    { name: "Mystery", active: false },
    { name: "Group", active: false },
  ]);

  const [activeDecades, setActiveDecades] = useState<number[]>([]);
  const [activeGenres, setActiveGenres] = React.useState<string[]>([]);
  const [activeSuggestors, setActiveSuggestors] = React.useState<string[]>([]);
  const handleGenreChange = (event: SelectChangeEvent<typeof activeGenres>) => {
    const {
      target: { value },
    } = event;
    setActiveGenres(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleSelectorChange = (
    event: SelectChangeEvent<typeof activeSuggestors>
  ) => {
    const {
      target: { value },
    } = event;
    setActiveSuggestors(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleDecadeChange = (
    event: SelectChangeEvent<typeof activeDecades>
  ) => {
    const {
      target: { value },
    } = event;
    // console.log("event: ", value);
    if (typeof value !== "string") {
      setActiveDecades(value);
    }
  };
  //

  const getGenres = async () => {
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
  };
  useEffect(() => {
    getGenres();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [activeGenres.length, activeSuggestors.length, activeDecades.length]);

  const applyFilter = () => {
    const filterDecades = activeDecades.map((x) => x);
    if (filterDecades.length === 0) {
      filterDecades.push(...decadeList.map((x) => x));
    }

    // console.log("filterDecades:", filterDecades);

    const filterGenres = genres
      .filter((genre) => activeGenres.includes(genre.name))
      .map((genre) => genre.id);
    if (filterGenres.length === 0) {
      filterGenres.push(...genres.map((genre) => genre.id));
    }

    const filterSuggestors = activeSuggestors.map((x) => x);

    if (filterSuggestors.length === 0) {
      filterSuggestors.push(...suggestors.map((suggestor) => suggestor.name));
    }
    const filtered = movies.filter((movie: MovieClubDataType) => {
      // console.log("year: ", movie.release_date.getFullYear());
      return (
        filterSuggestors.some((name) => name === movie.suggestor) &&
        movie.genres.some((genre) =>
          filterGenres.some((filteredGenre) => filteredGenre === genre.id)
        ) &&
        // true
        filterDecades.some(
          (decade) =>
            decade === Math.floor(movie.release_date.getFullYear() / 10) * 10
        )
      );
    });
    setFiltered(filtered);
  };

  //TODO make a list of chips as well

  return (
    <Box borderRadius={"5px"}>
      <Button
        variant="outlined"
        endIcon={<BsSliders />}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        Filters
      </Button>
      {expanded && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            // flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              paddingTop: "10px",
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
            }}
          >
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id="Genre">Genre</InputLabel>
              <Select
                labelId="Genre"
                id="Genre"
                multiple
                value={activeGenres}
                onChange={handleGenreChange}
                input={<OutlinedInput label="Tag" />}
                renderValue={(selected) => selected.join(", ")}
                MenuProps={MenuProps}
              >
                {genres.map((genre) => (
                  <MenuItem key={genre.name} value={genre.name}>
                    <Checkbox checked={activeGenres.indexOf(genre.name) > -1} />
                    <ListItemText primary={genre.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id="Suggestor">Suggestor</InputLabel>
              <Select
                labelId="Suggestor"
                id="Suggestor"
                multiple
                value={activeSuggestors}
                onChange={handleSelectorChange}
                input={<OutlinedInput label="Tag" />}
                renderValue={(selected) => selected.join(", ")}
                MenuProps={MenuProps}
              >
                {suggestorList.map((suggestor) => (
                  <MenuItem key={suggestor} value={suggestor}>
                    <Checkbox
                      checked={activeSuggestors.indexOf(suggestor) > -1}
                    />
                    <ListItemText primary={suggestor} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id="Decade">Decade</InputLabel>
              <Select
                labelId="Decade"
                id="Decade"
                multiple
                value={activeDecades}
                onChange={handleDecadeChange}
                input={<OutlinedInput label="Tag" />}
                renderValue={(selected) => selected.join(", ")}
                MenuProps={MenuProps}
              >
                {decadeList.map((decade) => (
                  <MenuItem key={decade} value={decade}>
                    <Checkbox checked={activeDecades.indexOf(decade) > -1} />
                    <ListItemText primary={decade} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {/* <Button
            variant="outlined"
            onClick={() => {
              applyFilter();
            }}
          >
            Apply
          </Button> */}
        </Box>
      )}
      {/* TODO put a dropdown menu here */}
      {/*  */}
    </Box>
  );
};
