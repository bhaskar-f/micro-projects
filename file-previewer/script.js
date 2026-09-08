const fileInput = document.querySelector("#fileInput");
const preview = document.querySelector("#filePreview");
const fileList = document.querySelector("#fileList");

function clearPreview() {
  preview.innerHTML = "";
}

function listHandler(list) {
  console.log("START");

  for (let i = 0; i < list.length; i++) {
    const parentDiv = document.createElement("div");
  
    parentDiv.addEventListener("click", () => {
      filePreviewer(list[i]);
      const currentActive=fileList.querySelector(".active");

      if(currentActive){
        currentActive.classList.remove("active")
      }

      parentDiv.classList.add("active");
    });
    const childDiv1=document.createElement("div");
    const childDiv2=document.createElement("div");
    const childDiv3=document.createElement("div");

    const fileName_label = document.createElement("span");
    fileName_label.textContent = "File Name :";
    const fileName_value = document.createElement("span");
    fileName_value.textContent = list[i].name;
    fileName_value.setAttribute("title", list[i].name);
    const fileSize_label = document.createElement("span");
    fileSize_label.textContent = "File Size :";
    const fileSize_value = document.createElement("span");
    fileSize_value.textContent = ` ${
      list[i].size < 1024
        ? list[i].size + " Bytes"
        : list[i].size < 1024 * 1024
          ? (list[i].size / 1024).toFixed(2) + " KB"
          : (list[i].size / (1024 * 1024)).toFixed(2) + " MB"
    }`;
    const fileType_label = document.createElement("span");
    fileType_label.textContent = "File Type :";
    const fileType_value = document.createElement("span");
    fileType_value.textContent = list[i].type;

    childDiv1.appendChild(fileName_label);
    childDiv1.appendChild(fileName_value);
    childDiv2.appendChild(fileSize_label);
    childDiv2.appendChild(fileSize_value);
    childDiv3.appendChild(fileType_label);
    childDiv3.appendChild(fileType_value);

    parentDiv.appendChild(childDiv1);
    parentDiv.appendChild(childDiv2);
    parentDiv.appendChild(childDiv3);

    fileList.appendChild(parentDiv);
  }
  console.log("END");
}

function filePreviewer(file) {
  if (!file) return;

  if (file.type.startsWith("image/")) {
    previewImage(file);
  } else if (file.type.startsWith("text/")) {
    previewText(file);
  } else if (file.type === "application/json") {
    previewJSON(file);
  } else if (file.type.startsWith("audio/")) {
    previewAudio(file);
  } else if (file.type.startsWith("video/")) {
    previewVideo(file);
  } else if (file.type === "application/pdf") {
    previewPDF(file);
  } else {
    showUnsupported();
  }
}

fileInput.addEventListener("change", handleFile);

function handleFile(event) {
  const files = event.target.files;
  listHandler(files);
}

function previewImage(file) {
  clearPreview();

  const imageUrl = URL.createObjectURL(file);

  const image = document.createElement("img");
  image.src = imageUrl;

  preview.appendChild(image);
}

async function previewText(file) {
  clearPreview();
  const text = await file.text();
  const textFile = document.createElement("pre");
  textFile.textContent = text;

  preview.appendChild(textFile);
}

async function previewJSON(file) {
  try {
    clearPreview();
    const text = await file.text();
    const data = JSON.parse(text);
    const formattedJson = JSON.stringify(data, null, 2);

    const jsonFile = document.createElement("pre");
    jsonFile.textContent = formattedJson;

    preview.appendChild(jsonFile);
  } catch (error) {
    console.log(error);
    preview.textContent = "Invalid JSON file.";
  }
}

function previewAudio(file) {
  clearPreview();
  const fileUrl = URL.createObjectURL(file);
  const audioFile = document.createElement("audio");
  audioFile.setAttribute("controls", "");
  audioFile.src = fileUrl;
  preview.appendChild(audioFile);
}

function previewVideo(file) {
  clearPreview();

  const fileUrl = URL.createObjectURL(file);

  const videoFile = document.createElement("video");

  videoFile.setAttribute("controls", "");
  videoFile.src = fileUrl;

  preview.appendChild(videoFile);
}

function previewPDF(file) {
  clearPreview();
  const fileUrl = URL.createObjectURL(file);

  const pdfFile = document.createElement("iframe");

  pdfFile.src = fileUrl;

  preview.appendChild(pdfFile);
}

function showUnsupported() {
  clearPreview();
  const element = document.createElement("p");
  element.innerHTML = `⚠️ Preview not available

This file type cannot be previewed in the browser.`;

  preview.appendChild(element);
}
