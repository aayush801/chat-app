const users = []

const addUser = ({id, username, room }) => {

    if (!username || !room) {
        return {error: 'Username and room are required!'}
    }

    const existingUser = users.find( (user) => {
        return (username === user.username && user.room === room)
    })

    if(existingUser){
        return {
            error : 'username in use'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return user
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1){
        return users[index]
    }
}

const getUsersInRoom = (room) => {
    const Users = users.filter( (user) => {
        return (user.room === room)
    })
    return Users
}

module.exports = {
    getUsersInRoom,
    getUser,
    addUser,
    removeUser
}