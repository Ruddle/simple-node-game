exports.game = 'test'


const colors = ["rgb(0, 128, 0)", "rgb(0, 128, 128)", "rgb(128, 0, 0)", "rgb(255, 0, 0)", "rgb(128, 128, 0)"]
let nextColorIndex = 0
let nextColor = () => {
    nextColorIndex += 1
    return colors[nextColorIndex % colors.length]
}

module.exports.nextColor = nextColor

module.exports.newPlayer = (localId) => {
    return {
        id: localId, x: Math.random() * 500,
        y: Math.random() * 500,
        vx: 1,
        vy: 0,
        axe: 1,
        tickToBoost : 0,
        alive: true,
        color: nextColor()
    }
}

