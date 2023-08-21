var resizable = {
    ele: document.querySelector(".resizable"),
    // The current position of mouse
    x: 0,
    y: 0,
    // The dimension of the element,
    w: 0,
    h: 0
}
// Query the element
// var resizable.ele = document.querySelector(".resizable")

// // The current position of mouse
// let x = 0;
// let y = 0;

// // The dimension of the element
// let w = 0;
// let h = 0;

// Handle the mousedown event
// that's triggered when user drags the resizer
const mouseDownHandler = function (e) {
    console.log(e)
    if(e.target.closest(".resizable")) {
        resizable.ele = e.target.closest(".resizable");
        console.log(resizable.ele)
    }else {
        return;
    }
    // Get the current mouse position
    resizable.x = e.clientX;
    resizable.y = e.clientY;

    // Calculate the dimension of element
    const styles = window.getComputedStyle(resizable.ele);
    resizable.w = parseInt(styles.width, 10);
    resizable.h = parseInt(styles.height, 10);

    if(e.target.classList.contains("resizer-l")) {
        console.log("Whoo")
        document.addEventListener('mousemove', mouseMoveHandlerLEFT);
        document.addEventListener('mouseup', mouseUpHandlerLEFT);
        window.addEventListener('selectstart', disableSelect);
    }else if(e.target.classList.contains("resizer-r")) {
        console.log("Whoo")
        document.addEventListener('mousemove', mouseMoveHandlerRIGHT);
        document.addEventListener('mouseup', mouseUpHandlerRIGHT);
        window.addEventListener('selectstart', disableSelect);
    }else {
        console.log("Ya")
        document.addEventListener('mousemove', mouseMoveHandlerHEIGHT);
        document.addEventListener('mouseup', mouseUpHandlerHEIGHT);
        window.addEventListener('selectstart', disableSelect);
    }

};

const mouseMoveHandlerHEIGHT = function (e) {
    // How far the mouse has been moved
    const dy = e.clientY - resizable.y;

    // Adjust the dimension of element
    if(resizable.ele.getAttribute("restrict-y") === null) {
        resizable.ele.style.height = `${resizable.h + dy}px`;
    }
};
const mouseMoveHandlerLEFT = function (e) {
    // How far the mouse has been moved in X direction ONLY
    const dx = e.clientX - resizable.x;

    // Adjust the dimension of element
    if(resizable.ele.getAttribute("restrict-x") === null) {
        resizable.ele.style.width = `${resizable.w - dx}px`;
    }
};
const mouseMoveHandlerRIGHT = function (e) {
    // How far the mouse has been moved in X direction ONLY
    const dx = e.clientX - resizable.x;

    // Adjust the dimension of element
    if(resizable.ele.getAttribute("restrict-x") === null) {
        resizable.ele.style.width = `${resizable.w + dx}px`;
    }
};

const mouseUpHandlerHEIGHT = function () {
    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandlerHEIGHT);
    document.removeEventListener('mouseup', mouseUpHandlerHEIGHT);
    window.removeEventListener('selectstart', disableSelect);
    console.log(1)
};
const mouseUpHandlerLEFT = function () {
    document.removeEventListener('mousemove', mouseMoveHandlerLEFT);
    document.removeEventListener('mouseup', mouseUpHandlerLEFT);
    window.removeEventListener('selectstart', disableSelect);
    console.log(2)
};
const mouseUpHandlerRIGHT = function () {
    document.removeEventListener('mousemove', mouseMoveHandlerRIGHT);
    document.removeEventListener('mouseup', mouseUpHandlerRIGHT);
    window.removeEventListener('selectstart', disableSelect);
    console.log(2)
};



// Query all resizers
document.querySelectorAll('.resizer').forEach(resizer => {
    resizer.addEventListener('mousedown', mouseDownHandler);
})


function disableSelect(event) {
    event.preventDefault();
}

// // Loop over them
// resizers.forEach.call(resizers, function (resizer) {
// });