import { AuthContextType } from "./types";
import { createContext, useContext, useState } from "react";

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: "",
  login: (name: string) => {},
  logout: () => {},
});
// export const AuthContext = createContext<AuthContextType>(null);
