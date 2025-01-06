import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import { ErrorMiddleware } from "./middlewares/error-middleware";

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
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(ErrorMiddleware.handleError);
    // Error Handling Middleware
  }
  private async initializeServices() {
    //db connection
  }
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`CART-SERVICE RUNNING ON PORT ${this.port}`);
    });
  }
}
export default App;
