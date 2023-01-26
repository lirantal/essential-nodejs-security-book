# DevSecOps

DevSecOps is a movement, and set of security practices that enable teams to embed security and policies while still maintaining a fast-pace product delivery, by means of security automation and Security as Code.

I> ## DevSecOps Manifesto
I> Leaning in over Always Saying “No”
I> Data & Security Science over Fear, Uncertainty and Doubt
I> Open Contribution & Collaboration over Security-Only Requirements
I> Consumable Security Services with APIs over Mandated Security Controls & Paperwork
I> Business Driven Security Scores over Rubber Stamp Security
I> Red & Blue Team Exploit Testing over Relying on Scans & Theoretical Vulnerabilities
I> 24x7 Proactive Security Monitoring over Reacting after being Informed of an Incident
I> Shared Threat Intelligence over Keeping Info to Ourselves
I> Compliance Operations over Clipboards & Checklists
I> source: http://www.devsecops.org

The following sub-sections will explore tools that can be embedded in your Node.js project and its SDLC to further enhance security.

## Static Code Analysis

Static Code Analysis, also referred to as Static Application Security Testing (SAST), can be employed on source code in order to analyze and detect flaws in a program pre-runtime.

Most chances are you're already familiar with a set of tools which perform static code analysis. For example: ESLint, JSHint, or Standard JS, all of which analyze a program's source code to warn or reject code formatting or code styles.

### ESLint Plugin Security

[eslint-plugin-security](https://github.com/nodesecurity/eslint-plugin-security) provides a small collection of rules that help avoid security pitfalls.

Adding eslint-plugin-security to your project:

```bash
npm install --save-dev eslint-plugin-security
```

The eslint rules configuration is added to a project's `package.json` and can be individually applied (`error`, `warn`, or `off`):

```json
"eslintConfig": {
    "env": {
      "node": true,
    },
    "plugins": [
      "security"
    ],
    "extends": [
      "plugin:node/recommended"
    ],
    "rules": {
      "security/detect-non-literal-fs-filename": "error",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "error",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-non-literal-regexp": "error",
      "security/detect-non-literal-require": "error",
      "security/detect-object-injection": "error",
      "security/detect-possible-timing-attacks": "error",
      "security/detect-pseudoRandomBytes": "error"
    }
  }
```

I> ## Rules 
I> Consult the project's homepage (https://github.com/nodesecurity/eslint-plugin-security) for a clear description and use of each of the security rules the plugin provides.


## Sensitive Data Exposure 

Since most apps don't perform in a vacuum, it is quite common for applications to access other systems, for which they usually require a secret key.

Common examples are:

* Database connection details such as a username, and a password.
* Remote API accounts, usually authorized through a set of API keys such as AWS, or other services.
* A public/private key the application uses for internal microservices communication, or even just its own token.

Where you would expect such secrets to be kept private and secure, [more often](https://www.forbes.com/sites/runasandvik/2014/01/14/attackers-scrape-github-for-cloud-service-credentials-hijack-account-to-mine-virtual-currency/#3b081caa3196) [than none](https://it.slashdot.org/story/15/01/02/2342228/bots-scanning-github-to-steal-amazon-ec2-keys), they leak into source code versioning systems and it's a common mistake to commit and push them even if the repository is a private one. 

I> ## Number 3 on OWASP Top 10 for 2017
I> Sensitive Data Exposure makes it to number 3 in the [top 10](https://www.owasp.org/index.php/Top_10-2017_Top_10) list of OWASP for most common vulnerabilities or attacks in an updated survey of 2017.

### Git-Secrets

[git-secrets](https://github.com/awslabs/git-secrets) is a tool for AWS that helps mitigate the problem of secrets leaking into source control.

Once git-secrets is installed, it should be accompanied by a set of git hooks to make sure it gets called on every new commit and can alert if a developer may attempt pushing anything that is considered sensitive to source control.

T> ## Managing Git Hooks
T> [husky](https://github.com/typicode/husky) is a package that helps manage git hooks across developers collaborating on the project and it's a perfect match with git-secrets or other tooling embedded as part of a git workflow.


## Runtime Application Self-Protection (RASP)

The premise of RASP is to detect and mitigate attacks on a running web application as they happen in real-time. It becomes especially important for teams who don't practice penetration testing, vulnerability scanning or other security practices in the software development life-cycle (SDLC).

RASPs aren't limited to web applications and will turn active when they detect malicious behavior, or could silently log an event when they aren't fully active.

For Node.js, [sqreen](https://www.sqreen.io) is a RASP security offering worth looking into.
Other vendors include:
* [Contrast](https://www.contrastsecurity.com)
* [Immunio](https://www.immun.io)

## Managing Vulnerabilities in 3rd-party Packages

In reference to the chapter about secure dependency management - tracking and monitoring dependencies in an application is another important practice to follow.

I> ## Featured on OWASP Top 10 for 2017
I> Using Components with Known Vulnerabilities makes it to number 9 in the [top 10](https://www.owasp.org/index.php/Top_10-2017_Top_10) list for OWASP most common vulnerabilities or attacks in an updated survey of 2017.

The previous chapter covered the [snyk](https://snyk.io) tool and platform, and highlights the importance of gaining visibility into risks from bundled applications dependencies.

To mitigate 3rd party vulnerabilities be sure to integrate Snyk or another solution as part of your CI so you can catch vulnerable dependencies before they reach production.

{pagebreak}

## Summary

In this chapter we reviewed some tools and practices that add further layers of security through automation into a Node.js application.

There is no silver bullet tool to protect applications, and one would ideally incorporate all tools and practices through all stages and layers to achieve better coverage for security.