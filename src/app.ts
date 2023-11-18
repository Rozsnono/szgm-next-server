import express, { Router } from "express";
import mongoose from "mongoose";
import IController from "./interfaces/controller_interface";
import fs from "fs";
import path from 'path';
import cors from "cors";
import http from 'http';
import MessageModel from "./models/message.model";
import { WebSocketServer } from 'ws';




export default class App {
    public app: express.Application;
    public message = MessageModel;


    constructor(controllers: IController[]) {
        this.app = express();
        this.app.use(express.json());
        this.app.use(cors());

        const server = http.createServer(this.app);
        const wss = new WebSocketServer({ port: Number(process.env.PORT || 8000) });

        wss.on('connection', (ws) => {
            console.log("Connected");
        });

        const watching = this.message.watch();
        watching.on("change", (change: any) => {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(change));
                }
            });
        });

        this.connectToTheDatabase().then(() => {
            const port: number | any = process.env.PORT || 8000;
            // server.listen(port, "0.0.0.0", function () {
            //     console.log('Server is running on port ' + port);

            // });


        });
        // this.app.use(express.json());



        // const interval = this.keepAlive(wss)
        // wss.on("close", () => clearInterval(interval))

        controllers.forEach(controller => {
            this.app.use("/api", controller.router);
        });
    }
    private async connectToTheDatabase() {
        mongoose.set("strictQuery", true);
        try {
            "y2odsBbjrlt3YHUb"
            await mongoose.connect("mongodb+srv://admin:admin@szehelper.cslpsfr.mongodb.net/", { connectTimeoutMS: 10000 });
        } catch (error: any) {
            console.log({ message: error.message });
        }

    }

    // private keepAlive = (wss: WebSocketServer) =>
    //     setInterval(
    //         () =>
    //             wss.clients.forEach((ws: Socket) => {
    //                 if (ws.isAlive === false) return ws.terminate()
    //                 ws.isAlive = false
    //                 ws.ping()
    //             }),
    //         30_000,
    //     )
}
