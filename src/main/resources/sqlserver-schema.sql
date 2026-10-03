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



CREATE TABLE dbo.student_subjects (
    student_id VARCHAR(50) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (student_id, subject_id),
    FOREIGN KEY (student_id) REFERENCES dbo.students(student_id),
    FOREIGN KEY (subject_id) REFERENCES dbo.subjects(subject_id)
);
GO



SELECT * FROM subjects;
SELECT * FROM exam_results;


SELECT * FROM students;
SELECT * FROM exams;

SELECT * FROM students;
SELECT * FROM exams;

SELECT * FROM exam_results;

INSERT INTO dbo.students (student_id, full_name, dob, class_grade) VALUES
('001', 'Chamindu Dilshan', '2010-06-26', 'GRADE-11'),
('002', 'Kavindu Madushan', '2010-03-14', 'GRADE-11'),
('003', 'Thisara Perera', '2009-11-22', 'GRADE-11'),
('004', 'Nimesh Tharaka', '2011-01-15', 'GRADE-11'),
('005', 'Sachintha Lakshan', '2010-07-09', 'GRADE-11'),
('006', 'Dulan Sandeepa', '2010-05-18', 'GRADE-11'),
('007', 'Kasun Kalhara', '2009-08-30', 'GRADE-11'),
('008', 'Pathum Nissanka', '2010-12-04', 'GRADE-11'),
('009', 'Charith Asalanka', '2011-04-19', 'GRADE-10'),
('010', 'Wanindu Hasaranga', '2009-10-11', 'GRADE-10'),
('011', 'Minod Bhanuka', '2010-02-27', 'GRADE-10'),
('012', 'Avishka Fernando', '2011-09-05', 'GRADE-10'),
('013', 'Danushka Gunathilaka', '2009-06-17', 'GRADE-10'),
('014', 'Bhanuka Rajapaksa', '2010-08-21', 'GRADE-10'),
('015', 'Kusal Mendis', '2011-03-12', 'GRADE-10'),
('016', 'Lahiru Kumara', '2010-11-03', 'GRADE-10'),
('017', 'Nuwan Pradeep', '2009-12-29', 'GRADE-9'),
('018', 'Dushmantha Chameera', '2010-01-08', 'GRADE-9'),
('019', 'Maheesh Theekshana', '2011-07-24', 'GRADE-9'),
('020', 'Matheesha Pathirana', '2011-05-31', 'GRADE-9'),
('021', 'Dunith Wellalage', '2011-08-14', 'GRADE-9'),
('022', 'Kamindu Mendis', '2010-09-19', 'GRADE-9'),
('023', 'Sahan Arachchige', '2009-04-25', 'GRADE-9'),
('024', 'Dilshan Madushanka', '2010-10-02', 'GRADE-8'),
('025', 'Pramod Madushan', '2009-07-16', 'GRADE-8'),
('026', 'Asitha Fernando', '2010-04-06', 'GRADE-8'),
('027', 'Nuwanidu Fernando', '2011-02-18', 'GRADE-7'),
('028', 'Janith Liyanage', '2010-12-13', 'GRADE-7'),
('029', 'Vijayakanth Viyaskanth', '2011-06-07', 'GRADE-7'),
('030', 'Ramesh Mendis', '2009-09-28', 'GRADE-7'),
('031', 'Praveen Jayawickrama', '2010-03-01', 'GRADE-7'),
('032', 'Lakshan Sandakan', '2009-05-14', 'GRADE-7'),
('033', 'Binura Fernando', '2010-06-22', 'GRADE-7'),
('034', 'Chamika Karunaratne', '2009-11-08', 'GRADE-7'),
('035', 'Dasun Shanaka', '2009-03-19', 'GRADE-6'),
('036', 'Angelo Mathews', '2009-02-10', 'GRADE-6'),
('037', 'Dinesh Chandimal', '2009-01-27', 'GRADE-6'),
('038', 'Dimuth Karunaratne', '2009-04-03', 'GRADE-6'),
('039', 'Suranga Lakmal', '2009-06-11', 'GRADE-6'),
('040', 'Isuru Udana', '2009-08-04', 'GRADE-6'),
('041', 'Oshada Fernando', '2010-05-26', 'GRADE-6'),
('042', 'Vishwa Fernando', '2010-02-14', 'GRADE-6'),
('043', 'Kasun Rajitha', '2009-10-23', 'GRADE-6'),
('044', 'Ashen Bandara', '2011-03-30', 'GRADE-6'),
('045', 'Minod Bhanuka Silva', '2011-10-17', 'GRADE-6'),
('046', 'Shehan Jayasuriya', '2009-12-05', 'GRADE-6'),
('047', 'Milinda Siriwardana', '2009-07-21', 'GRADE-6'),
('048', 'Seekkuge Prasanna', '2009-09-12', 'GRADE-6'),
('049', 'Jeevan Mendis', '2009-01-18', 'GRADE-5'),
('050', 'Dilruwan Perera', '2009-04-15', 'GRADE-5'),
('051', 'Tharindu Kaushal', '2010-11-20', 'GRADE-5'),
('052', 'Jeffrey Vandersay', '2009-08-11', 'GRADE-5'),
('053', 'Amila Aponso', '2010-01-29', 'GRADE-5'),
('054', 'Chaturanga de Silva', '2010-07-04', 'GRADE-5'),
('055', 'Niroshan Dickwella', '2009-06-23', 'GRADE-5'),
('056', 'Kusal Janith Perera', '2009-08-17', 'GRADE-5'),
('057', 'Sadeera Samarawickrama', '2010-08-30', 'GRADE-5'),
('058', 'Roshen Silva', '2009-11-14', 'GRADE-5'),
('059', 'Malinda Pushpakumara', '2009-03-24', 'GRADE-5'),
('060', 'Vimukthi Perera', '2011-04-08', 'GRADE-5'),
('061', 'Anuk Fernando', '2011-06-19', 'GRADE-4'),
('062', 'Hashan Dumindu', '2011-01-23', 'GRADE-4'),
('063', 'Priyamal Perera', '2010-05-12', 'GRADE-4'),
('064', 'Charith Sudaraka', '2011-08-27', 'GRADE-4'),
('065', 'Navod Paranavithana', '2011-05-16', 'GRADE-4'),
('066', 'Kamil Mishara', '2011-07-01', 'GRADE-4'),
('067', 'Ahan Wickramasinghe', '2011-09-22', 'GRADE-4'),
('068', 'Sonal Dinusha', '2011-12-08', 'GRADE-4'),
('069', 'Raveen de Silva', '2011-10-30', 'GRADE-4'),
('070', 'Chamindu Wickramasinghe', '2011-02-14', 'GRADE-4'),
('071', 'Dunith Nethmika', '2011-11-11', 'GRADE-4'),
('072', 'Shevon Daniel', '2011-03-15', 'GRADE-4'),
('073', 'Pawan Pathiraja', '2011-04-26', 'GRADE-4'),
('074', 'Sadisha Rajapaksa', '2011-06-30', 'GRADE-4'),
('075', 'Ranuda Somarathne', '2011-08-09', 'GRADE-4'),
('076', 'Wanuja Sahan', '2011-05-04', 'GRADE-4'),
('077', 'Treveen Mathew', '2011-07-18', 'GRADE-3'),
('078', 'Malsha Tharupathi', '2012-01-05', 'GRADE-3'),
('079', 'Sineth Jayawardena', '2012-02-12', 'GRADE-3'),
('080', 'Dinura Kalupahana', '2011-12-20', 'GRADE-3'),
('081', 'Rusanda Gamage', '2011-09-14', 'GRADE-3'),
('082', 'Hirantha Jayasinghe', '2010-03-18', 'GRADE-3'),
('083', 'Supun Waduge', '2010-06-09', 'GRADE-3'),
('084', 'Garuka Sanketh', '2011-11-25', 'GRADE-3'),
('085', 'Vishen Halambage', '2011-04-02', 'GRADE-3'),
('086', 'Pulindu Perera', '2011-08-16', 'GRADE-3'),
('087', 'Ruvishan Perera', '2011-10-05', 'GRADE-3'),
('088', 'Sharujan Shanmuganathan', '2011-12-14', 'GRADE-2'),
('089', 'Vihas Thewmika', '2011-07-28', 'GRADE-2'),
('090', 'Kaveen Fernando', '2010-02-09', 'GRADE-2'),
('091', 'Senura Silva', '2010-05-15', 'GRADE-2'),
('092', 'Chathura Randunu', '2010-09-04', 'GRADE-2'),
('093', 'Gayan Maneeshan', '2010-11-19', 'GRADE-2'),
('094', 'Tharindu Rathnayake', '2009-04-12', 'GRADE-2'),
('095', 'Sithara Gimhana', '2010-01-22', 'GRADE-2'),
('096', 'Mohamed Shamaaz', '2010-08-08', 'GRADE-2'),
('097', 'Avishka Perera', '2010-10-31', 'GRADE-12'),
('098', 'Muditha Lakshan', '2010-07-20', 'GRADE-13'),
('099', 'Nipun Dananjaya', '2010-03-27', 'GRADE-13'),
('100', 'Nuwanidu Kaveeshwara', '2010-12-01', 'GRADE-12');
;
