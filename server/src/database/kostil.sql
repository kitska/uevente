CREATE TYPE rights_enum AS ENUM ('owner', 'editor', 'viewer');

ALTER TABLE calendar_users
ADD COLUMN rights rights_enum NOT NULL DEFAULT 'viewer';

ALTER TABLE event_users
ADD COLUMN rights rights_enum NOT NULL DEFAULT 'viewer';