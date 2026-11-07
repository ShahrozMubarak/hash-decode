CREATE TRIGGER date_projects_insert AFTER INSERT ON projects
BEGIN
 INSERT INTO settings(id,value) VALUES ('modified:'||'/',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||'/portfolio',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||'/portfolio/'||NEW.slug,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
END;
--> statement-breakpoint
CREATE TRIGGER date_posts_insert AFTER INSERT ON studio_content
BEGIN
 INSERT INTO settings(id,value) VALUES ('modified:'||CASE NEW.kind WHEN 'post' THEN '/blog' WHEN 'team' THEN '/about' ELSE '/' END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
END;
--> statement-breakpoint
CREATE TRIGGER date_settings_insert AFTER INSERT ON settings WHEN NEW.id IN ('connections','public')
BEGIN
 INSERT INTO settings(id,value) VALUES ('modified:'||'/',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||CASE NEW.id WHEN 'connections' THEN '/contact' ELSE '/about' END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
END;
--> statement-breakpoint
CREATE TRIGGER date_projects_update AFTER UPDATE ON projects
BEGIN
 INSERT INTO settings(id,value) VALUES ('modified:'||'/',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||'/portfolio',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||'/portfolio/'||NEW.slug,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
END;
--> statement-breakpoint
CREATE TRIGGER date_posts_update AFTER UPDATE ON studio_content
BEGIN
 INSERT INTO settings(id,value) VALUES ('modified:'||CASE NEW.kind WHEN 'post' THEN '/blog' WHEN 'team' THEN '/about' ELSE '/' END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
END;
--> statement-breakpoint
CREATE TRIGGER date_settings_update AFTER UPDATE ON settings WHEN NEW.id IN ('connections','public')
BEGIN
 INSERT INTO settings(id,value) VALUES ('modified:'||'/',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||CASE NEW.id WHEN 'connections' THEN '/contact' ELSE '/about' END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
END;
--> statement-breakpoint
CREATE TRIGGER date_projects_delete AFTER DELETE ON projects
BEGIN
 INSERT INTO settings(id,value) VALUES ('modified:'||'/',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||'/portfolio',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||'/portfolio/'||OLD.slug,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
END;
--> statement-breakpoint
CREATE TRIGGER date_posts_delete AFTER DELETE ON studio_content
BEGIN
 INSERT INTO settings(id,value) VALUES ('modified:'||CASE OLD.kind WHEN 'post' THEN '/blog' WHEN 'team' THEN '/about' ELSE '/' END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
END;
--> statement-breakpoint
CREATE TRIGGER date_settings_delete AFTER DELETE ON settings WHEN OLD.id IN ('connections','public')
BEGIN
 INSERT INTO settings(id,value) VALUES ('modified:'||'/',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||CASE OLD.id WHEN 'connections' THEN '/contact' ELSE '/about' END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
END;
