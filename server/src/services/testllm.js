const { generateAnswer } = require("./llmservice");

const testllm = async () => {
  try {
    const question = "How does Express.js handle POST requests?";

    const context = `
      FILE: server.js

      The application uses Express.js.
      It defines a POST route at /api/analyze.
      The route receives repository information
      and calls the analyzeRepository function.
    `;

    console.log("Question:", question);
    console.log("\nGenerating answer using Ollama...\n");

    const answer = await generateAnswer(question, context);

    console.log("===== GENERATED ANSWER =====\n");
    console.log(answer);
    console.log("\n===== END OF ANSWER =====");
  } catch (error) {
    console.error(
      "LLM test failed:",
      error.response?.data || error.message
    );
  }
};

testllm();