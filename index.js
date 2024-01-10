import { log } from "console";
import dayjs from "dayjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

const apiKey = process.env.TMDB_API_KEY;
const filePath = path.resolve("./movies.json");

const arg = process.argv[2];
const possibleArgs = ["now_playing", "top_rated", "upcoming"];
let pathArg = possibleArgs.includes(arg) ? arg : "popular";

const writeFile = (array) => {
  const data = JSON.stringify(array);
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error("Error writing movies");
      return;
    }
    console.log("Movies written: ", filePath);
  });
};

const readFile = () => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading movies");
      return;
    }
    const moviesArray = JSON.parse(data);
    const firstMovie =
      moviesArray.length > 0 ? moviesArray[0].title : "No movie found";
    console.log(firstMovie);
  });
};

let loadFromApi = false;
let fileDetails;
try {
  fileDetails = fs.statSync(filePath);
} catch (err) {
  loadFromApi = true;
}
if (fileDetails) {
  const fileDet = dayjs(fileDetails.ctime);
  const seconds = dayjs().diff(fileDet, "seconds");
  loadFromApi = seconds > 10 ? true : false;
} else {
  loadFromApi = true;
}

if (loadFromApi) {
  fetch(`https://api.themoviedb.org/3/movie/${pathArg}?api_key=${apiKey}`)
    .then((response) => response.json())
    .then((obj) => {
      if (obj.status_code > 0) {
        console.error("Error calling server");
      } else {
        const movieList = obj.results;
        const firstMov =
          movieList.length > 0 ? movieList[0].title : "No movie found";
        writeFile(movieList);
        console.log("Movies written correctly", firstMov);
      }
    })
    .catch((err) => console.error(err));
} else {
  readFile();
}
