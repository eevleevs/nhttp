import { bodyParser } from "./body.ts";
import { assertEquals } from "./deps_test.ts";
import { nhttp } from "./nhttp.ts";
import { RequestEvent } from "./request_event.ts";
import { TRet } from "./types.ts";
const base = "http://127.0.0.1:8000";
type MyNext = (err?: Error) => TRet;
Deno.test("body parser", async (t) => {
  const request = (
    body: TRet,
    type?: string,
    method = "POST",
    customRaw?: boolean,
  ) => {
    const headers = type
      ? {
        headers: {
          "content-type": type,
        },
      }
      : {};
    const req = new Request(base, {
      method,
      ...headers,
      body,
    });
    if (customRaw) {
      (<TRet> req).raw = { req: { headers: { "content-type": type } } };
    }
    return req;
  };
  await t.step("content-type", async (t) => {
    const createBody = async (
      content: string | FormData,
      type?: string,
      opts?: TRet,
    ) => {
      const rev = new RequestEvent(request(content, type) as TRet);
      await bodyParser(opts)(
        rev,
        ((err?: Error) => err?.message || "noop") as MyNext,
      );
      return rev.body;
    };

    await t.step("content-type noop", async () => {
      const ret = await createBody(
        `{"name": "john"`,
        "application/noop",
      );
      assertEquals(ret, {});
    });
    await t.step("content-type json", async () => {
      const ret = await createBody(
        `{"name": "john"}`,
        "application/json; charset=utf-8",
      );
      assertEquals(ret, { "name": "john" });
      const ret2 = await createBody(
        `{"name": "john"}`,
        "application/json",
        { json: "1mb" },
      );
      assertEquals(ret2, { "name": "john" });
    });
    await t.step("content-type urlencoded", async () => {
      const ret = await createBody(
        `name=john`,
        "application/x-www-form-urlencoded",
      );
      assertEquals(ret, { "name": "john" });
    });
    await t.step("content-type multipart", async () => {
      const form = new FormData();
      form.set("name", "john");
      const ret = await createBody(form);
      assertEquals(ret, { "name": "john" });
    });
    await t.step("content-type multipart no request.formData", async () => {
      const form = new FormData();
      form.set("name", "john");
      const ret = await createBody(
        form,
        "multipart/form-data",
        true,
      );
      assertEquals(ret, {});
    });
    await t.step("content-type multipart error try/catch", async () => {
      const form = new FormData();
      form.set("name", "john");
      const ret = await createBody(
        form,
        "multipart/form-data",
      );
      assertEquals(ret, {});
    });
    await t.step("content-type raw", async () => {
      const ret = await createBody(`{"name": "john"}`, "text/plain");
      assertEquals(ret, { "name": "john" });
    });
    await t.step("content-type raw not json", async () => {
      const ret = await createBody(`my name john`, "text/plain");
      assertEquals(ret, { "_raw": "my name john" });
    });
  });
  await t.step("content-type custom raw", async () => {
    const createBody = async (
      content: string | FormData,
      type: string,
    ) => {
      const rev = new RequestEvent(
        request(content, type, "POST", true) as TRet,
      );
      await bodyParser()(
        rev,
        ((err?: Error) => err?.message || "noop") as MyNext,
      );
      return rev.body;
    };
    const ret = await createBody(
      `{"name": "john"`,
      "application/json",
    );
    assertEquals(ret, {});
  });
  await t.step("body disable", async (t) => {
    await t.step("disable value 0", async (t) => {
      const createBody = async (content: string | FormData, type: string) => {
        const rev = new RequestEvent(request(content, type) as TRet);
        await bodyParser({
          json: 0,
          urlencoded: 0,
          raw: 0,
          multipart: 0,
        })(rev, ((err?: Error) => err?.message || "noop") as MyNext);
        return rev.body;
      };
      await t.step("disable value 0 json", async () => {
        const ret = await createBody(`{"name": "john"}`, "application/json");
        assertEquals(ret, {});
      });
      await t.step("disable value 0 urlencoded", async () => {
        const ret = await createBody(
          `name=john`,
          "application/x-www-form-urlencoded",
        );
        assertEquals(ret, {});
      });
      await t.step("disable value 0 raw", async () => {
        const ret = await createBody(`{"name": "john"}`, "text/plain");
        assertEquals(ret, {});
      });
      await t.step("disable value 0 multipart", async () => {
        const form = new FormData();
        form.set("name", "john");
        const ret = await createBody(
          form,
          "multipart/form-data",
        );
        assertEquals(ret, {});
      });
    });
    await t.step("disable value false", async (t) => {
      const createBody = async (content: string | FormData, type: string) => {
        const rev = new RequestEvent(request(content, type) as TRet);
        await bodyParser({
          json: false,
          urlencoded: false,
          raw: false,
          multipart: false,
        })(rev, ((err?: Error) => err?.message || "noop") as MyNext);
        return rev.body;
      };

      await t.step("disable value false json", async () => {
        const ret = await createBody(`{"name": "john"}`, "application/json");
        assertEquals(ret, {});
      });
      await t.step("disable value false urlencoded", async () => {
        const ret = await createBody(
          `name=john`,
          "application/x-www-form-urlencoded",
        );
        assertEquals(ret, {});
      });
      await t.step("disable value false raw", async () => {
        const ret = await createBody(`{"name": "john"}`, "text/plain");
        assertEquals(ret, {});
      });
      await t.step("disable value false not json", async () => {
        const ret = await createBody(`my name john`, "text/plain");
        assertEquals(ret, {});
      });
      await t.step("disable value false multipart", async () => {
        const form = new FormData();
        form.set("name", "john");
        const ret = await createBody(
          form,
          "multipart/form-data",
        );
        assertEquals(ret, {});
      });
    });
  });
  await t.step("verify body", async (t) => {
    const createBody = async (content: string | FormData, type: string) => {
      const rev = new RequestEvent(request(content, type) as TRet);
      return await bodyParser({
        json: 1,
        raw: 1,
        urlencoded: 1,
      })(rev, ((err?: Error) => err?.message || "noop") as MyNext);
    };
    const errMessage = "Body is too large. max limit 1";
    await t.step("verify json", async () => {
      const ret = await createBody(`{"name": "john"}`, "application/json");
      assertEquals(ret, errMessage);
    });
    await t.step("verify urlencoded", async () => {
      const ret = await createBody(
        `name=john`,
        "application/x-www-form-urlencoded",
      );
      assertEquals(ret, errMessage);
    });
    await t.step("verify raw", async () => {
      const ret = await createBody(`{"name": "john"}`, "text/plain");
      assertEquals(ret, errMessage);
    });
    await t.step("verify raw not json", async () => {
      const ret = await createBody(`my name john`, "text/plain");
      assertEquals(ret, errMessage);
    });
  });
  await t.step("GET body", async () => {
    const createBody = async (
      type: string,
    ) => {
      const rev = new RequestEvent(
        new Request(base + "/", {
          method: "GET",
          headers: { "content-type": type },
        }),
      );
      await bodyParser({ json: 1 })(
        rev,
        ((err?: Error) => err?.message || "noop") as MyNext,
      );
      return rev.body;
    };
    const ret = await createBody("application/json");
    assertEquals(ret, {});
    const ret2 = await createBody("application/x-www-form-urlencoded");
    assertEquals(ret2, {});
    const ret3 = await createBody("text/plain");
    assertEquals(ret3, {});
  });
  await t.step("has body", async () => {
    const app = nhttp();
    app.post(
      "/",
      bodyParser({
        json: "1mb",
        raw: "1mb",
        urlencoded: "1mb",
      }),
      (rev) => rev.body,
    );
    const req = (type: string, body: TRet) => {
      const init = {
        method: "POST",
        headers: {
          "content-type": type,
        },
        body,
      };
      return app.req("/", init).json();
    };
    const json = await req(
      "application/json",
      JSON.stringify({ name: "john" }),
    );
    assertEquals(json, { name: "john" });

    const raw = await req("text/plain", `{ "name": "john" }`);
    assertEquals(raw, { name: "john" });

    const urlencoded = await req(
      "application/x-www-form-urlencoded",
      "name=john",
    );
    assertEquals(urlencoded, { name: "john" });
  });
  await t.step("has body miss", async () => {
    const app = nhttp();
    app.post(
      "/",
      bodyParser({
        json: "0kb",
        raw: "0kb",
        urlencoded: "0kb",
      }),
      (rev) => rev.body,
    );
    const req = (type: string, body: TRet) => {
      const init = {
        method: "POST",
        headers: {
          "content-type": type,
        },
        body,
      };
      return app.req("/", init).status();
    };
    const json = await req(
      "application/json",
      JSON.stringify({ name: "john" }),
    );
    assertEquals(json, 400);

    const raw = await req("text/plain", `{ "name": "john" }`);
    assertEquals(raw, 400);

    const urlencoded = await req(
      "application/x-www-form-urlencoded",
      "name=john",
    );
    assertEquals(urlencoded, 400);
  });
  await t.step("false and cosume", async () => {
    const req = new Request(base + "/", {
      method: "GET",
      headers: { "content-type": "application/json" },
    });
    const createBody = async (status: boolean) => {
      const rev = new RequestEvent(req);
      await bodyParser(status)(
        rev,
        ((err?: Error) => err?.message || "noop") as MyNext,
      );
      return rev.body;
    };
    const ret = await createBody(false);
    assertEquals(ret, {});
    const ret2 = await createBody(true);
    assertEquals(ret2, {});
  });
});
