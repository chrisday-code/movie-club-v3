import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "./theme";
import { Rankings } from "./components/Rankings";
import { Navbar } from "./components/Navbar";
import { Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Movie } from "./components/Movie";
import { Spin } from "./components/Spin";
import { Stats } from "./components/Stats";
import { Settings } from "./components/Settings";
import { Search } from "./components/Search";
import { Footer } from "./components/Footer";
import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { BottomNav } from "./components/BottomNav";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState("");
  const login = (name: string) => {
    setUser(name);
    setIsAuthenticated(true);
  };
  const logout = () => {
    setUser("");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      <ThemeProvider theme={darkTheme}>
        <Router>
          <Navbar />
          <Box
            sx={{
              minHeight: { xs: "70px", sm: "70px" },
              minWidth: { xs: "100vw" },
            }}
          ></Box>
          <Routes>
            <Route path="/" element={<Rankings />} />
            <Route path="/movies" element={<Movie />} />
            <Route path="/movies/:id" element={<Movie />} />
            <Route path="/spin" element={<Spin />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/search" element={<Search />} />
            <Route path="/search/:query" element={<Search />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <Footer />
          <BottomNav />
        </Router>
        {/* <Rankings /> */}
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;
