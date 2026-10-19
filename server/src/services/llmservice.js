const axios = require("axios");

const generateAnswer = async (question, context) => {
  const response = await axios.post(
    "http://localhost:11434/api/chat",
    {
      model: "qwen2.5:3b",

      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes GitHub repositories.

Answer questions using the repository context provided by the user.

Rules:
1. Base your answer on the supplied repository context.
2. Explain the relevant code clearly.
3. If the context does not contain enough information, say so.
4. Do not invent files, functions, or implementation details.`,
        },
        {
          role: "user",
          content: `Question: ${question}

Repository context:
${context}

Answer the question using the repository context.`,
        },
      ],

      stream: false,
    }
  );

  return response.data.message.content;
};

module.exports = { generateAnswer };