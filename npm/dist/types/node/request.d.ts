import { TRet } from "../index";
import { s_inspect } from "./symbol";
export declare class NodeRequest {
    raw?: TRet;
    reqClone?: Request;
    constructor(input: RequestInfo, init?: RequestInit);
    constructor(input: RequestInfo, init?: RequestInit, raw?: TRet);
    constructor(input: RequestInfo, init?: RequestInit, raw?: TRet, reqClone?: Request);
    private get rawBody();
    private get req();
    get cache(): RequestCache;
    get credentials(): RequestCredentials;
    get destination(): RequestDestination;
    get headers(): Headers;
    get integrity(): string;
    get keepalive(): boolean;
    get method(): any;
    get mode(): RequestMode;
    get redirect(): RequestRedirect;
    get referrer(): string;
    get referrerPolicy(): ReferrerPolicy;
    get signal(): AbortSignal;
    get url(): string;
    clone(): Request;
    get body(): ReadableStream<any>;
    get bodyUsed(): any;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    formData(): Promise<FormData>;
    json(): Promise<TRet>;
    text(): Promise<string>;
    get [Symbol.hasInstance](): string;
    [s_inspect](depth: number, opts: TRet, inspect: TRet): string;
    [k: string | symbol]: TRet;
}
