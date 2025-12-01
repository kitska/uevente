let testStart: number;

beforeEach(() => {
  testStart = Date.now();
});

afterEach(() => {
  const duration = Date.now() - testStart;
  const name = expect.getState().currentTestName;
  process.stdout.write(`⏱ ${name} — ${duration} ms\n`);
});