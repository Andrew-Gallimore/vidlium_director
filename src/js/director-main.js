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
        console.log(clone)
        clone.setAttribute('uuid', UUID);
        clone.style.background = randomColor(90);

        document.querySelector(listLocation).appendChild(clone);
    })

    Portal.on('remove-director', (UUID) => {
        var listLocation = ".director-list";

        console.log("> Adding a director")
        document.querySelector(listLocation + " [uuid='" + UUID + "']").remove()
    })

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
startup();


// Used in startup for the URL C values
function createNewC() {
    var rand = Math.floor(Math.random() * 100000000000000).toString(36);
    rand.replace("--d", "ifykyk") //replacing the deliniator with random str so that it doesn't randomly break the c-value

    var rand2 = Math.floor(Math.random() * 100000000000000).toString(36);
    rand2.replace("--d", "ifykyk") //replacing the deliniator with random str so that it doesn't randomly break the c-value

    addURLParameter("c", btoa(rand + '--d' + rand2));
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




// Global variables
var views = {
    av8v1a: {
        viewtype: "vdoroom",
        data: {
            roomObject: {}
        }
    }
};

// Loads the view into the viewbox
function loadView(button) {
    // Checking if there is a view id attribute
    var vid = button.getAttribute("data-viewid");
    if(vid) {
        // Finding the view
        if(views[vid]) {
            // If the view is a vdo.ninja room
            if(views[vid].viewtype === "vdoroom") {
                // load the room based on data from the roomObject
                console.log("Loading vdo.ninja room " + vid)
            }
        }else {
            console.error("View ID '" + vid + "' wasn't found as a view. There was a problem, and so didn't load the view.")
        }
    }else {
        console.error("Can't load view without the button having a 'data-viewid' attribute. Didn't load view.")
    }
}