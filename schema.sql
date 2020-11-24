CREATEDB birding;

CREATE TABLE notes (id SERIAL PRIMARY KEY, -- index of entry
noted_date_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- the date and time, when the observation is made
birds_jizz TEXT, -- Appearance - overall impression of a bird's physical characteristics that can help pinpoint a proper identification, either by narrowing down options or directly leading to a specific species identification
noted_behavior TEXT, -- what the bird was doing as you observed it
flock_details TEXT, -- details of the flock like number of birds, gender balancing, mix of species
habitat_data TEXT -- Note plant life, water sources and vegetation conditions at the time of observation
 );