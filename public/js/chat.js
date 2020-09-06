const socket = io();

// Elements
const $MessageForm = document.querySelector("#message-form");
const $MessageFormInput = $MessageForm.querySelector("input");
const $MessageFormButton = $MessageForm.querySelector("button");
const $SendLocationButton = document.querySelector("#send-location");
const $Messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//QueryString

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = $Messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = $Messages.offsetHeight

  // Height of messages container
  const containerHeight = $Messages.scrollHeight

  // How far have I scrolled?
  const scrollOffset = $Messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
      $Messages.scrollTop = $Messages.scrollHeight
  }
}

socket.on("message", (messageData) => {
  //console.log(messageData);
  const html = Mustache.render(messageTemplate, {
    username : messageData.username,
    message: messageData.text,
    createdAt: moment(messageData.createdAt).format("h:mm a"),
  });
  $Messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on("locationMessage", (location) => {
  
  const html = Mustache.render(locationTemplate, {
    username:location.username,
    url: location.url,
    createdAt: moment(location.createdAt).format("h:mm a"),
  });
  $Messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

$MessageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $MessageFormButton.setAttribute("disabled", "disabled");

  const message = document.querySelector("input").value;

  socket.emit("sendMessage", message, () => {
    console.log("The message was delivered!");
    $MessageFormButton.removeAttribute("disabled");
    $MessageFormInput.value = "";
    $MessageFormInput.focus();
  });
});

$SendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Your Browser does not support Geolocation!");
  } else {
    console.log("Send location clicked");
    $SendLocationButton.setAttribute("disabled", "disabled");
    navigator.geolocation.getCurrentPosition((position) => {
      socket.emit(
        "sendLocation",
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        () => {
          $SendLocationButton.removeAttribute("disabled");
          console.log("Location Shared!");
        }
      );
    });
  }
});

socket.emit("join", { username, room },(error)=>{
  if(error){
    alert('Username is in use! Please try again with different username!!');
    location.href = "/";
  }
});


socket.on("roomData",({room,users})=>{
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
})
document.querySelector('#sidebar').innerHTML = html
})