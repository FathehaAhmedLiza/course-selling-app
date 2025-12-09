import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { BACKEND_URL } from "../utils/utils";

function Buy() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState({});
  const [clientSecret, setClientSecret] = useState("");
  const [cardError, setCardError] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }

    const fetchCourseData = async () => {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/course/buy/${courseId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setCourse(response.data.course);
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        if (err?.response?.status === 400) {
          setError("You have already purchased this course");
          navigate("/purchases");
        } else {
          setError(err?.response?.data?.errors || "Something went wrong");
        }
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) {
      setCardError("Card input not found");
      return;
    }

    setLoading(true);

    const { error: methodError } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (methodError) {
      setCardError(methodError.message);
      setLoading(false);
      return;
    }

    if (!clientSecret) {
      setCardError("Missing client secret");
      setLoading(false);
      return;
    }

    const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          name: user?.user?.firstName,
          email: user?.user?.email,
        },
      },
    });

    if (confirmError) {
      setCardError(confirmError.message);
    } else if (paymentIntent?.status === "succeeded") {
      const paymentInfo = {
        email: user.user.email,
        userId: user.user._id,
        courseId,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
      };

      try {
        await axios.post(`${BACKEND_URL}/order`, paymentInfo, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        toast.success("Payment Successful");
        navigate("/purchases");
      } catch (err) {
        toast.error("Error saving payment info");
      }
    }

    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-black to-blue-950 p-10 text-white flex items-center justify-center font-fredoka">
      {error ? (
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg">
          <p className="text-lg font-semibold">{error}</p>
          <Link
            to="/purchases"
            className="block mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded text-center"
          >
            Go to Purchases
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-10 max-w-5xl w-full justify-center items-start">
          {/* Order Details */}
<div className="bg-white text-black p-8 rounded-xl shadow-lg w-[500px] m-8 md:m-0 mt-20">
  <h2 className="text-2xl font-semibold underline mb-3 text-left center text-gray">🧾Order Details</h2>
  <div className="space-y-4">
    <div>
      <h2 className="text-font text-black">Course Name</h2>
      <p className="font-semibold text-black">{course?.title}</p>
    </div>
    <div>
      <h2 className="text-font text-black">Total Price</h2>
      <p className="font-semibold text-black">{course?.price} tk</p>
    </div>
  </div>
</div>

          {/* Payment Form */}
          <div className="w-full md:w-1/2">
            <div className="bg-white text-black shadow-xl rounded-xl p-8 w-full max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">💳 Process Your Payment</h2>
              <form onSubmit={handlePurchase} className="space-y-4">
                <div className="border border-gray-300 rounded-md p-3 bg-white">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": { color: "#aab7c4" },
                        },
                        invalid: { color: "#9e2146" },
                      },
                    }}
                  />
                </div>

                {cardError && (
                  <p className="text-red-600 text-sm font-medium">{cardError}</p>
                )}

                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition"
                >
                  {loading ? "Processing..." : "Pay"}
                </button>
              </form>

              <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded flex items-center justify-center">
                <span className="mr-2">🅿️</span> Other Payment Methods
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Buy;

