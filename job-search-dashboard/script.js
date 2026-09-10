const roles = [
  "All Jobs",

  // Roles
  "Backend",
  "Frontend",
  "Fullstack",
  "Software Engineer",
  "DevOps",
  "Data",
  "Product",
  "Designer",
  "Security",
  "QA",
  "Mobile Developer",
  "Machine Learning",
  "AI Engineer",
  "Cloud Engineer",
  "Database Engineer",

  // JavaScript ecosystem
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Vue",
  "Angular",
  "Svelte",
  "Express",

  // Languages
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Kotlin",
  "Swift",

  // Cloud / DevOps
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Terraform",
  "CI/CD",

  // Data
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Data Science",
  "Data Analyst",

  // Other popular technologies
  "GraphQL",
  "REST API",
  "Git",
  "Linux",
  "Redis",
  "Firebase"
];


const jobsArrayPromise = fetchJobs(
  "https://jobremotely.io/api/v1/jobs?limit=50"
);

let jobsArray = [];

jobsArrayPromise.then((array) => {
  jobsArray = array;
  console.log(jobsArray);
  renderingJobs(jobsArray);
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
        loadingState();
        renderingJobs(jobsArray);
    }else{
        loadingState();
         search(role.toLowerCase());
    }
  })
});

const leftArrow = document.querySelector("#left-arrow");
const rightArrow = document.querySelector("#right-arrow");

rightArrow.addEventListener("click", () => {
    keywords.scrollLeft += 1600;
});

leftArrow.addEventListener("click", () => {
    keywords.scrollLeft -= 1600;
});

async function fetchJobs(url) {
  try {
    const fetchedJobobject = await fetch(url);
   const data = await fetchedJobobject.json();

 return data.data.jobs;
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

    const category = document.createElement("span");
    category.textContent = "Category : " + job.category;

    

    const jobLocation = document.createElement("span");
    jobLocation.textContent = "Location : " + job.location;

    const jobType = document.createElement("span");
    jobType.textContent = "Type : " + job.jobType;

    

    const applyLink = document.createElement("span");
    applyLink.textContent = "Apply Here : "; // Fixed: was jobLocation.textContent

    const url = document.createElement("a");
    url.setAttribute("href", job.url); // Added: Sets the actual link destination
    url.textContent = job.url;

      const expiryDateTime = new Date(job.expiresAt).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // 2. Create the element
    const applyBy = document.createElement("span");
    applyBy.textContent = "Apply by : " + expiryDateTime;
    // Don't forget to append the anchor link to your span element!
    applyLink.appendChild(url);

    jobCard.appendChild(jobTitle);
    jobCard.appendChild(category);
   
    jobCard.appendChild(jobLocation);
    jobCard.appendChild(jobType);
    
    jobCard.appendChild(applyLink);
    jobCard.appendChild(applyBy);

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

async function search(query) {
  try {
    const response = await fetch(
      `https://jobremotely.io/api/v1/jobs?search=${encodeURIComponent(query)}&limit=50`
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    clearContainer();
    renderingJobs(data.data.jobs);
  } catch (error) {
    console.error("Could not fetch jobs:", error);
  }
}

// async function search(query) {
// //   const filteredJobs = jobsArray.filter((job) =>
// //     job.title.toLowerCase().includes(query),
// //   );

//   clearContainer();
//   renderingJobs(filteredJobs);
// }

// function debounce(callback, delay) {
//   let timer;
//   return function (...arg) {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       callback(...arg);
//     }, delay);
//   };
// }
