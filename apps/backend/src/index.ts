import express , { Request , Response } from 'express';
import cors  from 'cors';
import router from './routes/route';
import dotenv from 'dotenv';

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());

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
