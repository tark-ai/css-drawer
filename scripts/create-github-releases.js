#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Published packages configuration
const PUBLISHED_PACKAGES = [
  {
    name: 'css-drawer',
    path: 'packages/css-drawer'
  }
];

function getPackageVersion(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}

function getPackageChangelog(packagePath) {
  const changelogPath = path.join(packagePath, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) {
    console.log(`No CHANGELOG.md found for ${packagePath}`);
    return null;
  }

  const changelog = fs.readFileSync(changelogPath, 'utf8');

  // Extract the latest version's changes (between first two ## headers)
  const lines = changelog.split('\n');
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ') && startIndex === -1) {
      startIndex = i;
    } else if (lines[i].startsWith('## ') && startIndex !== -1) {
      endIndex = i;
      break;
    }
  }

  if (startIndex === -1) return null;
  if (endIndex === -1) endIndex = lines.length;

  return lines.slice(startIndex + 1, endIndex).join('\n').trim();
}

function createGitHubRelease(packageName, version, changelog) {
  const tagName = `${packageName}@${version}`;
  const releaseName = `${packageName} v${version}`;

  console.log(`Creating GitHub release for ${tagName}`);

  try {
    let tagExists = false;

    // Check if tag already exists
    try {
      execSync(`git rev-parse ${tagName}`, { stdio: 'ignore' });
      tagExists = true;
      console.log(`Tag ${tagName} already exists`);
    } catch (error) {
      console.log(`Tag ${tagName} doesn't exist, creating...`);
    }

    // Create and push tag only if it doesn't exist
    if (!tagExists) {
      execSync(`git tag ${tagName}`, { stdio: 'inherit' });
      execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
    } else {
      // Tag exists locally, make sure it's pushed to remote
      try {
        execSync(`git push origin ${tagName}`, { stdio: 'ignore' });
        console.log(`Pushed existing tag ${tagName} to remote`);
      } catch (error) {
        // Tag might already be on remote, continue
      }
    }

    // Check if GitHub release already exists
    try {
      execSync(`gh release view "${tagName}"`, { stdio: 'ignore' });
      console.log(`GitHub release ${tagName} already exists, skipping...`);
      return;
    } catch (error) {
      // Release doesn't exist, create it
    }

    // Create GitHub release
    const releaseBody = changelog || `Release ${version} of ${packageName}`;
    const command = `gh release create "${tagName}" --title "${releaseName}" --notes "${releaseBody}"`;

    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Created GitHub release for ${packageName}@${version}`);

  } catch (error) {
    console.error(`❌ Failed to create release for ${packageName}@${version}:`, error.message);
  }
}

function main() {
  console.log('🚀 Creating GitHub releases for all published packages...\n');

  for (const pkg of PUBLISHED_PACKAGES) {
    try {
      const version = getPackageVersion(pkg.path);
      const changelog = getPackageChangelog(pkg.path);

      console.log(`Processing ${pkg.name}@${version}`);
      createGitHubRelease(pkg.name, version, changelog);
      console.log('');

    } catch (error) {
      console.error(`❌ Error processing ${pkg.name}:`, error.message);
    }
  }

  console.log('🎉 GitHub releases creation completed!');
}

if (require.main === module) {
  main();
}

module.exports = { createGitHubRelease, getPackageVersion, getPackageChangelog };