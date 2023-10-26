import { Request, Response, Router } from "express";
import Controller from "../interfaces/controller_interface";
import userModel from "../models/user.model"
import mongoose from "mongoose";
import logModel from "../models/log.model";

export default class UserController implements Controller {
  public router = Router();
  public user = userModel;
  public log = logModel;

  constructor() {
    this.router.post("/user", (req, res, next) => {
      this.create(req, res).catch(next);
    });

    this.router.put("/user/:id", (req, res, next) => {
      this.put(req, res).catch(next);
    });

    this.router.delete("/user/:id/:ban", (req, res, next) => {
      this.delete(req, res).catch(next);
    });

    this.router.get("/user", (req, res, next) => {
      this.getByUserName(req, res).catch(next);
    });

    this.router.get("/logs", (req, res, next) => {
      this.getAllLogs(req, res).catch(next);
    });

    this.router.get("/subjects", (req, res, next) => {
      this.getSubjects(req, res).catch(next);
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
      const ip = req.query.ip;
      const data = await this.user.find({ "$and": [{ user: username }, { password: password }] });

      const logs = await this.log.find().sort({ date: -1 });
      if (data.length > 0) {
        if (logs[0] && !logs[0].log.includes(username as string)) {
          const body = { log: `${username} user loged in!`, ip: ip, date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" }) };
          const createdDocument = new this.log({
            ...body
          });
          createdDocument["_id"] = new mongoose.Types.ObjectId();
          const savedDocument = await createdDocument.save();
        }
        res.send(data);
      } else {
        if (logs[0] && !logs[0].log.includes(username as string)) {
          const body = { log: `${username} user tried to log in!`, ip: ip, date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" }) };
          const createdDocument = new this.log({
            ...body
          });
          createdDocument["_id"] = new mongoose.Types.ObjectId();
          const savedDocument = await createdDocument.save();
        }

        res.status(404).send({ message: `Felhasználó a(z) ${username} névvel nem található!` });
      }
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  };

  private getAllLogs = async (req: Request, res: Response) => {
    try {
      const data = await this.log.find().sort({ date: -1 });
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `Nincs log!` });
      }
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }

  private getSubjects = async (req: Request, res: Response) => {
    try {
      const url = req.query.url;
      await fetch("https://sze.vortexcode.com/ajaxfuggoseg/" + url).then(res => res.json()).then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({ message: `Nincs data!` });
        }
      });

    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }

  private put = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const body = req.body;
      const modificationResult = await this.user.replaceOne({ _id: id }, body, { runValidators: true });
      if (modificationResult.modifiedCount) {
        const updatedDoc = await this.user.findById(id);
        res.send({ new: updatedDoc, message: `OK` });
      } else {
        res.status(404).send({ message: `Felhasználó a(z) ${id} azonosítóval nem található!` });
      }
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  };

  private delete = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const ban = req.params.ban == "true" ? true : false;
      const updatedDoc = await this.user.findById(id);
      const body = updatedDoc;
      if (body) {
        body.isDeleted = ban;
        const modificationResult = await this.user.replaceOne({ _id: id }, body, { runValidators: true });
        if (modificationResult.modifiedCount) {
          res.send({ message: `OK` });
        } else {
          res.status(404).send({ message: `Felhasználó a(z) ${id} azonosítóval nem található!` });
        }
      } else {
        res.status(404).send({ message: `Felhasználó a(z) ${id} azonosítóval nem található!` });
      }
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  };


}
