from flask import abort, Flask, jsonify, render_template, request
from github import Github
from github.GithubException import UnknownObjectException
app = Flask(__name__)

git = Github('18a9d485827626dbb9460f627e79dce724f2b609')

@app.route('/')
def github():
    return render_template('github.html')

@app.route('/get_top_repos')
def get_top_repos():
    organization = request.args['organization']
    try:
        # For faster response in testing, may use [:5]
        # repos = git.get_organization(organization).get_repos()[:5]
        repos = git.get_organization(organization).get_repos()
        repos = [{
            'name': r.name,
            'stars': r.stargazers_count,
            'forks': r.forks_count,
            'contributors': r.get_contributors().totalCount
            } for r in repos]
        return jsonify(repos)
    except UnknownObjectException:
        return jsonify({'error': 'Organization not found.'})

# Building a separate function for getting top contributors may not be ideal in that some of the code is common with
# get_top_repos. However, putting everything in one function may further delay the response as it has been a bit long
# currently. Thus as a compromise, I put it in a separate function in consideration of better user experience and
# avoidance of server timeout. In the real world, if we want to avoid timeout, we may put the computation on a separate
# backend worker server, put the result on a temporary location, i.e. S3, use ajax to check whether the job has been
# finished and then fetch the result.
@app.route('/get_top_contributors')
def get_top_contributors():
    organization = request.args['organization']
    try:
        organization =  git.get_organization(organization)
        public_members = {m.login for m in organization.get_public_members()}

        # For faster response in testing, may use [:3]
        # repos = organization.get_repos()[:3]
        repos = organization.get_repos()

        d = {}
        for r in repos:
        	for contributor in r.get_contributors():
        		login = contributor.login
        		d[login] = d.get(login, 0) + contributor.contributions
        return jsonify({
            'internal': {k: d[k] for k in d if k in public_members},
            'external': {k: d[k] for k in d if k not in public_members}
            })
    except UnknownObjectException:
        return jsonify({'error': 'Organization not found.'})
