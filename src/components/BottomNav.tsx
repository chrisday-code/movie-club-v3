import { useEffect, useState, useRef } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  List,
  TextField,
  ListItem,
  Box,
  Grid,
  ListItemButton,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { NavLinks } from "../types";
import { FaTrophy } from "react-icons/fa";
import { MdLocalMovies } from "react-icons/md";
import { IconContext } from "react-icons";
import { PiSpinnerBall } from "react-icons/pi";
import { IoTrophyOutline } from "react-icons/io5";
import { IoIosStats } from "react-icons/io";

export const BottomNav = () => {
  // Icon: <FcCommandLine />,
  //todo idk maybe this gets set by something proper in the future
  const [navItems] = useState<Array<NavLinks>>([
    { name: "Ranks", link: "/", icon: <IoTrophyOutline /> },
    { name: "Movies", link: "/movies", icon: <MdLocalMovies /> },
    { name: "Spin", link: "/spin", icon: <PiSpinnerBall /> },
    { name: "Stats", link: "/stats", icon: <IoIosStats /> },
  ]);

  const bottomNavHeadings = () => {
    return (
      <Grid
        container
        sx={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        {navItems.map((item, index) => {
          return (
            <Grid key={index} item xs={3} sx={{ height: "100%" }}>
              {/* <Link to={"/"}> </Link> */}
              <Link
                to={item.link}
                style={{
                  textDecoration: "none",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "0.2em",
                  alignItems: "center",
                  // backgroundColor: "red",
                }}
              >
                {/* Icon and string */}
                <IconContext.Provider
                  value={{
                    size: "2vh",
                    color: theme.palette.primary.main,
                  }}
                >
                  {item.icon}
                </IconContext.Provider>
                {/* <FaTrophy /> */}
                <Typography variant="h5" sx={{ textAlign: "center" }}>
                  {item.name}
                </Typography>
              </Link>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const theme = useTheme();
  return (
    <Box
      sx={{
        position: "fixed",

        width: "100%",
        zIndex: "4",
        bottom: "0px",
        height: { xs: "5vh" },
        display: { xs: "flex", md: "none" },
        flexDirection: "row",
        alignItems: "center",
      }}
      bgcolor={theme.palette.background.navbar}
      color="white"
    >
      {bottomNavHeadings()}
    </Box>
  );
};
