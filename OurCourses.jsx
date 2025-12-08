import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";

function OurCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem("admin"));
  const token = admin?.token;

  // Secure redirect logic in useEffect
  useEffect(() => {
    if (!token) {
      toast.error("Please login to admin");
      navigate("/admin/login");
    }
  }, [token, navigate]);

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/course/courses`, {
          withCredentials: true,
        });
        setCourses(response.data.courses);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${BACKEND_URL}/course/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      const updatedCourses = courses.filter((course) => course._id !== id);
      setCourses(updatedCourses);
    } catch (error) {
      console.log("Error deleting course:", error);
      toast.error(error.response?.data?.errors || "Failed to delete course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black to-blue-950">
        <p className="text-center text-white text-xl font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-blue-950 p-8 space-y-8">
      <h1 className="text-4xl font-bold text-center text-white">Our Courses</h1>

      <div className="flex justify-center">
        <Link
          className="bg-orange-500 py-2 px-6 rounded-lg text-white hover:bg-orange-900 duration-300"
          to={"/admin/dashboard"}
        >
          Go to dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg text-white"
          >
            <img
              src={course?.image?.url}
              alt={course.title}
              className="h-40 w-full object-cover rounded-lg mb-4"
            />

            <h2 className="text-2xl font-semibold">{course.title}</h2>
            <p className="text-sm text-gray-300 mt-2">
              {course.description.length > 200
                ? `${course.description.slice(0, 200)}...`
                : course.description}
            </p>

            <div className="flex justify-between items-center mt-4 text-white font-bold">
              <span>
                {course.price}{" "}
                <span className="line-through text-gray-400">300</span>
              </span>
              <span className="text-green-400 text-sm">10% off</span>
            </div>

            <div className="flex justify-between mt-6">
              <Link
                to={`/admin/update-course/${course._id}`}
                className="bg-blue-500 py-2 px-4 rounded hover:bg-blue-700"
              >
                Update
              </Link>
              <button
                onClick={() => handleDelete(course._id)}
                className="bg-red-500 py-2 px-4 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OurCourses;
