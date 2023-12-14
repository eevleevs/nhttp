import { Helmet } from "./helmet.js";
import {
  dangerHTML,
  n,
  RequestEventContext
} from "./index.js";
import { isValidElement } from "./is-valid-element.js";
const sus = {
  i: 0,
  arr: []
};
const options = {
  onRenderHtml: (html) => html,
  onRenderElement: renderToString,
  onRenderStream: (stream) => stream,
  useHook: true
};
const voidTags = Object.assign(/* @__PURE__ */ Object.create(null), {
  area: true,
  base: true,
  br: true,
  col: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
});
const isArray = Array.isArray;
const mutateAttr = {
  acceptCharset: "accept-charset",
  httpEquiv: "http-equiv",
  htmlFor: "for",
  className: "class"
};
const toAttr = (props) => {
  let attr = "";
  for (const k in props) {
    let val = props[k];
    if (val == null || val === false || k === dangerHTML || k === "children" || typeof val === "function") {
      continue;
    }
    const key = mutateAttr[k] ?? k.toLowerCase();
    if (val === true) {
      attr += ` ${key}`;
    } else {
      if (key === "style" && typeof val === "object")
        val = toStyle(val);
      attr += ` ${key}="${escapeHtml(String(val))}"`;
    }
  }
  return attr;
};
async function writeHtml(body, write) {
  const writeElem = async (elem) => {
    if (elem.length) {
      for (let i = 0; i < elem.length; i++) {
        write(await renderToString(elem[i]));
      }
    }
  };
  write(options.docType ?? "<!DOCTYPE html>");
  const { footer, attr, head } = Helmet.rewind();
  write(`<html${toAttr({ lang: "en", ...attr.html })}>`);
  write(`<head><meta charset="utf-8">`);
  write(
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
  );
  await writeElem(head);
  write(`</head><body${toAttr(attr.body)}>`);
  write(body);
  if (sus.i) {
    for (let i = 0; i < sus.i; i++) {
      const elem = sus.arr[i];
      write(`<template id="__t__:${i}">`);
      write(await renderToString(elem));
      write(`</template>`);
      write(
        `<script>(function(){function $(s){return document.getElementById(s)};var t=$("__t__:${i}");var r=$("__s__:${i}");(r.replaceWith||r.replaceNode).bind(r)(t.content);t.remove();})();</script>`
      );
    }
    await writeElem(Helmet.rewind().footer);
    sus.i = 0;
    sus.arr = [];
  } else {
    await writeElem(footer);
  }
  write("</body></html>");
}
const REG_HTML = /["'&<>]/;
function escapeHtml(str, force) {
  return options.precompile && !force || !REG_HTML.test(str) ? str : (() => {
    let esc = "", i = 0, l = 0, html = "";
    for (; i < str.length; i++) {
      switch (str.charCodeAt(i)) {
        case 34:
          esc = "&quot;";
          break;
        case 38:
          esc = "&amp;";
          break;
        case 39:
          esc = "&#39;";
          break;
        case 60:
          esc = "&lt;";
          break;
        case 62:
          esc = "&gt;";
          break;
        default:
          continue;
      }
      if (i !== l)
        html += str.substring(l, i);
      html += esc;
      l = i + 1;
    }
    if (i !== l)
      html += str.substring(l, i);
    return html;
  })();
}
function kebab(camelCase) {
  return camelCase.replace(/[A-Z]/g, "-$&").toLowerCase();
}
const toStyle = (val) => {
  return Object.keys(val).reduce(
    (a, b) => a + kebab(b) + ":" + (typeof val[b] === "number" ? val[b] + "px" : val[b]) + ";",
    ""
  );
};
async function renderToString(elem) {
  if (elem instanceof Promise)
    return renderToString(await elem);
  if (elem == null || typeof elem === "boolean")
    return "";
  if (typeof elem === "number")
    return String(elem);
  if (typeof elem === "string")
    return escapeHtml(elem);
  if (isArray(elem)) {
    let str = "", i = 0;
    const len = elem.length;
    while (i < len) {
      str += await renderToString(elem[i]);
      i++;
    }
    return str;
  }
  const { type, props } = elem;
  if (typeof type === "function") {
    return renderToString(await type(props ?? {}));
  }
  const attributes = toAttr(props);
  if (type in voidTags)
    return `<${type}${attributes}>`;
  if (props?.[dangerHTML] != null) {
    return `<${type}${attributes}>${props[dangerHTML].__html}</${type}>`;
  }
  return `<${type}${attributes}>${await renderToString(
    props?.["children"]
  )}</${type}>`;
}
const renderToHtml = async (elem, rev) => {
  if (options.useHook) {
    elem = RequestEventContext({ rev, children: elem });
  }
  const body = await options.onRenderElement(elem, rev);
  let html = "";
  await writeHtml(body, (s) => html += s);
  return await options.onRenderHtml(html, rev);
};
const encoder = new TextEncoder();
const renderToReadableStream = async (elem, rev) => {
  const stream = await options.onRenderStream(
    new ReadableStream({
      async start(ctrl) {
        const writeStream = async (child) => {
          const elem2 = options.useHook ? RequestEventContext({
            rev,
            children: child
          }) : child;
          const body = await options.onRenderElement(elem2, rev);
          await writeHtml(
            body,
            (str) => ctrl.enqueue(encoder.encode(str))
          );
        };
        try {
          await writeStream(elem);
        } catch (error) {
          if (options.onErrorStream) {
            await writeStream(
              await options.onErrorStream({ error })
            );
          } else {
            ctrl.enqueue(encoder.encode(error));
          }
        }
        ctrl.close();
      }
    }),
    rev
  );
  return stream;
};
renderToHtml.check = isValidElement;
renderToReadableStream.check = isValidElement;
const Suspense = (props) => {
  const i = sus.i;
  const id = `__s__:${i}`;
  sus.arr[i] = props.children;
  sus.i++;
  return n(
    "div",
    { id },
    typeof props.fallback === "function" ? props.fallback({}) : props.fallback
  );
};
export {
  Suspense,
  escapeHtml,
  isValidElement,
  mutateAttr,
  options,
  renderToHtml,
  renderToReadableStream,
  renderToString,
  toStyle,
  writeHtml
};
