package schoolInformationsystem.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import schoolInformationsystem.demo.model.Exam;
import schoolInformationsystem.demo.model.Student;
import schoolInformationsystem.demo.model.Subject;
import schoolInformationsystem.demo.repository.ExamRepository;
import schoolInformationsystem.demo.repository.StudentRepository;
import schoolInformationsystem.demo.repository.SubjectRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public DataInitializer(ExamRepository examRepository,
                           StudentRepository studentRepository,
                           SubjectRepository subjectRepository) {
        this.examRepository = examRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initial Exams
        if (examRepository.count() == 0) {
            examRepository.save(new Exam("EX-101", "Mid-Year Assessment 2026", "Term 02"));
            examRepository.save(new Exam("EX-102", "First Term Evaluation", "Term 01"));
        }

        // Initial Subjects
        if (subjectRepository.count() == 0) {
            subjectRepository.save(new Subject("SUB-01", "Mathematics", "Mr. K. Perera", "B.Sc. Mathematics, PGDE"));
            subjectRepository.save(new Subject("SUB-02", "Science", "Mrs. S. Silva", "B.Sc. Biological Science"));
            subjectRepository.save(new Subject("SUB-03", "English Language", "Ms. A. Fernando", "BA in English Linguistics"));
            subjectRepository.save(new Subject("SUB-04", "Information Technology", "Mr. D. Wickramasinghe", "B.Sc. Computer Science"));
        }

        // Initial Students
        if (studentRepository.count() == 0) {
            studentRepository.save(new Student("ST-2024-001", "Kasun Bandara", "Grade 10 - Class A", "2009-04-14"));
            studentRepository.save(new Student("ST-2024-002", "Nimali Fonseka", "Grade 10 - Class A", "2009-08-22"));
            studentRepository.save(new Student("ST-2024-003", "Sandun Perera", "Grade 10 - Class A", "2009-01-10"));
            studentRepository.save(new Student("ST-2024-004", "Dinithi Jayasinghe", "Grade 10 - Class A", "2009-11-05"));
        }
    }
}