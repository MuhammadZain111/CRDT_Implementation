import express from 'express.js'
import { createServer } from "http";
import { Server } from "socket.io";


const app=express();

const httpserver=http.createServer(app);

const io=socket.io(httpserver);


app.get("/",(req,res)=>
{
res.status(200).json({ Message : " Welcome to Server "});

})


app.get("/api",(req,res)=>
{
res.status(200).json({ Message : " Welcome to Server API "});
})




const ysocketio=new YSocketio(io);


ysocketio.initialize();














io.on('connection',(socket)=>{

    
}