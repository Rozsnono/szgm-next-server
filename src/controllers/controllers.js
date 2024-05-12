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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_model_1 = __importDefault(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const log_model_1 = __importDefault(require("../models/log.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const openai_1 = __importDefault(require("openai"));
const ai_model_1 = __importDefault(require("../models/ai.model"));
class UserController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.user = user_model_1.default;
        this.log = log_model_1.default;
        this.message = message_model_1.default;
        this.ai = ai_model_1.default;
        this.getAiMessages = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.ai.find({ user_id: req.query.user_id }).sort({ date: -1 });
                if (data.length > 0) {
                    res.send(data);
                }
                else {
                    res.status(404).send({ message: `Felhasználó nem található!` });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.newAiMessage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const createdDocument = new this.ai({
                    user_id: req.body.user_id,
                    messages: [],
                    date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })
                });
                createdDocument["_id"] = new mongoose_1.default.Types.ObjectId();
                const savedDocument = yield createdDocument.save();
                res.status(200).send({ message: "OK", id: savedDocument._id });
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getAiMessageById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.ai.findById(req.query.id);
                if (data) {
                    res.send(data);
                }
                else {
                    res.status(404).send({ message: `Felhasználó nem található!` });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.aiMessage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const message = req.body.message;
            const id = req.body.id;
            if (message) {
                const openai = new openai_1.default({ apiKey: "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" });
                const completion = yield openai.chat.completions.create({
                    messages: [{ role: "system", content: message }],
                    model: "gpt-3.5-turbo",
                });
                const data = yield this.ai.findById(id);
                if (data) {
                    data.messages.push({ role: "user", message: message });
                    data.messages.push({ role: "ai", message: completion.choices[0].message.content });
                    const body = {
                        user_id: req.body.user_id,
                        messages: data.messages,
                        date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })
                    };
                    const modificationResult = yield this.ai.replaceOne({ _id: id }, body, { runValidators: true });
                    if (modificationResult.modifiedCount) {
                        res.send({ message: completion.choices[0].message.content });
                    }
                }
                else {
                    const createdDocument = new this.ai({
                        user_id: req.body.user_id,
                        messages: [{ role: "user", message: message }, { role: "ai", message: completion.choices[0].message.content }],
                        date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })
                    });
                    createdDocument["_id"] = new mongoose_1.default.Types.ObjectId();
                    const savedDocument = yield createdDocument.save();
                    res.send({ message: completion.choices[0].message.content });
                }
            }
            res.status(400).send({ message: "Nincs üzenet!" });
        });
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const createdDocument = new this.user(Object.assign({}, body));
                createdDocument["_id"] = new mongoose_1.default.Types.ObjectId();
                const savedDocument = yield createdDocument.save();
                res.send({ new: savedDocument, message: "OK" });
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const username = req.query.user;
                const password = req.query.password;
                const ip = req.query.ip;
                const data = yield this.user.find({ "$and": [{ user: username }, { password: password }] });
                const logs = yield this.log.find().sort({ date: -1 });
                if (data.length > 0 && data[0].isDeleted == false) {
                    if (logs[0] && !logs[0].log.includes(username) && !logs[0].log.includes(ip)) {
                        const body = { log: `${username} user loged in!`, ip: ip, date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" }) };
                        const createdDocument = new this.log(Object.assign({}, body));
                        createdDocument["_id"] = new mongoose_1.default.Types.ObjectId();
                        const savedDocument = yield createdDocument.save();
                    }
                    res.send(data);
                }
                else {
                    if (logs[0] && !logs[0].log.includes(username) && !logs[0].log.includes(ip)) {
                        const body = { log: `${username} user tried to log in!`, ip: ip, date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" }) };
                        const createdDocument = new this.log(Object.assign({}, body));
                        createdDocument["_id"] = new mongoose_1.default.Types.ObjectId();
                        const savedDocument = yield createdDocument.save();
                    }
                    res.status(404).send({ message: `Felhasználó a(z) ${username} névvel nem található!` });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.user.find().sort({ role: 1 });
                if (data.length > 0) {
                    res.send(data);
                }
                else {
                    res.status(404).send({ message: `Felhasználó nem található!` });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getAllLogs = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.log.find().sort({ date: -1 });
                if (data) {
                    res.send(data);
                }
                else {
                    res.status(404).send({ message: `Nincs log!` });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getSubjects = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const url = req.query.url;
                yield fetch("https://sze.vortexcode.com/ajaxfuggoseg/" + url).then(res => res.json()).then(data => {
                    if (data) {
                        res.send(data);
                    }
                    else {
                        res.status(404).send({ message: `Nincs data!` });
                    }
                });
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getSubjectsData = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield fetch("https://sze.vortexcode.com/list.json").then(res => res.json()).then(data => {
                    if (data) {
                        res.send(data);
                    }
                    else {
                        res.status(404).send({ message: `Nincs data!` });
                    }
                });
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.put = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const body = req.body;
                const modificationResult = yield this.user.replaceOne({ _id: id }, body, { runValidators: true });
                if (modificationResult.modifiedCount) {
                    const updatedDoc = yield this.user.findById(id);
                    res.send({ new: updatedDoc, message: `OK` });
                }
                else {
                    res.status(404).send({ message: `Felhasználó a(z) ${id} azonosítóval nem található!` });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.delete = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const ban = req.params.ban == "true" ? true : false;
                const updatedDoc = yield this.user.findById(id);
                const body = updatedDoc;
                if (body && body.role != 1) {
                    body.isDeleted = ban;
                    const modificationResult = yield this.user.replaceOne({ _id: id }, body, { runValidators: true });
                    if (modificationResult.modifiedCount) {
                        res.send({ message: `OK` });
                    }
                    else {
                        res.status(404).send({ message: `Felhasználó a(z) ${id} azonosítóval nem található!` });
                    }
                }
                else {
                    res.status(404).send({ message: `Felhasználó a(z) ${id} azonosítóval nem található!` });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.createMessage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.body);
                const body = req.body;
                const createdDocument = new this.message(Object.assign({}, body));
                createdDocument["_id"] = new mongoose_1.default.Types.ObjectId();
                const savedDocument = yield createdDocument.save();
                res.send({ new: savedDocument, message: "OK" });
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getMessages = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.message.find();
                const newData = data.filter((message) => message.participants.filter((participant) => participant._id == req.query.user).length > 0).map((message) => { return { _id: message._id, participants: message.participants, lastMessage: message.messages[message.messages.length - 1] }; });
                if (newData) {
                    res.send(newData);
                }
                else {
                    res.status(404).send({ message: `Nincs üzenet!` });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getMessagesByUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("asd");
                const id = req.params.user;
                const data = yield this.message.findById(req.query.id);
                if (data) {
                    res.send(data);
                }
                else {
                    res.status(404).send({ message: `Nincs üzenet!` });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.getMessagesById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("asd");
                const id = req.params.id;
                const data = yield this.message.findById(id);
                if (data) {
                    res.send(data);
                }
                else {
                    res.status(404).send({ message: `Nincs üzenet!` });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.putMessage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                try {
                    const id = req.params.id;
                    const body = req.body;
                    const data = yield this.message.findById(id);
                    let newBody = {};
                    if (data) {
                        data.messages.push({ _id: new mongoose_1.default.Types.ObjectId(), by: body.by, message: body.message, date: new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" }), reaction: [] });
                        newBody = { messages: data.messages, participants: data.participants };
                    }
                    const modificationResult = yield this.message.replaceOne({ _id: id }, newBody, { runValidators: true });
                    if (modificationResult.modifiedCount) {
                        res.send({ message: `OK` });
                    }
                    else {
                        res.status(404).send({ message: `Felhasználó a(z) ${id} azonosítóval nem található!` });
                    }
                }
                catch (error) {
                    res.status(400).send({ message: error.message });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
        this.reactionMessage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                try {
                    const id = req.params.id;
                    const body = req.body;
                    const data = yield this.message.findById(id);
                    let newBody = {};
                    if (data) {
                        const tmp = data.messages.filter((message) => message._id == body._id)[0];
                        const index = data.messages.indexOf(tmp);
                        if (index != -1) {
                            data.messages[index].reaction.unshift(body.reaction);
                            data.messages[index].reaction = data.messages[index].reaction.slice(0, 3);
                        }
                        else {
                            res.status(404).send({ message: `NINCS ILYEN ${body._id}` });
                        }
                        newBody = { messages: data.messages, participants: data.participants };
                    }
                    const modificationResult = yield this.message.replaceOne({ _id: id }, newBody, { runValidators: true });
                    if (modificationResult.modifiedCount) {
                        res.send({ message: `OK` });
                    }
                    else {
                        res.status(404).send({ message: `Felhasználó a(z) ${id} azonosítóval nem található!` });
                    }
                }
                catch (error) {
                    res.status(400).send({ message: error.message });
                }
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
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
}
exports.default = UserController;
