import { Request, Response, Router } from "express";
import Controller from "../interfaces/controller_interface";
import userModel from "../models/user.model"
import mongoose from "mongoose";
import logModel from "../models/log.model";
import MessageModel from "../models/message.model";
import OpenAI from "openai";
import AImodel from "../models/ai.model";


export default class UserController implements Controller {
  public router = Router();
  public user = userModel;
  public log = logModel;
  public message = MessageModel;
  public ai = AImodel;

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

    this.router.post("/subjects", (req, res, next) => {
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

    this.router.get("/ai-all", (req, res, next) => {
      this.getAiMessages(req, res).catch(next);
    });

    this.router.get("/ai", (req, res, next) => {
      this.getAiMessageById(req, res).catch(next);
    });

    this.router.post("/ai-new", (req, res, next) => {
      this.newAiMessage(req, res).catch(next);
    });

  }

  private getAiMessages = async (req: Request, res: Response) => {
    try {
      const data = await this.ai.find({ user_id: req.query.user_id }).sort({ date: -1 });

      if (data.length > 0) {
        res.send(data);
      } else {
        res.status(404).send({ message: `Felhasználó nem található!` });
      }
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }

  private newAiMessage = async (req: Request, res: Response) => {
    try {
      const createdDocument = new this.ai({
        user_id: req.body.user_id,
        messages: [],
        date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })
      });
      createdDocument["_id"] = new mongoose.Types.ObjectId();
      const savedDocument = await createdDocument.save();
      res.status(200).send({ message: "OK", id: savedDocument._id });
    } catch (error: any | Error) {
      res.status(400).send({ message: error.message });
    }
  };



