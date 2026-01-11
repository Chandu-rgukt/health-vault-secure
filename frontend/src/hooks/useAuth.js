import { useEffect } from "react";
import api from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, setProfile, setLoading, logout } from "@/store/slices/authSlice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, profile, isLoading, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setUser(parsedUser));

        api
          .get("/auth/me")
          .then((response) => {
            const { user: userData, profile: profileData } =
              response.data.data;

            dispatch(setUser(userData));
            if (profileData) {
              dispatch(setProfile(profileData));
            }
          })
          .catch(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            dispatch(logout());
          })
          .finally(() => {
            dispatch(setLoading(false));
          });
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(logout());
        dispatch(setLoading(false));
      }
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const signUp = async (email, password, fullName) => {
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        fullName,
      });

      const { token, user: userData, profile: profileData } =
        response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      dispatch(setUser(userData));
      if (profileData) {
        dispatch(setProfile(profileData));
      }

      return { data: response.data.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error?.response?.data?.error || "Registration failed",
        },
      };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user: userData, profile: profileData } =
        response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      dispatch(setUser(userData));
      if (profileData) {
        dispatch(setProfile(profileData));
      }

      return { data: response.data.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error?.response?.data?.error || "Login failed",
        },
      };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
  };

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
  };
};
