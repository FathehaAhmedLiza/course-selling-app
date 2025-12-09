import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaDiscourse,
  FaDownload
} from "react-icons/fa";
import {
  IoMdSettings
} from "react-icons/io";
import {
  IoLogIn,
  IoLogOut
} from "react-icons/io5";
import {
  RiHome2Fill
} from "react-icons/ri";
import {
  HiMenu,
  HiX
} from "react-icons/hi";
import {
  Link,
  useNavigate
} from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";

function Purchases() {
  const [purchases, setPurchase] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    if (!token) {
      setIsLoggedIn(false);
      navigate("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/user/purchases`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setPurchase(response.data.courseData);
      } catch (error) {
        setErrorMessage("Failed to fetch purchase data");
      }
    };
    fetchPurchases();
  }, [token]);

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("user");
      navigate("/login");
      setIsLoggedIn(false);
    } catch (error) {
      toast.error(error.response?.data?.errors || "Error in logging out");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-black to-blue-950 text-white flex font-fredoka">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-gradient-to-r from-black to-blue-950 p-5 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 z-50 shadow-xl`}
      >
        <nav>
          <ul className="space-y-4">
            <li>
              <Link to="/" className="flex items-center hover:text-blue-300">
                <RiHome2Fill className="mr-2" /> Home
              </Link>
            </li>
            <li>
              <Link to="/courses" className="flex items-center hover:text-blue-300">
                <FaDiscourse className="mr-2" /> Courses
              </Link>
            </li>
            <li>
              <span className="flex items-center text-blue-300 font-semibold">
                <FaDownload className="mr-2" /> Purchases
              </span>
            </li>
            <li>
              <Link to="/settings" className="flex items-center hover:text-blue-300">
                <IoMdSettings className="mr-2" /> Settings
              </Link>
            </li>
            <li>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="flex items-center hover:text-blue-300">
                  <IoLogOut className="mr-2" /> Logout
                </button>
              ) : (
                <Link to="/login" className="flex items-center hover:text-blue-300">
                  <IoLogIn className="mr-2" /> Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-md"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
      </button>

      {/* Main Content */}
      <div
        className={`flex-1 p-10 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        } md:ml-64`}
      >
        <h2 className="text-3xl font-bold mb-8">My Purchases</h2>

        {errorMessage && (
          <div className="text-red-400 text-center mb-6">{errorMessage}</div>
        )}

        {purchases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {purchases.map((purchase, index) => (
              <div
                key={index}
                className="bg-gray-900 text-white border border-gray-700 rounded-lg p-4 shadow-md transition-transform transform hover:scale-[1.03]"
              >
                <img
                  className="rounded-lg w-full h-48 object-cover mb-4"
                  src={purchase.image?.url || "https://via.placeholder.com/200"}
                  alt={purchase.title}
                />
                <h3 className="text-lg font-bold text-center mb-2">{purchase.title}</h3>
                <p className="text-gray-300 text-center mb-2">
                  {purchase.description.length > 100
                    ? `${purchase.description.slice(0, 100)}...`
                    : purchase.description}
                </p>
                <p className="text-green-400 font-semibold text-sm text-center">
                  {purchase.price} tk only
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300 text-center">You have no purchases yet.</p>
        )}
      </div>
    </div>
  );
}

export default Purchases;
