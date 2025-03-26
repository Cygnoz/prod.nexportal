export interface SubCategory {
  image?: string;
  subCategoryName: string;
  order?: string;
  categoryName?: string;
  description?: string;
  _id?: string;
  category?: string;
  project?: string;
}

export interface Category {
  categoryName: string;
  description?: string;
  categoryType?: string;
  _id?: string;
  image?: string;
  order?: string;
  project?: string;
}

export interface EventFormData {
  category?: string;
  meetingDate?: string;
  startTime?: string;
  endTime?: string;
  meetingLink?: string;
  meetingType?: string;
  venueName?: string;
  address?: string;
  project?: string;
  title: string;
  image?: string[];
  postType?: string;
  content?: string;
  link?: string;
  updatedAt?: string;
  _id?: string;
  postStatus?:string
}

export interface Articles {
  image?: string;
  title: string;
  category: string;
  subCategory: string;
  content: string;
  project?: string;
}

export interface Post {
  title: string;
  image?: string[];
  postType?: string;
  category?: string;
  content?: string;
  link?: string;
  updatedAt?: string;
  _id?: string;
  project?: string;
  postStatus?:string
}

export interface NotificationFormData {
  title: string;
  image?: string;
  licensers: string[];
  body?: string;
  date?: string;
  time?: string;
  status?: string;
  _id?: string;
  LicenserType?: string;
  project?: string;
}

export interface Terms {
  termTitle: string;
  order?: string;
  termDescription?: string;
  _id?: string;
  type?: string;
  project?: string;
}

export interface LegalAndSecurity {
  termTitle: string;
  order?: string;
  termDescription?: string;
  _id?: string;
  type?: string;
  project?: string;
}
