console.log("Started Paging script")

// var closeOnReclick = true;
// var closeLocation = "#main .pannel-section-1";
// var closeClass = "hide";

// Checks type of input and also removes "." or "#"
function checkClass(input) {
    var temp = [];
    if(input.charAt(0) == ".") {
        temp.push({
            type: "class",
            value: input.substring(1)
        })
    }else if(input.charAt(0) == "#") {
        temp.push({
            type: "id",
            value: input.substring(1)
        })
    }
    return temp;
    // This is set up so that later I can add in multiple class functionality
}

// This is really only the code for managing the button states for paging
function clickOfButtons(button, buttonList) {
    // NOTE: all buttons should be a button element, no particular repeating class on all of them needed 

    /* 
    button      = button element (likely 'this')
    buttonList  = query for element
    */

    // Getting all button lists for 
    document.querySelectorAll(buttonList).forEach(list => {
        // Removing active class from any currently active buttons
        list.querySelectorAll(":scope > .active").forEach(button => {
            button.classList.remove("active");
        })
    });
    // Adding active class to clicked button
    button.classList.add("active");
}

// Full paging switcher system
function loadPage(pageQuery, pageListQuery, options={button: null, buttonList: null, force: false}) {
    // NOTE: the .page class is required on all pages inside the pageLists for this to work

    /* 
    page        = query for element (ex: ".rooms")
    pageList    = query for element (ex: ".pages")
    options     = object of options for the function
        button      = an element
        buttonList  = an element (likely the button.parentElement)
        force       = either strings "open", or "close". Forces the page into that state no matter what the last state was.
    */


    //changing the button active or not (if the button element is there in the options object)
    if(options.button !== null && options.buttonList !== null) {
        // TODO, add the button code to change it's status
    }

    // Changing the page's classes to be active or not
    document.querySelectorAll(pageListQuery).forEach(pageList => {
        // console.log(pageList)

        // If the current page active is the one we are toggling, then toggle it off
        pageList.querySelectorAll(":scope > .page" + pageQuery + ".active").forEach(page => {
            // TODO, would need to do custom hiding/showing here because it was needed in the previous function
        })

        // Removing active from all active pages that are not our current page we are toggling
        pageList.querySelectorAll(":scope > .page:not(" + pageQuery + ").active").forEach(page => {
            page.classList.remove("active");
        })

        // Now toggling active-ness of the page we want
        pageList.querySelectorAll(":scope > .page" + pageQuery).forEach(page => {
            if(options.force !== false) {
                // If we are forcing the value to something manually
                if(options.force === "open") {
                    page.classList.add("active")
                }else if(options.force === "close") {
                    page.classList.remove("active")
                }
            }else if(options.button !== null) {
                // If we have a button, use the button's active/not-active status for the page's status
                if(options.button.classList.contains("active")) {
                    page.classList.add("active")
                }else {
                    page.classList.remove("active")
                }
            }else {
                // Else, just toggle the class
                page.classList.toggle("active")
            }
        })
    })
}

function showHideElement(button, element, buttonClass=".active", elementClass=".active") {
    var buttonClasses = checkClass(buttonClass);

    // Changing button data
    // console.log(buttonClasses)
    for (let i = 0; i < buttonClasses.length; i++) {
        if(buttonClasses[i].type === "class") button.classList.toggle(buttonClasses[i].value);
        if(buttonClasses[i].type === "id") {
            console.log(buttonClasses)
            if(button.getAttribute('id') !== null) {
                button.id = buttonClasses[i].value;
            }else {
                button.removeAttribute('id');
            }
        }
    }


    var elementClasses = checkClass(elementClass);

    // Changing page data
    var elementElement = document.querySelector(element);
    for (let i = 0; i < elementClasses.length; i++) {
        if(elementClasses[i].type == "class") elementElement.classList.toggle(elementClasses[i].value);
        if(elementClasses[i].type == "id") {
            console.log("ok")
            elementElement.id = elementClasses[i].value;
        };
    }

    // Really should check the state of the button, and match that, but that is for later!


    
}

window.addEventListener("DOMContentLoaded", (e) => {
    document.querySelectorAll("[data-original-active]").forEach(element => {
        element.click();
    })
})