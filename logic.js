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

        // Open fence when close button was clicked or photoelectric barrier was interrupted
        if (isOpenButtonClicked || (!isFenceClosed && isPhotoelectricBarrierInterrupted)) {
            openFence = true;
            closeFence = false;
        }
        
        // Close fence with a on-delay after it has been opened when the photoelectric barrier has been interrupted
        if ((openFence || closeFence) && isPhotoelectricBarrierInterrupted) closeFenceWithDelay = true;

        // Stop fence when stop button was clicked or a limit-switch is active
        if (isStopButtonClicked || (isFenceClosed && !openFence) || (isFenceOpened && !closeFence)) {
            openFence = false;
            closeFence = false;
        }

        // Clear on-delay when stop button was clicked
        if (isStopButtonClicked && delay != 0) delay = 0;

        // Start with on-delay to close fence when it is open and the photoelectric barrier is no longer interrupted.
        // Also check whether no other on-delay is currently active
        if (isFenceOpened && !isPhotoelectricBarrierInterrupted && closeFenceWithDelay && delay == 0) {
            closeFenceWithDelay = false;
            delay = time;
        }

        // Close fence after 10 seconds if there is an active on-delay
        if (delay != 0 && time > delay + 10000) {
            openFence = false;
            closeFence = true;
            delay = 0;
        }

        // Set outputs
        if (openFence) moveFenceRight();
        else if (closeFence) moveFenceLeft();
        else stopFence();
    }

    return await setup();
}
