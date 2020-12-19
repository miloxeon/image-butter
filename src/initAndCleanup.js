import config from './config'

export const init = () => {
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
    `
}

export const cleanup = () => document.getElementById('butter').remove()
