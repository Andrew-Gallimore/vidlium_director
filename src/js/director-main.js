/* The parent script running all the sub scripts and functions directors page uses.
 * Created:         5.9.23
 * Contributors:    Andrew G.
 */


// Accesses localstorage in browser/device, uses lib to aid in that
// var localData = localDataStorage(Date.now() + Math.floor(Math.random() * 100) + "");

// Gets the ball rolling for the portal.js lib and opens 'connecting' dialog(s)
function startup() {
    // Getting the channel hash from the URL
    var URLparams = (new URL(document.location)).searchParams;
    if(URLparams.get("c")) {
        alert.searchingForDirector.showMini();
        alert.searchingForDirector.setProgressBar(0.1);
        alert.searchingForDirector.setProgressMessage('Starting up...');
        
        try {
            var fields = atob(URLparams.get("c")).split('--d');
            if(fields.length === 2) {
                // We have a good c value
                console.log("Yay")
                // localData.safeset('createdStream', false);
                object = {
                    c: fields[0],
                    p: fields[1]
                }
                console.log(object)
            }else {
                // We don't have a good c value
                console.log("creating new C value")
                createNewC();
                // localData.safeset('createdStream', true);
            }
        }catch (error) {
            console.error(error)
            alert.searchingForDirector.setProgressMessage("Error");
            alert.searchingForDirector.setState("error")
        }
        
    }else {
        // The URL doesn't have c-value :(
        console.log("creating new C value")
        createNewC();
        // localData.safeset('createdStream', true);
    }

    loadPortal()
}
startup();


// Used in startup for the URL C values
function createNewC() {
    var rand = Math.floor(Math.random() * 100000000000000).toString(36);
    rand.replace("--d", "ifykyk") //replacing the deliniator with random str so that it doesn't randomly break the c-value

    var rand2 = Math.floor(Math.random() * 100000000000000).toString(36);
    rand2.replace("--d", "ifykyk") //replacing the deliniator with random str so that it doesn't randomly break the c-value

    addURLParameter("c", btoa(rand + '--d' + rand2));
}

// Opens the a portal instance from the Portal.js Library
function loadPortal() {
    // Portal loading error States
    Portal.on('channel-empty', () => {
        console.log("> Coms Empty")
        alert.searchingForDirector.setProgressMessage("No other Directors found.");
        alert.searchingForDirector.setState("error")
    })
    Portal.on('failed-auth', () => {
        console.log("> Failed Auth")
        alert.searchingForDirector.setProgressMessage("Password incorrect. Double check your link.");
        alert.searchingForDirector.setState("error")
    })

    // portal loading success states
    Portal.on('found-peer', () => {
        console.log("> Found a Peer")
        alert.searchingForDirector.setProgressBar(0.55);
        alert.searchingForDirector.setProgressMessage("Checking credentials...");
    })
    Portal.on('authed', () => {
        console.log("> We Authed")
        alert.searchingForDirector.setProgressBar(0.8);
        alert.searchingForDirector.setProgressMessage("Getting config...");
    })
    Portal.on('recive-full-config', () => {
        console.log("> Recived Full Config")
        alert.searchingForDirector.setProgressBar(1);
        alert.searchingForDirector.setProgressMessage("Success");
        alert.searchingForDirector.setState("success")
    })

    // Managing directors
    Portal.on('add-director', (UUID) => {
        var listLocation = ".director-list";

        console.log("> Adding a director")
        var clone = document.querySelector(listLocation + " template").content.cloneNode(true).querySelector(".icon");
        clone.setAttribute('uuid', UUID);
        clone.style.background = randomColor(90);

        document.querySelector(listLocation).appendChild(clone);
    })
    Portal.on('remove-director', (UUID) => {
        var listLocation = ".director-list";

        console.log("> Removing a director")
        document.querySelector(listLocation + " [uuid='" + UUID + "']").remove()
    })


    // Managing rooms
    Portal.on('updated-rooms', regenerateRooms)

    // Now loading the portal (either as creator or not)
    Portal.loadPrimaryChannel(true, {
        c: "testingVIDLIUM",
        p: "testing"
    })
    // Portal.loadPrimaryChannel(localData.safeget('createdStream'), {
    //     c: "testingVIDLIUM",
    //     p: "testing"
    // })
}

