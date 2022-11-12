const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//Get Movie Names
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT *
    FROM movie;`;
  const dbObject = await db.all(getMoviesQuery);
  const finalOutput = dbObject.map((details) => {
    return {
      movieName: details.movie_name,
    };
  });
  response.send(finalOutput);
});

//Post Movie Details

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
    movie (director_id, movie_name, lead_actor)
    VALUES
    (${directorId}, '${movieName}', '${leadActor}');`;
  const dbObject = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get movie using id

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const getMovieQuery = `
  SELECT *
  FROM movie
  WHERE movie_id=${movieId};`;
  const dbObject = await db.get(getMovieQuery);
  response.send(dbObject);
});

//update movie details
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE 
        movie
    SET
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor= '${leadActor}'
    WHERE 
        movie_id=${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// delete movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get director details
app.get("/directors/", async (request, response) => {
  const getDirectorDetailsQuery = `
    SELECT *
    FROM 
    director;`;
  const dbObject = await db.all(getDirectorDetailsQuery);
  const finalOutput = dbObject.map((details) => {
    return {
      directorId: details.director_id,
      directorName: details.director_name,
    };
  });
  response.send(finalOutput);
});

//get specific director movies
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
    SELECT *
    FROM movie
    WHERE director_id=${directorId};`;
  const dbObject = await db.all(getDirectorMovieQuery);
  const finalOutput = dbObject.map((details) => {
    return {
      movieName: details.movie_name,
    };
  });
  response.send(finalOutput);
});
module.exports = app;
