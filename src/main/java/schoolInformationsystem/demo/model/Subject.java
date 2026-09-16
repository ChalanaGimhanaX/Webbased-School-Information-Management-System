package schoolInformationsystem.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @Column(name = "subject_id", nullable = false, unique = true)
    private String subjectId;

    @Column(name = "subject_name", nullable = false)
    private String subjectName;

    @Column(name = "teacher_name")
    private String teacherName;

    @Column(name = "teacher_qualification")
    private String teacherQualification;

    public Subject() {
    }

    public Subject(String subjectId, String subjectName, String teacherName, String teacherQualification) {
        this.subjectId = subjectId;
        this.subjectName = subjectName;
        this.teacherName = teacherName;
        this.teacherQualification = teacherQualification;
    }

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getTeacherQualification() {
        return teacherQualification;
    }

    public void setTeacherQualification(String teacherQualification) {
        this.teacherQualification = teacherQualification;
    }
}