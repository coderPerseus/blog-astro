---
title: "Automatic code sync and build deployment on Alibaba Cloud CentOS server using Baota + webhook"
publishDate: "2024-08-18T08:27:30Z"
updatedDate: "2024-08-18T08:27:31Z"
tags: ["部署","CI/CD"]
description: "Since the static blog is deployed on a server: https://mp.weixin.qq.com/s/tBxfcDsMIh_HCRS1EqBMoQ , I want it to automatically redeploy when the source code changes. Let's implement this together.\n\nRequirements\n\nMy project source code is on GitHub, blog posts are stored via GitHub Issues, and through GitHub acti"
---

Since deploying a static blog on a server — `https://mp.weixin.qq.com/s/tBxfcDsMIh_HCRS1EqBMoQ` — I want changes in the source code to trigger an automatic redeploy. Let's walk through how to set it up.

## Requirements

My project source code is on GitHub. I use GitHub Issues to store blog posts, and GitHub Actions to check for issue changes and auto-update the code. It was originally deployed on Vercel, which can link to a GitHub repo and automatically monitor source code changes to redeploy. But since Vercel is unstable, I migrated to a domestic Alibaba Cloud server and self-hosted. That means the old CI/CD no longer works, and I need to set up a new solution. After looking up some approaches online, let's first clarify our requirements:

1. Whenever the GitHub source code updates, I want the mirrored repo on Gitee to automatically update too (for now this doesn't work — I have to manually click the sync button, which isn't too inconvenient).
2. When the Gitee source code updates, it should notify the Baota (BT) panel server, trigger a rebuild, and then deploy.

## Implementation

### Install Git

```bash
# Installation command
yum -y install git
# Then check if it's installed successfully
git version
# Generate SSH key
ssh-keygen -t rsa
# Get the public key and add it to Gitee
cd ~/.ssh
cat id_rsa.pub
```

Successfully pulled the code with git 🎉🎉🎉

![img](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/1723957015510-1055824c-67e6-40d2-8716-8d7eebba90c5.png)

### Install Webhook

Go to the Baota panel's [App Store], search for "webhook" and install it.

![img](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/1723955575913-cf60e14a-8b9b-4eaa-9f67-7055a41065f5.png)

After installation, open the plugin and click "Add". Give it any name, and fill in a temporary script (we'll write the real one later). After submitting, you'll see a record in the list. Click "View Secret Key".

![img](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/1723955841856-dc3ed46e-7744-4bed-ad30-7836be8c74b7.png)

Copy the full URL.

![img](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/1723955910161-862e7123-0f36-4eac-8a8d-c7682ed555fd.png)

Now go to Gitee to configure the webhook (indeed, you can find "Ma Yun" everywhere).

![img](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/1723956118470-2571693d-5a95-4a20-babb-0e96fcf525f7.png)

Click "Add WebHooks", fill in the corresponding information, check the events you want, and click "OK". You'll see:

![img](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/1723956327949-72627f3d-7090-4289-82c5-1d0d4ea96378.png)

Then go back to the Baota [WebHook] config, add a new hook with the script we just created.

```bash
#!/bin/bash
echo ""
# Output current time
date --date='0 days ago' "+%Y-%m-%d %H:%M:%S"
echo "Start"
# Git branch name
branch="main"
# Git project path
gitPath="/www/wwwroot/blog"
# Git remote URL
gitHttp="git@gitee.com:chaseFunny/blog.git"
# gitHttp="http://192.168.2.20/llh/$1.git" // for multiple repos
echo "Web site path: $gitPath"
# Check if project path exists
if [ -d "$gitPath" ]; then
cd $gitPath
# Check if .git directory exists
if [ ! -d ".git" ]; then
echo "Cloning git in this directory"
sudo git clone $gitHttp gittemp
sudo mv gittemp/.git .
sudo rm -rf gittemp
fi
echo "Pulling latest project files"
#sudo git reset --hard origin/$branch
git remote add origin $gitHttp
git branch --set-upstream-to=origin/$branch $branch
sudo git reset --hard origin/$branch
sudo git pull $gitHttp 2>&1
echo "Setting directory permissions"
sudo chown -R www:www $gitPath
echo "End"
exit
else
echo "Project path does not exist"
echo "Creating new project directory"
mkdir $gitPath
cd $gitPath
# Check if .git directory exists
if [ ! -d ".git" ]; then
echo "Cloning git in this directory"
sudo git clone $gitHttp gittemp
sudo mv gittemp/.git .
sudo rm -rf gittemp
fi
echo "Pulling latest project files"
#sudo git reset --hard origin/$branch
sudo git pull gitHttp 2>&1
echo "Setting directory permissions"
sudo chown -R www:www $gitPath
echo "pnpm run build"
sudo pnpm i &&  pnpm run build
echo "End"
exit
fi
```

You just need to replace the config values with your own, and update the script at the end to fit your actual needs. Here's a quick explanation of this code:

This script is a Bash script for automating Git project deployment. Let's break down its functionality step by step:

1. It outputs the current date and time at the start.
2. It defines several variables:
   - `branch`: Git branch name ("mian", likely a typo for "main")
   - `gitPath`: Local path to the Git project
   - `gitHttp`: Remote URL of the Git repository
3. The script checks if `$gitPath` exists:
   - If it exists:
     - Enters the directory
     - Checks if a `.git` directory exists; if not, clones the repo and moves the `.git` directory
     - Updates the remote URL and branch tracking
     - Force resets to the latest state of the remote branch
     - Pulls the latest code
     - Sets directory permissions
   - If it does not exist:
     - Creates the new directory
     - Clones the repo
     - Pulls the latest code
     - Sets directory permissions
     - Runs `pnpm i && pnpm run build`
4. The script uses `sudo` for some operations, which requires administrator privileges.
5. Finally, it sets the directory owner to "www" user and group, which is typical for web server configurations.

The main purpose of this script is to automate the deployment of a Git project, including cloning the repository, updating code, setting permissions, etc. It also includes some error handling and conditional logic to handle different scenarios (such as whether the project directory already exists).
