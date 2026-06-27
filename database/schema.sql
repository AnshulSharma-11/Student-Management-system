
CREATE DATABASE student_management;
USE student_management;


CREATE TABLE IF NOT EXISTS students (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(100)    NOT NULL,
    last_name   VARCHAR(100)    NOT NULL,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    phone       VARCHAR(20),
    date_of_birth DATE,
    gender      ENUM('Male', 'Female', 'Other'),
    address     TEXT,
    enrolled_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    
    INDEX idx_email       (email),
    INDEX idx_name        (last_name, first_name),
    INDEX idx_enrolled_at (enrolled_at)
);


CREATE TABLE subjects (
    id         SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150) NOT NULL UNIQUE,
    code       VARCHAR(20)  NOT NULL UNIQUE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);


INSERT IGNORE INTO subjects (name, code) VALUES
    ('Mathematics',          'MATH101'),
    ('Physics',              'PHY101'),
    ('Chemistry',            'CHEM101'),
    ('English',              'ENG101'),
    ('Computer Science',     'CS101'),
    ('History',              'HIST101'),
    ('Geography',            'GEO101'),
    ('Biology',              'BIO101');

CREATE TABLE  marks (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id  INT UNSIGNED    NOT NULL,
    subject_id  SMALLINT UNSIGNED NOT NULL,
    exam_type   ENUM('Midterm', 'Final', 'Quiz', 'Assignment') NOT NULL DEFAULT 'Final',
    marks       DECIMAL(5, 2)   NOT NULL CHECK (marks >= 0 AND marks <= 100),
    max_marks   DECIMAL(5, 2)   NOT NULL DEFAULT 100.00 CHECK (max_marks > 0),
    exam_date   DATE,
    remarks     VARCHAR(255),
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,


    CONSTRAINT fk_marks_student
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_marks_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT ON UPDATE CASCADE,


    UNIQUE KEY uq_student_subject_exam (student_id, subject_id, exam_type),


    INDEX idx_student_id (student_id),
    INDEX idx_subject_id (subject_id)
);

CREATE OR REPLACE VIEW student_summary AS
SELECT
    s.id,
    s.first_name,
    s.last_name,
    s.email,
    s.phone,
    s.date_of_birth,
    s.gender,
    s.enrolled_at,
    COUNT(m.id)                        AS total_marks_entries,
    ROUND(AVG(m.marks / m.max_marks * 100), 2) AS average_percentage
FROM students s
LEFT JOIN marks m ON m.student_id = s.id
GROUP BY s.id, s.first_name, s.last_name, s.email, s.phone, s.date_of_birth, s.gender, s.enrolled_at;
