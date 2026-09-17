-- MySQL dump 10.13  Distrib 8.4.11, for Linux (x86_64)
--
-- Host: localhost    Database: sim_system_db
-- ------------------------------------------------------
-- Server version	8.4.11-0ubuntu0.26.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `academic_classes`
--

DROP TABLE IF EXISTS `academic_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_classes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `grade_level` int NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `academic_year` int NOT NULL,
  `capacity` int DEFAULT '40',
  `class_teacher_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_class_year` (`grade_level`,`class_name`,`academic_year`),
  UNIQUE KEY `UKj1cfjjrmiwlgp0ilsa1s28ac9` (`grade_level`,`class_name`,`academic_year`),
  KEY `fk_classes_teacher` (`class_teacher_id`),
  CONSTRAINT `fk_classes_teacher` FOREIGN KEY (`class_teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_classes`
--

LOCK TABLES `academic_classes` WRITE;
/*!40000 ALTER TABLE `academic_classes` DISABLE KEYS */;
INSERT INTO `academic_classes` VALUES (1,10,'Grade 10-A',2026,35,1,'2026-09-17 16:15:58'),(2,10,'Grade 10-B',2026,35,2,'2026-09-17 16:15:58'),(3,11,'Grade 11-A',2026,35,3,'2026-09-17 16:15:58'),(4,11,'Grade 11-B',2026,35,5,'2026-09-17 16:15:58'),(5,12,'GRADE 12-TEST',2026,40,1,'2026-09-17 18:07:34'),(6,13,'GRADE 13-668906',2026,30,NULL,'2026-09-17 18:15:34');
/*!40000 ALTER TABLE `academic_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_entries`
--

DROP TABLE IF EXISTS `attendance_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attendance_record_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `status` enum('PRESENT','ABSENT','LATE') NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_record_student` (`attendance_record_id`,`student_id`),
  UNIQUE KEY `UKladquk7aq6e7cbcg1tkkxepq6` (`attendance_record_id`,`student_id`),
  KEY `idx_att_entry_student` (`student_id`),
  CONSTRAINT `fk_att_entry_record` FOREIGN KEY (`attendance_record_id`) REFERENCES `attendance_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_entry_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_entries`
--

LOCK TABLES `attendance_entries` WRITE;
/*!40000 ALTER TABLE `attendance_entries` DISABLE KEYS */;
INSERT INTO `attendance_entries` VALUES (1,1,1,'PRESENT','On time'),(2,1,2,'PRESENT','On time'),(3,1,3,'LATE','Arrived 15 mins late'),(4,2,1,'PRESENT','On time'),(5,2,2,'ABSENT','Medical leave'),(6,2,3,'PRESENT','On time'),(7,3,1,'PRESENT','On time'),(8,3,2,'PRESENT','On time'),(9,3,3,'PRESENT','On time'),(10,4,6,'LATE',''),(11,4,7,'ABSENT',''),(13,5,1,'PRESENT','Retest'),(14,5,2,'ABSENT','Retest'),(15,5,3,'LATE','Retest'),(17,6,1,'PRESENT','Run 668906'),(18,6,2,'ABSENT','Run 668906'),(19,6,3,'LATE','Run 668906');
/*!40000 ALTER TABLE `attendance_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `class_id` bigint NOT NULL,
  `teacher_id` bigint NOT NULL,
  `attendance_date` date NOT NULL,
  `academic_year` int NOT NULL,
  `is_locked` tinyint(1) DEFAULT '0',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_class_date` (`class_id`,`attendance_date`),
  UNIQUE KEY `UKelum0v503ojlxmvqu057jxnyp` (`class_id`,`attendance_date`),
  KEY `fk_att_record_teacher` (`teacher_id`),
  CONSTRAINT `fk_att_record_class` FOREIGN KEY (`class_id`) REFERENCES `academic_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_record_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
