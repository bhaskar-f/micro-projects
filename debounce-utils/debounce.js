function debounce(callback,delay){
    let timer;
    return function(...argument){
        clearTimeout(timer);
        timer=setTimeout(()=>{
            callback(...argument);
        },delay)
    }

}

export default debounce;
