console.log("Portal running")


var Portal = {
    iframe: undefined,
    cashe: {
        events: {},
        sentFirstMessage: false,
        usedFullConfig: false,
        askedForConfig: false,
        password: "",
        isCreator: false,
        peers: {}
    },
    io: {
        iframeID: "portaliframe",
        addURLParameter: addURLParameter, //see index.html
    },
    db: {
        rooms: []
    },
    onMessage: (message) => {
        // console.log(message)
        if("dataReceived" in message){ // user-transferred data.  Other data is available, such as connection info.

            // Type check
            if(typeof message.dataReceived === "object")

            // I check if the person is authorized inside each message option
            if(message.dataReceived.action === "helloWorld") {
                var authed;

                // Trying to send a message now
                if(message.dataReceived.password === Portal.cashe.password) {
                    // Responding with success status
                    console.log("Sent success authed responce")
                    document.getElementById(Portal.io.iframeID).contentWindow.postMessage({"sendData":{
                        action: "authedResponce",
                        status: true,
                        isCreator: Portal.cashe.isCreator
                    }, "UUID": message.UUID}, '*');
                    authed = true;
                }else {
                    document.getElementById(Portal.io.iframeID).contentWindow.postMessage({"sendData":{
                        action: "authedResponce",
                        status: false
                    }, "UUID": message.UUID}, '*');
                    authed = false;
                }
                if(!Portal.cashe.peers[message.UUID]) {
                    // Adding user to peers list WITH a todo to respond
                    if(authed) {
                        Portal.cashe.peers[message.UUID] = {
                            todos: [{
                                action: "authedResponce",
                                status: authed,
                                isCreator: Portal.cashe.isCreator
                            }]
                        }
                    }else {
                        Portal.cashe.peers[message.UUID] = {
                            todos: [{
                                action: "authedResponce",
                                status: authed
                            }]
                        }
                    }
                }
            }else if(message.dataReceived.action === "authedResponce") {
                if(message.dataReceived.status === true) {
                    if(!Portal.cashe.askedForConfig) {
                        // Asking for config from the group
                        Portal.cashe.askedForConfig = true;
                        document.getElementById(Portal.io.iframeID).contentWindow.postMessage({"sendData": {
                            action: "getFullConfig",
                            password: Portal.cashe.password
                        }, "type": "pcs"}, '*');
                        Portal.dispatch("authed")
                    }
                }else {
                    Portal.dispatch("failed-auth")
                }
                // TODO: Add resiliency against just one person hacking and having a bad password
            }else if(message.dataReceived.action === "getFullConfig") {
                if(message.dataReceived.password === Portal.cashe.password) {
                    console.log("Sent Config")

                    // Responding with most of db + if we are creator
                    document.getElementById(Portal.io.iframeID).contentWindow.postMessage({"sendData":{
                        action: "reciveFullConfig",
                        password: Portal.cashe.password,
                        value: {
                            rooms: Portal.db.rooms
                        },
                        isCreator: Portal.cashe.isCreator
                    }, "UUID": message.UUID}, '*');
                }
            }else if(message.dataReceived.action === "reciveFullConfig") {
                if(message.dataReceived.password === Portal.cashe.password) {
                    
                    // I only use the first responce, or if they are creator use that because its trust worthy
                    if(!Portal.cashe.usedFullConfig || message.dataReceived.isCreator) {
                        // console.log("Got full config")
                        Portal.cashe.usedFullConfig = true;

                        if(message.dataReceived.value.rooms.length > 0) {
                            // Adding parts of config to db
                            Portal.db.rooms = message.dataReceived.value.rooms;

                            Portal.dispatch("updated-rooms");
                        }
                        
                        Portal.dispatch("recive-full-config");
                    }
                }
            }else if(message.dataReceived.action === "roomsAdded") {
                if(message.dataReceived.password === Portal.cashe.password) {
                    console.log("Added rooms to list")
                    console.log(message.dataReceived.value)

                    Portal.db.rooms = Portal.db.rooms.concat(message.dataReceived.value);
                    console.log(Portal.db.rooms)
                }
            }else if(message.dataReceived.action === "roomsRemoved") {
                if(message.dataReceived.password === Portal.cashe.password) {
                    console.log("Removed rooms from list")
                    console.log(message.dataReceived.value)

                    Portal.db.rooms = Portal.db.rooms.filter(n => !message.dataReceived.value.includes(n));
                    console.log(Portal.db.rooms)
                }
            }
        }else if("guest-connected" === message.action) {
            if(!Portal.cashe.peers[message.UUID]) {
                // Adding user to peers list
                Portal.cashe.peers[message.UUID] = {}
            }else {
                // There must be some todo's
                if(Portal.cashe.peers[message.UUID].todos)

                Portal.cashe.peers[message.UUID].todos.forEach(obj => {
                    // Now sending a success status to authing
                    console.log("Sent success authed responce")
                    document.getElementById(Portal.io.iframeID).contentWindow.postMessage({"sendData": obj, "UUID": message.UUID}, '*');
                });
            }
            if(!Portal.cashe.sentFirstMessage) {
                // Sending first message out to the group to establish auth
                console.log("sent hello World")
                
                document.getElementById(Portal.io.iframeID).contentWindow.postMessage({"sendData":{
                    action: "helloWorld",
                    password: Portal.cashe.password
                }, "type": "pcs"}, '*');
                
                Portal.cashe.sentFirstMessage = true;
                Portal.dispatch("found-peer")
            }
            Portal.dispatch("add-director", message.UUID);
        }else if("end-view-connection" === message.action) {
            console.log(message)
            if(Portal.cashe.peers[message.UUID]) {
                // Removing user from peers list
                delete Portal.cashe.peers[message.UUID];
            }
            Portal.dispatch("remove-director", message.UUID);
        }else if("joined-room-complete" === message.action) {
            setTimeout(() => {
                if(Object.keys(Portal.cashe.peers).length < 1) {
                    Portal.dispatch("channel-empty")
                }
            }, 2000);
            // 1000 is too short in a few cases
        }
    },
    loadPrimaryChannel: (isCreator, object) => {
        // Setting if we are the primary authority for stored values
        Portal.cashe.isCreator = isCreator;
        Portal.cashe.password = object.p;

        // Loading the iframe
        var iframe = document.createElement("iframe");
        iframe.src = "https://vdo.ninja/alpha/?room="+object.c+"&vd=0&ad=0&autostart&cleanoutput"; // See the info at docs.vdo.ninja for options
        iframe.id = Portal.io.iframeID;
        document.body.appendChild(iframe);

        // Adding it to Portal object (used so we can filter messages)
        Portal.iframe = iframe;
    },
    addRooms: (array) => {
        Portal.db.rooms = Portal.db.rooms.concat(array);
        
        // Sending update to all other peers
        document.getElementById(Portal.io.iframeID).contentWindow.postMessage({"sendData":{
            action: "roomsAdded",
            password: Portal.cashe.password,
            value: array
        }, "type": "pcs"}, '*');
    },
    removeRooms: (array) => {
        console.log("removed " + (Portal.db.rooms.length - Portal.db.rooms.filter(n => !array.includes(n)).length) + " room(s)")

        Portal.db.rooms = Portal.db.rooms.filter(n => !array.includes(n));
        
        // Sending update to all other peers
        document.getElementById(Portal.io.iframeID).contentWindow.postMessage({"sendData":{
            action: "roomsRemoved",
            password: Portal.cashe.password,
            value: array
        }, "type": "pcs"}, '*');
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
    // Dispatches custom event
    dispatch(eventName, data="") {
        const event = Portal.cashe.events[eventName];
        if (event) {
            event.fire(data);
        }
    },

    // Lissens to custom events that are dispatched
    on(eventName, callback) {
        let event = Portal.cashe.events[eventName];
        if (!event) {
            event = new Portal.DispatcherEvent(eventName);
            Portal.cashe.events[eventName] = event;
        }
        event.registerCallback(callback);
    },

    // Removes the lissener to the custom events
    off(eventName, callback) {
        const event = Portal.cashe.events[eventName]
        if (event && event.callbacks.indexOf(callback) > -1) {
            event.unregisterCallback(callback);
            if (event.callbacks.length === 0) {
                delete this.events[eventName];
            }
        }
    }
}