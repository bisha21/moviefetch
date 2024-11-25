import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import StarRating from './starRating';

function Test() {
  const [movieRating, setMovieRating] = useState(0);

  return (
    <div>
      <StarRating color='blue' maxRating={10} onSetRating={setMovieRating} />
      <p>The movie has {movieRating} rating</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* <StarRating maxRating={5} size={48} message={['terrible','Bad',"Ok",'Good',"Amazing"]}/>
    <StarRating maxRating={5} size={24} color='red'/> */}
     
    <App/>
    

  </React.StrictMode>
);
