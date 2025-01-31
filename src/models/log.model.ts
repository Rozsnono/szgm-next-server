
import { Schema, model } from "mongoose";

const logSchema = new Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            readonly: true
        },
        log: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required:true
        },
        ip: {
            type: String,
            required: true
        }
    },
    { versionKey: false },
);

const logModel = model("log", logSchema, "Log");


export default logModel;