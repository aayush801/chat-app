const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('../src/utils/messages')
const {
    getUsersInRoom,
    getUser,
    addUser,
    removeUser,
    getUsers
} = require('../src/utils/users')

const {addRoom, removeRoom, getAllRooms} = require('../src/utils/rooms')

const port = process.env.PORT || 3000

const app = express();
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath));

let count = 0;

io.on('connection', (socket) => {
    const emoji = String.fromCodePoint(0x1F600)
    socket.emit('message', generateMessage(`Welcome ! ${emoji}`))

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})

        if (error) {
            return callback(error)
        }
        addRoom(user.room)
        socket.join(user.room);
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined !`, ''))

        io.to(user.room).emit('roomData', {
            room: user.room,
            usersInRoom: getUsersInRoom(user.room)
        })
        callback();
    })

    socket.on('roomsListQuery', () => {
        socket.emit('roomsList', getAllRooms())
    })

    socket.on('sendMessage', (message, callback) => {
        const User = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('message contains profanity')
        }
        io.to(User.room).emit('message', generateMessage(message, User.username))
        callback();
    })

    socket.on('coordinates', (coords, callback) => {
        const User = getUser(socket.id)
        io.to(User.room).emit('location-message', generateLocationMessage(`https://google.com/maps?g=${coords.latitude},${coords.longitude}`, User.username))
        callback();
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has disconnected`, ''))

            removeRoom(user.room)

            io.to(user.room).emit('roomData', {
                room: user.room,
                usersInRoom: getUsersInRoom(user.room)
            })
        }

    })

})

server.listen(port, () => {
    console.log(`server is up and running on ${port} `);
});

