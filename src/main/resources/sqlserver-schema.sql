USE [SIS BASE];
GO



-- 1. Students Table
CREATE TABLE dbo.students (
    student_id VARCHAR(50) PRIMARY KEY,
    full_name NVARCHAR(150) NOT NULL,
    dob DATE NULL,
    class_grade VARCHAR(50) NULL
);
GO

-- 2. Exams Table
CREATE TABLE dbo.exams (
    exam_id VARCHAR(50) PRIMARY KEY,
    exam_name NVARCHAR(150) NOT NULL,
    term VARCHAR(50) NULL,
    academic_year VARCHAR(20) NULL,
    status VARCHAR(20) DEFAULT 'Active'
);
GO

-- 3. Subjects Table
CREATE TABLE dbo.subjects (
    subject_id VARCHAR(50) PRIMARY KEY,
    subject_name NVARCHAR(100) NOT NULL,
    teacher_name VARCHAR(150) NULL,
    teacher_qualification VARCHAR(150) NULL
);
GO

-- 4. Exam Results Table
CREATE TABLE dbo.exam_results (
    id INT IDENTITY(1,1) PRIMARY KEY,
    exam_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    marks FLOAT NULL,
    grade VARCHAR(10) NULL,
    remarks VARCHAR(100) NULL,

    -- Foreign Keys
    CONSTRAINT FK_result_exam FOREIGN KEY (exam_id) REFERENCES dbo.exams(exam_id) ON DELETE CASCADE,
    CONSTRAINT FK_result_student FOREIGN KEY (student_id) REFERENCES dbo.students(student_id) ON DELETE CASCADE,
    CONSTRAINT FK_result_subject FOREIGN KEY (subject_id) REFERENCES dbo.subjects(subject_id) ON DELETE CASCADE,

    -- Composite Unique Constraint
    CONSTRAINT UQ_exam_student_subject UNIQUE (exam_id, student_id, subject_id)
);
GO



SELECT * FROM subjects;
SELECT * FROM exam_results;


SELECT * FROM students;
SELECT * FROM exams;

SELECT * FROM students;
SELECT * FROM exams;

SELECT * FROM exam_results;

DELETE FROM  dbo.students WHERE student_id ='sd001' ;


INSERT INTO dbo.students(student_id,full_name,dob,class_grade)
VALUES
('001','chamindu Dilshan','02-06-26','GRADE-11');
