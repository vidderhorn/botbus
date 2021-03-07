import { Rpc } from "@botbus/rpc";

export module Service {
  export function host<S>(protocol: string, service: S) {
    for (const methodName of Object.keys(service)) {
      Rpc.respond(protocol, methodName, (service as any)[methodName]);
    }
  }

  export function client<S>(protocol: string): S {
    return new Proxy({}, {
      get(obj, prop) {
        return (arg: any) => {
          return Rpc.request(protocol, prop.toString(), arg);
        };
      }
    }) as S;
  }
}

export default Service;
