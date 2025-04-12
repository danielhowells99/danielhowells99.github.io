function _isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

function initializeUserInput(canvas,toggle_behavior = true){

    let userInput = {
        mouse_location: {x: 0,y:0},
        mouse_force: 0.0,
        cap_flag: 0.0,
        play_flag: 1.0,
        mouse_toggle_flag: 0.0,
        mouse_start_time: 0.0,
        mouse_end_time: 0.0
    };

    const screenScale = 1.0;
    const width = canvas.width
    const height = canvas.height

    if (_isTouchDevice()){
        ontouchmove = function(e){userInput.mouse_location = {x: screenScale*e.touches[0].clientX/width, y: 1-screenScale*e.touches[0].clientY/height};userInput.mouse_force = 1.0;}
        ontouchstart = function(e){userInput.mouse_location = {x: screenScale*e.changedTouches[0].clientX/width, y: 1-screenScale*e.changedTouches[0].clientY/height};userInput.mouse_force = 1.0;}
        ontouchend = function(e){userInput.mouse_location = {x: screenScale*e.changedTouches[0].clientX/width, y: 1-screenScale*e.changedTouches[0].clientY/height};userInput.mouse_force = 0.0;}
    }
    if (!toggle_behavior){
        onmousemove = function(e){
            userInput.mouse_location = {x: screenScale*e.clientX/width, y: 1-screenScale*e.clientY/height}; 
        }

        onmousedown = function(e){
            userInput.mouse_start_time  = new Date().getTime()
            userInput.mouse_location = {x: screenScale*e.clientX/width, y: 1-screenScale*e.clientY/height}; 
            userInput.mouse_force = 1.0;
        }
        onmouseup = function(e){
            userInput.mouse_end_time = new Date().getTime()
            userInput.mouse_location = {x: screenScale*e.clientX/width, y: 1-screenScale*e.clientY/height}; 
            userInput.mouse_force = 0.0;
        }
    } else {
        onmousemove = function(e){
            userInput.mouse_location = {x: screenScale*e.clientX/width, y: 1-screenScale*e.clientY/height}; 
            userInput.mouse_force = 1.0*userInput.mouse_toggle_flag;
        }

        onmousedown = function(e){
            userInput.mouse_start_time  = new Date().getTime()
            userInput.mouse_location = {x: screenScale*e.clientX/width, y: 1-screenScale*e.clientY/height}; 
            userInput.mouse_toggle_flag = userInput.mouse_toggle_flag^1; 
            userInput.mouse_force = 1.0*userInput.mouse_toggle_flag;
        }
        onmouseup = function(e){
            userInput.mouse_end_time = new Date().getTime()
            if (userInput.mouse_end_time-userInput.mouse_start_time > 250){
                userInput.mouse_toggle_flag = userInput.mouse_toggle_flag^1; 
            }
            userInput.mouse_location = {x: screenScale*e.clientX/width, y: 1-screenScale*e.clientY/height}; 
            userInput.mouse_force = userInput.mouse_toggle_flag;
        }
    }

    document.addEventListener("keypress", function onEvent(event) {
        if (event.key == "p" || event.key == "P"){
            userInput.cap_flag = 1;
        }
        if (event.key == "a" || event.key == "A"){
            userInput.play_flag = 0.0;
        }
        if (event.key == "d" || event.key == "D"){
            userInput.play_flag = 1;
        }
    });  

    return userInput;
}

export{initializeUserInput}