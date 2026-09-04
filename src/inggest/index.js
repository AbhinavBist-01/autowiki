import { inngest } from "./client.js";
import { helloWorld } from "./functions/helloworld.js";
import { indexRepo } from "./functions/index-repo.js";
export { inngest };

export const functions = [helloWorld, indexRepo];
