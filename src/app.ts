import express, { Router } from "express";
import mongoose from "mongoose";
import IController from "./interfaces/controller_interface";
import fs from "fs";
import path from 'path';
import cors from "cors";
 




export default class App {
    public app: express.Application;

    constructor(controllers: IController[]) {  
        this.app = express();
        this.app.use(express.json());
        this.app.use(cors())
        this.connectToTheDatabase().then(() => {
            this.listen()
        });
       // this.app.use(express.json());

        controllers.forEach(controller => {
            this.app.use("/api", controller.router);
        })
    }

    public listen(): void {
        this.app.listen(8000, () => {
            console.log("The application is available on port 8000!");
        })
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
}
