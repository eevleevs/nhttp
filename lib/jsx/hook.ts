import {
  type HttpResponse,
  type NHttp,
  type RequestEvent,
  type TObject,
  type TRet,
} from "../deps.ts";
import {
  type EObject,
  type FC,
  Helmet,
  type JSXElement,
  type JSXProps,
  n,
  type NJSX,
  toStyle,
} from "./index.ts";

const now = Date.now();
type TValue = string | number | TRet;
type TContext = {
  Provider: (props: JSXProps<{ value?: TValue }>) => JSXElement | null;
  i: number;
};
const hook = {
  ctx_i: 0,
  ctx: [] as TValue,
  js_i: 0,
  id: 0,
};
/**
 * createContext.
 * @example
 * ```tsx
 * const MyContext = createContext();
 *
 * app.get("/", () => {
 *   return (
 *     <MyContext.Provider value="foo">
 *       // element
 *     </MyContext.Provider>
 *   )
 * })
 * ```
 */
export function createContext<T extends unknown = unknown>(
  initValue?: T,
): TContext {
  const i = hook.ctx_i++;
  return {
    Provider({ value, children }) {
      hook.ctx[i] = value !== void 0 ? value : initValue;
      return children as JSXElement;
    },
    i,
  };
}
/**
 * useContext.
 * @example
 * ```tsx
 * const FooContext = createContext();
 *
 * const Home: FC = () => {
 *   const foo = useContext(FooContext);
 *   return <h1>{foo}</h1>
 * }
 *
 * app.get("/", () => {
 *   return (
 *     <FooContext.Provider value="foo">
 *       <Home/>
 *     </FooContext.Provider>
 *   )
 * })
 * ```
 */
export function useContext<T extends unknown = unknown>(context: TContext): T {
  return hook.ctx[context.i];
}

const RevContext = createContext();
export const RequestEventContext: FC<{ rev: RequestEvent }> = (props) => {
  const elem = RevContext.Provider({
    value: props.rev,
    children: props.children,
  });
  hook.js_i = 0;
  hook.id = 0;
  return elem;
};
/**
 * useRequestEvent. server-side only.
 * @example
 * ```tsx
 * const Home: FC = () => {
 *   const rev = useRequestEvent();
 *   return <h1>{rev.url}</h1>
 * }
 * ```
 */
export const useRequestEvent = <T extends EObject = EObject>(): RequestEvent<
  T
> => useContext(RevContext);
/**
 * useParams. server-side only.
 * @example
 * ```tsx
 * const User: FC = () => {
 *   const params = useParams<{ name: string }>();
 *   return <h1>{params.name}</h1>
 * }
 * ```
 */
export const useParams = <T = TObject>(): T => useRequestEvent()?.params as T;
/**
 * useQuery. server-side only.
 * @example
 * ```tsx
 * const User: FC = () => {
 *   const query = useQuery<{ name: string }>();
 *   return <h1>{query.name}</h1>
 * }
 * ```
 */
export const useQuery = <T = TObject>(): T => useRequestEvent()?.query as T;
/**
 * useBody. server-side only.
 * @example
 * ```tsx
 * const User: FC = async () => {
 *   const user = useBody<{ name: string }>();
 *   // example save user to db.
 *   await user_db.save(user);
 *   return <h1>{user.name}</h1>
 * }
 * ```
 */
export const useBody = <T = TObject>(): T => useRequestEvent()?.body as T;
/**
 * useResponse. server-side only.
 * @example
 * ```tsx
 * const User: FC = () => {
 *   const res = useResponse();
 *   res.setHeader("name", "john");
 *   return <h1>hello</h1>
 * }
 * ```
 */
export const useResponse = (): HttpResponse => useRequestEvent()?.response;
export const useRequest = (): Request => useRequestEvent()?.request;

interface AttrScript extends NJSX.ScriptHTMLAttributes {
  /**
   * position. default to `footer`
   */
  position?: "head" | "footer";
  /**
   * inline script. default to `false`
   */
  inline?: boolean;
  /**
   * write script to Helmet. default to `true`
   */
  writeToHelmet?: boolean;
}
type OutScript = { path?: string; source?: string };
const cst = {} as Record<string, string | boolean>;
/**
 * useScript. simple client-script from server-side.
 * @example
 * ```tsx
 * // without params
 * const User: FC = () => {
 *
 *   useScript(() => {
 *      const title = document.getElementById("title") as HTMLElement;
 *      title.innerText = "bar";
 *   });
 *
 *   return <h1 id="title">foo</h1>
 * }
 *
 * // with params
 * const Home: FC = async () => {
 *   const state = {
 *      data: await db.getAll();
 *   }
 *
 *   useScript(state, (state) => {
 *      const title = document.getElementById("title") as HTMLElement;
 *      title.innerText = "bar";
 *      console.log("data from server =>", state.data);
 *   });
 *
 *   return <h1 id="title">foo</h1>
 * }
 * ```
 */
