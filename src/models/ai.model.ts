
import { Schema, model } from "mongoose";

const aiSchema = new Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            readonly: true
        },
        date: {
            type: Date,
            required: true,
            readonly: true
        },
        user_id: {
            type: String,
            required: true
        },
        messages: {
            type: Array,
        },
    },
    { versionKey: false },
);

const AImodel = model("ai", aiSchema, "AI");


export default AImodel;