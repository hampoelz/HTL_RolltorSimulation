
function StartWorker() {
    self.addEventListener('message', async event => {
        // Finally start the actual code 
        if (event.data == "load") await Logic();
    });
}

// Function bridge for web workers, as the web worker cannot access functions in the UI thread
function SimulationBridge() {
    function waitForResponse(channel) {
        return new Promise(resolve => {
            const listener = event => {
                if (event.data.channel == channel) {
                    self.removeEventListener('message', listener);
                    resolve(event.data.content);
                }
            };

            self.addEventListener('message', listener);
            self.postMessage(channel);
        });
    }
    return {
        start: () => self.postMessage("start"),
        isFenceOpened: () => waitForResponse("isFenceOpened"),
        isFenceClosed: () => waitForResponse("isFenceClosed"),
        isOpenButtonClicked: () => waitForResponse("isOpenButtonClicked"),
        isCloseButtonClicked: () => waitForResponse("isCloseButtonClicked"),
        isStopButtonClicked: () => waitForResponse("isStopButtonClicked"),
        isPhotoelectricBarrierInterrupted: () => waitForResponse("isPhotoelectricBarrierInterrupted"),
        moveFenceRight: () => self.postMessage("moveFenceRight"),
        moveFenceLeft: () => self.postMessage("moveFenceLeft"),
        stopFence: () => self.postMessage("stopFence")
    };
}