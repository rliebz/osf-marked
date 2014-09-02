from invoke import task, run


@task
def node():
    run(r'<node-requirements.txt xargs -I % npm install %')
