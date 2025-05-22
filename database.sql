CREATE TABLE module (
                        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                        name TEXT(255)
);

CREATE TABLE source_code (
                             id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                             module_id INTEGER DEFAULT (0) NOT NULL,
                             module_name TEXT(255),
                             keywords TEXT,
                             description TEXT
);