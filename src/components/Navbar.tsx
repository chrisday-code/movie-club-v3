import { useEffect, useState, useRef } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  List,
  TextField,
  ListItem,
  Box,
  ListItemButton,
  Typography,
  InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import InputBase from "@mui/material/InputBase";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { options } from "../.config/tmdb-options";
import { Result } from "../types";
import VpnKey from "@mui/icons-material/VpnKey";
import { Login } from "./Login";
import { useContext } from "react";
import { AuthContext } from "../AuthContext";
import Visibility from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
// import SearchIcon from "@mui/icons-material/Search";

interface NavLinks {
  name: string;
  link: string;
}

const SearchResult = ({ title, release_date, id }: Result) => {
  const link = `/movies/${id}`;
  return (
    <Link to={link} style={{ textDecoration: "none", color: "inherit" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body1">{title}</Typography>
        <Typography variant="body1">{release_date}</Typography>
      </Box>
    </Link>
  );
};

export const Navbar = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthStatus must be used within an AuthProvider");
  }
  const [searchHovered, setSearchHovered] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const theme = useTheme();
  const [navItems] = useState<Array<NavLinks>>([
    { name: "Ranks", link: "/" },
    { name: "Movies", link: "/movies" },
    { name: "Spin", link: "/spin" },
    { name: "Stats", link: "/stats" },
  ]);
  const [searchFocus, setSearchFocus] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Result[]>([]);

  const displaySearchResults = () => {
    return searchResults.map((result: Result, index: number) => (
      <SearchResult key={index} {...result}></SearchResult>
    ));
  };

  const links = (mobile: boolean) => {
    return (
      <List
        sx={{
          display: { xs: "none", md: "flex" },
          justifyContent: "space-around",
          alignItems: "center", // Evenly space elements
        }}
      >
        {navItems.map((item, index) => (
          <Link key={index} to={item.link} style={{ textDecoration: "none" }}>
            <ListItem disablePadding>
              <ListItemButton>
                <Typography variant="h4" sx={{ margin: "auto" }}>
                  {item.name}
                </Typography>
              </ListItemButton>
            </ListItem>{" "}
          </Link>
        ))}
        <ListItem>
          <IconButton
            aria-label="delete"
            size="large"
            sx={{ height: "40px", width: "40px" }}
            onClick={() => {
              setShowLogin(!showLogin);
            }}
          >
            <VpnKey fontSize="inherit" />
          </IconButton>
          {showLogin && (
            <Box
              sx={{
                position: "absolute",
                padding: "20px 5px 5px 5px",
                right: "0px",
                top: "10px",
                zIndex: "10",
              }}
              bgcolor={theme.palette.background.navbar}
            >
              <Login setShowLogin={setShowLogin} />
            </Box>
          )}
        </ListItem>
      </List>
    );
  };

  const searchApi = async () => {
    if (search === "") {
      setSearchResults([]);
    }
    const url = `https://api.themoviedb.org/3/search/movie?query=${search}&include_adult=false&language=en-US&page=1`;
    const results = await fetch(url, options).then((data) => data.json());
    // console.log("movies,", results);
    let i = 0;
    const newSearchResults: Result[] = [];
    for (const result of results.results) {
      if (i === 5) {
        break;
      }
      newSearchResults.push({
        id: result.id,
        title: result.title,
        release_date: result.release_date,
      });
      i++;
    }
    // console.log("newSearchResults:", newSearchResults);
    setSearchResults(newSearchResults);
  };

  const handleChange = (event: any) => {
    const value = event.target.value;
    console.log("handling change,", event);
    setSearch(value);
    searchApi();
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    // console.log("searching for", search);
    searchApi();
  };

  const handleBlur = () => {
    // console.log("no focus");
    if (!searchHovered) {
      setSearchResults([]);
    }
  };

  const searchFocussed = () => {
    // console.log("focus");
    setSearchFocus(true);
  };

  const resetSearch = () => {
    setSearch("");
    setSearchResults([]);
  };

  useEffect(() => {
    // do something when there are new search results
  }, [searchResults]);

  const keyPress = (e: any) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      navigate(`/search/${search}`);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        width: "100%",
        zIndex: "4",
        height: { xs: "70px", sm: "70px" },
      }}
      bgcolor={theme.palette.background.navbar}
    >
      <AppBar
        component="nav"
        position="static"
        elevation={1}
        sx={{
          maxHeight: "100%",
          background: theme.palette.background.navbar,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h4" color="inherit" component="div">
            Movie Club
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              margin: "0 5% 0% 5%",
            }}
            onFocus={searchFocussed}
            onBlur={handleBlur}
            onMouseEnter={() => {
              setSearchHovered(true);
            }}
            onMouseLeave={() => {
              setSearchHovered(false);
            }}
          >
            <form>
              <InputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                type="text"
                onChange={handleChange}
                value={search}
                onKeyDown={keyPress}
                endAdornment={
                  <InputAdornment position="end">
                    <Link
                      to={`/search/${search}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => {
                          console.log("clicked search, value is ", search);
                        }}
                        edge="end"
                      >
                        {<SearchIcon />}
                      </IconButton>
                    </Link>
                  </InputAdornment>
                }
                sx={{
                  width: "100%",
                  padding: "5px 15px 5px 5px",
                  backgroundColor: "#282f34", //TODO add proper color here
                  borderRadius: "5px",
                  paddingLeft: "5px",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  backgroundColor: "#282f34",
                  paddingLeft: "5px",
                }}
                onClick={resetSearch}
              >
                {displaySearchResults()}
              </Box>
            </form>
          </Box>
          <Box>{links(false)}</Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
