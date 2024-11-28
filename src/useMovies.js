import { useState, useEffect } from "react";

export function useMovies(query, handleCloseMovies) {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // callBack?.();
    const controller = new AbortController(); // Define controller outside the fetchMovies function

    async function fetchMovies() {
      let res
      try {
        setIsLoading(true)
        setError("");
        query==="" ? res = await fetch(
          `http://www.omdbapi.com/?s=movie&apikey=e4f7cc5&s=Inception`,
          { signal: controller.signal }
        ):
        res = await fetch(
          `http://www.omdbapi.com/?s=movie&apikey=e4f7cc5&s=${query}`,
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
        console.error("Error fetching movies:", error);
        setError(error.message);
      } finally {
        setIsLoading(true);
      }
    }
    handleCloseMovies();
        fetchMovies();

    // Return a cleanup function to abort the fetch when component unmounts or when the query changes
    return () => {
      controller.abort();
    };
  }, [query]);

  return { movies, error, isLoading };
}
