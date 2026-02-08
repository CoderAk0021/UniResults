// AuthContext.jsx
import { createContext, useContext } from "react";
import { useCookies } from "react-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies(["user_token"]);

  const login = (token) => {
    setCookie("user_token", token, { path: "/", maxAge: 3600 });
  };

  const logout = () => {
    removeCookie("user_token");
  };

  return (
    <AuthContext.Provider value={{ token: cookies.user_token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