INSERT INTO `attendance_records` VALUES (1,1,1,'2026-09-15',2026,1,'2026-09-17 16:15:59'),(2,1,1,'2026-09-16',2026,1,'2026-09-17 16:15:59'),(3,1,1,'2026-09-17',2026,0,'2026-09-17 16:15:59'),(4,3,5,'2026-09-17',2026,0,'2026-09-17 18:00:53'),(5,1,1,'2026-09-18',2026,0,'2026-09-17 18:09:06'),(6,1,1,'2026-10-07',2026,0,'2026-09-17 18:15:45');
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_papers`
--

DROP TABLE IF EXISTS `exam_papers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_papers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  `grade_level` int NOT NULL,
  `max_marks` decimal(5,2) DEFAULT '100.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exam_subject` (`exam_id`,`subject_id`,`grade_level`),
  UNIQUE KEY `UK8uk1gwuu7mof2f9si8hqtxpa3` (`exam_id`,`subject_id`,`grade_level`),
  KEY `fk_paper_subject` (`subject_id`),
  CONSTRAINT `fk_paper_exam` FOREIGN KEY (`exam_id`) REFERENCES `examinations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_paper_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_papers`
--

LOCK TABLES `exam_papers` WRITE;
/*!40000 ALTER TABLE `exam_papers` DISABLE KEYS */;
INSERT INTO `exam_papers` VALUES (1,1,1,10,100.00),(2,1,2,10,100.00),(3,1,3,10,100.00),(4,2,1,10,100.00),(5,4,1,10,100.00);
/*!40000 ALTER TABLE `exam_papers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_results`
--

DROP TABLE IF EXISTS `exam_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_paper_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `marks_obtained` decimal(5,2) NOT NULL,
  `grade` varchar(5) NOT NULL,
  `is_published` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_paper_student` (`exam_paper_id`,`student_id`),
  UNIQUE KEY `UKjvpbn001k3k6dkj5v4s88u1d7` (`exam_paper_id`,`student_id`),
  KEY `idx_results_student` (`student_id`),
  CONSTRAINT `fk_result_paper` FOREIGN KEY (`exam_paper_id`) REFERENCES `exam_papers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_result_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_results`
--

LOCK TABLES `exam_results` WRITE;
/*!40000 ALTER TABLE `exam_results` DISABLE KEYS */;
INSERT INTO `exam_results` VALUES (1,1,1,94.00,'A+',1,'2026-09-17 16:16:00'),(2,2,1,88.00,'A',1,'2026-09-17 16:16:00'),(3,3,1,82.00,'A',1,'2026-09-17 16:16:00'),(4,1,2,85.00,'A',1,'2026-09-17 16:16:00'),(5,2,2,92.00,'A+',1,'2026-09-17 16:16:00'),(6,3,2,78.00,'B',1,'2026-09-17 16:16:00'),(7,1,3,68.00,'C',1,'2026-09-17 16:16:00'),(8,2,3,72.00,'B',1,'2026-09-17 16:16:00'),(9,3,3,64.00,'C',1,'2026-09-17 16:16:00'),(10,4,1,65.00,'B',1,'2026-09-17 18:07:53'),(11,4,2,75.00,'A',1,'2026-09-17 18:07:53'),(12,4,3,85.00,'A',1,'2026-09-17 18:07:53'),(13,5,1,60.00,'C',1,'2026-09-17 18:16:09'),(14,5,2,70.00,'B',1,'2026-09-17 18:16:09'),(15,5,3,80.00,'A',1,'2026-09-17 18:16:09');
/*!40000 ALTER TABLE `exam_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examinations`
--

DROP TABLE IF EXISTS `examinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examinations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_name` varchar(150) NOT NULL,
  `term` int NOT NULL,
  `academic_year` int NOT NULL,
  `status` enum('DRAFT','PUBLISHED') DEFAULT 'DRAFT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exam_term_year` (`exam_name`,`term`,`academic_year`),
  UNIQUE KEY `UKmyc1ywykbmkc76thuu0eo4nxp` (`exam_name`,`term`,`academic_year`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examinations`
--

LOCK TABLES `examinations` WRITE;
/*!40000 ALTER TABLE `examinations` DISABLE KEYS */;
INSERT INTO `examinations` VALUES (1,'Term 1 Mid-Year Examination 2026',1,2026,'PUBLISHED','2026-09-17 16:15:59'),(2,'Test Verification Exam',2,2026,'PUBLISHED','2026-09-17 18:07:51'),(3,'gbjcgjcg',2,2026,'DRAFT','2026-09-17 18:14:10'),(4,'Exam-668906',1,2026,'PUBLISHED','2026-09-17 18:15:47');
/*!40000 ALTER TABLE `examinations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_structures`
--

DROP TABLE IF EXISTS `fee_structures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_structures` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fee_type` enum('TUITION','FACILITY','EXAMINATION','LIBRARY','ADMISSION','TRANSPORT','ACTIVITY','OTHER') NOT NULL,
  `grade_level` int DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `academic_year` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` bit(1) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `term` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fee_grade_year` (`fee_type`,`grade_level`,`academic_year`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_structures`
--

LOCK TABLES `fee_structures` WRITE;
/*!40000 ALTER TABLE `fee_structures` DISABLE KEYS */;
INSERT INTO `fee_structures` VALUES (1,'TUITION',10,25000.00,2026,'2026-09-17 16:16:00',_binary '','First term secondary tuition fees','2026-10-31','Grade 10 Term 1 Tuition Fee',1,'2026-09-17 16:16:00.000000'),(2,'FACILITY',10,8000.00,2026,'2026-09-17 16:16:00',_binary '','Sports complex and science lab maintenance','2026-09-30','Grade 10 Annual Facility & Sports Fee',1,'2026-09-17 16:16:00.000000'),(3,'TUITION',11,28000.00,2026,'2026-09-17 16:16:00',_binary '','First term O/L tuition fees','2026-10-31','Grade 11 Term 1 Tuition Fee',1,'2026-09-17 16:16:00.000000'),(4,'LIBRARY',NULL,5000.00,2026,'2026-09-17 16:16:00',_binary '','School-wide digital library access','2026-11-15','Annual Digital Lab & Library Fee',1,'2026-09-17 16:16:00.000000'),(5,'ACTIVITY',10,1500.00,2026,'2026-09-17 18:11:19',_binary '','Verify fix',NULL,'Test Activity Fee',2,'2026-09-17 18:11:18.811128'),(7,'EXAMINATION',12,3500.00,2026,'2026-09-17 18:17:46',_binary '\0','Final verify','2026-12-31','Grade 12 Exam Fee 69063',1,'2026-09-17 19:49:35.918861'),(8,'FACILITY',13,8500.00,2026,'2026-09-17 18:56:08',_binary '\0','Updated description','2026-12-31','Updated Fee 71366',1,'2026-09-17 18:56:14.172925');
/*!40000 ALTER TABLE `fee_structures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parents`
--

DROP TABLE IF EXISTS `parents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `father_name` varchar(150) DEFAULT NULL,
  `mother_name` varchar(150) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `nic` varchar(20) NOT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nic` (`nic`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_parents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parents`
--

LOCK TABLES `parents` WRITE;
/*!40000 ALTER TABLE `parents` DISABLE KEYS */;
INSERT INTO `parents` VALUES (1,5,'Bandula Perera','Sunethra Perera','0771122334','197512345678','124 Temple Road, Kurunegala','2026-09-17 16:15:58'),(2,NULL,'Sarath Silva','Menaka Silva','0775566778','197898765432','45 Kandy Road, Kurunegala','2026-09-17 16:15:58');
/*!40000 ALTER TABLE `parents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_receipts`
--

DROP TABLE IF EXISTS `payment_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_receipts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `payment_slip_id` bigint NOT NULL,
  `receipt_number` varchar(100) NOT NULL,
  `issued_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `receipt_type` enum('FULL','PARTIAL') NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `amount_paid` decimal(12,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `fee_structure_name` varchar(150) NOT NULL,
  `fee_type` enum('TUITION','FACILITY','EXAMINATION','LIBRARY','ADMISSION','TRANSPORT','ACTIVITY','OTHER') NOT NULL,
  `issued_by` varchar(100) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `remaining_balance` decimal(12,2) NOT NULL,
  `student_admission_number` varchar(50) NOT NULL,
  `student_id` bigint NOT NULL,
  `student_name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_slip_id` (`payment_slip_id`),
  UNIQUE KEY `receipt_number` (`receipt_number`),
  CONSTRAINT `fk_receipt_slip` FOREIGN KEY (`payment_slip_id`) REFERENCES `payment_slips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_receipts`
--

LOCK TABLES `payment_receipts` WRITE;
/*!40000 ALTER TABLE `payment_receipts` DISABLE KEYS */;
INSERT INTO `payment_receipts` VALUES (1,1,'RCPT-2026-00001','2026-09-17 16:16:00','FULL',NULL,25000.00,'2026-09-17 16:16:00.000000','Grade 10 Term 1 Tuition Fee','TUITION','Admin Counter','Official receipt for first term tuition fee',0.00,'WYC-2026-00101',1,'Kasun Perera'),(2,2,'REC-2026-00002','2026-09-17 18:17:47','PARTIAL',NULL,1500.00,'2026-09-17 18:17:47.061091','Grade 12 Exam Fee 69063','EXAMINATION','Admin','Verify payment',2000.00,'STD001',1,'Test Student'),(3,3,'REC-2026-00003','2026-09-17 18:20:14','FULL',NULL,2000.00,'2026-09-17 18:20:13.836708','Grade 12 Exam Fee 69063','EXAMINATION','Admin Counter','Over-the-counter settlement',0.00,'STD001',1,'Test Student'),(4,4,'REC-2026-00004','2026-09-17 18:56:12','PARTIAL',NULL,3000.00,'2026-09-17 18:56:11.928544','Updated Fee 71366','FACILITY','Admin','CRUD test',5500.00,'STD001',1,'Test Student'),(5,5,'REC-2026-00005','2026-09-17 19:46:11','FULL',NULL,28000.00,'2026-09-17 19:46:10.955626','Grade 11 Term 1 Tuition Fee','TUITION','Admin Counter','Counter payment',0.00,'WYC-2026-00103',3,'Kavindu Bandara'),(6,6,'REC-2026-00006','2026-09-17 19:58:17','FULL',NULL,8000.00,'2026-09-17 19:58:17.015336','Grade 10 Annual Facility & Sports Fee','FACILITY','Admin Counter','Counter payment',0.00,'WYC-2026-00101',1,'Kasun Perera');
/*!40000 ALTER TABLE `payment_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_slips`
--

DROP TABLE IF EXISTS `payment_slips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_slips` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fee_account_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `slip_image_url` varchar(500) DEFAULT NULL,
  `amount_paid` decimal(12,2) NOT NULL,
  `verification_status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `reviewed_by` varchar(100) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `paid_by` varchar(150) DEFAULT NULL,
  `payment_date` datetime(6) NOT NULL,
  `payment_method` enum('CASH','BANK_TRANSFER','BANK_DEPOSIT','CHEQUE','ONLINE_SLIP') NOT NULL,
  `review_remarks` varchar(500) DEFAULT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `student_id` bigint NOT NULL,
  `transaction_reference` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_slip_parent` (`parent_id`),
  KEY `idx_slips_account` (`fee_account_id`),
  CONSTRAINT `fk_slip_account` FOREIGN KEY (`fee_account_id`) REFERENCES `student_fee_accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_slip_parent` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_slips`
--

LOCK TABLES `payment_slips` WRITE;
/*!40000 ALTER TABLE `payment_slips` DISABLE KEYS */;
INSERT INTO `payment_slips` VALUES (1,1,1,NULL,25000.00,'APPROVED','Admin Counter',NULL,'2026-09-17 16:16:00',NULL,'2026-09-17 16:16:00.000000','CASH','Cash received in full at office counter','2026-09-17 16:16:00.000000',1,'REC-2026-00101-01','2026-09-17 16:16:00.000000'),(2,4,NULL,NULL,1500.00,'APPROVED','Admin',NULL,'2026-09-17 18:17:47','Parent','2026-09-17 18:17:47.040547','CASH','Verify payment','2026-09-17 18:17:47.040618',1,'PAY-69063','2026-09-17 18:17:47.041549'),(3,4,NULL,NULL,2000.00,'APPROVED','Admin Counter',NULL,'2026-09-17 18:20:14','Test Student','2026-09-17 18:20:13.831254','CASH','Over-the-counter settlement','2026-09-17 18:20:13.831287',1,'REC-1789669213456','2026-09-17 18:20:13.831505'),(4,5,NULL,NULL,3000.00,'APPROVED','Admin',NULL,'2026-09-17 18:56:12','Test Parent','2026-09-17 18:56:11.924042','CASH','CRUD test','2026-09-17 18:56:11.924056',1,'PAY-71366','2026-09-17 18:56:11.924644'),(5,6,NULL,NULL,28000.00,'APPROVED','Admin Counter',NULL,'2026-09-17 19:46:11','Kavindu Bandara','2026-09-17 19:46:10.930381','CASH','Counter payment','2026-09-17 19:46:10.930404',3,'REC-1789674370506','2026-09-17 19:46:10.931400'),(6,2,NULL,NULL,8000.00,'APPROVED','Admin Counter',NULL,'2026-09-17 19:58:17','Kasun Perera','2026-09-17 19:58:17.006821','BANK_TRANSFER','Counter payment','2026-09-17 19:58:17.006846',1,'REC-1789675097197','2026-09-17 19:58:17.007203');
/*!40000 ALTER TABLE `payment_slips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_class_allocations`
--

DROP TABLE IF EXISTS `student_class_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_class_allocations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `class_id` bigint NOT NULL,
  `academic_year` int NOT NULL,
  `allocated_date` date NOT NULL,
  `status` enum('ACTIVE','TRANSFERRED') DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_year` (`student_id`,`academic_year`),
  UNIQUE KEY `UKr61qkfyllu1jdu0kh8btautqx` (`student_id`,`academic_year`),
  KEY `idx_alloc_student` (`student_id`),
  KEY `idx_alloc_class` (`class_id`),
  CONSTRAINT `fk_alloc_class` FOREIGN KEY (`class_id`) REFERENCES `academic_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_alloc_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_class_allocations`
--

LOCK TABLES `student_class_allocations` WRITE;
/*!40000 ALTER TABLE `student_class_allocations` DISABLE KEYS */;
INSERT INTO `student_class_allocations` VALUES (1,1,1,2026,'2026-01-05','ACTIVE'),(2,2,1,2026,'2026-01-05','ACTIVE'),(3,3,1,2026,'2026-01-05','ACTIVE'),(4,4,2,2026,'2026-01-05','ACTIVE'),(5,5,2,2026,'2026-01-05','ACTIVE'),(6,6,3,2026,'2026-01-05','ACTIVE'),(7,7,3,2026,'2026-01-05','ACTIVE'),(8,8,4,2026,'2026-01-05','ACTIVE');
/*!40000 ALTER TABLE `student_class_allocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_fee_accounts`
--

DROP TABLE IF EXISTS `student_fee_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_fee_accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `fee_structure_id` bigint NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `paid_amount` decimal(12,2) NOT NULL,
  `balance_amount` decimal(12,2) NOT NULL,
  `status` enum('PENDING','PARTIAL','PAID') DEFAULT 'PENDING',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `academic_year` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `due_date` date DEFAULT NULL,
  `grade_level` int NOT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `student_admission_number` varchar(50) NOT NULL,
  `student_name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_fee` (`student_id`,`fee_structure_id`),
  UNIQUE KEY `UKk23naf13jryrg6rfq6emnvvom` (`student_id`,`fee_structure_id`),
  KEY `fk_sfa_fee` (`fee_structure_id`),
  KEY `idx_sfa_student` (`student_id`),
  CONSTRAINT `fk_sfa_fee` FOREIGN KEY (`fee_structure_id`) REFERENCES `fee_structures` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_sfa_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_fee_accounts`
--

LOCK TABLES `student_fee_accounts` WRITE;
/*!40000 ALTER TABLE `student_fee_accounts` DISABLE KEYS */;
INSERT INTO `student_fee_accounts` VALUES (1,1,1,25000.00,25000.00,0.00,'PAID','2026-09-17 16:16:00',2026,'2026-09-17 16:16:00.000000','2026-10-31',10,'Direct counter payment','WYC-2026-00101','Kasun Perera'),(2,1,2,8000.00,8000.00,0.00,'PAID','2026-09-17 19:58:17',2026,'2026-09-17 16:16:00.000000','2026-09-30',10,'Regular enrollment charge','WYC-2026-00101','Kasun Perera'),(3,2,1,25000.00,15000.00,10000.00,'PARTIAL','2026-09-17 16:16:00',2026,'2026-09-17 16:16:00.000000','2026-10-31',10,'Instalment payment','WYC-2026-00102','Nimasha Silva'),(4,1,7,3500.00,3500.00,0.00,'PAID','2026-09-17 18:20:14',2026,'2026-09-17 18:17:46.458486','2026-12-31',12,NULL,'STD001','Test Student'),(5,1,8,8500.00,3000.00,5500.00,'PARTIAL','2026-09-17 18:56:12',2026,'2026-09-17 18:56:10.194329','2026-12-31',13,'CRUD test 71366','STD001','Test Student'),(6,3,3,28000.00,28000.00,0.00,'PAID','2026-09-17 19:46:11',2026,'2026-09-17 19:45:12.525242','2026-10-10',10,NULL,'WYC-2026-00103','Kavindu Bandara');
/*!40000 ALTER TABLE `student_fee_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `admission_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `dob` date NOT NULL,
  `gender` enum('MALE','FEMALE','OTHER') NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admission_number` (`admission_number`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_students_parent` (`parent_id`),
  CONSTRAINT `fk_students_parent` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,4,'WYC-2026-00101','Kasun','Perera','2010-05-15','MALE',1,'2026-09-17 16:15:58'),(2,NULL,'WYC-2026-00102','Nimasha','Silva','2010-08-22','FEMALE',2,'2026-09-17 16:15:58'),(3,NULL,'WYC-2026-00103','Kavindu','Bandara','2010-03-10','MALE',1,'2026-09-17 16:15:58'),(4,NULL,'WYC-2026-00104','Dilshan','Fernando','2010-11-04','MALE',NULL,'2026-09-17 16:15:58'),(5,NULL,'WYC-2026-00105','Tharushi','Jayawardena','2010-07-19','FEMALE',NULL,'2026-09-17 16:15:58'),(6,NULL,'WYC-2026-00201','Rashmi','Dissanayake','2009-02-14','FEMALE',NULL,'2026-09-17 16:15:58'),(7,NULL,'WYC-2026-00202','Malith','Weerasekara','2009-09-30','MALE',NULL,'2026-09-17 16:15:58'),(8,NULL,'WYC-2026-00203','Chathura','Gimhana','2009-12-05','MALE',NULL,'2026-09-17 16:15:58');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `subject_code` varchar(30) NOT NULL,
  `subject_name` varchar(150) NOT NULL,
  `grade_level` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subject_code` (`subject_code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'MATH10','Mathematics',10,'2026-09-17 16:15:58'),(2,'SCI10','Science',10,'2026-09-17 16:15:58'),(3,'ENG10','English Language',10,'2026-09-17 16:15:58'),(4,'SIN10','Sinhala Language',10,'2026-09-17 16:15:58'),(5,'HIST10','History',10,'2026-09-17 16:15:58'),(6,'ICT10','Information & Communication Technology',10,'2026-09-17 16:15:58'),(7,'MATH11','Mathematics',11,'2026-09-17 16:15:58'),(8,'SCI11','Science',11,'2026-09-17 16:15:58'),(9,'TST101','Test Subject',10,'2026-09-17 18:07:43'),(10,'SBJ668906','Test Subject 668906',10,'2026-09-17 18:15:42');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_subject_assignments`
--

DROP TABLE IF EXISTS `teacher_subject_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_subject_assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `teacher_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  `class_id` bigint NOT NULL,
  `academic_year` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_assignment` (`teacher_id`,`subject_id`,`class_id`,`academic_year`),
  UNIQUE KEY `UK4yv7gh2ag2nh7s37lruet9xh4` (`teacher_id`,`subject_id`,`class_id`,`academic_year`),
  KEY `fk_tsa_subject` (`subject_id`),
  KEY `fk_tsa_class` (`class_id`),
  KEY `idx_tsa_teacher` (`teacher_id`),
  CONSTRAINT `fk_tsa_class` FOREIGN KEY (`class_id`) REFERENCES `academic_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tsa_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tsa_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_subject_assignments`
--

LOCK TABLES `teacher_subject_assignments` WRITE;
/*!40000 ALTER TABLE `teacher_subject_assignments` DISABLE KEYS */;
INSERT INTO `teacher_subject_assignments` VALUES (1,1,1,1,2026),(2,2,1,2,2026),(3,3,2,1,2026),(4,3,2,2,2026),(5,4,3,1,2026),(6,4,3,2,2026),(7,5,6,1,2026),(8,6,5,1,2026);
/*!40000 ALTER TABLE `teacher_subject_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `employee_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `qualification` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','ON_LEAVE') DEFAULT 'ACTIVE',
  `hire_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_number` (`employee_number`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_teachers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,3,'EMP-2026-001','Sunil','Fernando','BSc Education (Mathematics)','0771234567','ACTIVE','2020-01-15','2026-09-17 16:15:58'),(2,NULL,'EMP-2026-002','Kamala','Rajapaksha','MSc Applied Mathematics','0779876543','ACTIVE','2018-05-10','2026-09-17 16:15:58'),(3,NULL,'EMP-2026-003','Nihal','Jayasinghe','BSc Biological Science','0714567890','ACTIVE','2021-03-01','2026-09-17 16:15:58'),(4,NULL,'EMP-2026-004','Anoma','Wickramasinghe','BA English Language & Literature','0763456789','ACTIVE','2019-09-15','2026-09-17 16:15:58'),(5,NULL,'EMP-2026-005','Chaminda','Silva','BSc Information Technology','0725678901','ACTIVE','2022-01-10','2026-09-17 16:15:58'),(6,NULL,'EMP-2026-006','Priyantha','Perera','BA Social Sciences & History','0756789012','ACTIVE','2017-06-20','2026-09-17 16:15:58');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `time_slots`
--

DROP TABLE IF EXISTS `time_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `time_slots` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `day_of_week` enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY') NOT NULL,
  `period_number` int NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_day_period` (`day_of_week`,`period_number`),
  UNIQUE KEY `UKoa67dg3rx4or9g8xg4kmwvsnn` (`day_of_week`,`period_number`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `time_slots`
--

LOCK TABLES `time_slots` WRITE;
/*!40000 ALTER TABLE `time_slots` DISABLE KEYS */;
INSERT INTO `time_slots` VALUES (1,'MONDAY',1,'08:00:00','08:45:00'),(2,'MONDAY',2,'08:45:00','09:30:00'),(3,'MONDAY',3,'09:30:00','10:15:00'),(4,'MONDAY',4,'10:30:00','11:15:00'),(5,'MONDAY',5,'11:15:00','12:00:00'),(6,'MONDAY',6,'12:00:00','12:45:00'),(7,'MONDAY',7,'13:15:00','14:00:00'),(8,'MONDAY',8,'14:00:00','14:45:00'),(9,'TUESDAY',1,'08:00:00','08:45:00'),(10,'TUESDAY',2,'08:45:00','09:30:00'),(11,'TUESDAY',3,'09:30:00','10:15:00'),(12,'TUESDAY',4,'10:30:00','11:15:00'),(13,'TUESDAY',5,'11:15:00','12:00:00'),(14,'TUESDAY',6,'12:00:00','12:45:00'),(15,'TUESDAY',7,'13:15:00','14:00:00'),(16,'TUESDAY',8,'14:00:00','14:45:00'),(17,'WEDNESDAY',1,'08:00:00','08:45:00'),(18,'WEDNESDAY',2,'08:45:00','09:30:00'),(19,'WEDNESDAY',3,'09:30:00','10:15:00'),(20,'WEDNESDAY',4,'10:30:00','11:15:00'),(21,'WEDNESDAY',5,'11:15:00','12:00:00'),(22,'WEDNESDAY',6,'12:00:00','12:45:00'),(23,'WEDNESDAY',7,'13:15:00','14:00:00'),(24,'WEDNESDAY',8,'14:00:00','14:45:00'),(25,'THURSDAY',1,'08:00:00','08:45:00'),(26,'THURSDAY',2,'08:45:00','09:30:00'),(27,'THURSDAY',3,'09:30:00','10:15:00'),(28,'THURSDAY',4,'10:30:00','11:15:00'),(29,'THURSDAY',5,'11:15:00','12:00:00'),(30,'THURSDAY',6,'12:00:00','12:45:00'),(31,'THURSDAY',7,'13:15:00','14:00:00'),(32,'THURSDAY',8,'14:00:00','14:45:00'),(33,'FRIDAY',1,'08:00:00','08:45:00'),(34,'FRIDAY',2,'08:45:00','09:30:00'),(35,'FRIDAY',3,'09:30:00','10:15:00'),(36,'FRIDAY',4,'10:30:00','11:15:00'),(37,'FRIDAY',5,'11:15:00','12:00:00'),(38,'FRIDAY',6,'12:00:00','12:45:00'),(39,'FRIDAY',7,'13:15:00','14:00:00'),(40,'FRIDAY',8,'14:00:00','14:45:00');
/*!40000 ALTER TABLE `time_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable_entries`
--

DROP TABLE IF EXISTS `timetable_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetable_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `timetable_id` bigint NOT NULL,
  `time_slot_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  `teacher_id` bigint NOT NULL,
  `room_number` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_class_slot` (`timetable_id`,`time_slot_id`),
  KEY `fk_tentry_slot` (`time_slot_id`),
  KEY `fk_tentry_subject` (`subject_id`),
  KEY `idx_timetable_entries_teacher` (`teacher_id`,`time_slot_id`),
  KEY `idx_timetable_entries_room` (`room_number`,`time_slot_id`),
  CONSTRAINT `fk_tentry_slot` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tentry_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_tentry_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_tentry_timetable` FOREIGN KEY (`timetable_id`) REFERENCES `timetables` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable_entries`
--

LOCK TABLES `timetable_entries` WRITE;
/*!40000 ALTER TABLE `timetable_entries` DISABLE KEYS */;
INSERT INTO `timetable_entries` VALUES (1,1,1,1,1,'ROOM-10A'),(2,1,2,1,1,'ROOM-10A'),(3,1,3,2,3,'LAB-01'),(4,1,4,3,4,'ROOM-10A'),(5,1,5,5,6,'ROOM-10A'),(6,1,6,6,5,'IT-LAB'),(7,1,9,2,3,'LAB-01'),(8,1,10,2,3,'LAB-01'),(9,1,11,1,1,'ROOM-10A'),(10,1,12,3,4,'ROOM-10A'),(11,1,17,6,5,'IT-LAB'),(12,1,18,6,5,'IT-LAB'),(13,1,19,1,1,'ROOM-10A'),(14,1,20,5,6,'ROOM-10A'),(18,2,1,3,2,'ROOM 101'),(19,2,10,7,2,'ROOM 101');
/*!40000 ALTER TABLE `timetable_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetables`
--

DROP TABLE IF EXISTS `timetables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetables` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `class_id` bigint NOT NULL,
  `academic_year` int NOT NULL,
  `term` int NOT NULL,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') DEFAULT 'DRAFT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_class_term_year` (`class_id`,`academic_year`,`term`),
  UNIQUE KEY `UKmd4lxf3wjfh4u1xuq2dp8gbsc` (`class_id`,`academic_year`,`term`),
  CONSTRAINT `fk_timetable_class` FOREIGN KEY (`class_id`) REFERENCES `academic_classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetables`
--

LOCK TABLES `timetables` WRITE;
/*!40000 ALTER TABLE `timetables` DISABLE KEYS */;
INSERT INTO `timetables` VALUES (1,1,2026,1,'PUBLISHED','2026-09-17 16:15:59','2026-09-17 16:15:59'),(2,1,2026,2,'DRAFT','2026-09-17 18:07:56','2026-09-17 18:07:56'),(3,2,2026,1,'DRAFT','2026-09-17 18:17:45','2026-09-17 18:17:45');
/*!40000 ALTER TABLE `timetables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','HEAD_OF_ACADEMIC','TEACHER','STUDENT','PARENT') NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@sliit.lk','$2a$10$jQ5U7328CX/nBYiXT9TmOuabDNfNX7uXPFv3ZuDWR9Ic5V6oLnL1W','ADMIN',1,'2026-09-17 16:15:58','2026-09-17 16:15:58'),(2,'head_academic','academic@sliit.lk','$2a$10$I6gpPe3Cw.T4lcixgwBMge8KlkMTg1f3rVFZOTMaLk9b66EBbzQd6','HEAD_OF_ACADEMIC',1,'2026-09-17 16:15:58','2026-09-17 16:15:58'),(3,'teacher1','teacher1@sliit.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-17 16:15:58','2026-09-17 16:15:58'),(4,'student1','student1@sliit.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-17 16:15:58','2026-09-17 16:15:58'),(5,'parent1','parent1@sliit.lk','$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu','PARENT',1,'2026-09-17 16:15:58','2026-09-17 16:15:58');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'sim_system_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-17 20:23:43
