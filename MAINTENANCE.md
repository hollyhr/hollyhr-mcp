# Maintenance

## Ownership

Paul Gould (`@paulgould`) is the accountable maintainer and CODEOWNER. Issues
are enabled for setup, compatibility and discovery reports.

If the repository receives no human review or public-contract change for 90
days, the maintainer must record a current review, name a replacement owner or
mark the repository as unmaintained. Automated dependency or scheduled-check
activity does not count as human maintenance.

## Review cadence

- Weekly automation validates the checked-in identity, Cursor plugin package
  and README contract.
- Monthly human review checks the live official Registry entry, hosted endpoint,
  developer documentation, plan/scopes posture and linked directory profiles.
- Every MCP contract, endpoint, version, authentication or write-posture change
  triggers an immediate review rather than waiting for the monthly cadence.

The review date is evidenced by a merged pull request, release or dated issue.

## Version policy

`server.json` mirrors the latest active official MCP Registry record. Change its
version only when publishing that same version to the Registry; a documentation
edit alone does not create a server release.

Registry versions are immutable public discovery snapshots. A changed endpoint,
capability description or incompatible contract requires a deliberate new
version, published first-party and then verified through Registry readback.

External directories may lag or apply their own test and verification state.
Record those states accurately without treating ingestion as ownership, testing
as approval, or a pending submission as a listing.

The Cursor plugin version is independent of the hosted MCP Registry version.
Increment `.cursor-plugin/plugin.json` only when the installable package or its
user-facing setup contract changes, record the change in `CHANGELOG.md`, and
request Marketplace re-indexing only from a merged default-branch commit.

Keep these states separate in release evidence: repository package, local
Cursor or Grok Bot qualification, Marketplace submission, provider approval,
public listing and end-user adoption. A successful OAuth connection is not a
Marketplace approval, and a submitted repository is not yet a listing.
