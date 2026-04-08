import API from "./Api";

// GET all internships
export const getInternships = () => API.get("/internships");

// POST internship
export const addInternship = (data) =>
  API.post("/internships", data);