"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const message_model_1 = __importDefault(require("./models/message.model"));
class App {
    constructor(controllers) {
        this.message = message_model_1.default;
        this.app = (0, express_1.default)();
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)());
        const server = http_1.default.createServer(this.app);
        this.connectToTheDatabase().then(() => {
            const port = process.env.PORT || 8000;
            server.listen(port, "0.0.0.0", function () {
                console.log('Server is running on port ' + port);
            });
        });
        // this.app.use(express.json());
        // const interval = this.keepAlive(wss)
        // wss.on("close", () => clearInterval(interval))
        controllers.forEach(controller => {
            this.app.use("/api", controller.router);
        });
    }
    connectToTheDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            mongoose_1.default.set("strictQuery", true);
            try {
                "y2odsBbjrlt3YHUb";
                yield mongoose_1.default.connect("mongodb+srv://admin:admin@szehelper.cslpsfr.mongodb.net/", { connectTimeoutMS: 10000 });
            }
            catch (error) {
                console.log({ message: error.message });
            }
        });
    }
}
exports.default = App;
