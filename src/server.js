"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const controllers_1 = __importDefault(require("./controllers/controllers"));
const neptun_controller_1 = __importDefault(require("./controllers/neptun.controller"));
new app_1.default([new controllers_1.default(), new neptun_controller_1.default()]);
