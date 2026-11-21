import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

test("nodemailer is upgraded to the 10.x line required for the Gmail transporter", () => {
    const { version } = require("nodemailer/package.json");
    const [major, minor, patch] = version.split(".").map(Number);

    assert.ok(
        major > 10 || (major === 10 && (minor > 6 || (minor === 6 && patch >= 1))),
        `expected nodemailer >= 10.6.1, found ${version}`
    );
});

test("the shared transporter still exposes the sendMail API used by the controllers", async () => {
    const { default: transporter } = await import("../configs/nodemailer.js");

    assert.equal(typeof transporter.sendMail, "function");
});
