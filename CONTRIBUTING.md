# Contributing

Use the module assignments in `docs/team-responsibilities.json`. Root npm
workspaces share the root lockfile. Run setup/build, relevant domain tests,
submission verification, and real-backend browser checks before proposing a
change. Describe checks actually run and any failures or untested workflows.

Commit actual contributions using the contributor's authorized, GitHub-linked
email. Push authentication is independent of commit authorship. Shared review
does not by itself establish authorship; record substantive co-authorship when
appropriate. Preserve existing commits and avoid empty attribution-only commits.
Changes on a review branch appear in the default-branch contribution graph only
after they reach the default branch under GitHub's counting rules.

Never commit actual .env files, tokens, production databases, uploaded user media
or generated dependency/build trees. Root .env.example and intentional bundled
teaching fixtures are maintained sources. The legacy directory is historical;
keep current documentation outside it.
