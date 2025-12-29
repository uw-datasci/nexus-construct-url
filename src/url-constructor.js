/**
 * URL Constructor - Constructs Vercel deployment URL from PR branch name
 */

/**
 * Sanitizes branch name for URL construction
 * @param {string} branchName - Raw branch name
 * @returns {string} Sanitized branch name safe for URLs
 */
function sanitizeBranchName(branchName) {
  if (!branchName) return "";

  // Remove refs/heads/ prefix if present
  const cleanBranch = branchName.replace(/^refs\/heads\//, "");

  // Replace special characters with hyphens and convert to lowercase
  return cleanBranch
    .toLowerCase()
    .replaceAll(/[^a-z0-9-]/g, "-")
    .replaceAll(/-+/g, "-") // Replace multiple consecutive hyphens with single hyphen
    .replaceAll(/(?:^-|-$)/g, ""); // Remove leading/trailing hyphens
}

/**
 * Constructs Vercel deployment URL using the standard format
 * @param {string} projectName - Vercel project name
 * @param {string} branchName - Git branch name
 * @param {string} teamSlug - Vercel team slug
 * @returns {string} Constructed deployment URL
 */
function constructDeploymentUrl(projectName, branchName, teamSlug) {
  const sanitizedBranch = sanitizeBranchName(branchName);
  return `https://${projectName}-git-${sanitizedBranch}-${teamSlug}.vercel.app`;
}

/**
 * Gets commit information from PR context (no API call needed)
 * @param {Object} pr - Pull request object from context
 * @returns {Object} Commit information
 */
function getCommitInfo(pr) {
  // Use information already available in PR context
  return {
    sha: pr.head.sha || "",
    message: pr.title || "", // Use PR title as fallback for commit message
    author: pr.user || null, // Use PR author as fallback
  };
}

/**
 * Constructs deployment information from PR context
 * @param {Object} context - GitHub context (pull_request event)
 * @param {string} projectName - Vercel project name (required)
 * @param {string} teamSlug - Vercel team slug (required)
 * @returns {Object} Result with shouldNotify flag and deployment info
 */
function constructDeploymentInfo(context, projectName, teamSlug) {
  // Get PR from context
  const pr = context.payload.pull_request;
  if (!pr) {
    throw new Error(
      "No PR found in context. This action must be run in a pull_request event."
    );
  }

  // Get branch name from PR
  const branchName = pr.head.ref;

  // Construct the deployment URL
  const deploymentUrl = constructDeploymentUrl(
    projectName,
    branchName,
    teamSlug
  );

  // Get commit information from PR context (no API call needed)
  const commitInfo = getCommitInfo(pr);

  return {
    shouldNotify: true,
    deploymentInfo: {
      url: deploymentUrl,
      ref: branchName,
      state: "constructed", // We don't have actual deployment state
      commitSha: commitInfo.sha?.substring(0, 7) || "",
      commitMessage: commitInfo.message?.split("\n")[0] || "", // First line only
      commitAuthor: commitInfo.author,
    },
  };
}

export { constructDeploymentInfo };
