var plugins = [];

class VPlugin {
    constructor(url_) {
        // For the custom event system
        this.events = {};

        this.mainSource = {
            url: url_,
            loaded: false,
            connected: false,
            iframe: undefined
        }

        this.config = {
            name: undefined,
            version: undefined
        }

        plugins.push(this);
    }

    connect() {
        console.log("loading iframe")
        var iframe = document.createElement("iframe");
        iframe.classList.add("plugin-iframe");
        iframe.src = this.mainSource.url;
        document.querySelector("body").appendChild(iframe);

        // Setting timeout
        setTimeout(() => {
            if(!this.mainSource.loaded || !this.mainSource.connected) {
                // The iframe isn't responding or hasn't loaded, end it
                for (let i = 0; i < plugins.length; i++) {
                    if(plugins[i].mainSource.iframe === this.mainSource.iframe) {
                        // The iframe still exists, so...

                        if(this.mainSource.loaded && !this.mainSource.connected) {
                            // The iframe didn't respond
                            this.dispatch("did-not-respond", "");
                        }else if(!this.mainSource.loaded) {
                            // The iframe didn't load
                            this.dispatch("did-not-load", "");
                        }
        
                        this.mainSource.iframe.remove();
                        this.removeSelf();
                    }
                }
            }
        }, 5000, this);


        iframe.onload = function() {
            // The iframe has loaded
            console.log("The iframe is loaded");

            for (let i = 0; i < plugins.length; i++) {
                if(plugins[i].mainSource.iframe === this) {
                    plugins[i].mainSource.loaded = true;
                }
            }
            
            // Sending connect request
            this.contentWindow.postMessage({
                "message": "connect-please"
            }, '*');
        };


        this.mainSource.iframe = iframe;
    }

    newMessage(data) {
        console.log(data)
        if(data.message === "connect-plugin") {
            // Checking the minimum values for the manifest are correctly added
            if(data.name === null || data.name === undefined || typeof data.name !== "string") {
                this.dispatch("manifest-failed", "Incorrect name value in manifest");
                
                // Removing the itself (the plugin object)
                this.mainSource.iframe.remove();
                this.removeSelf();
                return;
            }else {
                this.config.name = data.name;
            }
            if(data.version === null || data.version === undefined || typeof data.version !== "string") {
                this.dispatch("manifest-failed", "Incorrect version value in manifest");
                
                // Removing the itself (the plugin object)
                this.mainSource.iframe.remove();
                this.removeSelf();
                return;
            }else {
                this.config.version = data.version;
            }
            
            // It has connected successfully!
            this.mainSource.connected = true;
            this.dispatch("connected", "")

            // Setting up the rest of the configuration
        }
    }

    removeSelf() {
        for (let i = 0; i < plugins.length; i++) {
            if(plugins[i] === this) {
                plugins.splice(i,1);
            }
        }
    }

    // Events for the plugin object
    dispatch(eventName, data) {
        const event = this.events[eventName];
        if (event) {
            event.fire(data);
        }
    }

    // Lissens to events that are dispatched for this room
    on(eventName, callback) {
        let event = this.events[eventName];
        if (!event) {
            event = new DispatcherPluginEvent(eventName);
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
}

// Custom event system
class DispatcherPluginEvent {
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
}