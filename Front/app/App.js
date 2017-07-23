let canvas = document.getElementById('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
let ctx = canvas.getContext("2d")

let background = new Image()
background.src = 'texture/back.png'


let particules = []
let alivesId = []

module.exports.render = (frame) => {

  if (frame !== undefined) {


    ctx.beginPath();
    //let pattern = ctx.createPattern(background, 'repeat')
    ctx.fillStyle = "rgb(255,255,255)"// pattern
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let axes = frame.axes
    if (axes !== undefined) {
      axes.forEach(axe => {
        //   console.log("rendering " + key)
        ctx.beginPath();
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.arc(axe.x, axe.y, 10, 0, 2 * Math.PI);
        ctx.fill()
      })
    }


    particules.forEach(particle => {
      particle.timeLeft--
      particle.x += particle.vx
      particle.y += particle.vy
      ctx.beginPath();
      ctx.fillStyle = "rgba(0,0,0," + particle.timeLeft / 20.0 + ")";
      ctx.arc(particle.x, particle.y, 7, 0, 2 * Math.PI);
      ctx.fill()
    })
    particules = particules.filter(p => p.timeLeft > 0)


    let players = frame.players

    if (players !== undefined) {

      alivesId.forEach(id => {
        let count = Object.keys(players).filter(key => key == id && players[key] !== undefined && players[key].alive == true).length
        let someoneIsDead = count == 0 && players[id] !== undefined
        if (someoneIsDead) {
          for (let i = 0; i < 20; i++) {
            function uniRand() {
              return (Math.random() - 0.5) * 2
            }
            let vx = uniRand() * 5.0
            let vy = uniRand() * 5.0
            let particle = { x: players[id].x, y: players[id].y, vx: vx, vy: vy, timeLeft: 20 }
            particules.push(particle)
          }

        }
      })

      alivesId = []


      Object.keys(players).forEach(function (key) {
        let player = players[key]
        if (player.alive) {


          let playerJustBoosted = player.tickToBoost == 100
          if (playerJustBoosted) {
            for (let i = 0; i < 20; i++) {
              function uniRand() {
                return (Math.random() - 0.5) * 2
              }
              let vx = uniRand() * 5.0 -player.vx
              let vy = uniRand() * 5.0 -player.vy
              let particle = { x: player.x, y: player.y, vx: vx, vy: vy, timeLeft: 20 }
              particules.push(particle)
            }

          }

          alivesId.push(key)
          ctx.beginPath();
          ctx.shadowBlur = 10;
          ctx.shadowColor = "black";
          ctx.fillStyle = player.color;
          ctx.arc(player.x, player.y, 40, 0, 2 * Math.PI);
          ctx.fill()

          ctx.shadowBlur = 0;
          for (let i = 0; i < player.axe; i++) {
            let pos = (i + 0.5 - player.axe / 2) * 12
            ctx.beginPath();
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.arc(player.x + pos, player.y, 10, 0, 2 * Math.PI);
            ctx.fill()
          }

          ctx.beginPath();
          ctx.strokeStyle = "rgb(0,0,0)";
          ctx.lineWidth = 5
          ctx.arc(player.x, player.y, 40, 0, 2 * Math.PI * (100 - player.tickToBoost) / 100.0);
          ctx.stroke()

        }
      })

    }
  }
}

