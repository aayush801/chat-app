const socket = io();

//constants
const $messageForm = document.querySelector('form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button')
const $locationFormButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//Options
const { username, createRoom, joinRoom } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// check joining choice
const roomCheck = () =>{

    console.log(createRoom);
    console.log(joinRoom);

    if(createRoom && joinRoom){
        alert("Create a room OR select an existing one")
        location.href = '/'
        return
    }

    return createRoom ? createRoom : joinRoom
}

const room = roomCheck()
console.log('room', room);

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    console.log(newMessageStyles)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = ($messages.scrollTop + visibleHeight)*2

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message : message.text,
        username: message.username,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', (roomData) => {
    const html = Mustache.render(sidebarTemplate, {
        room : roomData.room,
        users : roomData.usersInRoom
    });
   document.querySelector("#sidebar").innerHTML = html
})
socket.on('location-message', (message) => {
    const html = Mustache.render(locationTemplate, {
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')

    let message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('message delivered!')
    })
})

$locationFormButton.addEventListener('click', (e) => {
    if (!navigator.geolocation)
        return alert('geolocation is not supported')

    $locationFormButton.setAttribute('disable', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('coordinates', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('location shared!')
            $locationFormButton.removeAttribute('disable')
        })
    })
})

socket.emit('join', {username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})

