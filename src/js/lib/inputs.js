// Updates colored-background and other linked values of a slider
function positionSliderValues(slider) {
    var max = slider.max ? slider.max : 100;
    slider.style.backgroundSize = Math.round(slider.value / max * 10000) / 100 + "% 100%";
}

window.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("input[type=range]").forEach(slider => {
        slider.addEventListener("input", e => {
            positionSliderValues(e.target);
        })
        positionSliderValues(slider);
    })
});