export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.info("[instrumentation] Easy Patch server started");
  }
}
