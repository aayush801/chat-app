const users = []

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'Username and room are required!',
            user: undefined
        }
    }

    const existingUser = users.find((user) => {
        return (username === user.username && user.room === room)
    })

    if (existingUser) {
        return {
            error: 'username in use',
            user: undefined
        }
    }

    const user = {id, username, room}
    users.push(user)
    return {
        error : undefined,
        user
    }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users[index]
    }
}

const getUsersInRoom = (room) => {
    const Users = users.filter((user) => {
        return (user.room === room)
    })
    return Users
}
const getUsers = () => {
    return users
}

module.exports = {
    getUsersInRoom,
    getUser,
    addUser,
    removeUser,
    getUsers
}