import { options } from "../.config/tmdb-options";
import { Result } from "../types";

//todo figure out if doing this here is actually bad
export const searchTMDB = async (query: string) => {
  if (query === "") {
    return [];
  }
  const url = `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`;
  const results = await fetch(url, options).then((data) => data.json());
  return results;
};
