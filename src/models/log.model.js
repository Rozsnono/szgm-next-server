"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const logSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.Schema.Types.ObjectId,
        readonly: true
    },
    log: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    }
}, { versionKey: false });
const logModel = (0, mongoose_1.model)("log", logSchema, "Log");
exports.default = logModel;
