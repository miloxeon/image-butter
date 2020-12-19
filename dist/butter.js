var butter = (function () {
  'use strict';

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

  const appearDuration = 300;
  const appearDurationFinal = 1000;

  const queue = new Metameta({
      interval: appearDuration,
      bias: 1
  });

  const handleHeavyElements = () => Array.from(document.querySelectorAll('img')).forEach(img => {

      img.classList.add('butter-loading');

      img.addEventListener('load', e => {
          const loadedImg = e.target;
          console.log('Loaded: ', loadedImg);

          queue.push(() => {
              console.log('should appear');
              loadedImg.classList.add('butter-loaded');

              setTimeout(() => {
                  loadedImg.classList.remove('butter-loading', 'butter-loaded');
                  if (loadedImg.getAttribute('class') === '') {
                      loadedImg.removeAttribute('class');
                  }
              }, appearDurationFinal);
          });

      }, {
          once: true
      });
  });

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
                    appear-position ${appearDuration}ms,
                    appear-opacity ${appearDurationFinal}ms;

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

  const cleanup = () => {
      const styles = document.getElementById('butter');
      styles.parentNode.removeChild(styles);
  };

  var index = (params = {}) => {

      const {
          msBeforeLoader = 10
      } = params;
      
      const initialReadyState = document.readyState;
      let currentReadyState = initialReadyState;
      let isLoaderShown = false;

      console.log(`START`);

      init();

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

          const onReadyStateChange = () => {
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
                  handleHeavyElements();

              } else if (currentReadyState === 'complete') {
                  console.log(`ReadyState is complete, should show everything already. FINISH, destroy everything`);
                  document.removeEventListener('readystatechange', onReadyStateChange);
                  queue.push(cleanup);
              }
          };

          document.addEventListener('readystatechange', onReadyStateChange);

      } else if (initialReadyState === 'interactive') {
          // add listeners to heavy elements

          console.log(`Initial readyState is interactive, should add listeners to heavy elements`);

          handleHeavyElements();

          window.addEventListener('load', () => queue.push(cleanup), {
              once: true
          });
      }
      
      // we end up here if document is loaded — we should do nothing
  };

  return index;

}());
