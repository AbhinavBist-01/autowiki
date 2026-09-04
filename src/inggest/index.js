import { askQuestion } from "../service/rag.js";
import { inngest } from "./client.js";
import { helloWorld } from "./functions/helloworld.js";
import { indexRepo } from "./functions/index-repo.js";
import { askQuestionFn } from "./functions/ask-questions.js";
export { inngest };

export const functions = [helloWorld, indexRepo, askQuestionFn];
