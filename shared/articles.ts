export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "Nutrition" | "Workouts" | "Sports" | "Wellness" | "Tips";
  author: string;
  publishDate: string;
  modifiedDate?: string;
  readTime: number;
  imageUrl?: string;
  imageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
}

export const categories = ["all", "Nutrition", "Workouts", "Sports", "Wellness", "Tips"] as const;
