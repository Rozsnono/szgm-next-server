import App from "./app";

import UserController from "./controllers/controllers";
import NeptunController from "./controllers/neptun.controller";

new App([new UserController(), new NeptunController()]);  
