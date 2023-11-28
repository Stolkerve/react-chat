import express from "express"
import { createServer } from "node:http"
import {Server} from "socket.io"
import { Message } from "./interfaces/message"
import { User } from "./interfaces/user"

const users = new Map<string, User>()
const bannedUsers = new Map<string, string>()

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
})

// Global middlewares
io.use((socket, next) => {
    if (bannedUsers.has(socket.handshake.address)) {
        socket.disconnect(true)
        return next(new Error("Banned :P")) 
    }
    const username = socket.handshake.auth.username

    if (users.has(username)) {
        return next(new Error("Invalid username or already exist")) 
    }

    socket.data.username  = username
    users.set(username, new User())
    next()
})

io.on("connection", (socket) => {
    const sockets = io.of("/").sockets
    const usersConnected = Array(sockets.size)

    let i = 0
    for (let [id, socket] of sockets)  {
        usersConnected[i] = socket.data.username
        i++
    }

    socket.broadcast.emit("hello", socket.data.username)

    setTimeout(() => {
        socket.emit("users", usersConnected)
    }, 500)

    socket.on('disconnect', () => {
        socket.broadcast.emit("bye", socket.data.username)
        console.log(`${socket.data.username} disconnected`);
    });


    socket.on("chat-group", ({data, type}: Message) => {
        
        let user = users.get(socket.data.username)
        const delta = Date.now() - user.lastMsg.getMilliseconds()
        if (Math.floor(delta / 1000) < 2) {
            // SPAN
            if (user.msgsRate > 200) {
                user.strikes += 1
            }
            user.msgsRate += 1
        } else {
            user.msgsRate = 1
        }



        if (user.strikes > 3) {
            bannedUsers.set(socket.handshake.address, socket.data.username)
            socket.disconnect(true)
            return
        }

        socket.broadcast.emit("chat-group", {
            username: socket.data.username,
            type,
            data
        })
    })
})




server.listen(5000, () => {
    console.log('server running at http://localhost:5000');
})