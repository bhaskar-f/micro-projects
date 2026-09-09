const roles = [
"All Jobs",
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Junior Developer",
  "Senior Developer",
  "DevOps Engineer",
  "SDE 1",
  "Finance"
];


const jobsArrayPromise =fetchJobs("https://remotelanders.com/api/jobs");
let jobsArray = [];
jobsArrayPromise.then((array) => {
  jobsArray = array;
  renderingJobs(jobsArray)
});

const keywords = document.querySelector("#keywords");
const jobsContainer = document.querySelector(".jobs-ui");
loadingState();

roles.forEach((role) => {
  const keywordButton = document.createElement("button");
  keywordButton.textContent = role;
  keywords.appendChild(keywordButton);
  
  keywordButton.addEventListener("click",()=>{
    if(roles.indexOf(role)==0){
        renderingJobs(jobsArray);
    }else search(role.toLowerCase());
  })
});

async function fetchJobs(url) {
  try {
    const fetchedJobobject = await fetch(url);
    const data = await fetchedJobobject.json();

    return data.jobs;
  } catch (error) {
    console.log("could not fetch data", error);
  }
}
const searchButton=document.querySelector("#searchButton")



function loadingState(){
    clearContainer();
const loadingText=document.createElement("h1");
loadingText.id="loading-text"
loadingText.textContent="Loading..."
jobsContainer.appendChild(loadingText);
}









function renderingJobs(jobs) {
  clearContainer();

  jobs.forEach((job) => {
    const jobCard = document.createElement("div");
    jobCard.classList.add("job-card");

    const jobTitle = document.createElement("span");
    jobTitle.textContent = "Job Title : " + job.title;

    const company = document.createElement("span");
    company.textContent = "Company : " + job.company; // Fixed: was jobTitle.textContent

    const jobLocation = document.createElement("span");
    jobLocation.textContent = "Location : " + job.location;

    // const jobDescription = document.createElement("span");
    // jobDescription.textContent = "Description : " + job.description; // Fixed: was jobLocation.textContent

    const applyLink = document.createElement("span");
    applyLink.textContent = "Apply Here : "; // Fixed: was jobLocation.textContent

    const url = document.createElement("a");
    url.setAttribute("href", job.applyUrl); // Added: Sets the actual link destination
    url.textContent = job.applyUrl;

    // Don't forget to append the anchor link to your span element!
    applyLink.appendChild(url);

    jobCard.appendChild(jobTitle);
    jobCard.appendChild(company);
    jobCard.appendChild(jobLocation);
    // jobCard.appendChild(jobDescription);
    applyLink.appendChild(url);
    jobCard.appendChild(applyLink);

    jobsContainer.appendChild(jobCard);
  });
}

const searchBar = document.querySelector("#searchBar");

let typedQuery;

searchBar.addEventListener("input", (e) => {
  typedQuery=e.target.value.toLowerCase();
  if(typedQuery===""){
    clearContainer();
    renderingJobs(jobsArray);
  }
 
});

searchButton.addEventListener("click",()=>{
    loadingState();
   search(typedQuery);
})

function clearContainer() {
  jobsContainer.innerHTML = "";
}

function search(query) {
  const filteredJobs = jobsArray.filter((job) =>
    job.title.toLowerCase().includes(query),
  );
  clearContainer();
  renderingJobs(filteredJobs);
}

// function debounce(callback, delay) {
//   let timer;
//   return function (...arg) {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       callback(...arg);
//     }, delay);
//   };
// }
