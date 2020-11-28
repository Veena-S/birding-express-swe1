CREATEDB birding;

CREATE TABLE notes (id SERIAL PRIMARY KEY, -- index of entry
noted_date_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- the date and time, when the observation is made
birds_jizz TEXT, -- Appearance - overall impression of a bird's physical characteristics that can help pinpoint a proper identification, either by narrowing down options or directly leading to a specific species identification
noted_behavior TEXT, -- what the bird was doing as you observed it
flock_details TEXT, -- details of the flock like number of birds, gender balancing, mix of species
habitat_data TEXT, -- Note plant life, water sources and vegetation conditions at the time of observation
user_id INTEGER,
species_id INTEGER
 );

 CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT, password TEXT, username TEXT);

 ALTER TABLE notes ADD COLUMN user_id INTEGER;

 -- 3.PCE.7: Bird Watching Species

 CREATE TABLE species (id SERIAL PRIMARY KEY, name TEXT, scientific_name TEXT);


 ALTER TABLE notes ADD COLUMN species_id INTEGER;

 CREATE TABLE bird_behaviours (id SERIAL PRIMARY KEY, behaviour TEXT);

 CREATE TABLE notes_behaviours(id SERIAL PRIMARY KEY, notes_id INTEGER, behaviour_id INTEGER);

CREATE TABLE user_comments (id SERIAL PRIMARY KEY, user_id INTEGER, notes_id INTEGER, comments TEXT, comment_date DATE DEFAULT CURRENT_DATE);