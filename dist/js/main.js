var VStreamData = {
    timeCreated: Date.now(),
    publicName: undefined
}

var localStateData = {
    searching: false
}
// ----------------
// - Stream Setup -
// ----------------

// Checking if someone is creating a new stream or joining one
// Getting data from URL
async function startup() {
    var URLparams = (new URL(document.location)).searchParams;
    if(URLparams.get("c") && URLparams.get("c") !== localStorage.getItem("createdC")) {
        // Treat as someone joining someone else who has a c value
        console.warn("Treating you as someone joining with c-value")
        
        // Showing modal that says the page is checking for other directors
        localStateData.searching = true;
        alert.searchingForDirector.showMain();
        alert.searchingForDirector.setProgressBar(0.1);

        // Loading the pubcoms system
        await loadComSys(false);
        console.log(pubcoms.mainIn)
        
        // Adding custom events to joining process for the UI popup
        alert.searchingForDirector.setProgressBar(0.3);
        pubcoms.mainIn.on("found-peer", () => {
            alert.searchingForDirector.setProgressBar(0.55);
            alert.searchingForDirector.setProgressMessage("Checking credentials...");
        })
        pubcoms.mainIn.on("first-raw-resp", () => {
            alert.searchingForDirector.setProgressBar(0.8);
            alert.searchingForDirector.setProgressMessage("Getting config...");
        })
        pubcoms.mainIn.on("recived-full-config", data => {
            alert.searchingForDirector.setProgressBar(1);
            alert.searchingForDirector.setProgressMessage("Success");
            // alert.searchingForDirector.setState("success")
        })
        pubcoms.mainIn.on("coms-empty", () => {
            alert.searchingForDirector.setProgressMessage("Error");
            alert.searchingForDirector.setState("error")
        })
    }else {
        // Treat as someone creating new stream (even if they already have created a c-value)

        // TODO: Make popup telling them to name the stream

        console.warn("Treating you as someone making new room (no c value)")

        // Loading the pubcoms system *as the creator* (that's the 'true' parameter)
        await loadComSys(true);
        console.log(pubcoms.mainIn)

        // Creating c value for URL(if needed) and now trying to load pubcoms
        if(!URLparams.get("c")) {
            var c = pubcoms.createC();
            var p = pubcoms.createC();
            addURLParameter("c", btoa(c + '--d' + p));
            localStorage.setItem("createdC", btoa(c + '--d' + p));

            pubcoms.mainIn.load({c: c, p: p})
        }else {
            // pubcoms.mainIn.load()
        }

        // And now trying to load pubcoms
    }
}
startup();

async function loadComSys(isCreator) {
    // Loading coms
    await loadScript("js/pubcoms.js", () => {
        // Creating a pubcoms instance
        var coms = new pubcoms.Instance(isCreator);

        // Setting up listeners to com events
        // Loading conditions
        coms.on("found-peer", () => {
            // We had at least one person also using coms connect.
            // NOTE: It does not suggest anything about auth status or any data avalible
            console.log("> Found Peer")
        })
        coms.on("first-raw-resp", () => {
            // We recived a message in responce to our inital message.
            // This shows someone else is also part of the vidlium system
            console.log("> First responce message")
        })

        // Fail conditions
        coms.on("invalid-url", msg => {
            console.log("> Invalid URL")
            if(msg === "no-c") {
                // No c value in URL params, should already be handled by the larger system, don't worry.

            }else if(msg === "bad-c-value"){
                // Warn the user the join link isn't propper
            }
        })
        coms.on("bad-password", () => {
            // Warn user the join link isn't propper
            console.log("> Bad Password")
        })
        coms.on("coms-empty", () => {
            // Warn user the join link isn't propper, or the other directors have disconnected and lost the config
            console.log("> Empty Room")
        })

        // Messaging events
        coms.on("recived-rooms", data => {
            console.log("> Recived Rooms")
            console.log(data)
            // Data will be in the form of an array with the rooms added
            // EX: ["Room 1", "Room 2"]
            // Look at coms.db.rooms to see stored list
        })
        // This one isn't added to the pubcoms.js script yet - not functional
        coms.on("recived-full-config", data => {
            console.log("> Recived full config")
            console.log(data)
        })
        coms.on("updated-rooms", data => {
            console.log("> Updated Rooms")
            console.log(data)
            // Data will be in the form of an array with the new rooms added
            // EX: ["Room 1", "Room 2"]
            // Look at coms.db.rooms to see full list
        })

        // Starting up the coms
        coms.load();
    })
}



// Sudo Code

// First, check if someone is creating new stream or not

// Second, syncrounously:
// Initialize coms lib and load coms system
    // If they are creaing new stream
        // Generate new coms
    // Else, they are joining an already configured stream
        // So wait to see if there is a config in the coms

        // If there is a config, and vdo.ninja has loaded, loadrooms() & such
        // Else, notify the user the code is wrong or something


// AND Initialize vdo.ninja lib
    // Once loaded, notify plugin lib (if its started up already) so it can tell the plugins

// AND (at less priority) Initialize plugin lib.
    // Need to know which plugins to load
    // Once loaded, check if vdo.ninja is loaded
        // If so, tell plugins to start