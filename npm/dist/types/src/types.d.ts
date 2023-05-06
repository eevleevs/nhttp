import { RequestEvent } from "./request_event";
import Router from "./router";
export type Merge<A, B> = {
    [K in keyof (A & B)]: (K extends keyof B ? B[K] : (K extends keyof A ? A[K] : never));
};
export type TRet = any;
export type EObject = {};
export type TObject = {
    [k: string]: TRet;
};
export type TSendBody = string | Response | ReadableStream | Blob | TObject | null | number;
export type NextFunction = (err?: Error) => Promise<Response>;
export type RetHandler = Promise<void | string | TObject> | void | string | TObject;
export type Handler<T = EObject, Rev extends RequestEvent = RequestEvent> = (rev: Merge<Rev, T>, next: NextFunction, ...args: TRet) => RetHandler;
export type Handlers<T = EObject, Rev extends RequestEvent = RequestEvent> = Array<Handler<T, Rev> | Handler<T, Rev>[]>;
export type TValidBody = number | string | false | undefined;
export type TBodyParser = {
    json?: TValidBody;
    urlencoded?: TValidBody;
    raw?: TValidBody;
    multipart?: TValidBody;
};
export type TSizeList = {
    b: number;
    kb: number;
    mb: number;
    gb: number;
    tb: number;
    pb: number;
    [key: string]: unknown;
};
export type Cookie = {
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
    other?: string[];
    encode?: boolean;
};
export type TQueryFunc = TRet;
export type TApp = {
    /**
     * custom parseQuery
     * @example
     * // example using qs lib.
     * const app = nhttp({
     *   parseQuery: qs.parse
     * })
     */
    parseQuery?: TQueryFunc;
    /**
     * custom bodyLimit or disable bodyParser. default to `3mb`/content-type.
     * @deprecated
     * Use bodyParser instead.
     * @example
     * const app = nhttp({
     *   bodyParser: {
     *      // disable json body
     *      json: false,
     *      // custom limit for urlencoded
     *      urlencoded: "1mb"
     *   }
     * })
     */
    bodyLimit?: TBodyParser;
    /**
     * bodyParser.
     * @example
     * const app = nhttp({ bodyParser: true });
     *
     * // or
     * const app = nhttp({
     *   bodyParser: {
     *      // disable json body
     *      json: false,
     *      // custom limit for urlencoded
     *      urlencoded: "1mb"
     *   }
     * })
     */
    bodyParser?: TBodyParser | boolean;
    /**
     * env default to dev.
     * @example
     * const app = nhttp({
     *   env: "production"
     * })
     */
    env?: string;
    /**
     * flash server for `Deno.serve`. default to false.
     * @example
     * const app = nhttp({
     *   flash: true
     * })
     */
    flash?: boolean;
    /**
     * stackError. send error stacks in response for default error handling. default to true.
     * @example
     * const app = nhttp({
     *    // disable stackError
     *    stackError: false
     * })
     */
    stackError?: boolean;
};
export type FetchEvent = TRet;
export type RouterOrWare<T extends unknown = unknown, Rev extends RequestEvent = RequestEvent> = Handler<T, Rev> | Handler<T, Rev>[] | Router<Rev> | Router<Rev>[] | TObject | TObject[];
export type FetchHandler = (request: Request, ...args: TRet) => Response | Promise<Response>;
export type ListenOptions = {
    port: number;
    fetch?: FetchHandler;
    hostname?: string;
    key?: string;
    cert?: string;
    keyFile?: string;
    certFile?: string;
    transport?: "tcp";
    alpnProtocols?: string[];
    handler?: FetchHandler;
    signal?: AbortSignal;
    [k: string]: TRet;
};
export type EngineOptions = {
    /**
     * Extension
     */
    ext?: string;
    /**
     * Base folder views engine
     */
    base?: string;
};
export type MatchRoute = {
    method: string;
    params: TObject;
    path: string | RegExp;
    pathname: string;
    query: TObject;
    pattern: RegExp;
    wild: boolean;
};