## npm versioning action

Github action package that generates versioning string base on the npm version value, branch name and commit number.

### Inputs:

- release-branch : string, default value **_master_**.

- package-json-path : string, path to package.json file, default value **_./package.json_**

- update-version : boolean, flag to indicate wheather to update package.json file, default value **_true_**

### outputs:

- version, the version string generated
  
- tag: **_latest_** for release branch, **_beta_** for other branches

For release branch (default **_master_**), version string is generated based on the semantic version specified in **_package.json_** file.

For other branches, version string is generated using `${package.json semantic version}-${branchName}.${commitCount}` format.

### Basic usage:

```yml
- name: npm versioning
  id: npmVersioning
  uses: pengyanb/npm-versioning-action@v1

- name: dummy versioning usage
  run: echo "Generated version is \${{ steps.npmVersioning.outputs.version}}"
```

### Specify a different release branch:

```yml
- name: npm versioning
  id: npmVersioning
  uses: pengyanb/npm-versioning-action@v1
  with:
    release-branch: "develop"

- name: dummy versioning usage
  run: echo "Generated version is \${{ steps.npmVersioning.outputs.version}}"
```

### Set multiple release branches:

```yml
- name: npm versioning
  id: npmVersioning
  uses: pengyanb/npm-versioning-action@v1
  with:
    release-branch: "develop,master"

- name: dummy versioning usage
  run: echo "Generated version is \${{ steps.npmVersioning.outputs.version}}"
```

### use with npm publish:

```yml
- name: npm versioning
  id: npmVersioning
  uses: pengyanb/npm-versioning-action@v1
  with:
    release-branch: "master" 
    package-json-path: "./dist/package.json"
    update-version: true

- name: npm publish
  run: run: npm publish ./dist --tag ${{ steps.npmVersioning.outputs.tag }} --dry-run true
  env:
    NPM_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
```