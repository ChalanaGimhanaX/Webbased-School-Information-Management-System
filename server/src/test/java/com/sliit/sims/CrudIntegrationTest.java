// Group Project Integration Suite - Team: IT25100975, IT25102861, IT25101863, IT25103724, IT25101913, IT25103710
package com.sliit.sims;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sliit.sims.common.auth.jwt.JwtTokenProvider;
import com.sliit.sims.common.auth.repository.UserRepository;
import com.sliit.sims.fee.FeePaymentDataSeeder;
import com.sliit.sims.student.repository.StudentRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:crud;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa",
        "spring.datasource.password=", "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop", "logging.level.org.springframework=INFO", "logging.level.org.hibernate=INFO"})
@AutoConfigureMockMvc
@Transactional
class CrudIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtTokenProvider tokens;
    @Autowired UserRepository users;
    @Autowired StudentRepository students;
    @Autowired EntityManager entityManager;
    @MockBean FeePaymentDataSeeder feeSeeder;

    private String token(String username) { return tokens.generateToken(users.findByUsername(username).orElseThrow()); }
    private JsonNode call(String method, String path, Object body) throws Exception {
        var request = request(HttpMethod.valueOf(method), "/api/v1" + path).header("Authorization", "Bearer " + token("admin"));
        if (body != null) request.contentType("application/json").content(json.writeValueAsString(body));
        String response = mvc.perform(request).andExpect(status().is2xxSuccessful()).andReturn().getResponse().getContentAsString();
        entityManager.flush();
        return response.isEmpty() ? json.nullNode() : json.readTree(response);
    }
    private long createClass() throws Exception {
        return call("POST", "/students/classes", Map.of("className","CRUD-A","gradeLevel",10,"academicYear",2026,"capacity",30)).get("id").asLong();
    }
    private long createStudent(long classId) throws Exception {
        return call("POST", "/students", Map.of("admissionNumber","CRUD-001","firstName","Test","lastName","Student","dob","2010-01-01","gender","MALE","initialClassId",classId)).get("id").asLong();
    }
    private long createTeacher() throws Exception {
        return call("POST", "/teachers", Map.of("employeeNumber","CRUD-T1","firstName","Test","lastName","Teacher")).get("id").asLong();
    }

    @Test void classAllocationRemovalAndStudentDeactivationPreserveRecord() throws Exception {
        long classId = createClass();
        long studentId = createStudent(classId);
        call("PUT", "/students/classes/" + classId, Map.of("className","CRUD-B","gradeLevel",10,"academicYear",2026,"capacity",31));
        call("DELETE", "/students/" + studentId + "/allocation?year=2026", null);
        assertTrue(call("GET", "/students/class/" + classId, null).isEmpty());
        call("DELETE", "/students/" + studentId, null);
        assertFalse(students.findById(studentId).orElseThrow().getActive());
        assertTrue(call("GET", "/students", null).isEmpty());
    }

    @Test void teacherAssignmentsCanBeCorrectedAndRemoved() throws Exception {
        long classId = createClass();
        long teacherId = createTeacher();
        long subjectId = call("POST", "/teachers/subjects", Map.of("subjectCode","CRUD-S1","subjectName","Science","gradeLevel",10)).get("id").asLong();
        call("POST", "/teachers/assign-subject", Map.of("teacherId",teacherId,"subjectId",subjectId,"classId",classId,"academicYear",2026));
        long assignmentId = call("GET", "/teachers/"+teacherId+"/assignments", null).get(0).get("id").asLong();
        call("PUT", "/teachers/"+teacherId+"/assignments/"+assignmentId, Map.of("teacherId",teacherId,"subjectId",subjectId,"classId",classId,"academicYear",2026));
        call("DELETE", "/teachers/"+teacherId+"/assignments/"+assignmentId, null);
        assertTrue(call("GET", "/teachers/"+teacherId+"/assignments", null).isEmpty());
        call("DELETE", "/teachers/"+teacherId, null);
        assertEquals("INACTIVE",call("GET", "/teachers/"+teacherId,null).get("status").asText());
    }

    @Test void attendanceCorrectionsAndIndividualDeletionPersist() throws Exception {
        long classId = createClass();
        long studentId = createStudent(classId);
        long teacherId = createTeacher();
        Map<String,Object> body = new java.util.HashMap<>(Map.of("classId",classId,"teacherId",teacherId,"academicYear",2026,"attendanceDate","2026-09-18",
                "entries",List.of(Map.of("studentId",studentId,"status","ABSENT","remarks","Unwell"))));
        long recordId = call("POST", "/attendance",body).get("id").asLong();
        body.put("entries",List.of(Map.of("studentId",studentId,"status","EXCUSED","remarks","Medical note")));
        call("POST", "/attendance",body);
        entityManager.clear();
        assertEquals("Medical note",call("GET", "/attendance/class/"+classId+"?date=2026-09-18",null).get("entries").get(0).get("remarks").asText());
        call("DELETE", "/attendance/"+recordId+"/students/"+studentId,null);
        assertTrue(call("GET", "/attendance/class/"+classId+"?date=2026-09-18",null).get("entries").isEmpty());
        call("DELETE", "/attendance/"+recordId,null);
    }

    @Test void examinationDeletionRemovesDependentResults() throws Exception {
        long examId = call("POST", "/exams",Map.of("examName","CRUD exam","term",1,"academicYear",2026)).get("id").asLong();
        long paperId = call("POST", "/exams/papers",Map.of("examId",examId,"subjectId",1,"gradeLevel",10,"maxMarks",100)).get("id").asLong();
        call("PUT", "/exams/papers/"+paperId,Map.of("examId",examId,"subjectId",1,"gradeLevel",10,"maxMarks",50));
        call("POST", "/exams/marks",Map.of("examPaperId",paperId,"marks",List.of(Map.of("studentId",1,"marksObtained",45))));
        assertEquals("A+",call("GET", "/exams/papers/"+paperId+"/results",null).get(0).get("grade").asText());
        call("PUT", "/exams/"+examId,Map.of("examName","Corrected exam"));
        call("DELETE", "/exams/"+examId,null);
        assertTrue(call("GET", "/exams/papers/"+paperId+"/results",null).isEmpty());
    }

    @Test void studentCannotMutateAndAcademicHeadCannotChangeFees() throws Exception {
        mvc.perform(delete("/api/v1/exams/1").header("Authorization","Bearer "+token("student1"))).andExpect(status().isForbidden());
        mvc.perform(delete("/api/v1/fees/accounts/1").header("Authorization","Bearer "+token("head_academic"))).andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/auth/register").contentType("application/json").content("{}")).andExpect(status().isForbidden());
    }
}
