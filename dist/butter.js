var butter = (function () {
    'use strict';

    var config = {
        appearDuration: 300,
        appearDurationFinal: 1000,
        selector: 'img[width][height][alt]:not([alt=""])',
    };

    const init = () => {
        document.head.innerHTML += `
        <style id="butter">
            .butter-loading {
                background-image: linear-gradient(to right, #eee, #ededed);
                filter: contrast(0%) brightness(185%);
            }

            .butter-loading.butter-loaded {
                filter: none;
                animation:
                    appear-position ${config.appearDuration}ms,
                    appear-opacity ${config.appearDurationFinal}ms;

                animation-fill-mode: forwards;
                animation-timing-function: cubic-bezier(.25, .8, .25, 1);
            }

            @keyframes appear-position {
                from {
                    transform: translateY(20px) scale(0.97);
                } to {
                    transform: translateY(0) scale(1);
                }
            }

            @keyframes appear-opacity {
                from {
                    opacity: 0;
                } to {
                    opacity: 1;
                }
            }
        </style>
    `;
    };

    const cleanup = () => document.getElementById('butter').remove();

    class Metameta {
        constructor (options = {}) {
            this.options = {
                interval: options.interval || 20,
                bias: options.bias || 50
            };
            this.queue = [];
            this.clock = null;
            this.previousResult = undefined;

            this.events = {
            // called on every function being executed
                tick: (previousResult, next) => {},

                // called on execution start
                start: () => {},

                // called on execution stop and
                // notifies you whether there were function to execute or not
                stop: (isFinished) => {},

                // called on push. Receives the the new function
                // and whether this push has started the execution
                push: (fn, wasStarted) => {},

                // called on queue wiping
                clear: () => {}
            };

            this._runtime = this._runtime.bind(this);
            this.start = this.start.bind(this);
            this.stop = this.stop.bind(this);
            this.push = this.push.bind(this);
            this.clear = this.clear.bind(this);
            this.getQueue = this.getQueue.bind(this);
            this.on = this.on.bind(this);
            this.off = this.off.bind(this);
            this.getOptions = this.getOptions.bind(this);
        }

        _runtime () {
            for (let i = 0; i < this.options.bias; i++) {
                // destructurize next function
                const next = this.queue.shift();

                if (next) {
                    const nextFunction = next[0];
                    let nextArgs = [];
                    let chains = false;

                    if (next.length === 2) {
                    if (Array.isArray(next[1])) {
                        nextArgs = next[1];
                    } else {
                        chains = true;
                    }
                    } else if (next.length === 3) {
                        nextArgs = next[1];
                        chains = true;
                    }

                    if (chains) {
                        // pass previous execution result as the first argument
                        nextArgs.unshift(this.previousResult);
                    }

                    // call the actual function
                    this.previousResult = nextFunction.apply(null, nextArgs);
                    this.events['tick'](this.previousResult, next);
                } else {
                    this.stop();
                    this.events['stop'](true);
                }
            }
        }

        start () {
            this.clock = setInterval(this._runtime, this.options.interval);
            this.events['start']();
        }

        stop () {
            if (this.clock) {
                clearInterval(this.clock);

                // notify whether there's actually was the execution process
                this.events['stop'](false);
            }
            this.events['stop'](true);
        }

        push () {
            const prevLength = this.queue.length;
            const args = Array.from(arguments);
            this.queue.push(args);

            if (prevLength === 0) {
                this.start();
            }

            this.events['push'](args[0], prevLength === 0);
        }

        clear () {
            this.queue = [];
            this.events['clear']();
        }

        getQueue () {
            return this.queue
        }

        getOptions () {
            return this.options
        }

        on (event, cb) {
            this.events[event] = cb;
        }

        off (event) {
            this.events[event] = () => {};
        }
    }

    var handleImages = cb => {
        const imagesArray = Array.from(document.querySelectorAll(config.selector));
        const imagesLoaded = imagesArray.map(() => false);

        const queue = new Metameta({
            interval: config.appearDuration,
            bias: 2
        });

        imagesArray.forEach((img, index) => {

            const restoreImg = () => {
                img.classList.remove('butter-loading', 'butter-loaded');
                if (img.getAttribute('class') === '') {
                    img.removeAttribute('class');
                }

                imagesLoaded[index] = true;
                const allLoaded = imagesLoaded.find(x => x === false) === undefined;

                if (cb && allLoaded) {
                    cb();
                }
            };
            
            const handleImg = () => queue.push(() => {
                img.classList.add('butter-loaded');
                setTimeout(() => {
                    restoreImg();
                    img.removeEventListener('load', handleImg);
                    img.removeEventListener('error', handleImg);
                }, config.appearDurationFinal);
            });

            img.classList.add('butter-loading');
        
            if (img.complete) {
                setTimeout(handleImg, 500);
                return
            }
        
            img.addEventListener('load', handleImg, { once: true });
            img.addEventListener('error', handleImg, { once: true });
        });
    };

    var index = () => {
        const initialReadyState = document.readyState;

        if (initialReadyState === 'loading') {
            init();

            // if will fire on readyState === interactive only
            document.addEventListener(
                'readystatechange',
                () => handleImages(cleanup),
                { once: true }
            );

        } else if (initialReadyState === 'interactive') {
            init();
            handleImages(cleanup);
        }
    };

    return index;

}());
