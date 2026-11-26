ALTER TABLE students ADD COLUMN announcement_id INTEGER CHECK (announcement_id > 0);
CREATE UNIQUE INDEX students_display_name ON students(name);

UPDATE students SET announcement_id = 212 WHERE id = 'tsukuyo';
UPDATE students SET announcement_id = 613 WHERE id = 'tsukuyo-dress';
