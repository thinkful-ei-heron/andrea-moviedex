/* eslint-disable no-console */
/* eslint-disable strict */
require('dotenv').config();
const express = require('express');
const movieData = require('./movieData.json');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');


const app = express();

const morganOption = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

//Authentication 
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  
  next();
});

app.get('/movie', (req, res) => {
  let movies = movieData;
  const { genre, country, avg_vote } = req.query;

  if(genre){
    movies = movies.filter(movie => 
      movie.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  if(country){
    movies = movies.filter(place =>
      place.country.toLowerCase().includes(country.toLowerCase())
    );
  }
  
  if(avg_vote){
    movies = movies.filter(vote => 
      vote.avg_vote >= avg_vote);
  }

  res.json(movies);
});

app.use((error, req, res, next) =>{
  let response;
  if(process.env.NODE_ENV === 'production') {
    response = { error: {message: 'server error' } };
  } else {
    response = { message: error.message, error};
  }
  res.status(500).json(response);
});

const   PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening at http:localhost:${PORT}`);
});
