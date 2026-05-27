---
layout: layouts/page
title: CryptPad Security Policy
---

This document is there to provide information about the policy of
[CryptPad](https://cryptpad.org) in case a vulnerability is found.

## Known CryptPad security issues

All publicly known security issues on CryptPad are reported as Common
Vulnerabilities and Exposures (CVE) issues and can be found on
[cve.org](https://www.cve.org/CVERecord/SearchResults?query=CryptPad).

## What are the available channels to discuss security issues?

These channels are private because we want to apply the following strategy:

- Don't make it too easy for hackers to find about security issues before we've
  had the chance to provide a fix that our users can apply on their CryptPad
  instances.
- Once we have fixed a security issue and released CryptPad versions with the fix,
  and after a defined waiting period (see below for more details) to allow users
  to upgrade, the security issue is disclosed publicly.

### GitHub security advisories

For each security issue fixed for CryptPad, a dedicated security advisory is
created on GitHub. Those advisories remain private until they are publicly
disclosed. In our case, only senior developers in the CryptPad team can view and
interact with the created advisories.

## Where to submit security issues?

All security issues should be communicated to us via emails on
[security@cryptpad.org](mailto:security@cryptpad.org).
Before reaching out about a potential vulnerability, ensure it falls within the
scope of our project.
Please read thoroughly our
[whitepaper](https://blueprints.cryptpad.org/document/whitepaper/) describing
our threat model and what we consider acceptable or not security-wise.
Try to give as much information as possible for those issues and in particular a
way to exploit the vulnerability, or a way to assess that the vulnerability is
present: we will use it to determine if some instances are subject to it or not.

Those issues are only visible to the members of CryptPad security team.

## How to detect new security issues?

The following tools and practices are used to detect new security issues:

- Issues reported by the community on our security communication channels,
  especially on the [security@cryptpad.org](mailto:security@cryptpad.org)
  emails, which are the main entry points to report security issues.
    - This includes manual code reviews by CryptPad core maintainers who create
      issues.
- Issues detected by [`npm
  audit`](https://docs.npmjs.com/cli/v10/commands/npm-audit) to scan security
  issues in our external dependencies.
- [Dependabot](https://docs.github.com/en/code-security/getting-started/dependabot-quickstart-guide)
  alerts related to Security. This GitHub application is set up on our GitHub
  repositories.

## What are the criteria for computing severity?

The severity is defined on a case by case basis by the core committers depending
on two criteria:

- the impact of the security issue (for instance an issue that would be blocked
  by our Content Security Policies (CSPs) in less severe than being able to
  erase a document without being an owner)
- and the difficulty to reproduce it (e.g., an issue which needs to forge
  seemingly well-formed messages is less severe than an issue which only needs
  to tamper with a page URL)

We currently use two types of labels to compute the severity of an issue: the
type of attacker (depending on its rights on the targeted ressource) and the
type of attack (depending on what he can actually do).

### Types of attackers


| Label               | Description                                                      |
|:---                 |:---                                                              |
| attacker_guest      | The attacker doesn’t need to be logged-in to perform the attack. |
| attacker_view       | The attacker needs to have view right to perform the attack.     |
| attacker_edit       | Same as above but with edit rights.                              |
| attacker_registered | The attacker needs to be logged-in to perform the attack.        |
| attacker_admin      | The attacker can only perform the attack if he has physical access to the target device. |


### Types of attacks

| Label                | Description                                                               |
|:---                  |:---                                                                       |
| attack_stability     | Attacks that are related to targeting the host (e.g. DOS attack)          |
| attack_escalation    | Attacks that are related to permanently getting more rights               |
| attack_login         | Attacks that are related to login with another user identity              |
| attack_xss           | All attacks related to code injection                                     |
| attack_impersonation | Attacks that are related to using another people right to perform actions |
| attack_dataleak      | Attacks that are related to confidential data that might be retrieved in readonly: could be notification, but could also be CryptPad document that shouldn’t be viewable. |

### Severity

The severity of the security tickets should be computed using a **CVSS 4
calculator** such as <https://nvd.nist.gov/vuln-metrics/cvss/v4-calculator>.

Security issues are marked as “Critical” issues if the Common Vulnerability
Scoring System (CVSS) score is \>= 7, otherwise they are marked as “Major”.

A committer reviewing a security issue could decide to raise the
severity to “Critical” for a vulnerability with a CVSS score \< 7:

-   if there’s an high system impact
-   for another reason if there’s a strong argument for it, after
    discussing within available channels

Finally, as an exception, a security issue can be classified as
“Blocker” after discussing it within available channels, for example,
when the security issue is actively exploited.

### Best practices for computing CVSS

In general, it's good to refer to [the official
documentation](https://www.first.org/cvss/v4.0/specification-document#Base-Metrics)
for understanding CVSS, and to also look on [the
examples](https://www.first.org/cvss/v4.0/examples) to better understand the
different criteria.

Besides this, some best practices have been established for computing CVSS
specifically for CryptPad security issues.

#### Attack vector

It should always be Network. According to our [threat
model](https://blueprints.cryptpad.org/document/threatmodel/), the service
provider is assumed to be _honest-but-curious_, and is thus modeled as a
passive adversary.

#### Attack complexity

There are no specific best practice for this: the official definition and
examples should be used to define the value.

#### Attack requirements

There are no specific best practice for this: the official definition and
examples should be used to define the value.

#### Privileges Required

We defined the following mapping to apply the privileges required from CVSS
which is a very discretised scope, to the rights from CryptPad that is defined
with the access or not of some specific keys or seeds:

-   None: Apply for any vulnerability that might be done with Guest users or data leaking from a document for which the corresponding cryptographic keys are not available to the attacker;
-   Low: Apply for any vulnerability that might involve a user with partial access to a ressource (for example read-access to a document) managing to do more with it. This also applies for MFA bypass for instance, as they still require the credential of the target to be applicable;
-   High: Apply for any vulnerability that involves more right than previously stated (for instance administrator rights on the instance).

#### User Interaction

There are no specific best practice for this: the official definition and
examples should be used to define the value.

#### Confidentiality Impact

In case of gaining access to a document content without obtaining its (at least
viewing) keys from proper channels beforehand, the impact should be set to high.

For other cases the official definition and examples should be used to define
the value.

#### Integrity Impact

In case of being able to tamper a document content without first getting its
editing key from proper channels results in a high impact.

For other cases the official definition and examples should be used to define
the value.

#### Availability Impact

There are no specific best practice for this: the official definition and
examples should be used to define the value.

## How long does it take to fix a security issue?

There is no timeline to fix a security issue as it mostly depends on the other
priorities of the maintainers. However, as CryptPad is a product focused on
security, we do our best to give security issues a high priority depending on
their severity.

According to the above classification, the security team will be working on
blockers in priority, then critical and finally other security issues in this
order.

## When is a security issue considered as fixed?

Security issues are considered fixed only once it’s part of a CryptPad release
(or its CryptPad maintained components, as plugins or dependencies).

## Are security issues ever publicly disclosed?

Once the issue has been properly fixed and the fix has been released, a CVE is
published to publicly disclose about this issue and to encourage upgrading. The
CVE publication is mandatory for any security issues.

## How long does it take to publish a CVE?

Once an issue has been fixed and released, an embargo of at least 90 days is
starting to allow anyone working with CryptPad to perform actions before the
publication of the CVE. The embargo might be longer than 90 days, in which case
extending the embargo might be decided by the security team coordinated with the
security reporter.

For example, if a security issue has been fixed and released in 2026.2.1
released on March the 27th, the CVE could be published 90 days after the
release, i.e. June the 25th.

## How do I know if I need to upgrade?

The security issues fixed are not listed in the release notes for security
reasons.

The reason is the embargo period that is there to give CryptPad instance
administrators the time to upgrade their instance before the security issues are
made public and thus before attackers may start to attack CryptPad instances.

However, once made public, we communicate on those in our
[blog](https://blog.cryptpad.org/tags/security/), and when security fixes are
included in a release, we state in the release note that administrators should
upgrade as soon as possible.

## Vulnerabilities in CryptPad dependencies

CryptPad relies on some dependencies that are maintained by the CryptPad team:
- [chainpad](https://www.npmjs.com/package/chainpad)
- [chainpad-crypto](https://www.npmjs.com/package/chainpad-crypto)
- [chainpad-listmap](https://www.npmjs.com/package/chainpad-listmap)
- [chainpad-netflux](https://www.npmjs.com/package/chainpad-netflux)
- [chainpad-server](https://www.npmjs.com/package/chainpad-server)
- [hyper-json](https://www.npmjs.com/package/hyper-json)
- [netflux-websocket](https://www.npmjs.com/package/netflux-websocket)

As well as CryptPad plugins (for instance for
[SSO](https://github.com/cryptpad/sso) support).

Those repositories follow the same security policy as CryptPad and CVE and
issues will be reported in their own respective GitHub security advisories. As
such, severity evaluation and embargo period remains the same for all
CryptPad-managed products. Reporting, similarly, is also done through
[security@cryptpad.org](mailto:security@cryptpad.org).

## Security Advisory template and information

For global information of creating a Github advisory, you can consult the
official documentation:
<https://docs.github.com/en/code-security/security-advisories/repository-security-advisories/creating-a-repository-security-advisory>.

You can find below a template to use for the content of a new security advisory:

```md
### Impact

Describe here the impact of the vulnerability and provide information about the
versions of CryptPad impacted by it.

#### CVSS Score Computation Details

| Metric                            | Value                   | Comment        |
| --------------------------------- | ----------------------- | -------------- |
| Attack Vector                     | Network                 | Your comment.  |
| Attack Complexity                 | Low / High              | Your comment.  |
| Attack Requirements               | None / Present          | Your comment.  |
| Privileges Required               | None / Low / High       | Your comment.  |
| User Interaction                  | None / Passive / Active | Your comment.  |
| Vulnerable System Confidentiality | None / Low / High       | Your comment.  |
| Vulnerable System Integrity       | None / Low / High       | Your comment.  |
| Vulnerable System Availability    | None / Low / High       | Your comment.  |
| Subsequent System Confidentiality | None / Low / High       | Your comment.  |
| Subsequent System Integrity       | None / Low / High       | Your comment.  |
| Subsequent System Availability    | None / Low / High       | Your comment.  |

### Patches

Provide in the section the list of patched versions of CryptPad. You can also
provide some details about the patches.

### Workarounds

Provide information how to workaround the vulnerability when it's possible. If
not possible, inform that users should upgrade to get the fix.

### For more information

If you have any questions or comments about this advisory:
* Email us at [Security Mailbox](mailto:security@cryptpad.org)

### Attribution

You can specify here who reported the issue.
```

The versions set in the security advisory should follow the best practices
documented in
<https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/best-practices-for-writing-repository-security-advisories#affected-versions>.

The severity of the vulnerability should be assessed using CVSS, you can find
information and a calculator here to help you:
<https://nvd.nist.gov/vuln-metrics/cvss/v4-calculator>.
You should also try to find a Common Weakness Enumeration (CWE) corresponding to
the vulnerability. You can browse and search for the closest one using the
official website: <https://cwe.mitre.org/data/index.html>.

Finally, you should not forget to add “CryptPad” Github Team as collaborator of
your advisory to ensure that the intended people are able to see it.
