export type ReviewType = {
  reviewer: string;
  rating: string;
  comment?: string;
};

export type GenreType = {
  id: number;
  name: string;
  active?: boolean;
};

export type SuggestorsFilter = {
  name: string;
  active?: boolean;
};

export type MovieClubDataType = {
  title: string;
  tmdb_title: string;
  release_date: Date;
  suggestor: string;
  id: number;
  score: number;
  rank: number;
  reviews: Array<ReviewType>;
  poster_path: string;
  backdrop_path: string;
  director: string;
  runtime: number;
  tmdb_score: number;
  genres: Array<GenreType>;
};

export type MovieClubData = {
  title: string;
  suggestor: string;
  id: number;
  score: number;
  rank: number;
  reviews: Array<ReviewType>;
};

export type MovieType = {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  movieClub?: MovieClubData;
};
