import dotenv from 'dotenv';
dotenv.config();

import express , { Request , Response } from 'express';
import cors  from 'cors';
import router from './routes/route';

const app = express();

app.use(express.json());
app.use(cors({
    origin : [ "https://vericaptcha.live" , "https://www.vericaptcha.live" , "https://metamind-web.vercel.app" , "http://localhost:3000" ],
    allowedHeaders : '*'
}));

app.use('/api/v1' , router);

app.get('/' , async (req : Request , res : Response) => {
    res.json({
        message : "The server is running fine!!"
    });
    return;
});


const port = process.env.BACKEND_PORT || 3001;
app.listen(port , () => {
    console.log("Server started listening on port : " , port);
});
