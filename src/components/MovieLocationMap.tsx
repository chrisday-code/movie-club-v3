import React from "react";
import ReactDOM from "react-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { WorldMapJson } from "../utils/MapData";
import { Country } from "../types";
import { useState, useEffect } from "react";

interface MovieLocationMapProps {
  countries: Map<string, Country>;
}

// Rate each country and display it on the map, then decide which country makes the best movies (it's argentina)
export const MovieLocationMap = ({ countries }: any) => {
  // TODO add colours to theme
  const theme = useTheme();
  // Composable map is a wrapper component that determines the maps context, determines the type of projection
  // get passed the list of countries
  // make the usa a country

  // useEffect(() => {
  // }, [countries]);

  // add countries in as markers OR
  // try to make one a different colours
  // TODO add labels and show movies
  // show a table underneath that has all the movies from that country or whatever
  return (
    <Box sx={{ width: "80vw", backgroundColor: "#A9A9A9" }}>
      <ComposableMap>
        <Geographies geography={WorldMapJson}>
          {({ geographies }) =>
            geographies.map((geo) => {
              // console.log("geo:", geo);
              //
              return (
                <Geography
                  key={geo.rsmKey}
                  fill={countries.has(geo.id) ? "#02002e" : "#F5F5F5"}
                  geography={geo}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </Box>
  );
};
