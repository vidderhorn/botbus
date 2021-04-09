import { Bus } from "@botbus/bus";
import { v4 as uuid } from "uuid";

const TIME_LIMIT = 15 * 1000;

export module Rpc {
  export interface Request<Req> {
    id: string;
    arg: Req;
  }

  export type Response<Res> = Success<Res> | Problem;

  export interface Success<T> {
    id: string;
    success: true;
    value: T;
  }

  export interface Problem {
    id: string;
    success: false;
    message: string;
  }

  export function request<Req, Res>(protocol: string, signal: string, arg: Req, timeLimit = TIME_LIMIT): Promise<Res> {
    const id = uuid();
    return new Promise((resolve, reject) => {
      let timeout = setTimeout(timedOut, timeLimit);
      function timedOut() {
        dispose();
        reject(new Error(`request.${protocol}: response time limit exceeded`));
      }
      const dispose = Bus.receive<Response<Res>>("respond", signal, protocol, (m) => {
        if (m.id !== id) return;
        clearTimeout(timeout);
        dispose();
        if (!m.success) return reject(new Error(m.message));
        resolve(m.value);
      });
      Bus.send<Request<Req>>("request", signal, protocol, { id, arg });
    });
  }

  export type Method<Req, Res> = (arg: Req) => Res | Promise<Res>;

  export function respond<Req, Res>(protocol: string, signal: string, method: Method<Req, Res>) {
    return Bus.receive<Request<Req>>("request", signal, protocol, async ({ id, arg }) => {
      try {
        const value = await Promise.resolve(method(arg));
        Bus.send<Response<Res>>("respond", signal, protocol, {
          id, success: true, value
        });
      }
      catch (e) {
        console.log(e);
        Bus.send("respond", signal, protocol, {
          success: false, message: e.toString()
        });
      }
    });
  }
}

export default Rpc;
