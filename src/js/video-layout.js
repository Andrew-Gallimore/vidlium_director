// Setting aspect ratio value for all .video elements
function initVideoGridApsects() {
    document.querySelectorAll(".content-pages .room.page .video").forEach(element => {
        var ratio = eval(getComputedStyle(element).aspectRatio);
        element.setAttribute("aspectratio", Math.round(ratio * 10000) / 10000);
    })
}
initVideoGridApsects();


// Setting up zoom slider for video grid
function initVideoGridZoom() {
    var slider = document.querySelector(".content-pages .zoom input");
    slider.addEventListener("input", e => {
        // console.log(e.originalTarget.value)

        // Setting width of elements
        document.querySelectorAll(".content-pages .room.page .video").forEach(element => {
            element.style.width = videoScaling(element.getAttribute("aspectratio"), e.originalTarget.value) + "px";
            // console.log(element.getAttribute("aspectratio"))
        })
    })

    // Setting width of elements for the first time
    document.querySelectorAll(".content-pages .room.page .video").forEach(element => {
        element.style.width = videoScaling(element.getAttribute("aspectratio")) + "px";
    })
}
initVideoGridZoom();


// Calculates the scaling of video feeds based on aspect ratio and a prefered width at 16/9
function videoScaling(aspect, width=false) {
    // The optimal width of a video when its at 16/9 ratio.
    var optimalWidth = 300;
    if(!width) {
        width = optimalWidth;
    }
    
    // Scaling and yOffset are directly from the output of desmos
    //Link to how equation was found https://www.desmos.com/calculator/twwq1zlppn
    var yOffset = 123.036;
    var scaling = 99.6926;
    
    var fullOffset = yOffset - optimalWidth + Number(width);
    var possibleWidth = Math.max((scaling * aspect) + fullOffset, 0);
    
    // Counteracting the extreme scaling of extream aspect ratios at small widths
    if(possibleWidth < 120) {
        fullOffset = fullOffset + Math.max(((120 - possibleWidth) / 2), 0);
    }
    
    return Math.max((scaling * aspect) + fullOffset, 0);
}


// var FlexMasonry;
// // Loading up the current room's grid
// async function loadVideoGrid() {
//     // Checks every 0.5 seconds to see if lib has been loaded to initialize it
//     var Obj = setInterval(() => {
//         if(FlexMasonry !== undefined && FlexMasonry !== null) {
//             FlexMasonry.init('.video-grid', {
//                 responsive: true,
//                 breakpointCols: {
//                     'min-width: 1500px': 3,
//                     'min-width: 1100px': 2,
//                     'min-width: 992px': 1,
//                 },
//             });
//             console.log(FlexMasonry)
//             clearInterval(Obj)
//         }
//     }, 500, Obj);
// }
// loadVideoGrid();