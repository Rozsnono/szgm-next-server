import { Request, Response, Router } from "express";
import Controller from "../interfaces/controller_interface";


export default class NeptunController implements Controller {
  public router = Router();

  constructor() {
    this.router.post("/neptun/login", (req, res, next) => {
      this.logIn(req, res).catch(next);
    });

    this.router.get("/neptun/terms", (req, res, next) => {
      this.getTerms(req, res).catch(next);
    });

    this.router.get("/neptun/subjectTypes", (req, res, next) => {
      this.getSubjectType(req, res).catch(next);
    });

    this.router.get("/neptun/curriculum", (req, res, next) => {
      this.getCurrciculum(req, res).catch(next);
    });

    this.router.get("/neptun/subjectGroup", (req, res, next) => {
      this.getSubjectGroup(req, res).catch(next);
    });

    this.router.get("/neptun/subjects", (req, res, next) => {
      this.getSubjects(req, res).catch(next);
    });

    this.router.get("/neptun/subjectCourses", (req, res, next) => {
      this.getSubjectCourses(req, res).catch(next);
    });

    this.router.post("/neptun/signin", (req, res, next) => {
      this.signIn(req, res).catch(next);
    });

    this.router.post("/neptun/logout", (req, res, next) => {
      this.logout(req, res).catch(next);
    });
  }


  private logIn = async (req: Request, res: Response) => {
    try {
      const resp = await fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/Account/HasUserTokenRegistration?userLoginName=" + req.body.neptun);
      const data = await resp.json();
      if (data.data === true) {
        const resp2 = await fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/Account/Authenticate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "userName": req.body.neptun,
            "password": req.body.password,
            "captcha": "",
            "captchaIdentifier": "",
            "token": req.body.code,
            "LCID": 1038
          })
        });

        const data2 = await resp2.json();
        const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
        res.send({...data2, ip: ip});

      }
      if (data) {
        res.send(data);
      } else {
        res.status(400).send({ message: "Nem létezik ilyen neptun kód" });
      }
    } catch (error: any | Error) {
      res.status(400).send({ message: error.message });
    }
  }

  private getTerms = async (req: Request, res: Response) => {
    try {
      const resp = await fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/Terms"
        ,
        {
          headers: {
            "Authorization": "" + req.headers.authorization
          }
        }
      );
      const data = await resp.json();
      res.send(data);
    } catch (error: any | Error) {
      res.status(400).send({ message: error.message });
    }
  }

  private getSubjectType = async (req: Request, res: Response) => {
    try {
      const resp = await fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/SubjectTypes"
        ,
        {
          headers: {
            "Authorization": "" + req.headers.authorization
          }
        }
      );
      const data = await resp.json();
      res.send(data);
    } catch (error: any | Error) {
      res.status(400).send({ message: error.message });
    }

  }

  private getCurrciculum = async (req: Request, res: Response) => {
    try {
      const { termId, subjectType } = req.query;
      const resp = await fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/Curriculum?termId=" + termId + "&subjectType=" + subjectType
        ,
        {
          headers: {
            "Authorization": "" + req.headers.authorization
          }
        }
      );
      const data = await resp.json();
      res.send(data);
    } catch (error: any | Error) {
      res.status(400).send({ message: error.message });
    }
  }

  private getSubjectGroup = async (req: Request, res: Response) => {
    try {
      const { termId, subjectType, curriculumId } = req.query;
      const resp = await fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/SubjectGroup?termId=" + termId + "&subjectType=" + subjectType + "&curriculumIds%5B0%5D=" + curriculumId
        ,
        {
          headers: {
            "Authorization": "" + req.headers.authorization
          }
        }
      );
      const data = await resp.json();
      res.send(data);
    } catch (error: any | Error) {
      res.status(400).send({ message: error.message });
    }
  }

  private getSubjects = async (req: Request, res: Response) => {
    try {
      const { termId, subjectType, curriculumTemplateId, subjectGroupId } = req.query;
      const link = `https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/SchedulableSubjects?filter.termId=${termId}&filter.subjectType=${subjectType}&filter.hasRegisteredSubjects=true&filter.hasScheduledSubjects=true&filter.curriculumTemplateId=${curriculumTemplateId}&filter.subjectGroupId=${subjectGroupId}&sort.firstRow=0&sort.lastRow=100&sort.title=asc`;
      const resp = await fetch(link
        ,
        {
          headers: {
            "Authorization": "" + req.headers.authorization
          }
        }
      );
      const data = await resp.json();
      res.send(data);
    } catch (error: any | Error) {
      res.status(400).send({ message: error.message });
    }
  }


  private getSubjectCourses = async (req: Request, res: Response) => {
    try {
      const { subjectId, curriculumTemplateId, curriculumTemplateLineId, termId } = req.query;
      const queryString = "?" + "subjectId=" + subjectId + "&curriculumTemplateId=" + curriculumTemplateId + "&curriculumTemplateLineId=" + curriculumTemplateLineId + "&termId=" + termId;
      const link2 = "https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/GetSubjectsCourses?subjectId=98f72014-7f9b-459d-9373-97e45d7279c1&curriculumTemplateId=72d83061-7072-4ac1-8c44-ea7425659c08&curriculumTemplateLineId=5548fa3f-5001-4d74-b798-b60411f93ad4&termId=b476061d-3eb9-46e2-ba26-45273bc3701c";
      const link = `https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/GetSubjectsCourses${queryString}`;
      const resp = await fetch(link
        ,
        {
          headers: {
            "Authorization": "" + req.headers.authorization
          }
        }
      );
      const data = await resp.json();
      res.send(data);
    } catch (error: any | Error) {
      res.status(400).send({ message: error.message });
    }
  }

  private signIn = async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const resp = await fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/SubjectSignin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "" + req.headers.authorization
        },
        body: JSON.stringify(body)
      });

      const data = await resp.json();
      res.send(data);

    } catch (error: any | Error) {
      res.status(400).send({ message: error.message });
    }
  }

  private logout = async (req: Request, res: Response) => {
    try {
      const resp = await fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/User/Logout", {
        method: "POST",
        headers: {
          "Authorization": "" + req.headers.authorization
        }
      });
      const data = await resp.json();
      res.send(data);
    } catch (error: any | Error) {
      res.status(400).send({ message: error.message });
    }
  }
}
