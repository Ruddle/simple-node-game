import App from './App.js'

window.onload = function () {
    let modal = document.getElementById('modal')
    let link = "35.189.106.135" + ":3001"//"127.0.0.7:3001" //
    var socket = new WebSocket("ws://" + link);

    socket.onopen = function (event) {
        console.log("socket connected to " + link)
        let frame = {}
        socket.onmessage = function (event) {
            frame = JSON.parse(event.data)
        }

        let alive = false
        let mousePosition = { x: 0, y: 0 }
        function step(timestamp) {
            App.render(frame)
            if (alive) {

                socket.send(JSON.stringify({ mouse: mousePosition }))

                if (frame !== undefined && frame.players !== undefined && frame.players[frame.me] === undefined) {
                    alive = false
                    modal.style.display = "block"
                }

                else if (frame !== undefined && frame.players !== undefined && frame.players[frame.me] !== undefined && frame.players[frame.me].alive == false) {
                    alive = false
                    modal.style.display = "block"
                }
            }
            else {
                if (frame !== undefined && frame.players !== undefined && frame.players[frame.me] !== undefined && frame.players[frame.me].alive == true) {
                    alive = true
                    modal.style.display = "none"
                }
            }
            window.requestAnimationFrame(step);
        }

        window.requestAnimationFrame(step);

        //MODAL STYLING
        modal.style.position = "absolute"
        modal.style.display = "block"
        modal.style.width = parseInt(window.innerWidth / 2) + "px"
        modal.style.height = parseInt(window.innerHeight / 2) + "px"
        modal.style.top = parseInt(window.innerHeight / 4) + "px"
        modal.style.left = parseInt(window.innerWidth / 4) + "px"
        modal.style.backgroundColor = "rgb(230,255,240)"
        modal.style.border = "0px"
        modal.style.borderRadius = "5px"
        let restart = document.getElementById('restart')
        restart.style.backgroundColor = "rgb(200,240,240)"
        restart.style.padding = "10px"
        restart.style.cursor = "pointer"
        //RESTART HANDLING
        restart.addEventListener('click', function () {
            socket.send(JSON.stringify({ restart: true }))
        }, false);
        //CANVAS INPUT HANDLING
        let canvas = document.getElementById('canvas')
        canvas.addEventListener('click', function () {
            socket.send(JSON.stringify({ click: mousePosition }))
        }, false);
        canvas.addEventListener('contextmenu', function (e) {
            e.preventDefault()
            socket.send(JSON.stringify({ rclick: mousePosition }))
        }, false);
        canvas.addEventListener('mousemove', function (evt) {
            let x = evt.clientX
            let y = evt.clientY
            mousePosition = { x: x, y, y }
        }, false);

    };

}
