from fabric.api import *
import os

env.hosts = ['opal3.opalstack.com']
env.user = 'firebelly'
env.remotepath = '/home/firebelly/apps/fb_holiday2020'
env.git_branch = 'scroll-refactor'
env.forward_agent = True
env.warn_only = True

def deploy():
  update()
  local('rm -rf dist')
  local('yarn build:production')
  put('dist', env.remotepath)

def update():
  with cd(env.remotepath):
    run('git pull origin {0}'.format(env.git_branch))
