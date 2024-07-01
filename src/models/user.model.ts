
import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            readonly: true
        },
        user: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required:true
        },
        role: {
            type: Number,
            required: true
        },
        savedSubjects:{
            type: Array,
        },
        planedSubjects: {
            type: Array,
        },
        savedTematiks: {
            type: Object,
        },
        savedPlannedSubjects: {
            type: Array,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            readonly: true
        }
    },
    { versionKey: false },
);

const userModel = model("user", userSchema, "User");


export default userModel;