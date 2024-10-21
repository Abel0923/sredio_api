const { default: axios } = require("axios")
const userModel = require("../models/user.model")
const { getGitHubHeaders, getGitHubData } = require('../helpers/githubApi');
const GITHUB_API = process.env.GITHUB_API_URL

exports.getRepoStats = async (req, res, next) =>{

    try{
        const { org_name, page, page_size } = req.query
        const { repos } = req.body
        let {authorization} = req.headers
        let token = authorization.substring(6, authorization.length)
        let totalPages = 1;
        
        let headers = getGitHubHeaders(token)

          let repo_stats = await Promise.all(repos.map(async (_res) => {
            const collaboratorsResponse = await getGitHubData(`${process.env.GITHUB_API_URL}/repos/${org_name}/${_res.name}/collaborators?page=${page}&per_page=${page_size}`, headers);
            const collaborators = collaboratorsResponse.data;
        
            const linkHeader = collaboratorsResponse.headers.link;

            if (linkHeader) {
                const lastLink = linkHeader.split(',').find(s => s.includes('rel="last"'));
                if (lastLink) {
                    const lastPageUrl = new URL(lastLink.split(';')[0].replace(/<(.*)>/, '$1').trim());
                    totalPages = lastPageUrl.searchParams.get('page');
                }
            }
            
            return await Promise.all(collaborators.map(async (collaborator) => {
                const username = collaborator.login;
        
                const commitsResponse = await getGitHubData(`${GITHUB_API}/repos/${org_name}/${_res.name}/commits?author=${username}`, headers);
                const totalCommits = commitsResponse.data.length;
        
                const pullRequestsResponse = await getGitHubData(`${GITHUB_API}/repos/${org_name}/${_res.name}/pulls?state=all&creator=${username}`, { headers });
                const totalPullRequests = pullRequestsResponse.data.length;
        
                const issuesResponse = await getGitHubData(`${GITHUB_API}/repos/${org_name}/${_res.name}/issues?state=all&creator=${username}`, { headers });
                const totalIssues = issuesResponse.data.length;
        
                let user = await userModel.findOne({ userId: collaborator.id, repo: _res.name, org: org_name });
                if (!user) {
                    user = await new userModel({
                        userId: collaborator.id,
                        user: username,
                        org: org_name,
                        repo: _res.name,
                        totalCommits: totalCommits,
                        totalPullRequests: totalPullRequests,
                        totalIssues: totalIssues
                    }).save();
                }
                return user;
            }));
        }));
        
        repo_stats = repo_stats.flat();
        
        return res.status(200).json({data: repo_stats, pagination: { currentPage:  page, totalPages}})

    }catch(err){
        console.log("Error >> ", err)
        return res.stats(400).json({message: "Something went Wrong!"})

    }
  
}

exports.getCommits = async (req, res, next) => {
  try {
    const { org_name, page, page_size } = req.query;
    const { authorization } = req.headers;
    const { repos } = req.body

    const token = authorization.substring(6);
    const headers = getGitHubHeaders(token);
    let totalPages = 1
    let commit_resp = await Promise.all(repos.map(async (_res) => {
        const commitsResponse = await getGitHubData(`${GITHUB_API}/repos/${org_name}/${_res.name}/commits?page=${page}&per_page=${page_size}`, headers);
        totalPages =  parseLinkHeader(commitsResponse.headers.link);
        return commitsResponse.data;
    }))

    console.log("Coomits >> ", commit_resp.length)

    commit_resp = commit_resp.flat()
    
    return res.status(200).json({ data: commit_resp, pagination: { currentPage: page, totalPages } });
  } catch (err) {
    console.log("Error >> ", err);
    return res.status(400).json({ message: "Something went wrong!" });
  }
};

exports.getPullRequest = async (req, res, next) => {
  try {
    const { org_name, page, page_size } = req.query;
    const { authorization } = req.headers;
    const token = authorization.substring(6);
    const headers = getGitHubHeaders(token);
    const { repos } = req.body

    let totalPages = 1

    let pr_resp = await Promise.all(repos.map(async (_res) => {
        const prResponse = await getGitHubData(`${GITHUB_API}/repos/${org_name}/${_res.name}/pulls?state=all&page=${page}&per_page=${page_size}`, headers);
        totalPages = parseLinkHeader(prResponse.headers.link);
        return prResponse.data;
    }))

    console.log("pr>> ", pr_resp.length)
    pr_resp = pr_resp.flat()

    return res.status(200).json({ data: pr_resp, pagination: { currentPage: page, totalPages } });
  } catch (err) {
    console.log("Error >> ", err);
    return res.status(400).json({ message: "Something went wrong!" });
  }
};

exports.getIssues = async (req, res, next) => {
  try {
    const { org_name, page, page_size } = req.query;
    const { authorization } = req.headers;
    const token = authorization.substring(6);
    const { repos } = req.body

    const headers = getGitHubHeaders(token);
    let totalPages = 1

    let issue_resp = await Promise.all(repos.map(async (_res) => {
        const issuesResponse = await getGitHubData(`${GITHUB_API}/repos/${org_name}/${_res.name}/issues?state=all&page=${page}&per_page=${page_size}`, headers);
        totalPages = parseLinkHeader(issuesResponse.headers.link);
        return issuesResponse.data
    }))


    issue_resp = issue_resp.flat()
    return res.status(200).json({ data: issue_resp, pagination: { currentPage: page, totalPages } });
  } catch (err) {
    console.log("Error >> ",err)
    return res.status(400).json({ message: "Something went wrong!" });

 }
}


const parseLinkHeader = (linkHeader) => {
    if (linkHeader) {
      const lastLink = linkHeader.split(',').find(s => s.includes('rel="last"'));
      if (lastLink) {
        const lastPageUrl = new URL(lastLink.split(';')[0].replace(/<(.*)>/, '$1').trim());
        return lastPageUrl.searchParams.get('page');
      }
    }
    return 1;
};