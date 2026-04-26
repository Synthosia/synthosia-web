export type ProjectCategory = "tool" | "experiment" | "library";

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  tags: string[];
  docsUrl: string;
  githubUrl: string;
  category: ProjectCategory;
  featured: boolean;
  translations?: {
    "pt-BR"?: Pick<Project, "tagline" | "description" | "features">;
  };
};
