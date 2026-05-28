const fs = require("fs");
let content = fs.readFileSync("C:/Users/Admin/.openclaw/workspace/raw/MH/server/index.js", "utf8");
let replaced = content.replace(
  'console.log(\\(KIE WEBHOOK] Ignoring out-of-order callback (\\) for already completed task: \\);',
  'console.log("[KIE WEBHOOK] Ignoring out-of-order callback (" + callbackType + ") for already completed task: " + taskId);'
);
fs.writeFileSync("C:/Users/Admin/.openclaw/workspace/raw/MH/server/index.js", replaced, "utf8");
console.log("Done, lines changed:", content !== replaced);
