# Security Policy

## Reporting a vulnerability

**Please don't open a public issue.**

Use GitHub's [private vulnerability reporting](https://github.com/Feli-dev/colorsitos/security/advisories/new),
which notifies the maintainer without disclosing the details.

Include what you can: what an attacker could do, how to reproduce it, and the affected version or
commit. A rough report sent privately is better than a polished one sent publicly.

You'll get an acknowledgement as soon as it's seen. This is a small project maintained in spare time,
so please don't expect a same-day fix — but you will get an honest answer about whether and when.

## Supported versions

The `main` branch. This is a deployed application rather than a released library, so there are no
maintained older versions.

## Known accepted risks

`npm audit` currently reports advisories in `postcss` and `sharp`, both reached through Next.js. They
are **not fixable at this version**: Next pins `postcss` at an exact version below the patched one,
and the only remedy `npm audit` offers is a semver-major move to Next 16.

Both are build-time issues — path traversal while reading source maps, and libvips CVEs in image
processing — rather than request-path vulnerabilities in the deployed app. They are tracked in
[#39](https://github.com/Feli-dev/colorsitos/issues/39) and documented rather than silently carried.
