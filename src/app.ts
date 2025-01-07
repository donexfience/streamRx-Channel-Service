import express, { Application } from "express";
import { ErrorMiddleware } from "./middlewares/error-middleware";
import morgan from "morgan";
import { Database } from "./config/MongoDB/connection";

class App {
  public app: Application;
  private port: number;
  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.initializeMiddleware();
    this.initializeServices();
  }
  private initializeMiddleware() {
    this.app.use(morgan("tiny"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(ErrorMiddleware.handleError);
  }
  private async initializeServices() {
    await Database.connect();
  }
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`CHANNEL-SERVICE RUNNING ON PORT  ${this.port}`);
    });
  }
}
export default App;
