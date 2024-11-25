import { useEffect, useRef, useState } from "react";
import StarRating from "./starRating";
import { useMovies } from "./useMovies";

function average(arr) {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((total, value) => total + value, 0);
  return sum / arr.length;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [watched, setWatched] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const { movies, error, isLoading } = useMovies(query,handleCloseMovies);

  function Loader() {
    return <p>Loading....</p>;
  }
  function handleSelectedMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleCloseMovies() {
    setSelectedId(null);
  }
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function deleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* { isLoading ? <Loader/>:
          <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {isLoading && !error && (
            <MovieList movies={movies} onSelectedMovies={handleSelectedMovie} />
          )}
          {error && <ErrorMessage message={error.message} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetail
              selectedId={selectedId}
              onCloseMovies={handleCloseMovies}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary />
              <WatchedMovieList
                watched={watched}
                onDeleteMovie={deleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🌋</span>
      {message}
    </p>
  );
}
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);
  useEffect(
    function () {
      function callBack(e) {
        if (document.activeElement === inputEl) return;
        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery(" ");
        }
      }
      document.addEventListener("keydown", callBack);
      return () => document.addEventListener("keydown", callBack);
    },
    [setQuery]
  );
  return (
    <input
      className="search"
      type="text"
      placeholder="Serch for movies"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies ? movies.length : 0}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Movie({ movie, onSelectedMovies }) {
  return (
    <li onClick={() => onSelectedMovies(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieList({ movies, onSelectedMovies }) {
  return (
    <ul className="list">
      {movies.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelectedMovies={onSelectedMovies}
        />
      ))}
    </ul>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => {
    setIsOpen((prevOpen) => !prevOpen); // Using a function to update state based on previous state
  };

  return (
    <div className="box">
      <button className="btn-toggle" onClick={toggleOpen}>
        {isOpen ? "-" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieDetail({ selectedId, onCloseMovies, onAddWatched, watched }) {
  const [movie, setMovie] = useState({}); // State to hold movie details
  const [userRating, setUserRating] = useState("");
  const countRef = useRef(0);
  useEffect(
    function () {
      if (userRating) countRef.current = countRef.current + 1;
    },
    [userRating]
  );
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  console.log(isWatched);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  // Destructuring movie object to extract properties
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRateDecision: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovies();
  }

  useEffect(
    function () {
      function callBack(e) {
        if (e.code === "Escape") {
          onCloseMovies();
          console.log("Close");
        }
      }
      document.addEventListener("keydown", callBack);
      document.removeEventListener("keydown", callBack);
    },
    [onCloseMovies]
  );

  // console.log(title, year); // Logging title and year of the movie

  useEffect(() => {
    async function getMoviesDetails() {
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=e4f7cc5&i=${selectedId}`
      ); // Fetching movie details using OMDB API

      const data = await res.json(); // Parsing response data as JSON
      // console.log(data); // Logging fetched movie data
      setMovie(data); // Updating movie state with fetched data
    }

    if (selectedId) {
      getMoviesDetails(); // Calling function to fetch movie details when selectedId changes
    }
  }, [selectedId]); // useEffect dependency array with selectedId as the only dependency

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie|${title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );
  return (
    <div className="details">
      <header>
        <img src={poster} alt={`Poster of ${movie} movie`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐</span>
            {imdbRating} Imdb rating
          </p>
        </div>
        <button className="btn-back" onClick={onCloseMovies}>
          &larr;
        </button>
      </header>
      <section>
        {!isWatched ? (
          <div className="rating">
            <StarRating
              maxRating={10}
              size={24}
              color="yellow"
              onSetRating={setUserRating}
            />

            {userRating > 0 && (
              <button className="btn-add" onClick={handleAdd}>
                + Add item to list
              </button>
            )}
          </div>
        ) : (
          <p style={{ fontWeight: "200px" }}>
            You already rate this movie {watchedUserRating}
          </p>
        )}
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
      {selectedId}
    </div>
  );
}

function WatchedSummary() {
  const avgImdbRating = average(
    tempWatchedData.map((movie) => movie.imdbRating)
  );
  const avgUserRating = average(
    tempWatchedData.map((movie) => movie.userRating)
  );
  const avgRuntime = average(tempWatchedData.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movie you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{tempWatchedData.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDeleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <li key={movie.imdbID}>
          <img src={movie.poster} alt={`${movie.title} poster`} />
          <h3>{movie.title}</h3>

          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{movie.runtime} min</span>
            </p>
            <button
              className="btn-delete"
              onClick={() => onDeleteMovie(movie.imdbID)}
            >
              -
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
