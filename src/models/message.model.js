"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.Schema.Types.ObjectId,
        readonly: true
    },
    participants: {
        type: Array,
        required: true
    },
    messages: {
        type: Array,
        required: true
    }
}, { versionKey: false });
const MessageModel = (0, mongoose_1.model)("message", messageSchema, "Message");
exports.default = MessageModel;
