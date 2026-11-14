import test from "node:test";
import assert from "node:assert/strict";

import mongoose from "mongoose";

const parseVersion = (version) =>
    version.split(".").map((part) => Number.parseInt(part, 10));

test("mongoose is at least the CVE-fixed version 9.9.2", () => {
    const [major, minor, patch] = parseVersion(mongoose.version);

    const isAtLeastFixedVersion =
        major > 9 ||
        (major === 9 && (minor > 9 || (minor === 9 && patch >= 2)));

    assert.equal(
        isAtLeastFixedVersion,
        true,
        `expected mongoose >= 9.9.2, but found ${mongoose.version}`
    );
});