export class TerminalUI {
  static header(title: string) {
    console.log(`\n--- 🤖 ${title.toUpperCase()} ---`);
  }

  static info(msg: string) {
    console.log(`\n💡 ${msg}`);
  }

  static success(msg: string) {
    console.log(`\n✅ ${msg}`);
  }

  static error(msg: string) {
    console.error(`\n❌ ${msg}`);
  }

  static collection(name: string, count: number) {
    console.log(`\n📦 Syncing [${name}] (${count} files)...`);
  }

  static showHelp() {
    console.log("\n📜 Available Commands:");
    console.log("/clear  -> Resets current conversation memory");
    console.log("/back   -> Change category (clears memory)");
    console.log("/help   -> Shows this list");
    console.log("/exit   -> Closes the program");
  }
}