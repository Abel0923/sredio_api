const { default: axios } = require("axios")
const userModel = require("../models/user.model")
const { getGitHubHeaders, getGitHubData } = require('../helpers/githubApi');

const GITHUB_API = process.env.GITHUB_API_URL

exports.getOrganizations = async (req, res, next) =>{


    try{
        let {authorization} = req.headers
        if(!authorization){
            return res.status(401).json({message: "Unauthorized"})
        }
    
        let token = authorization.substring(6, authorization.length)
    
        const response = await axios.get(`${GITHUB_API}/user/orgs`, {
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

        if(!authorization){
            return res.status(401).json({message: "Unauthorized"})
        }
    
        let token = authorization.substring(6, authorization.length)
        let headers = getGitHubHeaders(token)

        let response  = await getGitHubData(`${process.env.GITHUB_API_URL}/orgs/${org_name}/repos?page=${page}&per_page=${page_size}`, headers)
    
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

