"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.Schema.Types.ObjectId,
        readonly: true
    },
    user: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        required: true
    },
    savedSubjects: {
        type: Array,
    },
    planedSubjects: {
        type: Array,
    },
    savedTematiks: {
        type: Object,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        readonly: true
    }
}, { versionKey: false });
const userModel = (0, mongoose_1.model)("user", userSchema, "User");
exports.default = userModel;
