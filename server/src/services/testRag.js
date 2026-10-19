const { retrieveContext } = require("./ragservice");

const testRag = async () => {
  try {
    const question = "How does this project handle API requests?";

    console.log("Question:", question);

    const context = await retrieveContext(question);
const result = await retrieveContext(question);

console.log("\n===== RETRIEVED CONTEXT =====\n");
console.log(result.context);

console.log("\n===== GENERATED ANSWER =====\n");
console.log(result.answer);
  
  } catch (error) {
    console.error("RAG test failed:", error);
  }
};

testRag();