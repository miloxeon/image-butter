import config from './config'
import Metameta from './metameta'

export default cb => {
    const imagesArray = Array.from(document.querySelectorAll(config.selector))
    const imagesLoaded = imagesArray.map(() => false)

    const queue = new Metameta({
        interval: config.appearDuration,
        bias: 2
    })

    imagesArray.forEach((img, index) => {

        const restoreImg = () => {
            img.classList.remove('butter-loading', 'butter-loaded')
            if (img.getAttribute('class') === '') {
                img.removeAttribute('class')
            }

            imagesLoaded[index] = true
            const allLoaded = imagesLoaded.find(x => x === false) === undefined

            if (cb && allLoaded) {
                cb()
            }
        }
        
        const handleImg = () => queue.push(() => {
            img.classList.add('butter-loaded')
            setTimeout(() => {
                restoreImg(img)
                img.removeEventListener('load', handleImg)
                img.removeEventListener('error', handleImg)
            }, config.appearDurationFinal)
        })

        img.classList.add('butter-loading')
    
        if (img.complete) {
            setTimeout(handleImg, 500)
            return
        }
    
        img.addEventListener('load', handleImg, { once: true })
        img.addEventListener('error', handleImg, { once: true })
    })
}
