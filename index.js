const core = require("@actions/core");
const exec = require("@actions/exec");
const { promises: fs } = require("fs");

async function main() {
  try {
    let versioningName = "";
    let defaultReleaseBranchs = core.getInput("who-to-greet");
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
    exec.exec("git", ["branch", "--show-current"], branchNameOptions);
    const branchName = (await branchNamePromise)
      .replace("/", "_")
      .replace("\r", "")
      .replace("\n", "");
    console.log("branchName: ", branchName);

    const packageJson = JSON.parse(
      (await fs.readFile("./package.json")).toString()
    );
    console.log("packageJsonVersion: ", packageJson.version);

    if (defaultReleaseBranchs.includes(branchName)) {
      versioningName = packageJson.version;
    } else {
      let countResolve, countReject;
      const countCommitPromise = new Promise((rs, rj) => {
        countResolve = rs;
        countReject = rj;
      });
      const countCommitsOptions = {
        listeners: {
          stdout: (data) => {
            countResolve(data.toString());
          },
          stderr: (err) => {
            reject({ message: err.toString() });
          },
        },
      };
      exec.exec("git", ["rev-list", "--count", "HEAD"], countCommitsOptions);
      const commitCount = (await countCommitPromise)
        .replace("\r", "")
        .replace("\n", "");
      versioningName = `${packageJson.version}-${branchName}.${commitCount}`;
    }
    console.log("versioning name: ", versioningName);
    core.setOutput("version", versioningName);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
