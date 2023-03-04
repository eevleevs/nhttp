var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);
var serve_static_exports = {};
__export(serve_static_exports, {
  sendFile: () => sendFile,
  serveStatic: () => serveStatic
});
var import_etag = require("./etag");
const sendFile = import_etag.sendFile;
function serveStatic(dir, opts = {}) {
  opts.index ??= "index.html";
  opts.redirect ??= true;
  return async (rev, next) => {
    try {
      const index = opts.redirect ? opts.index : "";
      let pathFile = dir + rev.path;
      if (opts.prefix) {
        if (opts.prefix[0] !== "/")
          opts.prefix = "/" + opts.prefix;
        if (!rev.url.startsWith(opts.prefix))
          return next();
        pathFile = pathFile.replace(opts.prefix, "");
      }
      if (pathFile.endsWith("/"))
        pathFile += index;
      return await sendFile(rev, pathFile, opts);
    } catch {
      return next();
    }
  };
}
module.exports = __toCommonJS(serve_static_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendFile,
  serveStatic
});