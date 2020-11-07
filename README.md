### npm versioning action

Github action package that generates versioning string base on the npm version value, branch name and commit number.

Inputs:

- release-branch, default value **_master_**.

outputs:

- version, the version string generated

For release branch (default **_master_**), version string is generated base on the semantic version specific in **_package.json_** file.

For other branches, version string is generated using `${package.json semantic version}-${branchName}.${commitCount}` format.

Basic usage:

> -- name: npm versioning
>
> id: npmVersioning
>
> uses: pengyanb/npm-versioning-action@v1
>
> -- name: dummy versioning usage
>
> run: echo "Generated version is \${{ steps.npmVersioning.outputs.version}}"

Use a different release branch:

> -- name: npm versioning
>
> id: npmVersioning
>
> uses: pengyanb/npm-versioning-action@v1
>
> with:
>
> release-branch: "develop"
>
> -- name: dummy versioning usage
>
> run: echo "Generated version is \${{ steps.npmVersioning.outputs.version}}"

set multiple release branches:

> -- name: npm versioning
>
> id: npmVersioning
>
> uses: pengyanb/npm-versioning-action@v1
>
> with:
>
> release-branch: "develop,master"
>
> -- name: dummy versioning usage
>
> run: echo "Generated version is \${{ steps.npmVersioning.outputs.version}}"
