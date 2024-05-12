"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const aiSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.Schema.Types.ObjectId,
        readonly: true
    },
    date: {
        type: Date,
        readonly: true
    },
    user_id: {
        type: String,
        required: true
    },
    messages: {
        type: Array,
    },
}, { versionKey: false });
const AImodel = (0, mongoose_1.model)("ai", aiSchema, "AI");
exports.default = AImodel;
