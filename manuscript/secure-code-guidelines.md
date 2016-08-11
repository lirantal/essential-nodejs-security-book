# Secure Code Guidelines

Secure code guidelines are best practices which are set by organization, individuals, or anyone else to provide a set of standards or rules to follow that enable a person to write secure code. They are different for every programming language, and different guidelines may be set for the same language or platform by different organizations. Adopting a secure code guideline which is in-par with your requirements and company culture ensures quality software, and enhances awareness for security in the team.

T> ## Enforcing Secure Code Guidelines
T>
T> To further strengthen the adoption in your team it is possible to create linting rules and git hooks that ensures source code that is being added to the source code repository is actually following the standards set for a secure code guideline.
T> OWASP maintains a [secure code guideline document](https://www.owasp.org/index.php/OWASP_Secure_Coding_Practices_-_Quick_Reference_Guide) as a reference.

## The Risk

These days attackers aim at application layers as they attempt to exploit vulnerable application code which isn't handling input correctly. Untrusted user input is the first line of defense for an application program code, and mitigating it early in the software development life-cycle is crucial in setting the security boundaries correctly and the foundations for a secure application design.

Failure of securely handling untrusted user input may result in:
* Injection attacks
* Information Disclosure
* Buffer Overflows leading to system compromise or memory leaks
