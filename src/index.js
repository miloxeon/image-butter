import { init, cleanup } from './initAndCleanup'
import handleImages from './handleImages'

export default () => {
    const initialReadyState = document.readyState

    if (initialReadyState === 'loading') {
        init()

        // if will fire on readyState === interactive only
        document.addEventListener(
            'readystatechange',
            () => handleImages(cleanup),
            { once: true }
        )

    } else if (initialReadyState === 'interactive') {
        init()
        handleImages(cleanup)
    }
}
