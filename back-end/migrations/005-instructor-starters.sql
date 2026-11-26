-- Existing installations gain starter courses without changing original ownership.
CREATE TEMP TABLE starter_courses AS
SELECT c.id source,u.id owner,(SELECT coalesce(max(id),0) FROM courses)+row_number() OVER (ORDER BY u.id) target
FROM (SELECT id FROM users WHERE role='instructor' AND status='approved' ORDER BY id LIMIT 2) u
JOIN courses c ON c.id=(SELECT id FROM courses WHERE state='published' ORDER BY id LIMIT 1)
WHERE NOT EXISTS(SELECT 1 FROM courses owned WHERE owned.owner=u.id);
INSERT INTO courses(id,owner,title,description,outcomes,difficulty,prerequisites,policy,state)
SELECT m.target,m.owner,c.title,c.description,c.outcomes,c.difficulty,c.prerequisites,c.policy,c.state FROM starter_courses m JOIN courses c ON c.id=m.source;
INSERT INTO lessons(course,module,title,body,position)
SELECT m.target,l.module,l.title,l.body,l.position FROM starter_courses m JOIN lessons l ON l.course=m.source;
INSERT INTO resource_links(resource,kind,target)
SELECT r.resource,'course',m.target FROM starter_courses m JOIN resource_links r ON r.kind='course' AND r.target=m.source;
INSERT INTO resource_links(resource,kind,target)
SELECT r.resource,'lesson',new.id FROM starter_courses m JOIN lessons old ON old.course=m.source
JOIN lessons new ON new.course=m.target AND new.position=old.position JOIN resource_links r ON r.kind='lesson' AND r.target=old.id;
DROP TABLE starter_courses;
