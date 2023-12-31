import type { TRet } from "../deps";
import type { NJSX } from "./types";
declare global {
    namespace JSX {
        type Element = JSXElement | Promise<JSXElement>;
        interface IntrinsicElements extends NJSX.IntrinsicElements {
            [k: string]: {
                children?: JSXNode;
                [k: string]: TRet;
            };
        }
        interface ElementChildrenAttribute {
            children: EObject;
        }
    }
}
export { escapeHtml, isValidElement, options, type RenderHTML, renderToHtml, renderToReadableStream, renderToString, Suspense, type TOptionsRender, toStyle, } from "./render";
export { Helmet, type HelmetRewind } from "./helmet";
export * from "./hook";
export * from "./types";
export * from "./htmx";
export type EObject = {};
type Merge<A, B> = {
    [K in keyof (A & B)]: (K extends keyof B ? B[K] : (K extends keyof A ? A[K] : never));
};
export type JSXProps<P = EObject> = Merge<{
    children?: JSXNode;
}, P>;
export type JSXNode<T = EObject> = JSXNode<T>[] | JSXElement<T> | Promise<JSXElement<T>> | string | number | boolean | null | undefined;
export declare const dangerHTML = "dangerouslySetInnerHTML";
export type JSXElement<T = EObject> = {
    type: string | FC<T>;
    props: T | null | undefined;
    key: number | string | null;
};
/**
 * Function Component (FC).
 * @example
 * const Home: FC<{ title: string; }> = (props) => {
 *   return <h1>{props.title}</h1>
 * }
 */
export type FC<T = EObject> = (props: JSXProps<T>) => TRet;
/**
 * Fragment.
 * @example
 * const Home: FC<{ title: string; }> = (props) => {
 *   return <Fragment><h1>{props.title}</h1></Fragment>
 * }
 */
export declare const Fragment: FC;
export declare function n(type: string, props?: NJSX.HTMLAttributes | null, ...children: JSXNode[]): JSXElement;
export declare function n<T = EObject>(type: FC<T>, props?: T | null, ...children: JSXNode[]): JSXElement | null;
export declare namespace n {
    var Fragment: FC<EObject>;
}
export { n as h };
/**
 * Client interactive.
 * @example
 * ```jsx
 * const Home = () => {
 *   return (
 *     <Client src="/assets/js/home.js">
 *       <h1 id="text">hey</h1>
 *     </Client>
 *   )
 * }
 * ```
 */
export declare const Client: FC<{
    src: string;
    footer?: boolean;
    id?: string;
    type?: string;
}>;