export function useScript<T>(
  params: T,
  js_string: string,
  options?: AttrScript,
): OutScript;
export function useScript<T>(
  params: T,
  fn: (params: T) => void | Promise<void>,
  options?: AttrScript,
): OutScript;
export function useScript<T>(
  fn: (params: T) => void | Promise<void>,
  params?: T,
  options?: AttrScript,
): OutScript;
export function useScript<T>(
  js_string: string,
  params?: T,
  options?: AttrScript,
): OutScript;
export function useScript<T>(
  fn: ((params: T) => void | Promise<void>) | string | T,
  params?: T | ((params: T) => void | Promise<void>) | string,
  options: AttrScript = {},
) {
  const rev = useRequestEvent();
  if (rev !== void 0) {
    let js_string = "";
    if (typeof fn === "string") {
      js_string = fn;
    } else if (typeof fn === "function") {
      js_string = fn.toString();
    } else {
      return useScript(params as TRet, fn, options);
    }
    const i = hook.js_i;
    const app = rev.__app() as NHttp;
    const id = `${now}${i}`;
    const path = `/__JS__/${id}.js`;
    hook.js_i--;
    const inline = options.inline;
    const toScript = () => {
      const src = `(${js_string})`;
      const arr = src.split(/\n/);
      return arr.map((str) =>
        str.includes("//") || str.includes("*")
          ? `\n${str}\n`
          : str.replace(/\s\s+/g, " ")
      ).join("");
    };
    if (cst[path] === void 0 && !inline) {
      cst[path] = true;
      app.get(`${path}`, ({ response }) => {
        response.type("js");
        response.setHeader(
          "cache-control",
          "public, max-age=31536000, immutable",
        );
        return ((cst[path + "_sc"] as string) ??= toScript()) +
          `(window.__INIT_${id});`;
      });
    }
    const isWrite = options.writeToHelmet ?? true;
    const pos = options.position === "head" ? "writeHeadTag" : "writeFooterTag";
    options.position = void 0;
    options.inline = void 0;
    options.type ??= "application/javascript";
    const last = Helmet[pos]?.() ?? [];
    const out = {} as OutScript;
    const init = params !== void 0
      ? n("script", {
        dangerouslySetInnerHTML: {
          __html: `window.__INIT_${id}=${JSON.stringify(params)}`,
        },
      })
      : void 0;
    if (inline) {
      out.source = toScript();
      if (isWrite) {
        Helmet[pos] = () =>
          [
            ...last,
            init as JSXElement<EObject>,
            n("script", {
              ...options,
              dangerouslySetInnerHTML: {
                __html: out.source as string,
              },
            }),
          ].filter(Boolean);
      }
    } else {
      options.src = path;
      if (isWrite) {
        Helmet[pos] = () =>
          [...last, init as JSXElement<EObject>, n("script", options)].filter(
            Boolean,
          );
        out.path = path;
      }
    }
    return out;
  }
  return {};
}

const cssToString = (css: Record<string, NJSX.CSSProperties>) => {
  let str = "";
  for (const k in css) {
    str += `${k}{${toStyle(css[k])}}`;
  }
  return str;
};
/**
 * useStyle. server-side only.
 * @example
 * ```tsx
 * const Home: FC = () => {
 *   useStyle({
 *     ".section": {
 *       backgroundColor: "red"
 *     },
 *     ".title": {
 *       color: "blue"
 *     }
 *   });
 *   return (
 *     <section className="section">
 *       <h1 className="title">title</h1>
 *     </section>
 *   )
 * }
 * ```
 */
export function useStyle(css: Record<string, NJSX.CSSProperties> | string) {
  const str = typeof css === "string" ? css : cssToString(css);
  const last = Helmet.writeHeadTag?.() ?? [];
  Helmet.writeHeadTag = () => [
    ...last,
    n("style", { type: "text/css", dangerouslySetInnerHTML: { __html: str } }),
  ];
}
/**
 * generate unique ID.
 */
export const useId = () => `:${hook.id--}`;
