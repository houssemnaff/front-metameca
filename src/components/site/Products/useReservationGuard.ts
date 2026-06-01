/**
 * useReservationGuard
 *
 * Centralized auth check for reservation flows.
 * Reads token from localStorage, shows a toast notification
 * if the user is not authenticated, then redirects to /login.
 * If authenticated, navigates to /reservation/:productId.
 *
 * Usage:
 *   const handleReserve = useReservationGuard();
 *   <button onClick={() => handleReserve(product._id)}>Réserver</button>
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function useReservationGuard() {
  const navigate = useNavigate();

  const handleReserve = useCallback(
    (productId: string) => {
      const token = localStorage.getItem("mm_token");

      if (!token) {
        toast.info("Veuillez vous connecter ou créer un compte avant la réservation.", {
          position: "top-center",
          autoClose: 3500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          style: {
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: "13px",
            borderRadius: "2px",
            background: "#0d3875",
            color: "#fff",
          },
          icon: false,
        });

        // Slight delay so the toast is visible before navigating
        setTimeout(() => {
          navigate("/login", {
            state: { from: `/produits/${productId}`, intent: "reserve" },
          });
        }, 1200);

        return;
      }

      // Authenticated → go directly to the reservation page
      navigate(`/reservation/${productId}`);
    },
    [navigate]
  );

  return handleReserve;
}