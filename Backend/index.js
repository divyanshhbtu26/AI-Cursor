import express from 'express';
const app = express();
import cors from 'cors';
import aiRouter from "./airoute.js"; 

const port=3000

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}))

app.use(express.json());

app.use('/ai',aiRouter);

const InitalizeConnection = async ()=>{
    try{
        app.listen(port, ()=>{
            console.log("Server listening at port number: "+ port );
        })

    }
    catch(err){
        console.log("Error: "+err);
    }
}

InitalizeConnection();



