const core = require("@actions/core");
const exec = require("@actions/exec");
const { promises: fs } = require("fs");

async function main() {
  try {
    let versioningName = "";
    let tag = "beta";
    let defaultReleaseBranchs = core.getInput("release-branch") || "master";
    const packageJsonPath =
      core.getInput("package-json-path") || "./package.json";
    const updateVersion = core.getInput("update-version") || "true";
    console.log("defaultReleaseBranch: ", defaultReleaseBranchs);
    console.log("packageJsonPath: ", packageJsonPath);
    console.log("updateVersion: ", updateVersion);
    if (defaultReleaseBranchs.includes(",")) {
      defaultReleaseBranchs = defaultReleaseBranchs.split(",");
    } else {
      defaultReleaseBranchs = [defaultReleaseBranchs];
    }
    let resolve, reject;
    const branchNamePromise = new Promise((rs, rj) => {
      resolve = rs;
      reject = rj;
    });
    const branchNameOptions = {
      listeners: {
        stdout: (data) => {
          resolve(data.toString());
        },
        stderr: (err) => {
          reject({ message: err.toString() });
        },
      },
    };
    exec.exec("git", ["name-rev", "--name-only", "HEAD"], branchNameOptions);
    const branchName = (await branchNamePromise)
      .replace("\r", "")
      .replace("\n", "");
    const branchNameEscaped = branchName.replace("/", "-");

    const packageJson = JSON.parse(
      (await fs.readFile(packageJsonPath)).toString()
    );
    console.log("packageJsonVersion: ", packageJson.version);

    if (defaultReleaseBranchs.includes(branchName)) {
      versioningName = packageJson.version;
      tag = "latest";
    } else {
      let countResolve, countReject;
      let commitCount = 0;
      const countCommitPromise = new Promise((rs, rj) => {
        countResolve = rs;
        countReject = rj;
      });
      const countCommitsOptions = {
        listeners: {
          stdout: (message) => {
            console.log("Commit: ", message);
            commitCount++;
          },
          stderr: (err) => {
            reject({ message: err.toString() });
          },
          debug: (message) => {
            console.log("DEBUG: ", message);
            if (message.includes("STDIO streams have closed for tool")) {
              countResolve();
            }
          },
        },
      };
      exec.exec(
        "git",
        ["log", "--abbrev-commit", "--pretty=oneline"],
        countCommitsOptions
      );
      await countCommitPromise;
      console.log("commitCount: ", commitCount);
      versioningName = `${packageJson.version}-${branchNameEscaped}.${commitCount}`;
    }
    if (updateVersion === "true") {
      packageJson.version = versioningName;
    }
    console.log(`versioning name: ${versioningName}, tag: ${tag}`);
    core.setOutput("version", versioningName);
    core.setOutput("tag", tag);
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
