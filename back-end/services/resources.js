export function removeResourceLink(db, link) {
  db.run('DELETE FROM resource_links WHERE id=?',link.id);
  db.run('DELETE FROM resources WHERE id=? AND NOT EXISTS(SELECT 1 FROM resource_links WHERE resource=?)',link.resource,link.resource);
}
