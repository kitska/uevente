class TimerReporter {
//   onTestResult(_, testResult) {
//     for (const result of testResult.testResults) {
//       const name = result.fullName;
//       const duration = result.duration;
//       console.log(`⏱ ${name} — ${duration} ms`);
//     }
//   }

  onRunComplete(_, results) {
    console.log("\n=== 🧾 Test duration summary ===");
    const all = results.testResults.flatMap(r => r.testResults);
    all.sort((a, b) => b.duration - a.duration);
    for (const r of all) {
      console.log(`• ${r.fullName} — ${r.duration} ms`);
    }
  }
}

module.exports = TimerReporter;
