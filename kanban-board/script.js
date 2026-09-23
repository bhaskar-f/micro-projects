

let taskArray = getTasks();

taskArray.forEach((task)=>{
  task.id??=crypto.randomUUID();
})
renderTasks();
const addButton = document.querySelector("#add-task-btn");

addButton.addEventListener("click", () => {
  const todoForm = document.createElement("form");
  todoForm.classList.add("todo-form");

  const inputTitle = document.createElement("input");
  inputTitle.type = "text";
  inputTitle.placeholder = "Title";

  const inputDesc = document.createElement("input");
  inputDesc.type = "text";
  inputDesc.placeholder = "Description";

  const inputPriority = document.createElement("select");
  ["Low", "Medium", "High"].forEach((text) => {
    const option = document.createElement("option");
    option.value = text.toLowerCase();
    option.textContent = text;
    inputPriority.appendChild(option);
  });

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Add Task";

  todoForm.appendChild(inputTitle);
  todoForm.appendChild(inputDesc);
  todoForm.appendChild(inputPriority);
  todoForm.appendChild(submitBtn);

  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();

   
    const obj = makeTaskObj(
      inputTitle.value,
      inputDesc.value,
      inputPriority.value,
    );
    addTask(obj);
    todoForm.style.display="none";
  });
  document.body.appendChild(todoForm);
  
});

function makeTaskObj(title, desc, priority) {
  let obj = {};
  
  obj.title = title;
  obj.description = desc;
  obj.priority = priority;
  obj.status = "todo";

  return obj;
}
function addTask(obj) {
  taskArray.push(obj);

  saveTasks();
 
  renderTasks();
}

function saveTasks(){
localStorage.setItem("tasksArray",JSON.stringify(taskArray));
}
function getTasks(){
  const taskArrayFromLocalStorage=JSON.parse(localStorage.getItem('tasksArray')) || [];
return taskArrayFromLocalStorage;
}

function renderTasks() {

 

  const taskCount = document.querySelectorAll(".task-count");
  const taskLists=document.querySelectorAll(".task-list");
  taskLists.forEach((tasklist)=>tasklist.replaceChildren());


 

  taskCount.forEach((count)=>{
    const status=count.closest(".column").dataset.status;
    const array=taskArray.filter((task)=>task.status===status);
    count.innerHTML=array.length;
  })
  taskArray.forEach((task) => {
    const taskList=document.querySelector(`.column[data-status="${task.status}"] .task-list`)
    // taskList.replaceChildren();
    const taskArticle = document.createElement("article");
    const taskHeading = document.createElement("h3");
    const taskDesc = document.createElement("p");
    const taskFooter = document.createElement("div");
    const taskPriority = document.createElement("span");

    taskArticle.className = "task-card";
    taskArticle.setAttribute("draggable", "true");
    taskArticle.dataset.id=task.id;
    taskArticle.dataset.status=task.status;

    taskFooter.className = "task-footer";

    taskPriority.classList.add("priority");

    taskHeading.textContent=task.title;
    taskDesc.textContent=task.description;
    taskPriority.innerHTML=task.priority;
    taskPriority.classList.add(task.priority)

    taskFooter.appendChild(taskPriority);
    taskArticle.appendChild(taskHeading);
    taskArticle.appendChild(taskDesc);
    taskArticle.appendChild(taskFooter);
    taskList.appendChild(taskArticle);
   
  });
}


const taskCards=document.querySelectorAll(".task-card");
const columns=document.querySelectorAll(".task-list");


columns.forEach((column,index)=>{

column.addEventListener("dragstart",(e)=>{
  const card=e.target.closest(".task-card")
  if(card) card.classList.add("dragging")
})  
column.addEventListener("dragend",(e)=>{
  const card=e.target.closest(".task-card")
  if(card) card.classList.remove("dragging")
})


column.addEventListener("dragover",(e)=>{
  e.preventDefault();
column.classList.add("drag-card");
})
column.addEventListener("dragleave",()=>{
column.classList.remove("drag-card");
})
column.addEventListener("drop",()=>{
  column.classList.remove("drag-card");
  const draggingCard=document.querySelector(".dragging");
  if(draggingCard){
    column.appendChild(draggingCard);
    draggingCard.dataset.status=column.parentElement.dataset.status;
  const newStatus=column.parentElement.dataset.status;
  
  const task=taskArray.find((task)=>task.id===draggingCard.dataset.id);
 
  if(task){
    task.status=newStatus;
  saveTasks();
    renderTasks();
  }

  }
})

})

const deleteIcon=document.querySelector(".delete-zone");

deleteIcon.addEventListener("dragenter",(e)=>{
e.preventDefault()
deleteIcon.classList.add("drag-over")
const image=deleteIcon.querySelector("img");
image.src="recycle-bin-open.png"
})

deleteIcon.addEventListener("dragover",(e)=>{
e.preventDefault()
})

deleteIcon.addEventListener("dragleave",(e)=>{
if (!deleteIcon.contains(e.relatedTarget)) {
    deleteIcon.classList.remove("drag-over");
    const image=deleteIcon.querySelector("img");
image.src="recycle-bin.png"
  }
})

deleteIcon.addEventListener("drop",(e)=>{
e.preventDefault()
deleteIcon.classList.remove("drag-over")
  const image=deleteIcon.querySelector("img");
image.src="recycle-bin.png"
 const draggingCard=document.querySelector(".dragging");
  const task=taskArray.find((task)=>task.id===draggingCard.dataset.id);
  const newArrayAfterDelete=taskArray.filter((t)=>t.id!=task.id);
  taskArray=newArrayAfterDelete;
 saveTasks();
  renderTasks();
})