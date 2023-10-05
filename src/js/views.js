// Opens the next section (likely what the label calling the function refers too) in the inspector UI
function openInspSection(button) {
    button.classList.toggle("active")
    button.parentElement.nextElementSibling.classList.toggle("active");
}



// Global variables
var activeViewID = undefined;
var views = {
    av8v1a: {
        viewtype: "vdoroom",
        roomData: {
            name: "testing1234TWO"
        }
    }
};


// Makes a button on left side of page to open the view when clicked
function addViewButton(viewID) {
    // console.log("adding view button")
    // console.log(views[viewID])
    if(views[viewID] !== undefined && views[viewID].viewtype === "vdoroom") {
        var listLocation = ".page.all-controls .list.rooms"

        const clone = document.querySelector(listLocation + " template").content.cloneNode(true).querySelector("button");
        clone.setAttribute('data-viewid', viewID);
        clone.querySelector("h3").innerHTML = views[viewID].roomData.name;

        document.querySelector(listLocation).appendChild(clone);
    }
}

// REMOVES a button on left side of page
function removeViewButton(viewID) {
    var query = '.page.all-controls .list.rooms [data-viewid="' + viewID + '"]'
    if(document.querySelector(query)) document.querySelector(query).remove();
}


function setCurrentView(viewID) {
    // Finding the view
    if(views[viewID]) {
        // If the view is a vdo.ninja room
        if(views[viewID].viewtype === "vdoroom") {
            activeViewID = viewID;
            // clicking button to load that view (the button click then calls "loadViewFromBTN")
            document.querySelector('button[data-viewid="' + viewID + '"').click()
        }
    }else {
        console.error("View ID '" + viewID + "' wasn't found as a view. There was a problem, and so didn't load the view.")
    }
}


// Loads the view into the viewbox
function loadViewFromBTN(button) {
    // Checking if there is a view id attribute
    var viewID = button.getAttribute("data-viewid");
    if(viewID) {
        console.log("Loading view " + viewID)
        // Code to set a view to be active
    }else {
        console.error("Can't load view without the button having a 'data-viewid' attribute. Didn't load view.")
    }
}




// Adds a vdo.ninja room as a view
function addVDORoomView(data={roomData: {}}) {
    // NO INPUT NEEDED
    // Expected input
    // data = {
    //     viewID: 1234567890
    //     roomData: {
    //          name: "Room 1"
    //     }
    // }

    console.log(data)

    // Adding random viewID if needed
    if(data.viewID === undefined) data.viewID = Math.floor(Math.random() * 1000000);
    // Adding name if needed
    if(data.roomData.name === undefined) data.roomData.name = "Funny Name";
    
    views[data.viewID] = {
        viewtype: "vdoroom",
        roomData: data.roomData
    }

    return data.viewID;
}

// Removes a view from 'views'
function removeVDORoomView(viewID) {
    delete views[viewID];
    // TODO: Could add some sort of cashe to tell when a room is previously used?
}