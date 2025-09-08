
const API = window.API_BASE;

async function loadProjects() {
  const res = await fetch(`${API}/api/projects`);
  const data = await res.json();
  console.log(data);
}
loadProjects();
