"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class NeptunController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.logIn = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const resp = yield fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/Account/HasUserTokenRegistration?userLoginName=" + req.body.neptun);
                const data = yield resp.json();
                if (data.data === true) {
                    const resp2 = yield fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/Account/Authenticate", {
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
                    const data2 = yield resp2.json();
                    res.send(data2);
                }
                if (data) {
                    res.send(data);
                }
                else {
                    res.status(400).send({ message: "Nem létezik ilyen neptun kód" });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getTerms = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const resp = yield fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/Terms", {
                    headers: {
                        "Authorization": "" + req.headers.authorization
                    }
                });
                const data = yield resp.json();
                res.send(data);
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getSubjectType = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const resp = yield fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/SubjectTypes", {
                    headers: {
                        "Authorization": "" + req.headers.authorization
                    }
                });
                const data = yield resp.json();
                res.send(data);
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getCurrciculum = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { termId, subjectType } = req.query;
                const resp = yield fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/Curriculum?termId=" + termId + "&subjectType=" + subjectType, {
                    headers: {
                        "Authorization": "" + req.headers.authorization
                    }
                });
                const data = yield resp.json();
                res.send(data);
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getSubjectGroup = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { termId, subjectType, curriculumId } = req.query;
                const resp = yield fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/SubjectGroup?termId=" + termId + "&subjectType=" + subjectType + "&curriculumIds%5B0%5D=" + curriculumId, {
                    headers: {
                        "Authorization": "" + req.headers.authorization
                    }
                });
                const data = yield resp.json();
                res.send(data);
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getSubjects = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { termId, subjectType, curriculumTemplateId, subjectGroupId } = req.query;
                const link = `https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/SchedulableSubjects?filter.termId=${termId}&filter.subjectType=${subjectType}&filter.hasRegisteredSubjects=true&filter.hasScheduledSubjects=true&filter.curriculumTemplateId=${curriculumTemplateId}&filter.subjectGroupId=${subjectGroupId}&sort.firstRow=0&sort.lastRow=100&sort.title=asc`;
                const resp = yield fetch(link, {
                    headers: {
                        "Authorization": "" + req.headers.authorization
                    }
                });
                const data = yield resp.json();
                res.send(data);
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getSubjectCourses = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { subjectId, curriculumTemplateId, curriculumTemplateLineId, termId } = req.query;
                const queryString = "?" + "subjectId=" + subjectId + "&curriculumTemplateId=" + curriculumTemplateId + "&curriculumTemplateLineId=" + curriculumTemplateLineId + "&termId=" + termId;
                const link2 = "https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/GetSubjectsCourses?subjectId=98f72014-7f9b-459d-9373-97e45d7279c1&curriculumTemplateId=72d83061-7072-4ac1-8c44-ea7425659c08&curriculumTemplateLineId=5548fa3f-5001-4d74-b798-b60411f93ad4&termId=b476061d-3eb9-46e2-ba26-45273bc3701c";
                const link = `https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/GetSubjectsCourses${queryString}`;
                const resp = yield fetch(link, {
                    headers: {
                        "Authorization": "" + req.headers.authorization
                    }
                });
                const data = yield resp.json();
                res.send(data);
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.signIn = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const resp = yield fetch("https://neptun-hweb.sze.hu/hallgato_ng/api/SubjectApplication/SubjectSignin", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "" + req.headers.authorization
                    },
                    body: JSON.stringify(body)
                });
                const data = yield resp.json();
                res.send(data);
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
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
    }
}
exports.default = NeptunController;
