var butter = (function () {
    'use strict';

    // const handleDCL = () => {

    // }

    // const handleHeavyElements = () => {

    // }

    // const handleWindowOnLoad = () => {

    // }

    var index = (params = {}) => {

        const {
            msBeforeLoader = 10
        } = params;
        
        const initialReadyState = document.readyState;
        let currentReadyState = initialReadyState;
        let isLoaderShown = false;

        console.log(`START`);

        if (initialReadyState === 'loading') {
            // listen for DOMContentLoaded

            // add a loader timeout
            const loaderTimeout = setTimeout(() => {
                if (currentReadyState === 'loading') {
                    console.log(`${msBeforeLoader}ms have passed, still loading. Should add loader`);
                    isLoaderShown = true;
                } else {
                    console.log(`${msBeforeLoader}ms have passed, already interactive. No loader needed`);
                }
            }, msBeforeLoader);

            document.addEventListener('readystatechange', () => {
                currentReadyState = document.readyState;

                const shouldHideLoader = 
                    currentReadyState === 'interactive' ||
                    currentReadyState === 'complete';

                if (isLoaderShown && shouldHideLoader) {
                    console.log(`ReadyState is ${currentReadyState}, should hide loader`);
                }

                if (currentReadyState === 'interactive') {
                    console.log(`ReadyState is interactive, should add listeners to heavy elements`);
                    clearTimeout(loaderTimeout);

                } else if (currentReadyState === 'complete') {
                    console.log(`ReadyState is complete, should show everything already. FINISH, destroy everything`);
                }
            });

        } else if (initialReadyState === 'interactive') {
            // add listeners to heavy elements

            console.log(`Initial readyState is interactive, should add listeners to heavy elements`);

        }
        
        // we end up here if document is loaded — we should do nothing
    };

    return index;

}());
