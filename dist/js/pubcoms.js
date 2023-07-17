console.log("PubComs Running");
// TODO: Add tracking to tell when all the tracker URL's are looked at and there wasn't any successful connections (as another fail condition)

// The main library object
var pubcoms = {
    mainIn: {},
    Instance: class {
        constructor(_isCreator=false, _rooms=[]) {
            this.p2pt = null;
            this.peerList = [];
            
            // Loaded status of the coms
            this.loadStatus = undefined;

            // The password of the page for coms
            this.userAuth = "";

            // Different status' for while the coms are loading
            this.loading = {
                connectedFirstPeer: false,
                recivedFirstMessage: false,
                badPassword: false,
                startedProcess: false,
                foundPeerConfig: false
            }

            var _hasValues = false;
            if(_isCreator) {
                _hasValues = true;
            }
            // Database for all stored data
            this.db = {
                rooms: _rooms,
                hasValues: _hasValues
            }
    
            // List of URLS that p2pt uses to connect in
            this.trackersAnnounceURLs = [
                "wss://tracker.openwebtorrent.com",
                // "wss://tracker.sloppyta.co:443/announce",
                // "wss://tracker.novage.com.ua:443/announce",
                // "wss://tracker.btorrent.xyz:443/announce",

                "wss://tracker.btorrent.xyz",
                "wss://tracker.files.fm:7073/announce",
                // "ws://tracker.files.fm:7072/announce"
            ];

            pubcoms.mainIn = this;
            this.events = {}
        }
    
        async load(customCvalue=false) {
            if(this.loading.startedProcess) {
                console.error("Already started loading or have loaded the room previously.")
                return;
            }

            var object = false;
            if(customCvalue) {
                object = customCvalue;
            }else {
                var URLparams = (new URL(document.location)).searchParams;
        
                // Getting the coms hash from the URL
                if(URLparams.get("c")) {
                    try {
                        var fields = atob(URLparams.get("c")).split('--d');
                        if(fields.length === 2) {
                            console.log("Yay")
                            object = {
                                c: fields[0],
                                p: fields[1]
                            }
                        }else {
                            throw "";
                        }
                    }catch (error) {
                        // console.error("c=value in URL was not a propper format. Not able to set up p2pt. Unhashed value was: " + atob(URLparams.get("c")))
                        this.dispatch("invalid-url", "bad-c-value")
                        this.loadStatus = false;
                    }
                    
                }else {
                    // console.error("Need a c=value in URL. Didn't set up p2pt.")
                    this.dispatch("invalid-url", "no-c")
                    this.loadStatus = false;
                }
            }

            // Checking if the object is there and then if the required data is in it
            if(object) {
                if(object.c !== undefined && object.p !== undefined) {
                    // Loading nessesary P2PT script, if it hasn't been loaded already
                    if(!pubcoms.loadedNeededScript) {
                        await pubcoms.loadScript("https://cdn.jsdelivr.net/gh/subins2000/p2pt/dist/p2pt.umd.min.js", () => {
                            pubcoms.loadedNeededScript = true;
                        })
                    }

                    // Setting global variable
                    this.userAuth = object.p;

                    // Updating variable for if room is being created
                    this.loading.startedProcess = true;
        

                    // Making the p2pt app
                    var p2pt = new P2PT(this.trackersAnnounceURLs, object.c);
                    // If a tracker connection was successful
                    p2pt.on('trackerconnect', (tracker, stats) => {
                        this.loadStatus = true;
                    })
                    // Starting the app up
                    p2pt.start()

        
                    // If a new peer, send message
                    p2pt.on('peerconnect', (peer) => {
                        console.log("peer")
                        // Adding peer to the list
                        this.peerList.push(peer);
                        if(!this.loading.connectedFirstPeer) {
                            this.loading.connectedFirstPeer = true;
                            this.dispatch("found-peer", "");
                        }

                        if(!this.loading.foundPeerConfig) {
                            // Sending initial message to peer to see if they repond and have a stored a config
                            p2pt.send(peer, {
                                "action": "imHere",
                                "password": object.p
                            }).then(([peer, msg]) => {
                                // We likely recived our first message!
                                if(!this.loading.recivedFirstMessage) {
                                    this.loading.recivedFirstMessage = true;
                                    this.dispatch("first-raw-resp", "");
                                }

                                // If we haven't already found someone and sent a request
                                console.log(msg)
                                if(msg.status === "401") {
                                    // We don't have the right password as credentials
                                    if(!this.loading.badPassword) {
                                        this.loading.badPassword = true;
                                        this.dispatch("bad-password", "");
                                    }

                                }else if(msg.status === "200") {
                                    this.loading.badPassword = false;

                                    if(msg.hasValues) {
                                        // Successful password as credentials and they have a config to share

                                        if(!this.loading.foundPeerConfig) {
                                            // Sending request to get the full config of the system
                                            p2pt.send(peer, {
                                                "action": "getFullConfig",
                                                "password": object.p
                                            }).then(([peer, msg]) => {
                                                // Checking if the request was fullfilled
                                                if(msg.status === "401") {
                                                    // Rejected password
                                                    console.warn("We don't have a proper password. Couldn't read the config.")
                                                }else if(msg.status === "200") {
                                                    // Successful password
                                                    this.db.hasValues = true;
                                                    this.db.rooms = msg.rooms;

                                                    this.dispatch("recived-full-config", msg);
                                                }
                                            })
                                            this.loading.foundPeerConfig = true;
                                        }
                                    }
                                }
                            })
                        }
                    })

                    // // Checking if the request was fullfilled
                    // if(msg.status === "401") {
                    //     // Rejected password
                    //     if(!this.loading.authed) {
                    //         this.loading.badPassword = true;
                    //     }
                    //     this.dispatch("bad-password", "");

                    //     console.warn("We don't have a proper password. Couldn't read rooms.")
                    // }else if(msg.status === "404") {
                    //     // Successful password, but theres no rooms stored
                    //     this.loading.authed = true;
                    //     this.loading.badPassword = false;

                    //     console.warn('They had No Rooms')
                    // }else if(msg.status === "200") {
                    //     // Successful password, they had rooms to send
                    //     this.loading.authed = true;
                    //     this.loading.badPassword = false;
                    //     if(!this.loading.recivedRooms) {
                    //         this.dispatch("recived-rooms", msg.rooms)
                    //     }
                    //     this.loading.recivedRooms = true;
                    //     this.db.rooms = msg.rooms;

                    //     console.warn('Got room(s)')
                    // }

                    // If a peer is leaving
                    p2pt.on('peerclose', (peer) => {
                        // Removing the peer from the peer list
                        for(var i=0; i < this.peerList.length; i++) {
                            if(this.peerList[i].id == peer.id) {
                               this.peerList.splice(i,1);
                            }
                        }
                    })

                    // Reciving the messages, specifically updateRooms or getRooms messages
                    p2pt.on('msg', (peer, msg) => {
                        // Making sure that the message is in object form
                        if(typeof msg === "object")

                        // First checking credentials
                        if(msg.password !== this.userAuth) {
                            peer.respond({
                                "status": "401"
                            })
                            return;
                        }

                        // Now checking the actual content of message
                        if(msg.action === "updateRooms") {
                            if(msg.password === this.userAuth) {
                                // They have a correct password
                                // Listing the new rooms added so it can be put into the event
                                var difference = this.db.rooms
                                .filter(x => !msg.rooms.includes(x))
                                .concat(msg.rooms.filter(x => !this.db.rooms.includes(x)));

                                this.db.rooms = msg.rooms;
                                this.dispatch("updated-rooms", difference);
                            }
                        }else if(msg.action === "getRooms") {
                            // Someone is looking to get the rooms stored
                            if(msg.password === this.userAuth) {
                                if(this.db.rooms.length > 0) {
                                    peer.respond({
                                        "status": "200",
                                        "rooms": this.db.rooms
                                    })
                                }else {
                                    peer.respond({
                                        "status": "404",
                                        "rooms": ""
                                    })
                                }
                            }else {
                                // They don't have a correct password
                                peer.respond({
                                    "status": "401",
                                    "rooms": ""
                                })
                            }
                        }else if(msg.action === "getFullConfig") {
                            peer.respond({
                                "status": "200",
                                "rooms": this.db.rooms
                            })
                        }
                    })
        
                    // Reciving the messages, specifically the first communication message sent
                    p2pt.on('msg', (peer, msg) => {
                        // Making sure that the message is in object form
                        if(typeof msg === "object")
        
                        // Someone else is looking to get the rooms
                        if(msg.action === "imHere") {
                            if(msg.password === this.userAuth) {
                                peer.respond({
                                    "status": "200",
                                    "hasValues": this.db.hasValues
                                })
                            }else {
                                // They don't have a correct password
                                peer.respond({
                                    "status": "401"
                                })
                            }
                        }
                    })

                    // Setting timeout for telling if the room is empty
                    setTimeout(() => {
                        if(!this.loading.recivedFirstMessage) {
                            this.dispatch("coms-empty", "")
                        }
                    }, 6000);

                    // Adding p2pt to the instance
                    this.p2pt = p2pt;
                }else {
                    this.loadStatus = false;
                    if(customCvalue) {
                        console.error("Object passed into .load() didn't have the required data. Not setting up p2pt.")
                        console.log(object)
                        this.dispatch("invalid-object", "")
                    }else {
                        // console.error("URL c=value object didn't have the required data. Not setting up p2pt.")
                        this.dispatch("invalid-url", "bad-c-value")
                    }
                }
            }
        }

        addRooms(rooms) {
            if(typeof rooms !== "object") {
                console.error("The rooms arguement needs to be in the form of an array, it can't be anything other than that.")
                return;
            }
            if(this.p2pt) {
                this.db.rooms = this.db.rooms.concat(rooms);
                console.log("added: " + rooms.toString())

                // Sending out updates to everyone
                for (let i = 0; i < this.peerList.length; i++) {
                    if(this.peerList[i].writable) {
                        this.p2pt.send(this.peerList[i], {
                            "action": "updateRooms",
                            "password": this.userAuth,
                            "rooms": this.db.rooms
                        })
                    }
                }
            }else {
                console.error("Need to wait until p2pt is intantiated and started. Didn't add rooms to db.")
            }
        }
    
        // Dispatches an event
        // FOR USE internally by any functions
        dispatch(eventName, data) {
            const event = this.events[eventName];
            if (event) {
                event.fire(data);
            }
        }
    
        // Lissens to events that are dispatched for this
        on(eventName, callback) {
            let event = this.events[eventName];
            if (!event) {
                event = new pubcoms.DispatcherEvent(eventName);
                this.events[eventName] = event;
            }
            event.registerCallback(callback);
        }
    
        // Removes the lissener to events
        off(eventName, callback) {
            const event = this.events[eventName];
            if (event && event.callbacks.indexOf(callback) > -1) {
                event.unregisterCallback(callback);
                if (event.callbacks.length === 0) {
                    delete this.events[eventName];
                }
            }
        }
    
    },

    // Custom event system
    DispatcherEvent: class {
        constructor(eventName) {
            this.eventName = eventName;
            this.callbacks = [];
        }
    
        registerCallback(callback) {
            this.callbacks.push(callback);
        }
    
        unregisterCallback(callback) {
            const index = this.callbacks.indexOf(callback);
            if (index > -1) {
                this.callbacks.splice(index, 1);
            }
        }
    
        fire(data) {
            const callbacks = this.callbacks.slice(0);
            callbacks.forEach((callback) => {
                callback(data);
            });
        }
    },

    createC: () => {
        // var date = new Date;
        // var time = (date.getTime() * 100).toString().substring(8); 
        var rand = Math.floor(Math.random() * 100000000000000).toString(36);
        rand.replace("--d", "ifykyk")
        return rand;
    },

    // Bringing along this script's own loadScript function, to load-in the needed P2PT script
    loadedNeededScript: false,
    loadScript: async (url, callback) => {
        var script = document.createElement("script")
        script.type = "text/javascript";
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);

        return new Promise((res, rej) => {
            if(script.readyState) {  // only required for IE <9
                script.onreadystatechange = function() {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.onreadystatechange = null;
                        callback();
                        res();
                    }
                };
            }else {  //Others
                script.onload = function() {
                    callback();
                    res();
                };
            }
        });
    }
}