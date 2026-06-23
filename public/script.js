// Connect to the Socket.IO server.
const socket = io("/");

// Prepare the current user's video.
let myVideoStream;
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

const user = prompt("Enter your name:");
// Connect to PeerJS for video and audio calls.
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "127.0.0.1",
  port: "3030",
});

// Ask the browser for permission to use the camera and microphone.
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
}).then((stream) => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);

  // Answer an incoming call and display the other user's video.
  peer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");

    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
  });

  // Call a new user when they join the room.
  socket.on("user-connected", (userId) => {
    connectToNewUser(userId, stream);
  });
});

// Send the current user's stream and receive the other user's stream.
const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

// Join the room after PeerJS gives this user a unique ID.
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

// Close the call when a user leaves the room.
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

// Display a camera stream inside the video grid.
const addVideoStream = (video, stream) => {
  video.srcObject = stream;

  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const disconnectBtn = document.querySelector("#disconnect");

muteButton.addEventListener("click",() => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if(enabled){
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background_red");
    muteButton.innerHTML = html;
  }
  else{
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background_red");
    muteButton.innerHTML = html;
  }
})

stopVideo.addEventListener("click",() => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if(enabled){
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background_red");
    stopVideo.innerHTML = html;
  }
  else{
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background_red");
    stopVideo.innerHTML = html;
  }
})

inviteButton.addEventListener("click",() => {
  prompt("Copy this link and send it to people you want to have video call with",
  window.location.href
  );
})

disconnectBtn.addEventListener("click",() => {
  peer.destroy();
  const myVideoElement = document.querySelector("video");
  if(myVideoElement){
    myVideoElement.remove();
  }
  socket.emit("disconnect");
  window.location.href = "https://www.google.com";
})