# GitHub AI Repository Analyzer

An AI-powered application designed to analyze GitHub repositories by processing source code, generating embeddings, and retrieving relevant code snippets through semantic search.

The project explores how repository data can be transformed into searchable vector representations, making it easier to find relevant code based on meaning rather than relying exclusively on exact keyword matches.

## Overview

Understanding an unfamiliar codebase can be time-consuming. Developers often need to inspect multiple files to locate relevant functions, understand implementation details, or investigate specific features.

The GitHub AI Repository Analyzer addresses this problem by providing a backend pipeline for retrieving repository content, splitting source code into manageable chunks, storing vector representations, and searching for relevant code.

## Features

- **GitHub Repository Integration:** Retrieve repository information and source code using the GitHub API.
- **Source Code Chunking:** Divide source files into smaller text chunks for processing and retrieval.
- **Embedding Pipeline:** Generate vector representations of code chunks through an embedding service.
- **Vector Storage:** Store searchable vectors and associated metadata using Vectra.
- **Semantic Search:** Retrieve relevant code chunks based on vector similarity.
- **Metadata-Aware Retrieval:** Associate stored chunks with repository and file information.
- **REST API:** Expose backend functionality through Express.js endpoints.
- **Modular Architecture:** Separate repository processing, embedding generation, vector storage, and retrieval into dedicated services.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime for the backend |
| Express.js | REST API and server-side routing |
| GitHub API | Repository data retrieval |
| Vectra | Local vector storage and similarity search |
| Embedding Service | Converts text chunks into vector representations |
| Axios | HTTP requests |
| dotenv | Environment-based configuration |
| React | Frontend user interface |
| Vite | Frontend development and build tooling |

## Architecture

The application follows a modular processing pipeline.

1. **Repository Input:** The application receives repository information.
2. **Repository Retrieval:** The backend retrieves relevant repository content.
3. **Text Chunking:** Source files are divided into smaller chunks.
4. **Embedding Generation:** The embedding service converts chunks into numerical vectors.
5. **Vector Storage:** Vectors and metadata are stored in a Vectra index.
6. **Semantic Retrieval:** A search query is converted into a vector and compared with stored vectors.
7. **Result Processing:** Relevant code chunks and their associated metadata can be returned to the caller.

### High-Level Pipeline

GitHub Repository
       |
       v
Repository Retrieval
       |
       v
Source Code Chunking
       |
       v
Embedding Generation
       |
       v
Vectra Vector Store
       |
       v
Similarity Search
       |
       v
Relevant Code Chunks

## Project Structure

The repository is organized into a frontend and backend.

```text
github-ai-repository-analyzer/
├── client/
│   └── React frontend
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
├── README.md
└── .gitignore
