setTimeout(() => {
    var testplugin = new VPlugin("http://127.0.0.1:5500/index.html");
    
    // Events for the plugin
    testplugin.on("connected", () => {
        console.log("test plugin connected")
    })
    testplugin.on("did-not-respond", () => {
        console.log("test plugin didn't respond")
    })
    testplugin.on("did-not-load", () => {
        console.log("test plugin didn't load")
    })
    testplugin.on("manifest-failed", message => {
        console.log("the manifest failed: " + message)
    })

    testplugin.connect();
}, 1000);