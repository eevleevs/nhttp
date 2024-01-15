import { Handler, RequestEvent, TRet } from "./deps";
export interface TOptsSendFile {
    weak?: boolean;
    stat?: (...args: TRet) => TRet;
    readFile?: (...args: TRet) => TRet;
    etag?: boolean;
    setHeaders?: (rev: RequestEvent, pathFile: string, stat: TRet) => void;
}
export declare function getContentType(path: string): string;
export declare function sendFile(rev: RequestEvent, pathFile: string, opts?: TOptsSendFile): Promise<any>;
export type EtagOptions = {
    weak?: boolean;
};
/**
 * Etag middleware.
 * @example
 * app.use(etag());
 */
export declare const etag: (opts?: EtagOptions) => Handler;
export default etag;
