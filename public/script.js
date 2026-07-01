// Connect to the Socket.IO server.
const socket = io("/");

// Prepare the current user's video.
let myVideoStream;
let myPeerId;
let hasJoinedRoom = false;
const peers = {};
// Keep each user's video tile so the name label can be removed with the video.
const videoTiles = {};
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

// Ask for the display name that appears under this user's video.
const user = prompt("Enter your name:") || "Guest";
// Connect to PeerJS for video and audio calls.
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: window.location.hostname,
  port: window.location.port || 3030,
});

// Ask the browser for permission to use the camera and microphone.
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
}).then((stream) => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream, `${user} (You)`, "me");

  // Answer an incoming call and display the other user's video.
  peer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");
    // Read the caller's display name from PeerJS metadata.
    const callerName = call.metadata && call.metadata.name ? call.metadata.name : "Guest";

    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream, callerName, call.peer);
    });
  });

  // Call a new user when they join the room.
  socket.on("user-connected", (userId, userName) => {
    connectToNewUser(userId, stream, userName);
  });

  joinRoomWhenReady();
}).catch((error) => {
  console.error("Unable to access the camera or microphone:", error);
  alert("Camera and microphone access is required for the video call.");
});

// Send the current user's stream and receive the other user's stream.
const connectToNewUser = (userId, stream, userName = "Guest") => {
  // Send this user's display name with the PeerJS call.
  const call = peer.call(userId, stream, {
    metadata: { name: user },
  });
  const video = document.createElement("video");
  peers[userId] = call;

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, userName, userId);
  });

  call.on("close", () => {
    removeVideoTile(userId);
    delete peers[userId];
  });
};

// Join the room after PeerJS gives this user a unique ID.
peer.on("open", (id) => {
  myPeerId = id;
  joinRoomWhenReady();
});

const joinRoomWhenReady = () => {
  if (hasJoinedRoom || !myPeerId || !myVideoStream) return;

  // Send this user's display name after camera and PeerJS are both ready.
  socket.emit("join-room", ROOM_ID, myPeerId, user);
  hasJoinedRoom = true;
};

// Close the call when a user leaves the room.
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

// Display a camera stream with the user's name under the video.
const addVideoStream = (video, stream, name, userId) => {
  if (videoTiles[userId]) return;

  // Wrap the video and name together like a call participant tile.
  const tile = document.createElement("div");
  tile.className = "video_tile";

  const nameTag = document.createElement("div");
  nameTag.className = "video_name";
  nameTag.innerText = name;

  video.srcObject = stream;
  tile.append(video, nameTag);
  videoTiles[userId] = tile;

  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(tile);
  });
};

const removeVideoTile = (userId) => {
  if (videoTiles[userId]) {
    videoTiles[userId].remove();
    delete videoTiles[userId];
  }
};

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const disconnectBtn = document.querySelector("#disconnect");

muteButton.addEventListener("click",() => {
  if (!myVideoStream || myVideoStream.getAudioTracks().length === 0) return;

  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if(enabled){
    myVideoStream.getAudioTracks()[0].enabled = false;
    muteButton.classList.toggle("background_red");
    muteButton.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
  }
  else{
    myVideoStream.getAudioTracks()[0].enabled = true;
    muteButton.classList.toggle("background_red");
    muteButton.innerHTML = `<i class="fas fa-microphone"></i>`;
  }
})

stopVideo.addEventListener("click",() => {
  if (!myVideoStream || myVideoStream.getVideoTracks().length === 0) return;

  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if(enabled){
    myVideoStream.getVideoTracks()[0].enabled = false;
    stopVideo.classList.toggle("background_red");
    stopVideo.innerHTML = `<i class="fas fa-video-slash"></i>`;
  }
  else{
    myVideoStream.getVideoTracks()[0].enabled = true;
    stopVideo.classList.toggle("background_red");
    stopVideo.innerHTML = `<i class="fas fa-video"></i>`;
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
  socket.disconnect();
  window.location.href = "https://www.google.com";
})
