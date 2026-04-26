import peopleConfig from "@/content/people.json";

export type PersonMentionConfig = {
  username: string;
  role: string;
  focus: string;
  description?: string;
  details?: string[];
  relatedProjects?: string[];
};

export const founder = peopleConfig.founder as PersonMentionConfig;
export const contributors = peopleConfig.contributors as PersonMentionConfig[];