  private getAiMessageById = async (req: Request, res: Response) => {
    try {
      const data = await this.ai.findById(req.query.id);

      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `Felhasználó nem található!` });
      }
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }

  private aiMessage = async (req: Request, res: Response) => {
    const message = req.body.message;
    const id = req.body.id;

    if (message) {
      const openai = new OpenAI({ apiKey: "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" });
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: message }],
        model: "gpt-3.5-turbo",
      });
      const data = await this.ai.findById(id);
      if (data) {
        data.messages.push({ role: "user", message: message });
        data.messages.push({ role: "ai", message: completion.choices[0].message.content });
        const body = {
          user_id: req.body.user_id,
          messages: data.messages,
          date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })
        }
        const modificationResult = await this.ai.replaceOne({ _id: id }, body, { runValidators: true });

        if (modificationResult.modifiedCount) {
          res.send({ message: completion.choices[0].message.content });
        }
      } else {
        const createdDocument = new this.ai({
          user_id: req.body.user_id,
          messages: [{ role: "user", message: message }, { role: "ai", message: completion.choices[0].message.content }],
          date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })
        });
        createdDocument["_id"] = new mongoose.Types.ObjectId();
        const savedDocument = await createdDocument.save();

        res.send({ message: completion.choices[0].message.content });

      }
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
      const ip = req.ip || req.connection.remoteAddress;
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

      // const data = JSON.parse(this.getSubjectsJSON);
      res.send(this.getSubjectsJSON());

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


  private getSubjectsJSON() {
    return {
        "mandatory": {
            data: [
                {
                    "code": "GKNB_MSTM001",
                    "name": "Matematika 1.",
                    "credit": "5",
                    "semester": "1",
                    "pre": ""
                },
                {
                    "code": "GKNB_MSTM014",
                    "name": "Diszkrét matematika",
                    "credit": "6",
                    "semester": "1",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM012",
                    "name": "Számítógépek működése",
                    "credit": "8",
                    "semester": "1",
                    "pre": ""
                },
                {
                    "code": "KGNB_NETM042",
                    "name": "Közgazdaságtan",
                    "credit": "4",
                    "semester": "1",
                    "pre": ""
                },
                {
                    "code": "GKNB_MSTM016",
                    "name": "Algoritmusok és adatstruktúrák",
                    "credit": "6",
                    "semester": "1",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM018",
                    "name": "Számítógép-hálózatok",
                    "credit": "6",
                    "semester": "2",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM001",
                    "name": "Rendszer és irányítás",
                    "credit": "3",
                    "semester": "2",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM021",
                    "name": "Programozás",
                    "credit": "6",
                    "semester": "2",
                    "pre": ""
                },
                {
                    "code": "GKNB_MSTM008",
                    "name": "Matematika 2.",
                    "credit": "5",
                    "semester": "2",
                    "pre": "GKNB_MSTM001"
                },
                {
                    "code": "GKNB_INTM022",
                    "name": "Projektmunka és szoftvertechnológia",
                    "credit": "6",
                    "semester": "2",
                    "pre": ""
                },
                {
                    "code": "KGNB_MMTM048",
                    "name": "Vállalatgazdaságtan",
                    "credit": "5",
                    "semester": "3",
                    "pre": ""
                },
                {
                    "code": "GKNB_MSTM011",
                    "name": "Matematika 3.",
                    "credit": "5",
                    "semester": "3",
                    "pre": "GKNB_MSTM008"
                },
                {
                    "code": "GKNB_INTM020",
                    "name": "Mikroelektromechanikai rendszerek",
                    "credit": "3",
                    "semester": "3",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM167",
                    "name": "Szakmai gyakorlat",
                    "credit": "0",
                    "semester": "3",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM025",
                    "name": "Rendszerüzemeltetés és biztonság",
                    "credit": "3",
                    "semester": "3",
                    "pre": "GKNB_INTM012"
                },
                {
                    "code": "GKNB_INTM085",
                    "name": "OO programozás",
                    "credit": "6",
                    "semester": "3",
                    "pre": "GKNB_INTM021"
                },
                {
                    "code": "GKNB_INTM086",
                    "name": "Adatbázis-kezelés",
                    "credit": "4",
                    "semester": "3",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM087",
                    "name": "Ipar 4.0 technológiák",
                    "credit": "3",
                    "semester": "4",
                    "pre": "GKNB_INTM003"
                },
                {
                    "code": "GKNB_FKTM007",
                    "name": "Fizika informatikusoknak",
                    "credit": "4",
                    "semester": "4",
                    "pre": "GKNB_MSTM001"
                },
                {
                    "code": "GKNB_INTM004",
                    "name": "Projektmunka 1.",
                    "credit": "6",
                    "semester": "4",
                    "pre": "GKNB_INTM022"
                },
                {
                    "code": "KGNB_GETM004",
                    "name": "Statisztika",
                    "credit": "2",
                    "semester": "4",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM002",
                    "name": "Mesterséges intelligencia",
                    "credit": "6",
                    "semester": "4",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM006",
                    "name": "Modern szoftverfejlesztési eszközök",
                    "credit": "3",
                    "semester": "5",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM005",
                    "name": "Projektmunka 2.",
                    "credit": "6",
                    "semester": "5",
                    "pre": "GKNB_INTM004"
                },
                {
                    "code": "GKNB_INTM007",
                    "name": "Vállalati információs rendszerek",
                    "credit": "3",
                    "semester": "5",
                    "pre": ""
                },
                {
                    "code": "DKNB_KATM030",
                    "name": "Üzleti és informatikai jog",
                    "credit": "5",
                    "semester": "5",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM019",
                    "name": "Modellezés és optimalizálás a gyakorlatban",
                    "credit": "6",
                    "semester": "5",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM009",
                    "name": "Korszerű hálózati alkalmazások",
                    "credit": "6",
                    "semester": "6",
                    "pre": "GKNB_INTM018"
                },
                {
                    "code": "GKNB_INTM096",
                    "name": "Szakdolgozati konzultáció I.",
                    "credit": "7",
                    "semester": "6",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM097",
                    "name": "Szakdolgozati konzultáció II.",
                    "credit": "8",
                    "semester": "7",
                    "pre": "GKNB_INTM096"
                },
                {
                    "code": "GKNB_INTM008",
                    "name": "IT-szolgáltatások",
                    "credit": "3",
                    "semester": "7",
                    "pre": ""
                }
            ],
            total: 149
        },
        "optional_professional": {
            data: [
                {
                    "code": "GKNB_AUTM078",
                    "name": "Autonóm járművek és robotok programozása",
                    "credit": "5",
                    "semester": "0",
                    "pre": "GKNB_INTM021"
                },
                {
                    "code": "AJNB_TVTM002",
                    "name": "Bevezetés a beágyazott rendszerekbe",
                    "credit": "2",
                    "semester": "0",
                    "pre": "AJNB_JFTM028"
                },
                {
                    "code": "GKNB_INTM032",
                    "name": "Humanoid robotok irányítása",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM033",
                    "name": "Információ modellezés",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM042",
                    "name": "Portálfejlesztés .NET-ben",
                    "credit": "6",
                    "semester": "0",
                    "pre": [
                        "GKNB_INTM024",
                        "GKNB_INTM085",
                        "GKNB_INTM086"
                    ]
                },
                {
                    "code": "GKNB_INTM043",
                    "name": "Programozás.Net-ben",
                    "credit": "6",
                    "semester": "0",
                    "pre": [
                        "GKNB_INTM024",
                        "GKNB_INTM085",
                        "GKNB_INTM086"
                    ]
                },
                {
                    "code": "GKNB_INTM044",
                    "name": "Adatintenzív adatbázis-kezelő alkalmazások",
                    "credit": "5",
                    "semester": "0",
                    "pre": "GKNB_INTM086"
                },
                {
                    "code": "GKNB_INTM051",
                    "name": "Ágazati információrendszerek II.",
                    "credit": "3",
                    "semester": "0",
                    "pre": "GKNB_INTM050"
                },
                {
                    "code": "MENB_NTTM035",
                    "name": "Növényvédelem technológiai alapjai",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "MENB_AVTM010",
                    "name": "Mezőgazdasági alapismeretek",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM038",
                    "name": "Gépi látás",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_AUTM007",
                    "name": "Szabályozástechnika",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM040",
                    "name": "Mobilalkalmazás-fejlesztés",
                    "credit": "6",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM047",
                    "name": "IT-beruházások megtérülése I",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM048",
                    "name": "IT-beruházások megtérülése II",
                    "credit": "5",
                    "semester": "0",
                    "pre": "GKNB_INTM047"
                },
                {
                    "code": "GKNB_INTM054",
                    "name": "C#",
                    "credit": "6",
                    "semester": "0",
                    "pre": [
                        "GKNB_INTM024",
                        "GKNB_INTM085",
                        "GKNB_INTM086"
                    ]
                },
                {
                    "code": "MENB_NTTM038",
                    "name": "Általános növénytermesztéstan",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM090",
                    "name": "Blokklánc rendszerek",
                    "credit": "3",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM029",
                    "name": "Funkcionális programozás",
                    "credit": "6",
                    "semester": "0",
                    "pre": [
                        "GKNB_INTM024",
                        "GKNB_INTM085",
                        "GKNB_INTM086"
                    ]
                },
                {
                    "code": "GKNB_INTM036",
                    "name": "IT-változásmenedzsment",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM039",
                    "name": "Kiterjesztett kollaboráció a jövő Internetén",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM045",
                    "name": "Számítógépes adatbiztonság",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_MSTM032",
                    "name": "Python programozás",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_MSTM028",
                    "name": "Linux ismeretek",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "MENB_NTTM051",
                    "name": "Precíziós növénytermesztési gazdálkodás",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "AJNB_JFTM028",
                    "name": "Járműfejlesztés alapjai informatikusoknak",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "MENB_ÁTTM033",
                    "name": "Általános állattenyésztéstan",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM034",
                    "name": "Interaktív multimédia alkalmazások",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_AUTM014",
                    "name": "Mikrokontroller programozás",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM041",
                    "name": "PHP",
                    "credit": "6",
                    "semester": "0",
                    "pre": [
                        "GKNB_INTM024",
                        "GKNB_INTM085",
                        "GKNB_INTM086"
                    ]
                },
                {
                    "code": "GKNB_MSTM033",
                    "name": "Robot programozás",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM050",
                    "name": "Ágazati információrendszerek I.",
                    "credit": "3",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_MSTM077",
                    "name": "Párhuzamos programozás",
                    "credit": "4",
                    "semester": "0",
                    "pre": "GKNB_MSTM032"
                },
                {
                    "code": "MENB_NTTM042",
                    "name": "Földműveléstan",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "MENB_BÉTM011",
                    "name": "Térinformatika",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM026",
                    "name": "C++",
                    "credit": "6",
                    "semester": "0",
                    "pre": [
                        "GKNB_INTM024",
                        "GKNB_INTM085",
                        "GKNB_INTM086"
                    ]
                },
                {
                    "code": "GKNB_INTM037",
                    "name": "Java programozás",
                    "credit": "6",
                    "semester": "0",
                    "pre": [
                        "GKNB_INTM024",
                        "GKNB_INTM085",
                        "GKNB_INTM086"
                    ]
                },
                {
                    "code": "GKNB_INTM052",
                    "name": "Banki Informatika",
                    "credit": "3",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM053",
                    "name": "Beágyazott rendszerek (IoT)",
                    "credit": "6",
                    "semester": "0",
                    "pre": [
                        "GKNB_INTM024",
                        "GKNB_INTM085",
                        "GKNB_INTM086"
                    ]
                },
                {
                    "code": "GKNB_MSTM030",
                    "name": "Kombinatorikus optimalizálás",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM011",
                    "name": "Rendszerfejlesztés",
                    "credit": "6",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "MENB_NTTM046",
                    "name": "Biotermékektől a géntechnológiáig",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "MENB_NTTM014",
                    "name": "Kertészet alapjai",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "MENB_ÁTTM017",
                    "name": "Takarmányozástan alapjai",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM030",
                    "name": "Gyakorlatorientált sw-technológia",
                    "credit": "6",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "KGNB_VKTM007",
                    "name": "Kommunikációs ismeretek",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_KVTM029",
                    "name": "Autóipari termékfejlesztés",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "MENB_ÁTTM054",
                    "name": "Precíziós állattenyésztés",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "MENB_ÉTTM020",
                    "name": "Minőségbiztosítás alapjai",
                    "credit": "3",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "MENB_VKTM026",
                    "name": "Vízgazdálkodás alapjai",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "AJNB_JFTM029",
                    "name": "Járműdinamika informatikusoknak",
                    "credit": "4",
                    "semester": "0",
                    "pre": "AJNB_JFTM028"
                },
                {
                    "code": "GKNB_INTM113",
                    "name": "Unity alapú VR fejlesztések",
                    "credit": "4",
                    "semester": "0",
                    "pre": "GKNB_INTM085"
                },
                {
                    "code": "GKNB_INTM028",
                    "name": "Felhasználói interfészek tervezése (Sw ergonómia)",
                    "credit": "6",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM049",
                    "name": "WEB technológia",
                    "credit": "6",
                    "semester": "0",
                    "pre": "GKNB_INTM018"
                },
                {
                    "code": "MENB_VKTM002",
                    "name": "Agrometeorológia alapjai",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_MSTM080",
                    "name": "Nagyteljesítményű számítási rendszerek",
                    "credit": "5",
                    "semester": "0",
                    "pre": "GKNB_MSTM077"
                },
                {
                    "code": "MENB_ÉTTM007",
                    "name": "Élelmiszerismeret",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM088",
                    "name": "SAP alkalmazói ismeretek",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM089",
                    "name": "Tartalomkezelő rendszerek",
                    "credit": "3",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM035",
                    "name": "IT a járműgyártásban",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_AUTM001",
                    "name": "Automatikai építőelemek",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_MSTM031",
                    "name": "Komponens alapú programozás",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_INTM013",
                    "name": "Üzleti célú rendszerek",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_TATM036",
                    "name": "Hang-és képtechnika alapjai",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                }
            ],
            total: 51
        },
        "optional": {
            data: [
                {
                    "code": "AKNB_BHTM164",
                    "name": "Értékek és kihívások",
                    "credit": "3",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "KGNB_VKTM018",
                    "name": "Bevezetés az innováció- és kutatáskommunikációba I.",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_FKTM033",
                    "name": "Műszaki kémiai laboratóriumi gyakorlatok",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_FKTM030",
                    "name": "Bevezetés a nukleáris technikába",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_FKTM027",
                    "name": "Diagnosztikai képalkotó eljárások",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "KGNB_NOKM022",
                    "name": "Exchange Course 2.",
                    "credit": "3",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "EKNB_KETM029",
                    "name": "CAD alkalmazások 1.",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "DKNB_KATM031",
                    "name": "Üzleti jog és iparjogvédelem",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "AKNB_TTTM202",
                    "name": "Mérnöki képességfejlesztés",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_FKTM029",
                    "name": "Fizikai alapmérések",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "KGNB_MMTM041",
                    "name": "Munkaerőpiaci ismeretek",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "EKNB_KETM032",
                    "name": "Térinformatika",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "KGNB_VKTM019",
                    "name": "Bevezetés az innováció- és kutatáskommunikációba II.",
                    "credit": "5",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "KGNB_VKTM017",
                    "name": "Startup vállalkozás I.",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "AKNB_SSTM197",
                    "name": "Színházi alkotás és előadástechnika",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_FKTM024",
                    "name": "Komplex energetikai rendszerek",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "KGNB_MMTM085",
                    "name": "Termelésmenedzsment",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_FKTM026",
                    "name": "Tudomány népszerűsítés II.",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "AKNB_SSTM186",
                    "name": "Önkéntes segítő gyakorlat",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_FKTM036",
                    "name": "Honvédelmi alapismeretek",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_FKTM034",
                    "name": "Környezetkémiai alapismeretek",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_FKTM023",
                    "name": "Fizikatörténet",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "EKNB_KOTM110",
                    "name": "A vasút világa",
                    "credit": "3",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "GKNB_FKTM025",
                    "name": "Tudomány népszerűsítés I.",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "KGNB_VKTM024",
                    "name": "Startup vállalkozás II.",
                    "credit": "4",
                    "semester": "0",
                    "pre": "KGNB_VKTM017"
                },
                {
                    "code": "KGNB_NOKM023",
                    "name": "Exchange Course 3.",
                    "credit": "4",
                    "semester": "0",
                    "pre": ""
                }
            ],
            total: 10
        },
        "physics": {
            data: [
                {
                    "code": "TKNB_TSKM001",
                    "name": "Testnevelés / Úszás",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "TKNB_TSKM002",
                    "name": "Testnevelés / Erő",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "TKNB_TSKM004",
                    "name": "Testnevelés / Sportági ismeret",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                },
                {
                    "code": "TKNB_TSKM003",
                    "name": "Testnevelés / Állóképesség",
                    "credit": "2",
                    "semester": "0",
                    "pre": ""
                }
            ],
            total: 8
        }
    };
}
}
