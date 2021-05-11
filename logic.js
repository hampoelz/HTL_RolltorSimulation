async function Logic() {
    async function setup() {
        // Configure pins to behave as input or output
        // (Motor_Rechts, Motor_Links, Lichtschranke, ES_Oben, ES_Unten, Taster_Auf, Taster_Zu, Taster_Stopp)
        SimulationBridge().start();

        while (true) await loop();
    }

    let delay = 0;
    let closeFenceWithDelay = false;
    
    let openFence = false;
    let closeFence = false;

    async function loop() {
        // Read pins (ES_Oben, ES_Unten, Taster_Auf, Taster_Zu, Taster_Stopp, Lichtschranke)
        const isFenceOpened = await SimulationBridge().isFenceOpened();
        const isFenceClosed = await SimulationBridge().isFenceClosed();
        const isOpenButtonClicked = await SimulationBridge().isOpenButtonClicked();
        const isCloseButtonClicked = await SimulationBridge().isCloseButtonClicked();
        const isStopButtonClicked = await SimulationBridge().isStopButtonClicked();
        const isPhotoelectricBarrierInterrupted = await SimulationBridge().isPhotoelectricBarrierInterrupted();

        // Set pins (Motor_Rechts, Motor_ Links)
        const moveFenceRight = () => SimulationBridge().moveFenceRight();       // Motor_Rechts --> 1
        const moveFenceLeft = () => SimulationBridge().moveFenceLeft();         // Motor_ Links --> 1
        const stopFence = () => SimulationBridge().stopFence();  // Motor_Rechts & Motor_ Links --> 0

        // Get current date
        const date = new Date();
        const time = date.getTime();

        // Close fence when close button was clicked
        if (isCloseButtonClicked) {
            openFence = false;
            closeFence = true;
        }

        // Open fence when close button was clicked
        if (isOpenButtonClicked) {
            openFence = true;
            closeFence = false;
        }
        
        // Stop fence when stop button was clicked
        if (isStopButtonClicked) {
            openFence = false;
            closeFence = false;
        }

        // Close fence with a on-delay after it has been opened when the photoelectric barrier has been interrupted
        if (!isFenceClosed && !isFenceOpened && isPhotoelectricBarrierInterrupted) {
            log("Light barrier interrupted  --> Open fence and start close-delay");
            closeFenceWithDelay = true;
            openFence = true;
            closeFence = false;
        }

        // Start on-delay to close fence when it is open and the photoelectric barrier is no longer interrupted.
        if (isFenceOpened && !isPhotoelectricBarrierInterrupted && closeFenceWithDelay) {
            log("Fence is open              --> Start 10 second close-delay");
            closeFenceWithDelay = false;
            delay = time;
        }

        // Clear on-delay when stop button was clicked
        if (isStopButtonClicked && (delay != 0 || closeFenceWithDelay)) {
            log("Stop button clicked        --> Clear close-delay");
            closeFenceWithDelay = false;
            delay = 0;
        }

        // Close fence after 10 seconds if there is an active on-delay
        if (delay != 0 && time > delay + 10000) {
            log("Delay expired              --> Close fence");
            openFence = false;
            closeFence = true;
            delay = 0;
        }

        // Stop fence when a limit-switch is active
        if ((isFenceClosed && !openFence) || (isFenceOpened && !closeFence)) {
            log("Limit switch activated     --> Stop motor");
            openFence = false;
            closeFence = false;
        }

        // Set outputs
        if (openFence) moveFenceRight();
        else if (closeFence) moveFenceLeft();
        else stopFence();
    }

    let oldMessage = "";
    function log(message) {
        if (message.toUpperCase() === oldMessage.toUpperCase()) return;
        self.postMessage({ channel: "debug", content: message });
        oldMessage = message;
    }

    return await setup();
}
