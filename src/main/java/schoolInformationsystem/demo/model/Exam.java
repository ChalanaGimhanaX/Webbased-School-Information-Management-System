package schoolInformationsystem.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "exams")

// This class represents an Exam entity in the school information system. It contains fields for exam ID, exam name, and term, along with their corresponding getters and setters. The class is annotated with JPA annotations to map it to a database table named "exams".
public class Exam {

    @Id
    @Column(name = "exam_id", nullable = false, unique = true)
    private String examId;

    @Column(name = "exam_name", nullable = false)
    private String examName;

    @Column(name = "term", nullable = false)
    private String term;

    public Exam() {
    }

    public Exam(String examId, String examName, String term) {
        this.examId = examId;
        this.examName = examName;
        this.term = term;
    }

    public String getExamId() {
        return examId;
    }

    public void setExamId(String examId) {
        this.examId = examId;
    }

    public String getExamName() {
        return examName;
    }

    public void setExamName(String examName) {
        this.examName = examName;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }
}