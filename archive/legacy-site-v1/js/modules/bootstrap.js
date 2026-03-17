export function safeInit(name, initializer) {
  try {
    initializer();
  } catch (error) {
    console.error(`[init] ${name} failed`, error);
  }
}

export function runInitializers(initializers) {
  initializers.forEach(({ name, initializer }) => safeInit(name, initializer));
}
