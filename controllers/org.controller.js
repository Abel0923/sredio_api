const { default: axios } = require("axios")
const userModel = require("../models/user.model")

exports.getOrganizations = async (req, res, next) =>{


    try{
        let {authorization} = req.headers
        if(!authorization){
            return res.status(401).json({message: "Unauthorized"})
        }
    
        let token = authorization.substring(6, authorization.length)
    
        const response = await axios.get('https://api.github.com/user/orgs', {
            headers: {
              Authorization: `token ${token}`,
              'Accept': 'application/vnd.github+json',
               'X-GitHub-Api-Version': '2022-11-28'
            }
          });
    
          if(!response){
            throw ({message: "Response not found"})
          }

          return res.status(200).json({data: response.data})
    }catch(err){
        console.log("ERROR GET ORG >> ", err)
        return res.status(400).json({message: err.message || "Something went Wrong!"})
    }
}

exports.getAllOrgRepo = async (req, res, next) =>{


    try{
        
        let {authorization} = req.headers
        let {org_name} = req.query

        if(!authorization){
            return res.status(401).json({message: "Unauthorized"})
        }
    
        let token = authorization.substring(6, authorization.length)
    

        let response  = await axios.get(`${process.env.GITHUB_API_URL}/orgs/${org_name}/repos`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'org': `${org_name}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
              }
        })
    
    
          if(!response){
            throw ({message: "Response not found"})
          }

          return res.status(200).json({data: response.data})
    }catch(err){
        console.log("ERROR GET ORG >> ", err)
        return res.status(400).json({message: err.message || "Something went Wrong!"})
    }
}

exports.getRepoStats = async (req, res, next) =>{

    
    try{
        const { org_name, repo_name } = req.query
        let {authorization} = req.headers
        let token = authorization.substring(6, authorization.length)



        let headers = {
            Authorization: `token ${token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        const collaboratorsResponse = await axios.get(`${process.env.GITHUB_API_URL}/repos/${org_name}/${repo_name}/collaborators`, {
            headers 
          });

          const collaborators = collaboratorsResponse.data;
      
          let stats = []
          for (const collaborator of collaborators) {
            const username = collaborator.login;
      
            const commitsResponse = await axios.get(`${process.env.GITHUB_API_URL}/repos/${org_name}/${repo_name}/commits?author=${username}`, { headers });
            const totalCommits = commitsResponse.data.length;
      
            const pullRequestsResponse = await axios.get(`${process.env.GITHUB_API_URL}/repos/${org_name}/${repo_name}/pulls?state=all&creator=${username}`, { headers });
            const totalPullRequests = pullRequestsResponse.data.length;
      
            const issuesResponse = await axios.get(`${process.env.GITHUB_API_URL}/repos/${org_name}/${repo_name}/issues?state=all&creator=${username}`, { headers });
            const totalIssues = issuesResponse.data.length;

            let user = await userModel.findOne({userId: collaborator.id, repo: repo_name, org: org_name})
            if(!user){
                user = await new userModel({
                    userId: collaborator.id,
                    user: username,
                    org: org_name,
                    repo: repo_name,
                    totalCommits: totalCommits,
                    totalPullRequests: totalPullRequests,
                    totalIssues: totalIssues
                }).save()
            }

            stats.push(user)
          }

        stats = await Promise.all(stats);
        return res.status(200).json({ data: stats });
    }catch(err){
        console.log("Error >> ", err)
        return res.stats(400).json({message: "Something went Wrong!"})

    }
  
}