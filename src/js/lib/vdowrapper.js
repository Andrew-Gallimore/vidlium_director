var testingTime;

var vdo = {
    roomList: [],
    peopleList: [],
    Room: class {
        constructor(roomID, options={}) {
            // For the custom events system
            this.events = {};


            ///// Setting up the config of the room /////
            this.config = {};
    
            // RoomID
            if(roomID == undefined) {
                console.error("You need a roomID when contructing a new Room object, no value was passed in.");
                return;
            }
            this.config.roomID = roomID.toString();
    
            // Password
            if(options.roomPassword) {
                this.config.roomPassword = options.roomPassword.toString();
            }else {
                this.config.roomPassword = false;
            }
            // Codirector Password
            if(options.codirectorPassword) {
                this.config.codirectorPassword = options.codirectorPassword.toString();
            }else {
                this.config.codirectorPassword = false;
            }

            // Name
            if(options.name) {
                this.config.name = options.name.toString();
            }else {
                this.config.name = false;
            }
    
            // Guest List
            this.guests = [];

            // Setting up the directors object
            this.me = {
                config: {
                    amdirector: undefined,
                    amcodirector: undefined
                }
            }

            // Media object for holding video streams & their tracks that come from vdo.ninja
            this.media = {
                streams: {},
                tracks: {}
            }

            // For if the room is registered with vdo.ninja
            this.registered = false;
    
            // Pushing this to the list of rooms in the "vdo" object
            vdo.roomList.push(this)
        }

        async awaitVDONLoad(iframe) {
            return new Promise(async function (resolve, reject) {
                // Setting a limit on how long it should try waiting for
                setTimeout(() => {
                    reject({
                        loadStatus: false,
                        message: "Iframe with vdo.ninja failed to send any messages within 10 seconds, failed to register."
                    })
                }, 10000);

                // Lissening for a message to come through
                var ivents2 = new iventLissener({}, iframe);
                ivents2.on((e) => {
                    resolve({
                        loadStatus: true,
                        message: "Successfully loaded vdo.ninja iframe."     
                    });
                    ivents2.off();
                });
            });
        }

        // Creates event listeners for when a person is joining/leaving
        createConnectionListeners(iframe) {
            // Setting up lisseners for events from the iframe
            var ivents = new iventLissener({
                parent: this //I need to pass in the Room class as part of the data because otherwise 'this' is the iventLissener
            }, iframe);
            ivents.on((e, data) => {
                // Guest related lisseners for events from iframe
                if(e.data.action === "director-connected") {
                    //TODO: Check with steve if there is a reason this event doesn't fire
                    // A director has connected

                    // First checking if there is a person object for them
                    data.parent.getPeople({streamID: e.data.streamID}, people => {
                        if(people) {
                            // Setting type of guest
                            var person = people[0];
                            person.config.type = "director";
                        }else {
                            // Making new person object
                            var person = new vdo.Person(e.data.streamID, {
                                roomID: data.parent.config.roomID,
                                type: "director"
                            });
                            data.parent.guests.push(person);

                            // Calling a room event
                            data.parent.dispatch("person-joining", person);

                            // Starting process of getting labels
                            data.parent.loadLabels();
                        }

                        // Updating the checklist for if the guest is fully joined
                        person.loadChecklist.personConnected = true;
                        data.parent.checkGuestLoaded(person);
                    })
                }else if(e.data.action === "guest-connected") {
                    // A guest (not director) has connected

                    // First checking if there is a person object for them
                    data.parent.getPeople({streamID: e.data.streamID}, people => {
                        if(people) {
                            // Setting type of guest
                            var person = people[0];
                            person.config.type = "guest";
                        }else {
                            // Making new person object
                            var person = new vdo.Person(e.data.streamID, {
                                roomID: data.parent.config.roomID,
                                type: "guest"
                            });
                            data.parent.guests.push(person);

                            // Calling a room event
                            data.parent.dispatch("person-joining", person);

                            // Starting process of getting labels
                            data.parent.loadLabels();
                        }

                        // Updating the checklist for if the guest is fully joined
                        person.loadChecklist.personConnected = true;
                        data.parent.checkGuestLoaded(person);
                    })
                }else if(e.data.action === "remote-screenshare-state" && e.data.value === true) {
                    // A connection that is a screenshare has connected

                    // Calling a room event
                    data.parent.dispatch("screenshare-connected", e);
                }else if(e.data.action === "view-connection") {
                    // Someone (director or just a guest, we don't know) is starting joining or leaving
                    // This event is mainly just to be able to call an asap person-joining event

                    // First checking if there is a person object for them
                    data.parent.getPeople({streamID: e.data.streamID}, people => {
                        if(people) {

                        }else {
                            // Making new person object
                            var person = new vdo.Person(e.data.streamID, {
                                roomID: data.parent.config.roomID
                            });
                            data.parent.guests.push(person);

                            // Calling a room event
                            data.parent.dispatch("person-joining", person);

                            // Starting process of getting labels
                            data.parent.loadLabels();
                        }
                    })

                    // // Calling a room event
                    // data.parent.dispatch("view-connection-changing", e);
                }else if(e.data.action === "end-view-connection") {
                    // Someone has left, checking to see who to send the right event for them
                    for (let i = 0; i < data.parent.guests.length; i++) {
                        if(data.parent.guests[i].streamID === e.data.streamID) {
                            data.parent.dispatch("person-left", data.parent.guests[i]);
                            // if(data.parent.guests[i].config.type === "guest") {
                            //     // Guest Left
                            // }else if(data.parent.guests[i].config.type === "director") {
                            //     // Director Left
                            //     data.parent.dispatch("director-left", data.parent.guests[i]);
                            // }
                        }
                        
                    }
                }else if(e.data.action === "view-connection-info") {
                    // First checking if there is a person object for them
                    data.parent.getPeople({streamID: e.data.streamID}, people => {
                        if(people) {
                            var person = people[0];
                        }else {
                            // Making new person object
                            var person = new vdo.Person(e.data.streamID, {
                                roomID: data.parent.config.roomID
                            });
                            data.parent.guests.push(person);

                            // Calling a room event
                            data.parent.dispatch("person-joining", person);

                            // Starting process of getting labels
                            data.parent.loadLabels();
                        }

                        // All below is translating recived info into the person object's data
                        var info = e.data.value;
                        console.log(info)
                        
                        // User Muted their Mic
                        if(info.muted !== null) {
                            person.config.userMutedMic = info.muted;
                        }
                        // User Muted their Video
                        if(info.video_muted_init === null || info.video_muted_init === false) {
                            person.config.userMutedVideo = false;
                        }else if(info.video_muted_init === true){
                            person.config.userMutedVideo = true;
                        }

                        // Director Muted Vision
                        if(info.directorDisplayMuted === null || info.directorDisplayMuted === false) {
                            person.config.directorMutedVision = false;
                        }else if(info.directorDisplayMuted === true){
                            person.config.directorMutedVision = true;
                        }
                        // Director Muted Speaker
                        if(info.directorSpeakerMuted === null || info.directorSpeakerMuted === null) {
                            person.config.directorMutedSpeaker = false;
                        }else if(info.directorSpeakerMuted === true){
                            person.config.speakerMuted = true;
                        }
                        // Director Muted Video
                        if(info.directorVideoMuted === null || info.directorVideoMuted === false) {
                            person.config.directorMutedVideo = false;
                        }else if(info.directorVideoMuted === true){
                            person.config.directorMutedVideo = true;
                        }

                        // Director set Volume of Mic
                        if(info.recording_audio_gain !== null && info.recording_audio_gain !== false) {
                            person.config.micVolume = info.recording_audio_gain;
                        }else {
                            person.config.micVolume = 0;
                        }

                        // Now device related items
                        // Battery
                        if(info.power_level !== null) {
                            person.config.device.batteryLevel = info.power_level;
                        }
                        // Plugged in
                        if(info.plugged_in !== null) {
                            person.config.device.pluggedIn = info.plugged_in;
                        }
                        // Connection type
                        if(info.conn_type !== null) {
                            person.config.device.connType = info.conn_type;
                        }
                        // CPU
                        if(info.CPU !== null) {
                            person.config.device.cpu = info.CPU;
                        }

                        // Updating the checklist for if the guest is fully joined
                        person.loadChecklist.viewInfo = true;
                        data.parent.checkGuestLoaded(person);

                    })
                }else if(e.data.action === "new-stream-added") {
                    var date = new Date;
	                testingTime = date.getTime()
                    // I have seen delays to reciving the audio/video tracks only be between 1-2 and 40-50-ish
                    setTimeout(() => {
                        // After 100ms the video & audio streams are likely loaded
                        console.log("Finished loading tracks? " + e.data.streamID)
                        data.parent.getPeople({streamID: e.data.streamID}, people => {
                            if(people) {
                                var person = people[0];

                                // Setting the sending-audio/video tracks variables to false if they aren't true
                                if(person.config.sendingVideo === undefined) {
                                    person.config.sendingVideo = false;
                                }
                                if(person.config.sendingAudio === undefined) {
                                    person.config.sendingAudio = false;
                                }

                                // Updating the checklist for if the guest is fully joined
                                person.loadChecklist.streamTracks = true;
                                data.parent.checkGuestLoaded(person);
                            }
                        })
                        setTimeout(() => {
                            data.parent.buildPersonVideo(e.data.streamID, "URL");
                        }, 200, data, e);
                    }, 150, data, e);
                }else if(e.data.action === "new-video-track-added") {
                    // Logging how long it took to load the track
                    var date = new Date;
                    console.log("VIDEO TRACK ADDED " + (date.getTime() - testingTime))
                    
                    // Getting person object connected to the streamID
                    data.parent.getPeople({streamID: e.data.streamID}, people => {
                        if(people) {
                            // Updating the if the person is sending video
                            people[0].config.sendingVideo = true;
                        }
                    })
                    
                }else if(e.data.action === "new-audio-track-added") {
                    // Logging how long it took to load the track
                    var date = new Date;
                    console.log("AUDIO TRACK ADDED " + (date.getTime() - testingTime))

                    // Getting person object connected to the streamID
                    data.parent.getPeople({streamID: e.data.streamID}, people => {
                        if(people) {
                            // Updating the if the person is sending video
                            people[0].config.sendingAudio = true;
                        }
                    })
                }else if(e.data.action === "aspect-ratio") {
                    data.parent.getPeople({streamID: e.data.streamID}, people => {
                        if(people) {
                            var person = people[0];

                            // Setting the value
                            person.config.aspectRatio = e.data.value;

                            // Adding the aspect ratio to the associated video element
                            this.getPeople({streamID: e.data.streamID}, people => {
                                if(people) {
                                    var person = people[0];

                                    if(person.primaryFeed) {
                                        person.primaryFeed.style.aspectRatio = person.config.aspectRatio;
                                    }
                                }else if(e.data.streamID.slice(-2) === ":s") {
                                    this.getPeople({streamID: e.data.streamID.slice(0, -2)}, people => {
                                        var person = people[0];

                                        if(person.screenShareFeed) {
                                            person.screenShareFeed.style.aspectRatio = person.config.aspectRatio;
                                        }
                                    });
                                }
                            });

                            // Updating the checklist for if the guest is fully joined
                            if(!person.loadChecklist.aspectRatio) {
                                person.loadChecklist.aspectRatio = true;
                                data.parent.checkGuestLoaded(person);
                            }
                        }
                    })
                }

                // Reciving a batch of labels for all the people
                if(e.data.streamIDs) {
                    for (const streamID in e.data.streamIDs) {
                        // Getting the person object that has the streamID
                        data.parent.getPeople({streamID: streamID}, people => {
                            if(people) {
                                var person = people[0];
    
                                // Setting the value
                                person.config.label = e.data.streamIDs[streamID]
    
                                // Updating the checklist for if the guest is fully joined
                                if(!person.loadChecklist.label) {
                                    person.loadChecklist.label = true;
                                    data.parent.checkGuestLoaded(person);
                                }
                            }
                        })
                    }
                }
            })
        }

        // Creates event listeners for when my own directors' status' comes in
        createDirectorListeners(iframe) {
            // Setting up lisseners for events from the iframe
            var ivents = new iventLissener({
                parent: this //I need to pass in the Room class as part of the data because otherwise 'this' is the iventLissener
            }, iframe);
            ivents.on((e, data) => {
                // Lissening for the amdirector status
                if(e.data.action === "director") {
                    if(e.data.value == true) {
                        // Calling director-status room event
                        data.parent.dispatch("director-status", {
                            directorStatus: true,
                            codirectorStatus: false,
                            message: "You are the director and not a codirector"
                        });
                        // Updating me data
                        data.parent.me.config.amdirector = true;
                        data.parent.me.config.amcodirector = false;

                    }else {
                        // Updating me data
                        data.parent.me.config.amdirector = false;

                        // Should wait for codirector message if one is possibly coming
                        if(!data.parent.iframe.src.includes("&codirector")) {
                            // If not...
                            // Calling director-status room event
                            data.parent.dispatch("director-status", {
                                directorStatus: false,
                                codirectorStatus: false,
                                message: "You are not the director nor a codirector"
                            });
                            // Updating me data
                            data.parent.me.config.amcodirector = false;
                        }
                    }
                }
                // Lissening for the amcodirector status
                if(e.data.value === "requestCoDirector" && e.data.action === "approved") {
                    // Calling director-status room event
                    data.parent.dispatch("director-status", {
                        directorStatus: data.parent.me.config.amdirector,
                        codirectorStatus: true,
                        message: "You are a codirector but not a director"
                    });
                    // Updating me data
                    data.parent.me.config.amcodirector = true;
                }else if(e.data.value === "requestCoDirector" && e.data.action === "rejected") {
                    // Calling director-status room event
                    data.parent.dispatch("director-status", {
                        directorStatus: data.parent.me.config.amdirector,
                        codirectorStatus: false,
                        message: "You are not the codirector nor a director"
                    });
                    // Updating me data
                    data.parent.me.config.amcodirector = false;
                }
            });
        }

        // Creates event listeners for when a video frames come in
        createFrameListeners(iframe) {
            // Setting up lisseners for events from the iframe
            var ivents = new iventLissener({
                parent: this //I need to pass in the Room class as part of the data because otherwise 'this' is the iventLissener
            }, iframe);
            ivents.on((e, data) => {
                // Guest related lisseners for events from iframe
                if(e.data.frame) {
                    // These are video & audio frames coming from the vdo.ninja iframe
                    var media = data.parent.media;
                    if(!media.tracks[e.data.trackID]) {
                        // Creating a new track since it hasn't been made yet
                        console.log(e)
                        media.tracks[e.data.trackID] = {};
                        media.tracks[e.data.trackID].streamID = e.data.streamID;
                        media.tracks[e.data.trackID].generator = new MediaStreamTrackGenerator({kind:e.data.kind});
                        media.tracks[e.data.trackID].stream = new MediaStream([media.tracks[e.data.trackID].generator]);
                        media.tracks[e.data.trackID].frameWriter = media.tracks[e.data.trackID].generator.writable.getWriter();
                        
                        // Adding the data to the new track
                        media.tracks[e.data.trackID].frameWriter.write(e.data.frame);
                        
                        // If the stream isn't made yet, make it
                        if(!media.streams[e.data.streamID]) {
                            data.parent.buildPersonVideo(e.data.streamID, "data-feed", media, e.data.trackID);

                        }else {
                            // Since there is already a stream for this, remove any tracks for it, and add the new one(s)?
                            if(e.data.kind == "video") {
                                media.streams[e.data.streamID].srcObject.getVideoTracks().forEach(trk=>{
                                    media.streams[e.data.streamID].srcObject.removeTrack(trk);
                                });
                                media.streams[e.data.streamID + "2"].srcObject.getVideoTracks().forEach(trk=>{
                                    media.streams[e.data.streamID + "2"].srcObject.removeTrack(trk);
                                });
                            }else if(e.data.kind == "audio") {
                                media.streams[e.data.streamID].srcObject.getAudioTracks().forEach(trk=>{
                                    media.streams[e.data.streamID].srcObject.removeTrack(trk);
                                });
                                media.streams[e.data.streamID + "2"].srcObject.getAudioTracks().forEach(trk=>{
                                    media.streams[e.data.streamID + "2"].srcObject.removeTrack(trk);
                                });
                            } 
                            media.tracks[e.data.trackID].stream.getTracks().forEach(trk=>{
                                media.streams[e.data.streamID].srcObject.addTrack(trk);
                            });
                            media.tracks[e.data.trackID].stream.getTracks().forEach(trk=>{
                                media.streams[e.data.streamID + "2"].srcObject.addTrack(trk);
                            });
                        }
                    }else {
                        // Adding the data to an existing track
                        media.tracks[e.data.trackID].frameWriter.write(e.data.frame);
                    }
                }
            });
        }

        // 'media' and 'trackID' is only needed for the "data-feed" format
        buildPersonVideo(streamID, format, media, trackID) {
            if(format === "data-feed") {
                console.log("Made Video Element in custom class")

                // Making a media stream for the feed
                media.streams[streamID] = document.createElement("video");
                // media.streams[streamID].id = "video_"+streamID;
                media.streams[streamID].muted = true;
                media.streams[streamID].autoplay = true;
                media.streams[streamID].srcObject = media.tracks[trackID].stream;
                // TODO: Need to unmute it when the user intacts with the page

                // Adding that feed to the person
                this.getPeople({streamID: streamID}, people => {
                    if(people) {
                        var person = people[0];

                        // Building div wrapper around video
                        var finalELem = document.createElement("div");
                        finalELem.classList.add("vdowrapper-feed")
                        finalELem.setAttribute("data-streamid", streamID)
                        finalELem.setAttribute("data-feedType", "primary")
                        finalELem.appendChild(media.streams[streamID]);
                        if(person.config.aspectRatio) {
                            finalELem.style.aspectRatio = person.config.aspectRatio;
                        }
                        
                        // Sending out event that the video is created
                        this.dispatch("primary-video-created", {
                            personObject: person,
                            videoElement: finalELem
                        });

                        // This automatically overwites the primary video if there is already one created (likely an iframe type)
                        // Updating the checklist for if the guest is fully joined
                        person.loadChecklist.primaryFeed = true;
                        person.primaryFeed = finalELem;
                        this.checkGuestLoaded(person);

                    }else if(streamID.slice(-2) === ":s") {
                        // Its likely that this feed is a screenshare of a guest
                        this.getPeople({streamID: streamID.slice(0, -2)}, people => {
                            if(people) {
                                var person = people[0];
 
                                // Building div wrapper around video
                                var finalELem = document.createElement("div");
                                finalELem.classList.add("vdowrapper-feed")
                                finalELem.setAttribute("data-streamid", streamID)
                                finalELem.setAttribute("data-feedType", "screenshare")
                                finalELem.appendChild(media.streams[streamID]);
                                if(person.config.aspectRatio) {
                                    finalELem.style.aspectRatio = person.config.aspectRatio;
                                }
                                
                                // Sending out event that the video is created
                                this.dispatch("screenshare-video-created", {
                                    personObject: person,
                                    videoElement: finalELem
                                });

                                // This automatically overwites the primary video if there is already one created (likely an iframe type)
                                // Updating the checklist for if the guest is fully joined
                                person.loadChecklist.screenShareFeed = true;
                                person.screenShareFeed = finalELem;
                                this.checkGuestLoaded(person);
                            }
                        })
                    }
                })
            }else if(format === "URL") {
                this.getPeople({streamID: streamID}, people => {
                    if(people) {
                        var person = people[0];

                        // Checking that there isn't already a primary feed
                        if(person.loadChecklist.streamTracks && !person.loadChecklist.primaryFeed) {
                            // Making the person's video from an iframe solo view
                            console.log("Made their feed from iframe " + streamID)

                            // The iframe API isn't sending video frames for this person (it should have sent some by now)
                            var iframe = document.createElement("iframe");
                            iframe.id = "video_" + person.config.streamID;
                            iframe.src = "https://vdo.ninja/?view=" + person.config.streamID + "&solo&room=" + person.config.roomID + "&nocontrols&cv&transparent";

                            // Building div wrapper around video
                            var finalELem = document.createElement("div");
                            finalELem.classList.add("vdowrapper-feed")
                            finalELem.setAttribute("data-streamid", streamID)
                            finalELem.setAttribute("data-feedType", "primary")
                            finalELem.appendChild(iframe);
                            if(person.config.aspectRatio) {
                                finalELem.style.aspectRatio = person.config.aspectRatio;
                            }

                            person.primaryFeed = finalELem;
                            person.loadChecklist.primaryFeed = true;

                            // Sending out event that the video is created
                            this.dispatch("primary-video-created", {
                                personObject: person,
                                videoElement: person.primaryFeed
                            });
                        }

                        // Updating the checklist for if the guest is fully joined
                        this.checkGuestLoaded(person);
                    }else if(streamID.slice(-2) === ":s") {
                        // Its likely that this feed is a screenshare of a guest
                        this.getPeople({streamID: streamID.slice(0, -2)}, people => {
                            if(people) {
                                var person = people[0];

                                // Checking that there isn't already a primary feed
                                if(person.loadChecklist.streamTracks && !person.loadChecklist.screenshareFeed) {
                                    // Making the person's video from an iframe solo view
                                    console.log("Made their feed from iframe " + streamID)

                                    // The iframe API isn't sending video frames for this person (it should have sent some by now)
                                    var iframe = document.createElement("iframe");
                                    iframe.id = "video_" + streamID;
                                    iframe.src = "https://vdo.ninja/?view=" + streamID + "&solo&room=" + person.config.roomID;

                                    // Building div wrapper around video
                                    var finalELem = document.createElement("div");
                                    finalELem.classList.add("vdowrapper-feed")
                                    finalELem.setAttribute("data-streamid", streamID)
                                    finalELem.setAttribute("data-feedType", "screenshare")
                                    finalELem.appendChild(iframe);
                                    if(person.config.aspectRatio) {
                                        finalELem.style.aspectRatio = person.config.aspectRatio;
                                    }

                                    person.screenShareFeed = finalELem;
                                    person.loadChecklist.screenShareFeed = true;

                                    // Sending out event that the video is created
                                    this.dispatch("screenshare-video-created", {
                                        personObject: person,
                                        videoElement: person.screenShareFeed
                                    });
                                }

                                // Updating the checklist for if the guest is fully joined
                                this.checkGuestLoaded(person);
                            }
                        })
                    }
                })
            }
        }

        // Used for loading the iframe of the room with vdo.ninja
        async register() {
            // Loading the vdo.ninja in an iframe

            // Making the iframe element
            var iframe = document.createElement("iframe");
            iframe.classList.add("vdon");
            iframe.classList.add("_" + this.config.roomID);

            if(this.config.codirectorPassword !== false) {
                iframe.src = "https://vdo.ninja/alpha/?sendframes&director=" + this.config.roomID + "&codirector=" + this.config.codirectorPassword;
            }else {
                iframe.src = "https://vdo.ninja/alpha/?sendframes&director=" + this.config.roomID;
            }
            iframe.allow = "autoplay; camera; microphone; fullscreen; picture-in-picture;";
            // iframe.allow = "document-domain;encrypted-media;sync-xhr;usb;web-share;cross-origin-isolated;accelerometer;midi;geolocation;autoplay;camera;microphone;fullscreen;picture-in-picture;display-capture;";
            iframe.sandbox = "allow-scripts allow-forms allow-pointer-lock allow-same-origin";

            document.body.appendChild(iframe);
            this.iframe = iframe;

            // Setting up joining/leaving listeners from the iframe
            this.createDirectorListeners(iframe);
            // Setting up joining/leaving listeners from the iframe
            this.createConnectionListeners(iframe);
            // Setting up video/audio frame event listeners from the iframe
            this.createFrameListeners(iframe);


            // Waiting for vdo.ninja room to send an iframe message, to then call it loaded
            var status = await this.awaitVDONLoad(this.iframe);

            this.registered = status.loadStatus;
            return status;
        }

        getPeople(options, callback) {
            // {id: "avI9s45"}
            // {group: 1}
            // {scene: 5}
            var results = [];

            // TODO: Add options to query mutliple streamID's, groups, etc. in the options
            // TODO: Also add AND | OR opertators, currently it only is an OR system & so collects all that apply

            // Filter by streamID
            if(options.streamID) {
                for (let i = 0; i < this.guests.length; i++) {
                    if(this.guests[i].config.streamID === options.streamID) results.push(this.guests[i]);
                }
            }else if(options.group) {
                for (let i = 0; i < this.guests.length; i++) {
                    for (let j = 0; j < this.guests[i].groups.length; j++) {
                        if(this.guests[i].groups[j] === options.group) results.push(this.guests[i]);
                    }
                }
            }else if(options.scene) {
                for (let i = 0; i < this.guests.length; i++) {
                    for (let j = 0; j < this.guests[i].scenes.length; j++) {
                        if(this.guests[i].scenes[j] === options.scene) results.push(this.guests[i]);
                    }
                }
            }

            // Returning the results in the callback
            if(results.length > 0) {
                callback(results, "");
            }else {
                callback(null, "No Results Found.")
            }
        }

        checkGuestLoaded(person) {
            // IF a feed isn't supposed to be coming, just check everything but the video-related items
            var primaryFeed = false;
            if(!person.config.sendingVideo && !person.config.sendingAudio) {
                if(person.loaded == false &&
                    person.loadChecklist.personConnected &&
                    person.loadChecklist.viewInfo) {

                    }
            }
            
            // Checking if all the load-checklist items are completed (this check includes primary feed being present)
            if(person.loaded == false &&
                person.loadChecklist.personConnected &&
                person.loadChecklist.viewInfo &&
                person.loadChecklist.streamTracks &&
                person.loadChecklist.primaryFeed &&
                person.loadChecklist.aspectRatio &&
                person.loadChecklist.label) {

                // The person has fully loaded in!
                // Updating person data
                person.loaded = true;

                // Calling a guest loaded event
                this.dispatch("person-connected", person)
            }
        }

        loadLabels() {
            // Sending iframe message to get the labels
            this.iframe.contentWindow.postMessage({"getStreamIDs":true}, '*');

            // There are listeners that recive the labels when they come in after this
        }

        // Dispatches an event, which the room.on() function lissens too
        // FOR USE internally by any room functions
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
                event = new vdo.DispatcherEvent(eventName);
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
    Person: class {
        constructor(streamID, options={}) {
            // For the custom events system
            this.events = {};


            ///// Setting up the config of the room /////
            this.config = {};

            this.config.streamID = streamID;
            this.config.label = undefined;

            // Telling what the person is sending, audio/video or none
            this.config.sendingVideo = undefined;
            this.config.sendingAudio = undefined;

            // Setting up view-info items
            this.config.aspectRatio = undefined;
            this.config.micVolume = undefined;
            this.config.userMutedMic = undefined;
            this.config.userMutedVideo = undefined;

            this.config.directorMutedMic = undefined;
            this.config.directorMutedSpeaker = undefined;
            this.config.directorMutedVideo = undefined;
            this.config.directorMutedVision = undefined;

            this.config.device = {
                cpu: undefined,
                connType: undefined,
                pluggedIn: undefined,
                batteryLevel: undefined
            };

            // Custom options when creating the person
            if(options.roomID) {
                this.config.roomID = options.roomID;
            }
            if(options.type) {
                this.config.type = options.type;
            }


            // Group & Scene lists for guest
            this.groups = [];
            this.scenes = [];

            // A place for the video elements connected to the person
            this.videoElements = [];


            // For while the guest is loading
            this.loadChecklist = {
                personConnected: false,
                viewInfo: false,
                streamTracks: false,
                primaryFeed: false,
                screenShareFeed: false,
                videoElement: false,
                aspectRatio: false,
                label: false
            }
            this.loaded = false;
        }

        inputRemoteInfo() {
            // This is like the parsePersonInfo function in back.js
        }

        addToScene() {
            // TODO:
            console.log("Adding " + this.config.streamID + "to a scene");
        }

        addToGroup() {
            // TODO:
            console.log("Adding " + this.config.streamID + "to a group");
        }

        directMessage() {
            // TODO:
        }

        transfer() {
            // TODO:
        }

        endCall() {
            // TODO:
        }

        generateVideoElement() {
            // TODO:
            // This is like the load labels function in back.js
        }


        // Dispatches an event, which the person.on() function lissens too
        // FOR USE internally by any person functions or room functions
        dispatch(eventName, data) {
            const event = this.events[eventName];
            if (event) {
                event.fire(data);
            }
        }
    
        // Lissens to events that are dispatched for this person
        on(eventName, callback) {
            let event = this.events[eventName];
            if (!event) {
                event = new vdo.DispatcherEvent(eventName);
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
    }
}



// Custom iframe event system
class iventLissener {
    constructor(data, iframe = false) {
        this.iventID = Math.floor(Math.random() * 100000000);
        this.data = data;
        this.iframe = iframe;
    }

    on(callback) {
        // Checking the event doesn't already exist in the list
        var found;
        for (let i = 0; i < iframeEventCallbacks.length; i++) {
            if(iframeEventCallbacks[i].ID === this.iventID) {
                found = true;
            }
        }

        // Adding event to the list
        if(!found) {
            iframeEventCallbacks.push({
                ID: this.iventID,
                data: this.data,
                iframe: this.iframe,
                callback: callback
            })
        }else {
            console.warn("This iventLissener.on() was already instantiated, but was called again (ID: " + this.iventID + ").")
        }
    }

    off() {
        // Removing the event from the list
        for (let i = 0; i < iframeEventCallbacks.length; i++) {
            if(iframeEventCallbacks[i].ID === this.iventID) {
                iframeEventCallbacks.splice(i,1);
            }
        }
    }
}

// List of events lissening to Iframe API messages, and calling any custom functions who are lissening to the messages
var iframeEventCallbacks = [];


// Only create eventer if it doesn't exist in another file already
var eventer;
if(!eventer) {
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent, e => {
        if(e.data.kind !== "video" && e.data.kind !== "audio") {
            if(e.data.action !== "view-stats-updated" && e.data.stats === undefined) {
                if(e.data.streamIDs === undefined) {
                    // console.log("Window event")
                    // // console.log(e)
                    // console.log(e.data)
                }
            }
        }else {
            // console.log("AudioVideo")
        }
        for (let i = 0; i < iframeEventCallbacks.length; i++) {
            // Filtering the events by if they are for the particular iframe or not
            if(iframeEventCallbacks[i].iframe !== false) {
                if(e.source === iframeEventCallbacks[i].iframe.contentWindow) {
                    iframeEventCallbacks[i].callback(e, iframeEventCallbacks[i].data);
                }
            }else {
                iframeEventCallbacks[i].callback(e, iframeEventCallbacks[i].data);
            }

        }
    });
}