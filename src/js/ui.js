// Opens the next section (likely what the label calling the function refers too) in the inspector UI
function openInspSection(button) {
    button.classList.toggle("active")
    button.parentElement.nextElementSibling.classList.toggle("active");
}