// Used in startup for when anonymous director icons need to be made
function randomColor(brightness){
    function randomChannel(brightness){
        var r = brightness;
        var n = 0|((Math.random() * r) + brightness);
        var s = n.toString(16);
        return (s.length==1) ? '0'+s : s;
    }
    return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
}





// Adds a room per user request
function userCreatingRoom(name="") {
    // TODO: Check if the room is already created in views

    // Adding view & its related UI
    var data = {roomData: {}}
    if(name.length > 0) {
        data.roomData.name = name;
    }
    var viewID = addVDORoomView(data);
    addViewButton(viewID);

    // Pinging others that we are adding a room
    Portal.addRooms([{
        viewID: viewID,
        roomData: views[viewID].roomData
    }]);

    // TODO: Add resources manager to manage what rooms need to be open or which can be closed/only-opened when needed
    // Opening vdo.ninja room through vdowrapper.js
    generateVdoRoom(views[viewID].roomData);
}

// Adds a room per user request
function userRemovingRoom(viewID) {
    // Check if the room is created in views
    if(views[viewID] === undefined) {
        console.warn("View '" + viewID + "' doesn't exist, can't remove it")
    }
    
    // Pinging others that we are removing a room
    Portal.removeRooms([{
        viewID: viewID,
        roomData: views[viewID].roomData
    }]);
    
    // TODO: Remove vdo.ninja room through vdowrapper.js

    // Removing view & its UI
    removeViewButton(viewID);
    removeVDORoomView(viewID);
}

// Checks what rooms are loaded, and sees if there are any updates needed
// Should only be called on "updated-rooms" from the Portal
function regenerateRooms() {
    var foundPrimary = false;
    for (const room of Portal.db.rooms) {
        // Setting this room as the primary one to load if none are currently in view
        if(room.primaryView) foundPrimary = room.viewID;

        // Loading the rooms that aren't in views yet
        if(!(room.viewID in views)) {
            addVDORoomView(room);
            addViewButton(room.viewID);

            generateVdoRoom(room.roomData);
        }

        // TODO: add loop over all views, to see if there are any that aren't in the portal db, and deleting them.
    }

    // Choosing what room view to display if none are displayed
    if(!activeViewID) {
        if(foundPrimary) {
            setCurrentView(foundPrimary);
        }else {
            var viewID = Object.keys(views)[0];
            setCurrentView(viewID);
        }
    }
}

// Starts up a vdo.ninja room
function generateVdoRoom(roomData) {
    console.log("Generating room: " + "testROOOMID");
    var room = new vdo.Room("testROOOMID", {codirectorPassword: "coPassword"});
    room.register()
    .then(data => {
        // Success
        console.log(data)
    }).catch(err => {
        // Error
        console.warn(err)
    })
    room.on("director-status", e => {
        console.log("Director Status Event")
        console.log(e)
    });
    
    // Fired as soon as a new person is joining, no data is added yet nessesarally when this fires
    room.on("person-joining", person => {
        // e.preventDefault();
        console.log("Person joining event!")
        console.log(person)
    })
    // When the primary video element is created for the person
    room.on("primary-video-created", e => {
        // e.preventDefault();
        console.log("Primary video created event!")
        console.log(e)
    })
    // When a screenshare video element is created for the person
    room.on("screenshare-video-created", e => {
        // e.preventDefault();
        console.log("Screenshare video created event!")
        console.log(e)
    })
    // Fired after all the information is gathered for the guest
    room.on("person-connected", person => {
        // e.preventDefault();
        console.log("LOADED GUEST!!!!!!")
        console.log(person)
        person.addToScene();

        person.primaryFeed.classList.add("video")
        person.primaryFeed.setAttribute("aspectratio", person.config.aspectRatio)

        var temp = document.createElement("div")
        temp.classList.add("person");
        temp.appendChild(person.primaryFeed)

        document.querySelector(".page.room .scroll").appendChild(temp)
    })
    
    room.on("person-left", e => {
        // e.preventDefault();
        console.log("Person Left!")
        console.log(e)
    })
}