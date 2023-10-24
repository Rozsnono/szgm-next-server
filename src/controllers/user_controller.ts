import { Request, Response, Router } from "express";
import Controller from "../interfaces/controller_interface";
import userModel from "../models/user.model"
import mongoose from "mongoose";

export default class UserController implements Controller {
  public router = Router();
  public user = userModel;

  constructor() {
    this.router.post("/user", (req, res, next) => {
      this.create(req, res).catch(next);
    });

    this.router.get("/user", (req, res, next) => {
      this.getByUserName(req, res).catch(next);
    });
  }


  private create = async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const createdDocument = new this.user({
        ...body
      });
      createdDocument["_id"] = new mongoose.Types.ObjectId();
      const savedDocument = await createdDocument.save();
      res.send({ new: savedDocument, message: "OK" });
    } catch (error: any | Error) {
      res.status(400).send({ message: error.message });
    }
  };

  private getByUserName = async (req: Request, res: Response) => {
    try {
      const username = req.query.user;
      const password = req.query.password;
      const data = await this.user.find({ "$and": [{ user: username }, { password: password }] });
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `Felhasználó a(z) ${username} névvel nem található!` });
      }
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  };


}
