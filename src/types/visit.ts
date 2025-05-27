export interface Visit {
  id: string;
  user: {
    id: string;
    username: string;
  };
  visitDate: Date;
  location: {
    name: string;
    place_id: string;
  } | null;
  comments: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  visibility: 'public' | 'private';
  logs: Array<{
    id: string;
    cocktail: {
      id: string;
      name: {
        en: string;
        zh: string;
      };
      slug: string;
    };
    comments: string | null;
    drinkDate: Date;
    createdAt: Date;
    updatedAt: Date;
    visibility: string;
    media: Array<{
      id: string;
      url: string;
    }>;
  }>;
} 