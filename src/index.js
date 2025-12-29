import { info, getInput, setOutput, setFailed } from "@actions/core";
import { getOctokit, context } from "@actions/github";
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

    // Get GitHub API instance (uses GITHUB_TOKEN from environment automatically)
    const github = getOctokit(process.env.GITHUB_TOKEN);

    // Construct deployment info from PR
    const result = await constructDeploymentInfo(
      github,
      context,
      projectName,
      teamSlug
    );

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
