
document.addEventListener("DOMContentLoaded", async () => {

    // Chrome doesn't support loading web worker when running script from local file
    // Workaround: Convert function to string and create blob to load web worker
    const blob = new Blob(["(" + StartWorker.toString() + ")();" + SimulationBridge.toString() + Logic.toString()], { type: "text/javascript" })
    const worker = new Worker(URL.createObjectURL(blob));

    const Simulation = (() => {
        const fence = document.getElementsByClassName("fence")[0];
        const laser = document.getElementsByClassName("laser")[0];
        const openedLimitedSwitch = document.getElementsByClassName("limit-switch opened")[0];
        const closedLimitedSwitch = document.getElementsByClassName("limit-switch closed")[0];
        const openButton = document.getElementsByClassName("button open")[0];
        const closeButton = document.getElementsByClassName("button close")[0];
        const stopButton = document.getElementsByClassName("button stop")[0];
        const photoelectricBarrier = document.getElementsByClassName("button photoelectric-barrier")[0];

        let isStarted = false;
        let openFence = false;
        let closeFence = false;
        let inputs = {
            open: false,
            close: false,
            stop: false,
            photoelectricBarrier: false
        }

        return {
            start: () => {
                if (isStarted) return;
                isStarted = true;

                openButton.addEventListener('pointerdown', () => inputs.open = true);
                openButton.addEventListener('pointerup', () => inputs.open = false);

                closeButton.addEventListener('pointerdown', () => inputs.close = true);
                closeButton.addEventListener('pointerup', () => inputs.close = false);

                stopButton.addEventListener('pointerdown', () => inputs.stop = true);
                stopButton.addEventListener('pointerup', () => inputs.stop = false);

                photoelectricBarrier.addEventListener('pointerdown', () => inputs.photoelectricBarrier = true);
                photoelectricBarrier.addEventListener('pointerup', () => inputs.photoelectricBarrier = false);

                // Update the user interface every millisecond
                setInterval(() => {
                    const fence = document.getElementsByClassName("fence")[0];

                    // Set the upper limit switch to active when the fence is open
                    if (Simulation.isFenceOpened()) openedLimitedSwitch.classList.add("active");
                    else openedLimitedSwitch.classList.remove("active");

                    // Set the lower limit switch to active when the fence is closed
                    if (Simulation.isFenceClosed()) closedLimitedSwitch.classList.add("active");
                    else closedLimitedSwitch.classList.remove("active");

                    // Move the fence
                    const moveSpeed = 0.2;
                    if (openFence) {
                        const left = window.getComputedStyle(fence, null).getPropertyValue("left");
                        let newLeft = parseFloat(left, 10) + moveSpeed;
                        fence.style.left = newLeft + "px"
                    }

                    if (closeFence) {
                        const left = window.getComputedStyle(fence, null).getPropertyValue("left");
                        let newLeft = parseFloat(left, 10) - moveSpeed;
                        fence.style.left = newLeft + "px"
                    }

                    // Interrupt photoelectric barrier
                    if (inputs.photoelectricBarrier) laser.classList.add("interrupted");
                    else laser.classList.remove("interrupted");
                }, 1);
            },
            isOpenButtonClicked: () => inputs.open,
            isCloseButtonClicked: () => inputs.close,
            isStopButtonClicked: () => inputs.stop,
            isPhotoelectricBarrierInterrupted: () => inputs.photoelectricBarrier,
            isFenceOpened: () => {
                // Check that the fence is touching the upper limit switch
                if (fence.getBoundingClientRect().right.toFixed() == openedLimitedSwitch.getBoundingClientRect().left.toFixed()) return true;
                return false;
            },
            isFenceClosed: () => {
                // Check that the fence is touching the lower limit switch
                if (fence.getBoundingClientRect().left.toFixed() == closedLimitedSwitch.getBoundingClientRect().right.toFixed()) return true;
                return false;
            },
            moveFenceRight: () => {
                closeFence = false;
                openFence = true;
            },
            moveFenceLeft: () => {
                closeFence = true;
                openFence = false;
            },
            stopFence: () => {
                openFence = false;
                closeFence = false;
            }
        }
    })();

    const debugDiv = document.getElementById("debug");
    function debug(message) {
        var msg = document.createElement('code');
        msg.textContent = message;
        debugDiv.prepend(msg);
    }

    // Function bridge for web workers, as the web worker cannot access functions in the UI thread
    worker.onmessage = event => {
        if (event.data == "start") Simulation.start();
        else if (event.data == "isOpenButtonClicked") worker.postMessage({ channel: "isOpenButtonClicked", content: Simulation.isOpenButtonClicked() });
        else if (event.data == "isCloseButtonClicked") worker.postMessage({ channel: "isCloseButtonClicked", content: Simulation.isCloseButtonClicked() });
        else if (event.data == "isStopButtonClicked") worker.postMessage({ channel: "isStopButtonClicked", content: Simulation.isStopButtonClicked() });
        else if (event.data == "isPhotoelectricBarrierInterrupted") worker.postMessage({ channel: "isPhotoelectricBarrierInterrupted", content: Simulation.isPhotoelectricBarrierInterrupted() });
        else if (event.data == "isFenceOpened") worker.postMessage({ channel: "isFenceOpened", content: Simulation.isFenceOpened() });
        else if (event.data == "isFenceClosed") worker.postMessage({ channel: "isFenceClosed", content: Simulation.isFenceClosed() });
        else if (event.data == "moveFenceRight") Simulation.moveFenceRight();
        else if (event.data == "moveFenceLeft") Simulation.moveFenceLeft();
        else if (event.data == "stopFence") Simulation.stopFence();
        else if (event.data.channel == "debug") debug(event.data.content);
    }

    worker.postMessage("load");
});