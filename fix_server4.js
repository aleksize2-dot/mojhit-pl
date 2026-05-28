const fs = require("fs");
let content = fs.readFileSync("C:/Users/Admin/.openclaw/workspace/raw/MH/server/index.js", "utf8");

// The broken lines have literal backslash+bracket outside a string
// File has: console.log(\[KIE WEBHOOK] Ignoring out-of-order callback (\) for already completed task: \);
// In JS source, \[ means backslash + bracket

// Construct the search string - in JS source, \ produces a single \
const searchStr = "console.log(\\[KIE WEBHOOK] Ignoring out-of-order callback (\\) for already completed task: \\);";
const replacement = 'console.log("[KIE WEBHOOK] Ignoring out-of-order callback (" + callbackType + ") for already completed task: " + taskId);';

let count = 0;
let newContent = content;
let pos = -1;
while ((pos = newContent.indexOf(searchStr)) !== -1) {
  console.log("Found broken line at position", pos);
  newContent = newContent.substring(0, pos) + replacement + newContent.substring(pos + searchStr.length);
  count++;
}

if (count > 0) {
  fs.writeFileSync("C:/Users/Admin/.openclaw/workspace/raw/MH/server/index.js", newContent, "utf8");
  console.log("Fixed", count, "occurrences");
} else {
  console.log("No matches found. Trying debug...");
  // Try to find backslash patterns
  const idx = content.indexOf("KIE WEBHOOK] Ignoring");
  if (idx !== -1) {
    console.log("Found near", idx, "context:", JSON.stringify(content.substring(idx - 25, idx + 85)));
    console.log("Char codes around:", Array.from(content.substring(idx - 25, idx + 5)).map(c => c.charCodeAt(0)).join(","));
  }
}
