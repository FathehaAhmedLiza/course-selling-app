import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";

function CreateCourse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("/imgPL.webp"); // default preview
  const navigate = useNavigate();

  const changePhotoHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImage(file); // ensure it's a File object
    };
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (!title || !description || !price || !image) {
      toast.error("All fields including image are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("image", image); // 👈 important: use "image" not "imageUrl"

    const admin = JSON.parse(localStorage.getItem("admin"));
    const token = admin?.token;

    if (!token) {
      toast.error("Please login to admin");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/course/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      toast.success(response.data.message || "Course created successfully");
      navigate("/admin/our-courses");
    } catch (error) {
      toast.error(
        error.response?.data?.errors || "Failed to create course"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black to-blue-950 py-12 px-4">
      <div className="w-full max-w-3xl bg-gradient-to-br from-black to-blue-950 text-white p-8 rounded-xl shadow-2xl">
        <h3 className="text-3xl font-bold mb-6 text-center">Create Course</h3>
        <form onSubmit={handleCreateCourse} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-black outline-none"
              placeholder="Course title"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-black outline-none"
              placeholder="Course description"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-black outline-none"
              placeholder="Course price"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Course Image</label>
            <div className="flex justify-center mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-w-sm h-64 object-cover rounded-md shadow"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={changePhotoHandler}
              className="w-full px-4 py-2 border rounded-md bg-white text-black outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold rounded-md transition duration-300"
          >
            Create Course
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateCourse;
