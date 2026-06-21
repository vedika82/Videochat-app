const express = require("express");
const app = express();
const server = require("http").Server(app);

// for using ejs
app.set("view engine", "ejs");

// for using all the static files inside the public folder
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});

server.listen(3030);