
import { Schema, model } from "mongoose";

const messageSchema = new Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            readonly: true
        },
        participants: {
            type: Array<{id: Schema.Types.ObjectId, name: string}>,
            required: true
        },
        messages: {
            type: Array<{by: Schema.Types.ObjectId, message: string}>,
            required:true
        }
    },
    { versionKey: false },
);

const MessageModel = model("message", messageSchema, "Message");


export default MessageModel;