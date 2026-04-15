export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "administrador" | "supervisor" | "agente";
  availability: "accept" | "auto" | "unavailable";
  phone?: string;
  team?: string;
  lastUpdated?: string;
};

export type Team = {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  assignedNumbers: string[];
};
