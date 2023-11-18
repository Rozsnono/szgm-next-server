
import { Schema, model } from "mongoose";

const messageSchema = new Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            readonly: true
        },
        participants: {
            type: Array,
            required: true
        },
        messages: {
            type: Array,
            required:true
        }
    },
    { versionKey: false },
);

const MessageModel = model("message", messageSchema, "Message");


export default MessageModel;