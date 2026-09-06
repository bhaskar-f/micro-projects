import debounce from "./debounce.js";

function search(query){
    console.log("search for: ",query);
}

const searchedFunction=debounce(search,300);

searchedFunction("j");
searchedFunction("ja");
searchedFunction("jav");
searchedFunction("java")
searchedFunction("hello")
searchedFunction("world")
