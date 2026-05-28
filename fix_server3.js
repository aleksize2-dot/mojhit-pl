const fs = require("fs");
let content = fs.readFileSync("C:/Users/Admin/.openclaw/workspace/raw/MH/server/index.js", "utf8");

// The broken line has literal backslash+paren outside a string
const targets = [
  'console.log(\\(KIE WEBHOOK] Ignoring out-of-order callback (\\) for already completed task: \\);'
];

const replacement = 'console.log("[KIE WEBHOOK] Ignoring out-of-order callback (" + callbackType + ") for already completed task: " + taskId);';

for (const target of targets) {
  // Use string.replace with a plain string (not regex) to avoid escaping issues
  // But we need to construct the exact search string from the file content
  // The target string has single backslashes which in JavaScript source need to be written as \\
  const searchStr = "console.log(\\(KIE WEBHOOK] Ignoring out-of-order callback (\\) for already completed task: \\);";
  
  // In this JavaScript source code:
  // \\( = \\ (escaped backslash) + ( = "\\("  → the string value is "\(" which is backslash + paren
  // But wait - JS doesn't recognize \( as a valid escape, so it produces the literal characters
  
  console.log("Search string char codes at position 12-18:");
  for (let i = 12; i < 18 && i < searchStr.length; i++) {
    process.stdout.write(searchStr.charCodeAt(i) + " ");
  }
  console.log();
  
  console.log("File char codes at same positions:");
  for (let i = 12; i < 18; i++) {
    process.stdout.write(content.charCodeAt(i) + " ");
  }
  console.log();
  
  // Just try a direct approach - find by position
  const idx1 = content.indexOf(searchStr);
  console.log("Index of search string:", idx1);
  
  if (idx1 === -1) {
    // Try to find a partial match
    const partial = "Ignoring out-of-order callback";
    const idx2 = content.indexOf(partial);
    console.log("Partial match found at:", idx2, "context:", JSON.stringify(content.substring(idx2 - 30, idx2 + 80)));
  }
}
