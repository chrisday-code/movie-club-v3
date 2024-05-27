export type ReviewType = {
  reviewer: string;
  rating: string;
  comment?: string;
};

export interface Result {
  id: number;
  title: string;
  release_date: string;
}

// add images
export interface DetailedSearchResult {
  id: number;
  title: string;
  poster: string;
  release_date: string;
}

export type Suggestion = {
  suggestor: string;
  title: string;
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

type BelongsToCollection = {
  id: number;
  name: string;
  poster_path?: string;
  backdrop_path?: string;
};

export interface NavLinks {
  name: string;
  link: string;
  icon?: JSX.Element;
}

export interface AuthContextType {
  user: string;
  isAuthenticated: boolean;
  login: (name: string) => void;
  logout: () => void;
}

// TODO remove this
type Genre = {
  id: number;
  name: string;
};

type ProductionCompany = {
  id: number;
  logo_path?: string;
  name: string;
  origin_country: string;
};

type ProductionCountry = {
  iso_3166_1: string;
  name: string;
};

type SpokenLanguage = {
  iso_639_1: string;
  name: string;
};

export type MovieDetailsFromApi = {
  adult: boolean;
  backdrop_path?: string;
  belongs_to_collection?: BelongsToCollection;
  budget: number;
  genres: Genre[];
  homepage: string;
  id: number;
  imdb_id?: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path?: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export type MoviePage = {
  tmdb_id: number;
  imdb_id: string;
  title: string;
  score: number;
  rank: number;
  poster_path?: string;
  director: Array<string>;
  budget: number;
  overview: string;
  genres: Genre[];
  release_date: string;
  revenue: number;
  runtime: number;
  providers: any; //TODO give this a type
  backdrop_path?: string;
  reviews?: Array<ReviewType>;
};

export type Director = {
  false: boolean;
  credit_id: string;
  department: string;
  gender: number;
  id: number;
  job: string;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
};

export type PersonalReview = {
  title: string;
  genres: GenreType[];
  rating: number;
};

export type Reviewer = {
  name: string;
  rank: number;
  watched: number;
  avg_review: number;
  fav_genre: string;
  avg_suggested: number;
  suggested: MovieClubDataType[];
  total_suggested: number;
  reviews: Array<PersonalReview>;
};

export type GenreReview = {
  name: string;
  reviews: number[];
  avg_review: number;
};
