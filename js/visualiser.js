const { execSync } = require('child_process');
const { randomBytes } = require('crypto');

const GIT_LOG_COMMAND = 'git log --pretty="%aN <%aE>@@%aI@@%h@@%s@@%D@@%p"';
const GIT_PATH = '/path/to/git/project';

const AUTHOR_INDEX = 0;
const DATE_INDEX = 1;
const HASH_INDEX = 2;
const MESSAGE_INDEX = 3;
const REFS_INDEX = 4;
const PARENTS_INDEX = 5;
const BRANCH_INDEX = 6;
const LEVEL_INDEX = 7;

const branchConfig = {
    // Empty config supplied as config with name drastically slows gitGraph
};

const graphTemplate = new GitGraph.Template({
    commit: {
        spacingY: -80,
        dot: {
            size: 12
        },
        message: {
            displayAuthor: true,
            displayBranch: false,
            displayHash: true,
            font: "normal 12pt Arial"
        }
    },
    shouldDisplayTooltipsInCompactMode: true,
    tooltipHTMLFormatter: function (commit) {
        return "" + commit.sha1 + "" + ": " + commit.message;
    }
});

const commitTable = {};
const numCommits = {};
const orderedHashes = [];

/**
 * Draw the graph using the commit table and list of ordered commits.
 */
function drawGraph() {
    let config = { template: graphTemplate, orientation: "vertical-reverse" };
    // let config = { template: "metro", orientation: "vertical-reverse" };
    let gitGraph = new GitGraph(config);

    let branches = {};
    let master = gitGraph.branch(branchConfig);
    branches['master'] = master;
    for (let hash of orderedHashes) {
        let commit = commitTable[hash];
        let parentBranch = branches[commit[PARENTS_INDEX][0]] || master;
        parentBranch.checkout();
        if (!branches[commit[BRANCH_INDEX]]) {
            branches[commit[BRANCH_INDEX]] = gitGraph.branch(branchConfig);
        }
        let branch = branches[commit[BRANCH_INDEX]];

        // Create branch for every commit, allows us to branch from any point
        branches[commit[HASH_INDEX]] = gitGraph.branch(branchConfig);
        branch.checkout();
        branches[commit[HASH_INDEX]].delete();

        let commitConfig = {
            messageAuthorDisplay: true,
            message: commit[MESSAGE_INDEX],
            tooltipDisplay: true,
            sha1: commit[HASH_INDEX],
            author: commit[AUTHOR_INDEX]
        };

        numCommits[commit[BRANCH_INDEX]] -= 1;
        if (commit[PARENTS_INDEX].length === 2) {
            branches[commitTable[commit[PARENTS_INDEX][1]][BRANCH_INDEX]]
                .merge(branch, commitConfig);
            if (numCommits[commitTable[commit[PARENTS_INDEX][1]][BRANCH_INDEX]] <= 0) {
                branches[commitTable[commit[PARENTS_INDEX][1]][BRANCH_INDEX]]
                    .delete();
            }
        } else {
            branch.commit(commitConfig);
        }
    }
}

/**
 * Get a list of commits, useful data delimited with '@@'.
 *
 * @returns {string[]}
 */
function getParsableLog() {
    let output = execSync(GIT_LOG_COMMAND, { cwd: GIT_PATH });
    let commits = output.toString().split('\n');
    commits.pop();
    return commits
}

/**
 * Populate the commit table and ordered hash list given a parsable list
 * of git commits. Due to the branch agnostic nature of git commits, the
 * branch name that commits occur on is randomly generated but consistent.
 *
 * @param {string[]} commits Parsable list of commits, see getParsableLog().
 */
function populateCommitTableAndList(commits) {
    let firstCommit = commits[0].split('@@');
    firstCommit[BRANCH_INDEX] = 'master';
    firstCommit[LEVEL_INDEX] = 0;
    commitTable[firstCommit[HASH_INDEX]] = firstCommit;

    let index = commits.length;
    for (let commit of commits) {
        commit = commit.split('@@');
        commit[PARENTS_INDEX] = commit[PARENTS_INDEX].split(' ');
        let firstParent = [];
        firstParent[BRANCH_INDEX] = commitTable[commit[HASH_INDEX]][BRANCH_INDEX];
        firstParent[LEVEL_INDEX] = commitTable[commit[HASH_INDEX]][LEVEL_INDEX];
        setParent(commit[PARENTS_INDEX][0], firstParent);
        if (commit[PARENTS_INDEX].length === 2) {
            let secondParent = [];
            secondParent[BRANCH_INDEX] = randomBytes(256).toString('hex');
            secondParent[LEVEL_INDEX] = commitTable[commit[HASH_INDEX]][LEVEL_INDEX] + 1;
            setParent(commit[PARENTS_INDEX][1], secondParent);
        }
        commit[BRANCH_INDEX] = commitTable[commit[HASH_INDEX]][BRANCH_INDEX];
        commitTable[commit[HASH_INDEX]] = commit;
        orderedHashes[--index] = commit[HASH_INDEX];
    }
}

/**
 * Store parent in the commit table iff a parent of the same hash is not
 * already in the commit table or the parent corresponds to a lower level.
 * Further updates the number of commits per branch.
 *
 * @param {string} hash Hash of parent commit.
 * @param {string[]} parent List containing a potential branch and level.
 */
function setParent(hash, parent) {
    let isLowerLevel = commitTable[hash]
        && commitTable[hash][LEVEL_INDEX] > parent[LEVEL_INDEX];
    if (!commitTable[hash] || isLowerLevel) {
        if (isLowerLevel) {
            numCommits[commitTable[hash][BRANCH_INDEX]] -= 1;
        }
        commitTable[hash] = parent;
        num = numCommits[parent[BRANCH_INDEX]];
        numCommits[parent[BRANCH_INDEX]] = num ? num + 1 : 1;
    }
}

/**
 * Initialise this module.
 */
function init() {
    let commits = getParsableLog();
    populateCommitTableAndList(commits);
    drawGraph();
}

window.onload = init;
