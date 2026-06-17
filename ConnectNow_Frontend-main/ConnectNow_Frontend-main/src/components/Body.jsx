import Navbar from "./navBar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser, removeUser } from "../utils/userSlice";
import { useEffect } from "react";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);

  useEffect(() => {
    const publicRoutes = ["/", "/login", "/signup"];
    if (publicRoutes.includes(location.pathname)) {
      return;
    }

    const fetchUser = async () => {
      if (userData) return;
      try {
        const res = await axios.get(BASE_URL + "/profile/view", {
          withCredentials: true,
        });
        dispatch(addUser(res.data));
      } catch (err) {
        console.error("Profile fetch error:", err);

  
        if (err?.response?.status === 401) {
          dispatch(removeUser());
          navigate("/login");
        } else if (!err.response) {
          console.error("Network error while fetching profile");
        } else if (err.response.status >= 500) {
          console.error("Server error while fetching profile");
        } else {
          console.error(
            "Error fetching profile:",
            err.response?.data?.message || err.message
          );
        }
      }
    };
    fetchUser();
  }, [userData, dispatch, navigate, location.pathname]);
  const isPublicRoute = ["/login", "/signup"].includes(location.pathname);

  return (
    <div>
      {!isPublicRoute && <Navbar />}
      <Outlet />
    </div>
  );
};

export default Body;
