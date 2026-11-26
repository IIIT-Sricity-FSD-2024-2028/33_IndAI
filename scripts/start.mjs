// Compatibility entry point for the matching Express runtime.
process.argv.push('--serve');
await import('../back-end/server.js');
