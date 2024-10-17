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
        let {org_name, page, page_size} = req.query

        console.log("query >> ", req.query)
        if(!authorization){
            return res.status(401).json({message: "Unauthorized"})
        }
    
        let token = authorization.substring(6, authorization.length)
    

        let response  = await axios.get(`${process.env.GITHUB_API_URL}/orgs/${org_name}/repos?page=${page}&per_page=${page_size}`, {
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


        const linkHeader = response.headers.link;
          
        let totalPages = 1;

        if (linkHeader) {
        const lastLink = linkHeader.split(',').find(s => s.includes('rel="last"'));
        if (lastLink) {
            const lastPageUrl = new URL(lastLink.split(';')[0].replace(/<(.*)>/, '$1').trim());
            totalPages = lastPageUrl.searchParams.get('page');
        }
    }

    console.log("Total pages >> ", totalPages)

          return res.status(200).json({data: response.data, pagination: { currentPage:  page, totalPages}})
    }catch(err){
        console.log("ERROR GET ORG >> ", err)
        return res.status(400).json({message: err.message || "Something went Wrong!"})
    }
}

exports.getRepoStats = async (req, res, next) =>{

    
    try{
        const { org_name, page, page_size } = req.query
        const { repos } = req.body
        let {authorization} = req.headers
        let token = authorization.substring(6, authorization.length)
        let totalPages = 1;
        let headers = {
            Authorization: `token ${token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
          let repo_stats = await Promise.all(repos.map(async (_res) => {
            const collaboratorsResponse = await axios.get(`${process.env.GITHUB_API_URL}/repos/${org_name}/${_res.name}/collaborators?page=${page}&per_page=${page_size}`, {
                headers
            });
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
        
                const commitsResponse = await axios.get(`${process.env.GITHUB_API_URL}/repos/${org_name}/${_res.name}/commits?author=${username}`, { headers });
                const totalCommits = commitsResponse.data.length;
        
                const pullRequestsResponse = await axios.get(`${process.env.GITHUB_API_URL}/repos/${org_name}/${_res.name}/pulls?state=all&creator=${username}`, { headers });
                const totalPullRequests = pullRequestsResponse.data.length;
        
                const issuesResponse = await axios.get(`${process.env.GITHUB_API_URL}/repos/${org_name}/${_res.name}/issues?state=all&creator=${username}`, { headers });
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