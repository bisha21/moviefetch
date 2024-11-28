import { useState, useEffect } from "react";

export function useMovies(query, handleCloseMovies) {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController(); // Create a new controller for every fetch

    async function fetchMovies() {
      try {
        setIsLoading(true); // Start loading
        setError(""); // Reset any previous errors

        const res = await fetch(
          `https://www.omdbapi.com/?s=movie&apikey=e4f7cc5&s=${query}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await res.json();
        if (data && data.Search) {
          setMovies(data.Search);
        } else {
          throw new Error("No movies found in the response");
        }
      } catch (error) {
        if (error.name !== "AbortError") {  // Don't set the error if it's an AbortError
          console.error("Error fetching movies:", error);
          setError(error.message);
        }
      } finally {
        setIsLoading(false); // Stop loading, whether it's successful or an error
      }
    }

    // Fetch movies only when there is a valid query
    if (query) {
      handleCloseMovies();
      fetchMovies();
    }

    // Cleanup function: abort fetch if the component unmounts or if the query changes
    return () => {
      controller.abort();
    };
  }, [query, handleCloseMovies]); // Re-run the effect when query changes

  return { movies, error, isLoading };
}
