import { info, getInput, setOutput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { constructDeploymentInfo } from "./url-constructor.js";

async function run() {
  try {
    // Get inputs defined in action.yml (required)
    const projectName = getInput("project-name", { required: true });
    const teamSlug = getInput("team-slug", { required: true });

    if (!projectName || !teamSlug) {
      throw new Error("project-name and team-slug are required inputs");
    }

    info(
      `🚀 Constructing deployment URL for project: ${projectName}, team: ${teamSlug}`
    );

    // Construct deployment info from PR (no GitHub API needed)
    const result = constructDeploymentInfo(context, projectName, teamSlug);

    // Set outputs
    setOutput("should-notify", result.shouldNotify.toString());
    setOutput("deployment-info", JSON.stringify(result.deploymentInfo));

    info(`✅ Deployment URL: ${result.deploymentInfo.url}`);
    info("Action completed successfully!");
  } catch (error) {
    setFailed(`Action failed: ${error.message}`);
  }
}

await run();
