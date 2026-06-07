const express = require ("express");
const app = express();
const server = require ("http").Server(app);
// for using ejs
app.set('view engine','ejs')
// for using all the static files inside of public folder
app.set(express.static('public'))

app.get('/',(req,res)=>{
    res.render('room')
})

server.listen(3030)