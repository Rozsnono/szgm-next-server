import { Request, Response, Router } from "express";
import Controller from "../interfaces/controller_interface";
import userModel from "../models/user.model"
import mongoose from "mongoose";
import logModel from "../models/log.model";
import MessageModel from "../models/message.model";
import OpenAI from "openai";


export default class UserController implements Controller {
  public router = Router();
  public user = userModel;
  public log = logModel;
  public message = MessageModel;

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
      this.login(req, res).catch(next);
    });

    this.router.get("/users", (req, res, next) => {
      this.getUser(req, res).catch(next);
    });

    this.router.get("/logs", (req, res, next) => {
      this.getAllLogs(req, res).catch(next);
    });

    this.router.get("/subjects", (req, res, next) => {
      this.getSubjects(req, res).catch(next);
    });

    this.router.get("/subjectData", (req, res, next) => {
      this.getSubjectsData(req, res).catch(next);
    });

    this.router.post("/message", (req, res, next) => {
      this.createMessage(req, res).catch(next);
    });

    this.router.get("/messages", (req, res, next) => {
      this.getMessages(req, res).catch(next);
    });

    this.router.get("/message/:id", (req, res, next) => {
      this.getMessagesById(req, res).catch(next);
    });

    this.router.put("/message/:id", (req, res, next) => {
      this.putMessage(req, res).catch(next);
    });

    this.router.put("/message/reaction/:id", (req, res, next) => {
      this.reactionMessage(req, res).catch(next);
    });

    this.router.post("/ai", (req, res, next) => {
      this.aiMessage(req, res).catch(next);
    });


  }

  private aiMessage = async (req: Request, res: Response) => {
    const message = req.body.message;
    if (message) {
      const openai = new OpenAI({ apiKey: "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" });
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: message }],
        model: "gpt-3.5-turbo",
      });

      res.send({ message: completion.choices[0].message.content });
    }
    res.status(400).send({ message: "Nincs üzenet!" });
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

  private login = async (req: Request, res: Response) => {
    try {
      const username = req.query.user;
      const password = req.query.password;
      const ip = req.query.ip;
      const data = await this.user.find({ "$and": [{ user: username }, { password: password }] });

      const logs = await this.log.find().sort({ date: -1 });
      if (data.length > 0 && data[0].isDeleted == false) {
        if (logs[0] && !logs[0].log.includes(username as string) && !logs[0].log.includes(ip as string)) {
          const body = { log: `${username} user loged in!`, ip: ip, date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" }) };
          const createdDocument = new this.log({
            ...body
          });
          createdDocument["_id"] = new mongoose.Types.ObjectId();
          const savedDocument = await createdDocument.save();
        }
        res.send(data);
      } else {
        if (logs[0] && !logs[0].log.includes(username as string) && !logs[0].log.includes(ip as string)) {
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

  private getUser = async (req: Request, res: Response) => {
    try {
      const data = await this.user.find().sort({ role: 1 });

      if (data.length > 0) {
        res.send(data);
      } else {
        res.status(404).send({ message: `Felhasználó nem található!` });
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

  private getSubjectsData = async (req: Request, res: Response) => {
    try {
      await fetch("https://sze.vortexcode.com/list.json").then(res => res.json()).then(data => {
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
      if (body && body.role != 1) {
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



  private createMessage = async (req: Request, res: Response) => {
    try {
      console.log(req.body)
      const body = req.body;
      const createdDocument = new this.message({
        ...body
      });
      createdDocument["_id"] = new mongoose.Types.ObjectId();
      const savedDocument = await createdDocument.save();
      res.send({ new: savedDocument, message: "OK" });
    } catch (error: any | Error) {
      res.status(400).send({ message: error.message });
    }
  };

  private getMessages = async (req: Request, res: Response) => {
    try {
      const data = await this.message.find();
      const newData = data.filter((message: any) => message.participants.filter((participant: any) => participant._id == req.query.user).length > 0).map((message: any) => { return { _id: message._id, participants: message.participants, lastMessage: message.messages[message.messages.length - 1] } });
      if (newData) {
        res.send(newData);
      } else {
        res.status(404).send({ message: `Nincs üzenet!` });
      }
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }

  private getMessagesByUser = async (req: Request, res: Response) => {
    try {
      console.log("asd");
      const id = req.params.user;
      const data = await this.message.findById(req.query.id);
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `Nincs üzenet!` });
      }
    } catch (error: any) {
      res.status(400).send({ message: error.message });

    }
  }

  private getMessagesById = async (req: Request, res: Response) => {
    try {
      console.log("asd");
      const id = req.params.id;
      const data = await this.message.findById(id);
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `Nincs üzenet!` });
      }
    } catch (error: any) {
      res.status(400).send({ message: error.message });

    }
  }

  private putMessage = async (req: Request, res: Response) => {
    try {
      try {
        const id = req.params.id;
        const body = req.body;
        const data = await this.message.findById(id);
        let newBody = {};
        if (data) {
          data.messages.push({ _id: new mongoose.Types.ObjectId(), by: body.by, message: body.message, date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" }), reaction: [] });
          newBody = { messages: data.messages, participants: data.participants };
        }
        const modificationResult = await this.message.replaceOne({ _id: id }, newBody, { runValidators: true });
        if (modificationResult.modifiedCount) {
          res.send({ message: `OK` });
        } else {
          res.status(404).send({ message: `Felhasználó a(z) ${id} azonosítóval nem található!` });
        }
      } catch (error: any) {
        res.status(400).send({ message: error.message });
      }
    } catch (error: any) {
      res.status(400).send({ message: error.message });

    }
  }

  private reactionMessage = async (req: Request, res: Response) => {
    try {
      try {
        const id = req.params.id;
        const body = req.body;
        const data = await this.message.findById(id);
        let newBody = {};
        if (data) {
          const tmp = data.messages.filter((message: any) => message._id == body._id)[0];
          const index = data.messages.indexOf(tmp);
          if (index != -1) {
            data.messages[index].reaction.unshift(body.reaction);
            data.messages[index].reaction = data.messages[index].reaction.slice(0, 3);
          } else {
            res.status(404).send({ message: `NINCS ILYEN ${body._id}` });
          }
          newBody = { messages: data.messages, participants: data.participants };
        }
        const modificationResult = await this.message.replaceOne({ _id: id }, newBody, { runValidators: true });
        if (modificationResult.modifiedCount) {
          res.send({ message: `OK` });
        } else {
          res.status(404).send({ message: `Felhasználó a(z) ${id} azonosítóval nem található!` });
        }
      } catch (error: any) {
        res.status(400).send({ message: error.message });
      }
    } catch (error: any) {
      res.status(400).send({ message: error.message });

    }
  }

}
