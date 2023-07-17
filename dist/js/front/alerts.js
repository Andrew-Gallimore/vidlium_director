var alertList = [
    {
        main: "searchingForDirector",
        mini: "searchingForDirectorMINI",
        initState: "loading",
        states: {
            loading: {
                fullClose: false,
                minimizable: true,
                changeToo: ["success", "error"]
            },
            success: {
                fullClose: true,
                minimizable: true,
                changeToo: []
            },
            error: {
                fullClose: true,
                minimizable: true,
                changeToo: ["success"]
            }
        },
        buttons: [
            {
                id: "#searchingForDirector .end-form .agknowledge",
                function: (state) => {
                    if(state === "success" || state === "error") {
                        alert.searchingForDirector.closeMain();
                    }else {

                    }
                }
            }
        ]
    }
]
document.querySelector("#searchingForDirector .end-form .agknowledge").addEventListener("click", () => {
    alert.searchingForDirector.closeMain();
})
document.querySelector("#searchingForDirectorMINI .end-form .agknowledge").addEventListener("click", () => {
    alert.searchingForDirector.closeMini();
})
document.querySelector("#searchingForDirectorMINI .close-x").addEventListener("click", () => {
    alert.searchingForDirector.closeMini();
})


// This gets filled in the constructor below
var alert = {}

// Contructor of alert objects from the alertlist
for (let i = 0; i < alertList.length; i++) {
    // Setting up listeners for the specific alert
    document.querySelector("#searchingForDirector .end-form .agknowledge").addEventListener("click", () => {
        alert.searchingForDirector.closeMain();
    })
    
    // Making the alert object for the specific alert
    alert[alertList[i].main] = {
        main: alertList[i].main,
        mini: alertList[i].mini,
        states: alertList[i].states,
        currentState: alertList[i].initState,

        setProgressBar: function(value) {
            var bar = document.querySelector("#" + this.main + " .bar");
            if((Number(bar.style.width.slice(0, -1)) / 100) > value) {
            }else {
                document.querySelector("#" + this.main + " .bar").style.width = value*100 + "%";
            }
        },
        setProgressMessage: function(value) {
            document.querySelector("#" + this.main + " .progress-message").innerHTML = value;
        },
        showMain: function() {
            document.querySelector("#" + this.main).showModal();
        },
        closeMain: function() {
            if(this.states[this.currentState]) {
                if(this.states[this.currentState].fullClose) {
                    // Closing element dialog via its built in system
                    document.querySelector("#" + this.main).close();
                }else if(this.states[this.currentState].minimizable) {
                    // Closing element dialog via its built in system
                    document.querySelector("#" + this.main).close();
                    // Showing mini alert
                    this.showMini();
                }
            }
        },
        setState: function(state) {
            // Checking if you can change to the new state from the current
            for (let i = 0; i < this.states[this.currentState].changeToo.length; i++) {
                if(this.states[this.currentState].changeToo[i] === state) {
                    // Setting new state
                    this.currentState = state;
                }
            }
        },
        showMini: function() {
            console.log("#" + this.mini)
            // TODO: Add code so that the message is displayed at top of alert list
            document.querySelector("#" + this.mini).classList.add("active")
        },
        closeMini: function() {
            if(this.states[this.currentState]) {
                if(this.states[this.currentState].fullClose) {
                    // Closing mini alert element
                    document.querySelector("#" + this.mini).classList.remove("active")
                }else if(this.states[this.currentState].minimizable) {
                    // Closing mini alert element
                    document.querySelector("#" + this.mini).classList.remove("active")
                    // Showing main alert
                    this.showMain();
                }
            }
        }
    };
}