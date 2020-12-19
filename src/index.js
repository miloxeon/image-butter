import Metameta from './metameta.js'

const appearDuration = 300
const appearDurationFinal = 1000

const setLoader = isShown => {
    if (isShown) {
        console.log('Should show loader')
        return
    }
    
    console.log('Should hide loader')
}

const queue = new Metameta({
    interval: appearDuration,
    bias: 1
})

const handleHeavyElements = () => Array.from(document.querySelectorAll('img')).forEach(img => {

    img.classList.add('butter-loading')

    img.addEventListener('load', e => {
        const loadedImg = e.target
        console.log('Loaded: ', loadedImg)

        queue.push(() => {
            console.log('should appear')
            loadedImg.classList.add('butter-loaded')

            setTimeout(() => {
                loadedImg.classList.remove('butter-loading', 'butter-loaded')
                if (loadedImg.getAttribute('class') === '') {
                    loadedImg.removeAttribute('class')
                }
            }, appearDurationFinal)
        })

    }, {
        once: true
    })
})

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
    `
}

const cleanup = () => {
    const styles = document.getElementById('butter')
    styles.parentNode.removeChild(styles)
}

export default (params = {}) => {

    const {
        msBeforeLoader = 10
    } = params
    
    const initialReadyState = document.readyState
    let currentReadyState = initialReadyState
    let isLoaderShown = false

    console.log(`START`)

    init()

    if (initialReadyState === 'loading') {
        // listen for DOMContentLoaded

        // add a loader timeout
        const loaderTimeout = setTimeout(() => {
            if (currentReadyState === 'loading') {
                console.log(`${msBeforeLoader}ms have passed, still loading. Should add loader`)
                isLoaderShown = true
            } else {
                console.log(`${msBeforeLoader}ms have passed, already interactive. No loader needed`)
            }
        }, msBeforeLoader)

        const onReadyStateChange = () => {
            currentReadyState = document.readyState

            const shouldHideLoader = 
                currentReadyState === 'interactive' ||
                currentReadyState === 'complete'

            if (isLoaderShown && shouldHideLoader) {
                console.log(`ReadyState is ${currentReadyState}, should hide loader`)
            }

            if (currentReadyState === 'interactive') {
                console.log(`ReadyState is interactive, should add listeners to heavy elements`)
                clearTimeout(loaderTimeout)
                handleHeavyElements()

            } else if (currentReadyState === 'complete') {
                console.log(`ReadyState is complete, should show everything already. FINISH, destroy everything`)
                document.removeEventListener('readystatechange', onReadyStateChange)
                queue.push(cleanup)
            }
        }

        document.addEventListener('readystatechange', onReadyStateChange)

    } else if (initialReadyState === 'interactive') {
        // add listeners to heavy elements

        console.log(`Initial readyState is interactive, should add listeners to heavy elements`)

        handleHeavyElements()

        window.addEventListener('load', () => queue.push(cleanup), {
            once: true
        })
    }
    
    // we end up here if document is loaded — we should do nothing
}
