class Metameta {
    constructor (options = {}) {
        this.options = {
            interval: options.interval || 20,
            bias: options.bias || 50
        }
        this.queue = []
        this.clock = null
        this.previousResult = undefined

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
        }

        this._runtime = this._runtime.bind(this)
        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
        this.push = this.push.bind(this)
        this.clear = this.clear.bind(this)
        this.getQueue = this.getQueue.bind(this)
        this.on = this.on.bind(this)
        this.off = this.off.bind(this)
        this.getOptions = this.getOptions.bind(this)
    }

    _runtime () {
        for (let i = 0; i < this.options.bias; i++) {
            // destructurize next function
            const next = this.queue.shift()

            if (next) {
                const nextFunction = next[0]
                let nextArgs = []
                let chains = false

                if (next.length === 2) {
                if (Array.isArray(next[1])) {
                    nextArgs = next[1]
                } else {
                    chains = true
                }
                } else if (next.length === 3) {
                    nextArgs = next[1]
                    chains = true
                }

                if (chains) {
                    // pass previous execution result as the first argument
                    nextArgs.unshift(this.previousResult)
                }

                // call the actual function
                this.previousResult = nextFunction.apply(null, nextArgs)
                this.events['tick'](this.previousResult, next)
            } else {
                this.stop()
                this.events['stop'](true)
            }
        }
    }

    start () {
        this.clock = setInterval(this._runtime, this.options.interval)
        this.events['start']()
    }

    stop () {
        if (this.clock) {
            clearInterval(this.clock)

            // notify whether there's actually was the execution process
            this.events['stop'](false)
        }
        this.events['stop'](true)
    }

    push () {
        const prevLength = this.queue.length
        const args = Array.from(arguments)
        this.queue.push(args)

        if (prevLength === 0) {
            this.start()
        }

        this.events['push'](args[0], prevLength === 0)
    }

    clear () {
        this.queue = []
        this.events['clear']()
    }

    getQueue () {
        return this.queue
    }

    getOptions () {
        return this.options
    }

    on (event, cb) {
        this.events[event] = cb
    }

    off (event) {
        this.events[event] = () => {}
    }
}
  
export default Metameta
