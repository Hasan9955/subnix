import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "MENTOR" | "ADMIN";
}

export interface AuthState {
  user: IUser | null;
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: IUser; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.role = user.role;
      state.isAuthenticated = true;

      // Persist in cookies for Next.js middleware and SSR
      Cookies.set("token", token, { expires: 7 });
      Cookies.set("role", user.role, { expires: 7 });
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;

      Cookies.remove("token");
      Cookies.remove("role");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
