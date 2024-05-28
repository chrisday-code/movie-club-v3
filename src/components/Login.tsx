import { Box, Button, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "../AuthContext";
import { authkey, validUsers } from "../.config/auth";

interface LoginProps {
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>; // Define the type of the onData prop
}

export const Login = ({ setShowLogin }: LoginProps) => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  //todo validation instead of error
  const [userError, setUserError] = useState(false);
  const [passError, setPassError] = useState(false);
  const authContext = useContext(AuthContext);

  // todo remove this
  useEffect(() => {
    console.log("authContext.isAuthenticated:", authContext.isAuthenticated);
  }, [authContext.isAuthenticated]);

  const tryLogin = () => {
    console.log("password: ", password);
    // check valid user
    if (validUsers.some((valid) => valid === user)) {
      console.log("valid", user);
      setUserError(false);
      if (authkey === password) {
        authContext.login(user);
        setShowLogin(false);
        setPassError(false);
      } else {
        setPassError(true);
      }
    } else {
      console.log("invalid", user);
      setUserError(true);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        // alignItems: "center",
        // justifyContent: "center",
      }}
    >
      {!authContext.isAuthenticated && (
        <Box
          sx={{
            // flex: "1",
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5em",
          }}
        >
          <TextField
            id="User"
            label="User"
            variant="outlined"
            value={user}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUser(event.target.value);
            }}
          />
          <TextField
            id="Password"
            label="Password"
            variant="outlined"
            value={password}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(event.target.value);
            }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              tryLogin();
            }}
          >
            Login
          </Button>
        </Box>
      )}
      {authContext.isAuthenticated && (
        <Button
          variant="outlined"
          onClick={() => {
            authContext.logout();
          }}
        >
          Logout
        </Button>
      )}
      {userError && (
        <Typography variant="body1" color="red">
          wrong user (try caps)
        </Typography>
      )}
      {passError && (
        <Typography variant="body1" color="red">
          wrong password
        </Typography>
      )}
    </Box>
  );
};
