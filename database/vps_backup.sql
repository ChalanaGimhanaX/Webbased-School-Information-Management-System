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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_classes`
--

LOCK TABLES `academic_classes` WRITE;
/*!40000 ALTER TABLE `academic_classes` DISABLE KEYS */;
INSERT INTO `academic_classes` VALUES (1,10,'Grade 10-A',2026,35,1,'2026-09-01 08:00:00'),(2,10,'Grade 10-B',2026,35,2,'2026-09-01 08:00:00'),(3,11,'Grade 11-A',2026,35,3,'2026-09-01 08:00:00'),(4,11,'Grade 11-B',2026,35,5,'2026-09-01 08:00:00'),(5,9,'Grade 9-A',2026,35,4,'2026-09-01 08:00:00'),(6,9,'Grade 9-B',2026,35,10,'2026-09-01 08:00:00');
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
  `status` enum('PRESENT','ABSENT','LATE','EXCUSED') NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_record_student` (`attendance_record_id`,`student_id`),
  UNIQUE KEY `UKladquk7aq6e7cbcg1tkkxepq6` (`attendance_record_id`,`student_id`),
  KEY `idx_att_entry_student` (`student_id`),
  CONSTRAINT `fk_att_entry_record` FOREIGN KEY (`attendance_record_id`) REFERENCES `attendance_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_entry_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=781 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_entries`
--

LOCK TABLES `attendance_entries` WRITE;
/*!40000 ALTER TABLE `attendance_entries` DISABLE KEYS */;
INSERT INTO `attendance_entries` VALUES (1,1,1,'PRESENT','On time'),(2,1,2,'PRESENT','On time'),(3,1,3,'PRESENT','On time'),(4,1,9,'PRESENT','On time'),(5,1,10,'LATE','School bus delayed 15 mins'),(6,1,11,'PRESENT','On time'),(7,1,12,'PRESENT','On time'),(8,2,4,'PRESENT','On time'),(9,2,5,'PRESENT','On time'),(10,2,13,'PRESENT','On time'),(11,2,14,'PRESENT','On time'),(12,2,15,'PRESENT','On time'),(13,2,16,'PRESENT','On time'),(14,3,6,'PRESENT','On time'),(15,3,7,'PRESENT','On time'),(16,3,17,'PRESENT','On time'),(17,3,18,'PRESENT','On time'),(18,3,19,'LATE','School bus delayed 15 mins'),(19,4,8,'PRESENT','On time'),(20,4,20,'PRESENT','On time'),(21,4,21,'PRESENT','On time'),(22,4,22,'PRESENT','On time'),(23,5,23,'PRESENT','On time'),(24,5,24,'PRESENT','On time'),(25,5,25,'PRESENT','On time'),(26,5,26,'PRESENT','On time'),(27,6,27,'LATE','School bus delayed 15 mins'),(28,6,28,'PRESENT','On time'),(29,6,29,'PRESENT','On time'),(30,6,30,'PRESENT','On time'),(31,7,1,'PRESENT','On time'),(32,7,2,'PRESENT','On time'),(33,7,3,'PRESENT','On time'),(34,7,9,'PRESENT','On time'),(35,7,10,'PRESENT','On time'),(36,7,11,'PRESENT','On time'),(37,7,12,'ABSENT','Medical leave'),(38,8,4,'PRESENT','On time'),(39,8,5,'PRESENT','On time'),(40,8,13,'PRESENT','On time'),(41,8,14,'LATE','School bus delayed 15 mins'),(42,8,15,'EXCUSED','Sports meet practice'),(43,8,16,'PRESENT','On time'),(44,9,6,'PRESENT','On time'),(45,9,7,'PRESENT','On time'),(46,9,17,'PRESENT','On time'),(47,9,18,'PRESENT','On time'),(48,9,19,'PRESENT','On time'),(49,10,8,'PRESENT','On time'),(50,10,20,'PRESENT','On time'),(51,10,21,'PRESENT','On time'),(52,10,22,'PRESENT','On time'),(53,11,23,'PRESENT','On time'),(54,11,24,'PRESENT','On time'),(55,11,25,'PRESENT','On time'),(56,11,26,'PRESENT','On time'),(57,12,27,'PRESENT','On time'),(58,12,28,'PRESENT','On time'),(59,12,29,'PRESENT','On time'),(60,12,30,'PRESENT','On time'),(61,13,1,'PRESENT','On time'),(62,13,2,'PRESENT','On time'),(63,13,3,'PRESENT','On time'),(64,13,9,'LATE','School bus delayed 15 mins'),(65,13,10,'EXCUSED','Sports meet practice'),(66,13,11,'PRESENT','On time'),(67,13,12,'PRESENT','On time'),(68,14,4,'PRESENT','On time'),(69,14,5,'ABSENT','Medical leave'),(70,14,13,'PRESENT','On time'),(71,14,14,'PRESENT','On time'),(72,14,15,'PRESENT','On time'),(73,14,16,'PRESENT','On time'),(74,15,6,'PRESENT','On time'),(75,15,7,'LATE','School bus delayed 15 mins'),(76,15,17,'PRESENT','On time'),(77,15,18,'LATE','School bus delayed 15 mins'),(78,15,19,'PRESENT','On time'),(79,16,8,'PRESENT','On time'),(80,16,20,'PRESENT','On time'),(81,16,21,'PRESENT','On time'),(82,16,22,'ABSENT','Medical leave'),(83,17,23,'PRESENT','On time'),(84,17,24,'PRESENT','On time'),(85,17,25,'PRESENT','On time'),(86,17,26,'PRESENT','On time'),(87,18,27,'PRESENT','On time'),(88,18,28,'EXCUSED','Sports meet practice'),(89,18,29,'PRESENT','On time'),(90,18,30,'PRESENT','On time'),(91,19,1,'PRESENT','On time'),(92,19,2,'PRESENT','On time'),(93,19,3,'LATE','School bus delayed 15 mins'),(94,19,9,'PRESENT','On time'),(95,19,10,'PRESENT','On time'),(96,19,11,'PRESENT','On time'),(97,19,12,'PRESENT','On time'),(98,20,4,'PRESENT','On time'),(99,20,5,'PRESENT','On time'),(100,20,13,'LATE','School bus delayed 15 mins'),(101,20,14,'PRESENT','On time'),(102,20,15,'PRESENT','On time'),(103,20,16,'PRESENT','On time'),(104,21,6,'PRESENT','On time'),(105,21,7,'PRESENT','On time'),(106,21,17,'ABSENT','Medical leave'),(107,21,18,'PRESENT','On time'),(108,21,19,'PRESENT','On time'),(109,22,8,'PRESENT','On time'),(110,22,20,'PRESENT','On time'),(111,22,21,'PRESENT','On time'),(112,22,22,'LATE','School bus delayed 15 mins'),(113,23,23,'PRESENT','On time'),(114,23,24,'PRESENT','On time'),(115,23,25,'PRESENT','On time'),(116,23,26,'PRESENT','On time'),(117,24,27,'PRESENT','On time'),(118,24,28,'PRESENT','On time'),(119,24,29,'PRESENT','On time'),(120,24,30,'PRESENT','On time'),(121,25,1,'PRESENT','On time'),(122,25,2,'PRESENT','On time'),(123,25,3,'PRESENT','On time'),(124,25,9,'PRESENT','On time'),(125,25,10,'PRESENT','On time'),(126,25,11,'PRESENT','On time'),(127,25,12,'PRESENT','On time'),(128,26,4,'PRESENT','On time'),(129,26,5,'PRESENT','On time'),(130,26,13,'PRESENT','On time'),(131,26,14,'PRESENT','On time'),(132,26,15,'PRESENT','On time'),(133,26,16,'PRESENT','On time'),(134,27,6,'PRESENT','On time'),(135,27,7,'PRESENT','On time'),(136,27,17,'LATE','School bus delayed 15 mins'),(137,27,18,'PRESENT','On time'),(138,27,19,'EXCUSED','Sports meet practice'),(139,28,8,'PRESENT','On time'),(140,28,20,'PRESENT','On time'),(141,28,21,'PRESENT','On time'),(142,28,22,'PRESENT','On time'),(143,29,23,'PRESENT','On time'),(144,29,24,'PRESENT','On time'),(145,29,25,'PRESENT','On time'),(146,29,26,'LATE','School bus delayed 15 mins'),(147,30,27,'ABSENT','Medical leave'),(148,30,28,'PRESENT','On time'),(149,30,29,'PRESENT','On time'),(150,30,30,'PRESENT','On time'),(151,31,1,'PRESENT','On time'),(152,31,2,'LATE','School bus delayed 15 mins'),(153,31,3,'PRESENT','On time'),(154,31,9,'PRESENT','On time'),(155,31,10,'PRESENT','On time'),(156,31,11,'PRESENT','On time'),(157,31,12,'PRESENT','On time'),(158,32,4,'PRESENT','On time'),(159,32,5,'PRESENT','On time'),(160,32,13,'PRESENT','On time'),(161,32,14,'EXCUSED','Sports meet practice'),(162,32,15,'PRESENT','On time'),(163,32,16,'PRESENT','On time'),(164,33,6,'PRESENT','On time'),(165,33,7,'PRESENT','On time'),(166,33,17,'PRESENT','On time'),(167,33,18,'PRESENT','On time'),(168,33,19,'PRESENT','On time'),(169,34,8,'PRESENT','On time'),(170,34,20,'PRESENT','On time'),(171,34,21,'LATE','School bus delayed 15 mins'),(172,34,22,'PRESENT','On time'),(173,35,23,'PRESENT','On time'),(174,35,24,'PRESENT','On time'),(175,35,25,'PRESENT','On time'),(176,35,26,'PRESENT','On time'),(177,36,27,'PRESENT','On time'),(178,36,28,'PRESENT','On time'),(179,36,29,'PRESENT','On time'),(180,36,30,'LATE','School bus delayed 15 mins'),(181,37,1,'PRESENT','On time'),(182,37,2,'PRESENT','On time'),(183,37,3,'PRESENT','On time'),(184,37,9,'EXCUSED','Sports meet practice'),(185,37,10,'PRESENT','On time'),(186,37,11,'PRESENT','On time'),(187,37,12,'PRESENT','On time'),(188,38,4,'PRESENT','On time'),(189,38,5,'PRESENT','On time'),(190,38,13,'PRESENT','On time'),(191,38,14,'PRESENT','On time'),(192,38,15,'PRESENT','On time'),(193,38,16,'PRESENT','On time'),(194,39,6,'PRESENT','On time'),(195,39,7,'EXCUSED','Sports meet practice'),(196,39,17,'PRESENT','On time'),(197,39,18,'ABSENT','Medical leave'),(198,39,19,'PRESENT','On time'),(199,40,8,'PRESENT','On time'),(200,40,20,'PRESENT','On time'),(201,40,21,'PRESENT','On time'),(202,40,22,'PRESENT','On time'),(203,41,23,'PRESENT','On time'),(204,41,24,'PRESENT','On time'),(205,41,25,'LATE','School bus delayed 15 mins'),(206,41,26,'PRESENT','On time'),(207,42,27,'EXCUSED','Sports meet practice'),(208,42,28,'PRESENT','On time'),(209,42,29,'PRESENT','On time'),(210,42,30,'PRESENT','On time'),(211,43,1,'PRESENT','On time'),(212,43,2,'PRESENT','On time'),(213,43,3,'EXCUSED','Sports meet practice'),(214,43,9,'PRESENT','On time'),(215,43,10,'PRESENT','On time'),(216,43,11,'PRESENT','On time'),(217,43,12,'LATE','School bus delayed 15 mins'),(218,44,4,'PRESENT','On time'),(219,44,5,'PRESENT','On time'),(220,44,13,'ABSENT','Medical leave'),(221,44,14,'PRESENT','On time'),(222,44,15,'PRESENT','On time'),(223,44,16,'PRESENT','On time'),(224,45,6,'PRESENT','On time'),(225,45,7,'PRESENT','On time'),(226,45,17,'PRESENT','On time'),(227,45,18,'PRESENT','On time'),(228,45,19,'PRESENT','On time'),(229,46,8,'PRESENT','On time'),(230,46,20,'LATE','School bus delayed 15 mins'),(231,46,21,'PRESENT','On time'),(232,46,22,'PRESENT','On time'),(233,47,23,'PRESENT','On time'),(234,47,24,'PRESENT','On time'),(235,47,25,'PRESENT','On time'),(236,47,26,'PRESENT','On time'),(237,48,27,'PRESENT','On time'),(238,48,28,'ABSENT','Medical leave'),(239,48,29,'LATE','School bus delayed 15 mins'),(240,48,30,'PRESENT','On time'),(241,49,1,'PRESENT','On time'),(242,49,2,'PRESENT','On time'),(243,49,3,'PRESENT','On time'),(244,49,9,'PRESENT','On time'),(245,49,10,'PRESENT','On time'),(246,49,11,'PRESENT','On time'),(247,49,12,'PRESENT','On time'),(248,50,4,'PRESENT','On time'),(249,50,5,'LATE','School bus delayed 15 mins'),(250,50,13,'PRESENT','On time'),(251,50,14,'PRESENT','On time'),(252,50,15,'PRESENT','On time'),(253,50,16,'LATE','School bus delayed 15 mins'),(254,51,6,'PRESENT','On time'),(255,51,7,'PRESENT','On time'),(256,51,17,'PRESENT','On time'),(257,51,18,'EXCUSED','Sports meet practice'),(258,51,19,'PRESENT','On time'),(259,52,8,'PRESENT','On time'),(260,52,20,'PRESENT','On time'),(261,52,21,'PRESENT','On time'),(262,52,22,'PRESENT','On time'),(263,53,23,'PRESENT','On time'),(264,53,24,'LATE','School bus delayed 15 mins'),(265,53,25,'PRESENT','On time'),(266,53,26,'PRESENT','On time'),(267,54,27,'PRESENT','On time'),(268,54,28,'PRESENT','On time'),(269,54,29,'PRESENT','On time'),(270,54,30,'PRESENT','On time'),(271,55,1,'PRESENT','On time'),(272,55,2,'ABSENT','Medical leave'),(273,55,3,'PRESENT','On time'),(274,55,9,'PRESENT','On time'),(275,55,10,'PRESENT','On time'),(276,55,11,'LATE','School bus delayed 15 mins'),(277,55,12,'PRESENT','On time'),(278,56,4,'PRESENT','On time'),(279,56,5,'PRESENT','On time'),(280,56,13,'EXCUSED','Sports meet practice'),(281,56,14,'PRESENT','On time'),(282,56,15,'PRESENT','On time'),(283,56,16,'PRESENT','On time'),(284,57,6,'PRESENT','On time'),(285,57,7,'PRESENT','On time'),(286,57,17,'PRESENT','On time'),(287,57,18,'PRESENT','On time'),(288,57,19,'ABSENT','Medical leave'),(289,58,8,'LATE','School bus delayed 15 mins'),(290,58,20,'PRESENT','On time'),(291,58,21,'PRESENT','On time'),(292,58,22,'PRESENT','On time'),(293,59,23,'PRESENT','On time'),(294,59,24,'PRESENT','On time'),(295,59,25,'PRESENT','On time'),(296,59,26,'PRESENT','On time'),(297,60,27,'PRESENT','On time'),(298,60,28,'LATE','School bus delayed 15 mins'),(299,60,29,'PRESENT','On time'),(300,60,30,'PRESENT','On time'),(301,61,1,'PRESENT','On time'),(302,61,2,'PRESENT','On time'),(303,61,3,'PRESENT','On time'),(304,61,9,'PRESENT','On time'),(305,61,10,'PRESENT','On time'),(306,61,11,'PRESENT','On time'),(307,61,12,'PRESENT','On time'),(308,62,4,'LATE','School bus delayed 15 mins'),(309,62,5,'PRESENT','On time'),(310,62,13,'PRESENT','On time'),(311,62,14,'ABSENT','Medical leave'),(312,62,15,'LATE','School bus delayed 15 mins'),(313,62,16,'PRESENT','On time'),(314,63,6,'PRESENT','On time'),(315,63,7,'PRESENT','On time'),(316,63,17,'PRESENT','On time'),(317,63,18,'PRESENT','On time'),(318,63,19,'PRESENT','On time'),(319,64,8,'PRESENT','On time'),(320,64,20,'PRESENT','On time'),(321,64,21,'PRESENT','On time'),(322,64,22,'PRESENT','On time'),(323,65,23,'PRESENT','On time'),(324,65,24,'PRESENT','On time'),(325,65,25,'PRESENT','On time'),(326,65,26,'PRESENT','On time'),(327,66,27,'PRESENT','On time'),(328,66,28,'PRESENT','On time'),(329,66,29,'ABSENT','Medical leave'),(330,66,30,'PRESENT','On time'),(331,67,1,'PRESENT','On time'),(332,67,2,'EXCUSED','Sports meet practice'),(333,67,3,'PRESENT','On time'),(334,67,9,'ABSENT','Medical leave'),(335,67,10,'LATE','School bus delayed 15 mins'),(336,67,11,'PRESENT','On time'),(337,67,12,'PRESENT','On time'),(338,68,4,'PRESENT','On time'),(339,68,5,'PRESENT','On time'),(340,68,13,'PRESENT','On time'),(341,68,14,'PRESENT','On time'),(342,68,15,'PRESENT','On time'),(343,68,16,'PRESENT','On time'),(344,69,6,'PRESENT','On time'),(345,69,7,'ABSENT','Medical leave'),(346,69,17,'PRESENT','On time'),(347,69,18,'PRESENT','On time'),(348,69,19,'LATE','School bus delayed 15 mins'),(349,70,8,'PRESENT','On time'),(350,70,20,'PRESENT','On time'),(351,70,21,'PRESENT','On time'),(352,70,22,'EXCUSED','Sports meet practice'),(353,71,23,'PRESENT','On time'),(354,71,24,'ABSENT','Medical leave'),(355,71,25,'PRESENT','On time'),(356,71,26,'PRESENT','On time'),(357,72,27,'LATE','School bus delayed 15 mins'),(358,72,28,'PRESENT','On time'),(359,72,29,'PRESENT','On time'),(360,72,30,'PRESENT','On time'),(361,73,1,'PRESENT','On time'),(362,73,2,'PRESENT','On time'),(363,73,3,'ABSENT','Medical leave'),(364,73,9,'PRESENT','On time'),(365,73,10,'PRESENT','On time'),(366,73,11,'PRESENT','On time'),(367,73,12,'PRESENT','On time'),(368,74,4,'PRESENT','On time'),(369,74,5,'PRESENT','On time'),(370,74,13,'PRESENT','On time'),(371,74,14,'LATE','School bus delayed 15 mins'),(372,74,15,'PRESENT','On time'),(373,74,16,'PRESENT','On time'),(374,75,6,'PRESENT','On time'),(375,75,7,'PRESENT','On time'),(376,75,17,'EXCUSED','Sports meet practice'),(377,75,18,'PRESENT','On time'),(378,75,19,'PRESENT','On time'),(379,76,8,'PRESENT','On time'),(380,76,20,'PRESENT','On time'),(381,76,21,'PRESENT','On time'),(382,76,22,'PRESENT','On time'),(383,77,23,'PRESENT','On time'),(384,77,24,'PRESENT','On time'),(385,77,25,'PRESENT','On time'),(386,77,26,'PRESENT','On time'),(387,78,27,'PRESENT','On time'),(388,78,28,'PRESENT','On time'),(389,78,29,'PRESENT','On time'),(390,78,30,'PRESENT','On time'),(391,79,1,'PRESENT','On time'),(392,79,2,'PRESENT','On time'),(393,79,3,'PRESENT','On time'),(394,79,9,'LATE','School bus delayed 15 mins'),(395,79,10,'PRESENT','On time'),(396,79,11,'PRESENT','On time'),(397,79,12,'PRESENT','On time'),(398,80,4,'PRESENT','On time'),(399,80,5,'PRESENT','On time'),(400,80,13,'PRESENT','On time'),(401,80,14,'PRESENT','On time'),(402,80,15,'ABSENT','Medical leave'),(403,80,16,'PRESENT','On time'),(404,81,6,'PRESENT','On time'),(405,81,7,'LATE','School bus delayed 15 mins'),(406,81,17,'PRESENT','On time'),(407,81,18,'LATE','School bus delayed 15 mins'),(408,81,19,'PRESENT','On time'),(409,82,8,'PRESENT','On time'),(410,82,20,'PRESENT','On time'),(411,82,21,'PRESENT','On time'),(412,82,22,'PRESENT','On time'),(413,83,23,'PRESENT','On time'),(414,83,24,'PRESENT','On time'),(415,83,25,'PRESENT','On time'),(416,83,26,'PRESENT','On time'),(417,84,27,'PRESENT','On time'),(418,84,28,'PRESENT','On time'),(419,84,29,'PRESENT','On time'),(420,84,30,'ABSENT','Medical leave'),(421,85,1,'PRESENT','On time'),(422,85,2,'PRESENT','On time'),(423,85,3,'LATE','School bus delayed 15 mins'),(424,85,9,'PRESENT','On time'),(425,85,10,'ABSENT','Medical leave'),(426,85,11,'PRESENT','On time'),(427,85,12,'PRESENT','On time'),(428,86,4,'PRESENT','On time'),(429,86,5,'PRESENT','On time'),(430,86,13,'LATE','School bus delayed 15 mins'),(431,86,14,'PRESENT','On time'),(432,86,15,'PRESENT','On time'),(433,86,16,'PRESENT','On time'),(434,87,6,'PRESENT','On time'),(435,87,7,'PRESENT','On time'),(436,87,17,'PRESENT','On time'),(437,87,18,'PRESENT','On time'),(438,87,19,'PRESENT','On time'),(439,88,8,'PRESENT','On time'),(440,88,20,'PRESENT','On time'),(441,88,21,'PRESENT','On time'),(442,88,22,'LATE','School bus delayed 15 mins'),(443,89,23,'PRESENT','On time'),(444,89,24,'PRESENT','On time'),(445,89,25,'ABSENT','Medical leave'),(446,89,26,'EXCUSED','Sports meet practice'),(447,90,27,'PRESENT','On time'),(448,90,28,'PRESENT','On time'),(449,90,29,'PRESENT','On time'),(450,90,30,'PRESENT','On time'),(451,91,1,'PRESENT','On time'),(452,91,2,'PRESENT','On time'),(453,91,3,'PRESENT','On time'),(454,91,9,'PRESENT','On time'),(455,91,10,'PRESENT','On time'),(456,91,11,'PRESENT','On time'),(457,91,12,'PRESENT','On time'),(458,92,4,'PRESENT','On time'),(459,92,5,'PRESENT','On time'),(460,92,13,'PRESENT','On time'),(461,92,14,'PRESENT','On time'),(462,92,15,'PRESENT','On time'),(463,92,16,'PRESENT','On time'),(464,93,6,'PRESENT','On time'),(465,93,7,'PRESENT','On time'),(466,93,17,'LATE','School bus delayed 15 mins'),(467,93,18,'PRESENT','On time'),(468,93,19,'PRESENT','On time'),(469,94,8,'PRESENT','On time'),(470,94,20,'ABSENT','Medical leave'),(471,94,21,'EXCUSED','Sports meet practice'),(472,94,22,'PRESENT','On time'),(473,95,23,'PRESENT','On time'),(474,95,24,'PRESENT','On time'),(475,95,25,'PRESENT','On time'),(476,95,26,'LATE','School bus delayed 15 mins'),(477,96,27,'PRESENT','On time'),(478,96,28,'PRESENT','On time'),(479,96,29,'PRESENT','On time'),(480,96,30,'PRESENT','On time'),(481,97,1,'PRESENT','On time'),(482,97,2,'LATE','School bus delayed 15 mins'),(483,97,3,'PRESENT','On time'),(484,97,9,'PRESENT','On time'),(485,97,10,'PRESENT','On time'),(486,97,11,'PRESENT','On time'),(487,97,12,'PRESENT','On time'),(488,98,4,'PRESENT','On time'),(489,98,5,'PRESENT','On time'),(490,98,13,'PRESENT','On time'),(491,98,14,'PRESENT','On time'),(492,98,15,'PRESENT','On time'),(493,98,16,'ABSENT','Medical leave'),(494,99,6,'PRESENT','On time'),(495,99,7,'PRESENT','On time'),(496,99,17,'PRESENT','On time'),(497,99,18,'PRESENT','On time'),(498,99,19,'PRESENT','On time'),(499,100,8,'PRESENT','On time'),(500,100,20,'PRESENT','On time'),(501,100,21,'LATE','School bus delayed 15 mins'),(502,100,22,'PRESENT','On time'),(503,101,23,'PRESENT','On time'),(504,101,24,'PRESENT','On time'),(505,101,25,'PRESENT','On time'),(506,101,26,'PRESENT','On time'),(507,102,27,'PRESENT','On time'),(508,102,28,'PRESENT','On time'),(509,102,29,'PRESENT','On time'),(510,102,30,'LATE','School bus delayed 15 mins'),(511,103,1,'PRESENT','On time'),(512,103,2,'PRESENT','On time'),(513,103,3,'PRESENT','On time'),(514,103,9,'PRESENT','On time'),(515,103,10,'PRESENT','On time'),(516,103,11,'ABSENT','Medical leave'),(517,103,12,'EXCUSED','Sports meet practice'),(518,104,4,'PRESENT','On time'),(519,104,5,'PRESENT','On time'),(520,104,13,'PRESENT','On time'),(521,104,14,'PRESENT','On time'),(522,104,15,'PRESENT','On time'),(523,104,16,'PRESENT','On time'),(524,105,6,'PRESENT','On time'),(525,105,7,'PRESENT','On time'),(526,105,17,'PRESENT','On time'),(527,105,18,'PRESENT','On time'),(528,105,19,'PRESENT','On time'),(529,106,8,'ABSENT','Medical leave'),(530,106,20,'PRESENT','On time'),(531,106,21,'PRESENT','On time'),(532,106,22,'PRESENT','On time'),(533,107,23,'PRESENT','On time'),(534,107,24,'PRESENT','On time'),(535,107,25,'LATE','School bus delayed 15 mins'),(536,107,26,'ABSENT','Medical leave'),(537,108,27,'PRESENT','On time'),(538,108,28,'PRESENT','On time'),(539,108,29,'PRESENT','On time'),(540,108,30,'EXCUSED','Sports meet practice'),(541,109,1,'PRESENT','On time'),(542,109,2,'PRESENT','On time'),(543,109,3,'PRESENT','On time'),(544,109,9,'PRESENT','On time'),(545,109,10,'PRESENT','On time'),(546,109,11,'PRESENT','On time'),(547,109,12,'LATE','School bus delayed 15 mins'),(548,110,4,'ABSENT','Medical leave'),(549,110,5,'EXCUSED','Sports meet practice'),(550,110,13,'PRESENT','On time'),(551,110,14,'PRESENT','On time'),(552,110,15,'PRESENT','On time'),(553,110,16,'PRESENT','On time'),(554,111,6,'PRESENT','On time'),(555,111,7,'PRESENT','On time'),(556,111,17,'PRESENT','On time'),(557,111,18,'PRESENT','On time'),(558,111,19,'PRESENT','On time'),(559,112,8,'PRESENT','On time'),(560,112,20,'LATE','School bus delayed 15 mins'),(561,112,21,'ABSENT','Medical leave'),(562,112,22,'PRESENT','On time'),(563,113,23,'PRESENT','On time'),(564,113,24,'PRESENT','On time'),(565,113,25,'EXCUSED','Sports meet practice'),(566,113,26,'PRESENT','On time'),(567,114,27,'PRESENT','On time'),(568,114,28,'PRESENT','On time'),(569,114,29,'LATE','School bus delayed 15 mins'),(570,114,30,'PRESENT','On time'),(571,115,1,'PRESENT','On time'),(572,115,2,'PRESENT','On time'),(573,115,3,'PRESENT','On time'),(574,115,9,'PRESENT','On time'),(575,115,10,'PRESENT','On time'),(576,115,11,'PRESENT','On time'),(577,115,12,'PRESENT','On time'),(578,116,4,'PRESENT','On time'),(579,116,5,'LATE','School bus delayed 15 mins'),(580,116,13,'PRESENT','On time'),(581,116,14,'PRESENT','On time'),(582,116,15,'PRESENT','On time'),(583,116,16,'LATE','School bus delayed 15 mins'),(584,117,6,'PRESENT','On time'),(585,117,7,'PRESENT','On time'),(586,117,17,'PRESENT','On time'),(587,117,18,'PRESENT','On time'),(588,117,19,'PRESENT','On time'),(589,118,8,'PRESENT','On time'),(590,118,20,'EXCUSED','Sports meet practice'),(591,118,21,'PRESENT','On time'),(592,118,22,'PRESENT','On time'),(593,119,23,'PRESENT','On time'),(594,119,24,'LATE','School bus delayed 15 mins'),(595,119,25,'PRESENT','On time'),(596,119,26,'PRESENT','On time'),(597,120,27,'PRESENT','On time'),(598,120,28,'PRESENT','On time'),(599,120,29,'PRESENT','On time'),(600,120,30,'PRESENT','On time'),(601,121,1,'PRESENT','On time'),(602,121,2,'PRESENT','On time'),(603,121,3,'PRESENT','On time'),(604,121,9,'PRESENT','On time'),(605,121,10,'PRESENT','On time'),(606,121,11,'LATE','School bus delayed 15 mins'),(607,121,12,'ABSENT','Medical leave'),(608,122,4,'PRESENT','On time'),(609,122,5,'PRESENT','On time'),(610,122,13,'PRESENT','On time'),(611,122,14,'PRESENT','On time'),(612,122,15,'PRESENT','On time'),(613,122,16,'EXCUSED','Sports meet practice'),(614,123,6,'PRESENT','On time'),(615,123,7,'PRESENT','On time'),(616,123,17,'PRESENT','On time'),(617,123,18,'PRESENT','On time'),(618,123,19,'PRESENT','On time'),(619,124,8,'LATE','School bus delayed 15 mins'),(620,124,20,'PRESENT','On time'),(621,124,21,'PRESENT','On time'),(622,124,22,'PRESENT','On time'),(623,125,23,'PRESENT','On time'),(624,125,24,'PRESENT','On time'),(625,125,25,'PRESENT','On time'),(626,125,26,'PRESENT','On time'),(627,126,27,'PRESENT','On time'),(628,126,28,'LATE','School bus delayed 15 mins'),(629,126,29,'PRESENT','On time'),(630,126,30,'PRESENT','On time'),(631,127,1,'PRESENT','On time'),(632,127,2,'PRESENT','On time'),(633,127,3,'PRESENT','On time'),(634,127,9,'PRESENT','On time'),(635,127,10,'PRESENT','On time'),(636,127,11,'EXCUSED','Sports meet practice'),(637,127,12,'PRESENT','On time'),(638,128,4,'LATE','School bus delayed 15 mins'),(639,128,5,'ABSENT','Medical leave'),(640,128,13,'PRESENT','On time'),(641,128,14,'PRESENT','On time'),(642,128,15,'LATE','School bus delayed 15 mins'),(643,128,16,'PRESENT','On time'),(644,129,6,'PRESENT','On time'),(645,129,7,'PRESENT','On time'),(646,129,17,'PRESENT','On time'),(647,129,18,'PRESENT','On time'),(648,129,19,'PRESENT','On time'),(649,130,8,'EXCUSED','Sports meet practice'),(650,130,20,'PRESENT','On time'),(651,130,21,'PRESENT','On time'),(652,130,22,'ABSENT','Medical leave'),(653,131,23,'PRESENT','On time'),(654,131,24,'PRESENT','On time'),(655,131,25,'PRESENT','On time'),(656,131,26,'PRESENT','On time'),(657,132,27,'PRESENT','On time'),(658,132,28,'PRESENT','On time'),(659,132,29,'EXCUSED','Sports meet practice'),(660,132,30,'PRESENT','On time'),(661,133,1,'PRESENT','On time'),(662,133,2,'PRESENT','On time'),(663,133,3,'PRESENT','On time'),(664,133,9,'PRESENT','On time'),(665,133,10,'LATE','School bus delayed 15 mins'),(666,133,11,'PRESENT','On time'),(667,133,12,'PRESENT','On time'),(668,134,4,'EXCUSED','Sports meet practice'),(669,134,5,'PRESENT','On time'),(670,134,13,'PRESENT','On time'),(671,134,14,'PRESENT','On time'),(672,134,15,'PRESENT','On time'),(673,134,16,'PRESENT','On time'),(674,135,6,'PRESENT','On time'),(675,135,7,'PRESENT','On time'),(676,135,17,'ABSENT','Medical leave'),(677,135,18,'PRESENT','On time'),(678,135,19,'LATE','School bus delayed 15 mins'),(679,136,8,'PRESENT','On time'),(680,136,20,'PRESENT','On time'),(681,136,21,'PRESENT','On time'),(682,136,22,'PRESENT','On time'),(683,137,23,'PRESENT','On time'),(684,137,24,'EXCUSED','Sports meet practice'),(685,137,25,'PRESENT','On time'),(686,137,26,'PRESENT','On time'),(687,138,27,'LATE','School bus delayed 15 mins'),(688,138,28,'PRESENT','On time'),(689,138,29,'PRESENT','On time'),(690,138,30,'PRESENT','On time'),(691,139,1,'PRESENT','On time'),(692,139,2,'PRESENT','On time'),(693,139,3,'PRESENT','On time'),(694,139,9,'PRESENT','On time'),(695,139,10,'PRESENT','On time'),(696,139,11,'PRESENT','On time'),(697,139,12,'PRESENT','On time'),(698,140,4,'PRESENT','On time'),(699,140,5,'PRESENT','On time'),(700,140,13,'PRESENT','On time'),(701,140,14,'LATE','School bus delayed 15 mins'),(702,140,15,'PRESENT','On time'),(703,140,16,'PRESENT','On time'),(704,141,6,'PRESENT','On time'),(705,141,7,'PRESENT','On time'),(706,141,17,'PRESENT','On time'),(707,141,18,'PRESENT','On time'),(708,141,19,'PRESENT','On time'),(709,142,8,'PRESENT','On time'),(710,142,20,'PRESENT','On time'),(711,142,21,'PRESENT','On time'),(712,142,22,'PRESENT','On time'),(713,143,23,'PRESENT','On time'),(714,143,24,'PRESENT','On time'),(715,143,25,'PRESENT','On time'),(716,143,26,'PRESENT','On time'),(717,144,27,'ABSENT','Medical leave'),(718,144,28,'PRESENT','On time'),(719,144,29,'PRESENT','On time'),(720,144,30,'PRESENT','On time'),(721,145,1,'PRESENT','On time'),(722,145,2,'PRESENT','On time'),(723,145,3,'PRESENT','On time'),(724,145,9,'LATE','School bus delayed 15 mins'),(725,145,10,'PRESENT','On time'),(726,145,11,'PRESENT','On time'),(727,145,12,'PRESENT','On time'),(728,146,4,'PRESENT','On time'),(729,146,5,'PRESENT','On time'),(730,146,13,'PRESENT','On time'),(731,146,14,'PRESENT','On time'),(732,146,15,'EXCUSED','Sports meet practice'),(733,146,16,'PRESENT','On time'),(734,147,6,'PRESENT','On time'),(735,147,7,'LATE','School bus delayed 15 mins'),(736,147,17,'PRESENT','On time'),(737,147,18,'LATE','School bus delayed 15 mins'),(738,147,19,'PRESENT','On time'),(739,148,8,'PRESENT','On time'),(740,148,20,'PRESENT','On time'),(741,148,21,'PRESENT','On time'),(742,148,22,'PRESENT','On time'),(743,149,23,'PRESENT','On time'),(744,149,24,'PRESENT','On time'),(745,149,25,'PRESENT','On time'),(746,149,26,'PRESENT','On time'),(747,150,27,'PRESENT','On time'),(748,150,28,'PRESENT','On time'),(749,150,29,'PRESENT','On time'),(750,150,30,'PRESENT','On time'),(751,151,1,'PRESENT','On time'),(752,151,2,'PRESENT','On time'),(753,151,3,'LATE','School bus delayed 15 mins'),(754,151,9,'PRESENT','On time'),(755,151,10,'EXCUSED','Sports meet practice'),(756,151,11,'PRESENT','On time'),(757,151,12,'PRESENT','On time'),(758,152,4,'PRESENT','On time'),(759,152,5,'PRESENT','On time'),(760,152,13,'LATE','School bus delayed 15 mins'),(761,152,14,'PRESENT','On time'),(762,152,15,'PRESENT','On time'),(763,152,16,'PRESENT','On time'),(764,153,6,'PRESENT','On time'),(765,153,7,'PRESENT','On time'),(766,153,17,'PRESENT','On time'),(767,153,18,'ABSENT','Medical leave'),(768,153,19,'PRESENT','On time'),(769,154,8,'PRESENT','On time'),(770,154,20,'PRESENT','On time'),(771,154,21,'PRESENT','On time'),(772,154,22,'LATE','School bus delayed 15 mins'),(773,155,23,'PRESENT','On time'),(774,155,24,'PRESENT','On time'),(775,155,25,'PRESENT','On time'),(776,155,26,'PRESENT','On time'),(777,156,27,'PRESENT','On time'),(778,156,28,'EXCUSED','Sports meet practice'),(779,156,29,'PRESENT','On time'),(780,156,30,'PRESENT','On time');
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
) ENGINE=InnoDB AUTO_INCREMENT=157 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
INSERT INTO `attendance_records` VALUES (1,1,1,'2026-09-01',2026,1,'2026-09-01 08:15:00'),(2,2,2,'2026-09-01',2026,1,'2026-09-01 08:15:00'),(3,3,3,'2026-09-01',2026,1,'2026-09-01 08:15:00'),(4,4,5,'2026-09-01',2026,1,'2026-09-01 08:15:00'),(5,5,4,'2026-09-01',2026,1,'2026-09-01 08:15:00'),(6,6,10,'2026-09-01',2026,1,'2026-09-01 08:15:00'),(7,1,1,'2026-09-02',2026,1,'2026-09-02 08:15:00'),(8,2,2,'2026-09-02',2026,1,'2026-09-02 08:15:00'),(9,3,3,'2026-09-02',2026,1,'2026-09-02 08:15:00'),(10,4,5,'2026-09-02',2026,1,'2026-09-02 08:15:00'),(11,5,4,'2026-09-02',2026,1,'2026-09-02 08:15:00'),(12,6,10,'2026-09-02',2026,1,'2026-09-02 08:15:00'),(13,1,1,'2026-09-03',2026,1,'2026-09-03 08:15:00'),(14,2,2,'2026-09-03',2026,1,'2026-09-03 08:15:00'),(15,3,3,'2026-09-03',2026,1,'2026-09-03 08:15:00'),(16,4,5,'2026-09-03',2026,1,'2026-09-03 08:15:00'),(17,5,4,'2026-09-03',2026,1,'2026-09-03 08:15:00'),(18,6,10,'2026-09-03',2026,1,'2026-09-03 08:15:00'),(19,1,1,'2026-09-04',2026,1,'2026-09-04 08:15:00'),(20,2,2,'2026-09-04',2026,1,'2026-09-04 08:15:00'),(21,3,3,'2026-09-04',2026,1,'2026-09-04 08:15:00'),(22,4,5,'2026-09-04',2026,1,'2026-09-04 08:15:00'),(23,5,4,'2026-09-04',2026,1,'2026-09-04 08:15:00'),(24,6,10,'2026-09-04',2026,1,'2026-09-04 08:15:00'),(25,1,1,'2026-09-07',2026,1,'2026-09-07 08:15:00'),(26,2,2,'2026-09-07',2026,1,'2026-09-07 08:15:00'),(27,3,3,'2026-09-07',2026,1,'2026-09-07 08:15:00'),(28,4,5,'2026-09-07',2026,1,'2026-09-07 08:15:00'),(29,5,4,'2026-09-07',2026,1,'2026-09-07 08:15:00'),(30,6,10,'2026-09-07',2026,1,'2026-09-07 08:15:00'),(31,1,1,'2026-09-08',2026,1,'2026-09-08 08:15:00'),(32,2,2,'2026-09-08',2026,1,'2026-09-08 08:15:00'),(33,3,3,'2026-09-08',2026,1,'2026-09-08 08:15:00'),(34,4,5,'2026-09-08',2026,1,'2026-09-08 08:15:00'),(35,5,4,'2026-09-08',2026,1,'2026-09-08 08:15:00'),(36,6,10,'2026-09-08',2026,1,'2026-09-08 08:15:00'),(37,1,1,'2026-09-09',2026,1,'2026-09-09 08:15:00'),(38,2,2,'2026-09-09',2026,1,'2026-09-09 08:15:00'),(39,3,3,'2026-09-09',2026,1,'2026-09-09 08:15:00'),(40,4,5,'2026-09-09',2026,1,'2026-09-09 08:15:00'),(41,5,4,'2026-09-09',2026,1,'2026-09-09 08:15:00'),(42,6,10,'2026-09-09',2026,1,'2026-09-09 08:15:00'),(43,1,1,'2026-09-10',2026,1,'2026-09-10 08:15:00'),(44,2,2,'2026-09-10',2026,1,'2026-09-10 08:15:00'),(45,3,3,'2026-09-10',2026,1,'2026-09-10 08:15:00'),(46,4,5,'2026-09-10',2026,1,'2026-09-10 08:15:00'),(47,5,4,'2026-09-10',2026,1,'2026-09-10 08:15:00'),(48,6,10,'2026-09-10',2026,1,'2026-09-10 08:15:00'),(49,1,1,'2026-09-11',2026,1,'2026-09-11 08:15:00'),(50,2,2,'2026-09-11',2026,1,'2026-09-11 08:15:00'),(51,3,3,'2026-09-11',2026,1,'2026-09-11 08:15:00'),(52,4,5,'2026-09-11',2026,1,'2026-09-11 08:15:00'),(53,5,4,'2026-09-11',2026,1,'2026-09-11 08:15:00'),(54,6,10,'2026-09-11',2026,1,'2026-09-11 08:15:00'),(55,1,1,'2026-09-14',2026,1,'2026-09-14 08:15:00'),(56,2,2,'2026-09-14',2026,1,'2026-09-14 08:15:00'),(57,3,3,'2026-09-14',2026,1,'2026-09-14 08:15:00'),(58,4,5,'2026-09-14',2026,1,'2026-09-14 08:15:00'),(59,5,4,'2026-09-14',2026,1,'2026-09-14 08:15:00'),(60,6,10,'2026-09-14',2026,1,'2026-09-14 08:15:00'),(61,1,1,'2026-09-15',2026,1,'2026-09-15 08:15:00'),(62,2,2,'2026-09-15',2026,1,'2026-09-15 08:15:00'),(63,3,3,'2026-09-15',2026,1,'2026-09-15 08:15:00'),(64,4,5,'2026-09-15',2026,1,'2026-09-15 08:15:00'),(65,5,4,'2026-09-15',2026,1,'2026-09-15 08:15:00'),(66,6,10,'2026-09-15',2026,1,'2026-09-15 08:15:00'),(67,1,1,'2026-09-16',2026,1,'2026-09-16 08:15:00'),(68,2,2,'2026-09-16',2026,1,'2026-09-16 08:15:00'),(69,3,3,'2026-09-16',2026,1,'2026-09-16 08:15:00'),(70,4,5,'2026-09-16',2026,1,'2026-09-16 08:15:00'),(71,5,4,'2026-09-16',2026,1,'2026-09-16 08:15:00'),(72,6,10,'2026-09-16',2026,1,'2026-09-16 08:15:00'),(73,1,1,'2026-09-17',2026,1,'2026-09-17 08:15:00'),(74,2,2,'2026-09-17',2026,1,'2026-09-17 08:15:00'),(75,3,3,'2026-09-17',2026,1,'2026-09-17 08:15:00'),(76,4,5,'2026-09-17',2026,1,'2026-09-17 08:15:00'),(77,5,4,'2026-09-17',2026,1,'2026-09-17 08:15:00'),(78,6,10,'2026-09-17',2026,1,'2026-09-17 08:15:00'),(79,1,1,'2026-09-18',2026,1,'2026-09-18 08:15:00'),(80,2,2,'2026-09-18',2026,1,'2026-09-18 08:15:00'),(81,3,3,'2026-09-18',2026,1,'2026-09-18 08:15:00'),(82,4,5,'2026-09-18',2026,1,'2026-09-18 08:15:00'),(83,5,4,'2026-09-18',2026,1,'2026-09-18 08:15:00'),(84,6,10,'2026-09-18',2026,1,'2026-09-18 08:15:00'),(85,1,1,'2026-09-21',2026,1,'2026-09-21 08:15:00'),(86,2,2,'2026-09-21',2026,1,'2026-09-21 08:15:00'),(87,3,3,'2026-09-21',2026,1,'2026-09-21 08:15:00'),(88,4,5,'2026-09-21',2026,1,'2026-09-21 08:15:00'),(89,5,4,'2026-09-21',2026,1,'2026-09-21 08:15:00'),(90,6,10,'2026-09-21',2026,1,'2026-09-21 08:15:00'),(91,1,1,'2026-09-22',2026,1,'2026-09-22 08:15:00'),(92,2,2,'2026-09-22',2026,1,'2026-09-22 08:15:00'),(93,3,3,'2026-09-22',2026,1,'2026-09-22 08:15:00'),(94,4,5,'2026-09-22',2026,1,'2026-09-22 08:15:00'),(95,5,4,'2026-09-22',2026,1,'2026-09-22 08:15:00'),(96,6,10,'2026-09-22',2026,1,'2026-09-22 08:15:00'),(97,1,1,'2026-09-23',2026,1,'2026-09-23 08:15:00'),(98,2,2,'2026-09-23',2026,1,'2026-09-23 08:15:00'),(99,3,3,'2026-09-23',2026,1,'2026-09-23 08:15:00'),(100,4,5,'2026-09-23',2026,1,'2026-09-23 08:15:00'),(101,5,4,'2026-09-23',2026,1,'2026-09-23 08:15:00'),(102,6,10,'2026-09-23',2026,1,'2026-09-23 08:15:00'),(103,1,1,'2026-09-24',2026,1,'2026-09-24 08:15:00'),(104,2,2,'2026-09-24',2026,1,'2026-09-24 08:15:00'),(105,3,3,'2026-09-24',2026,1,'2026-09-24 08:15:00'),(106,4,5,'2026-09-24',2026,1,'2026-09-24 08:15:00'),(107,5,4,'2026-09-24',2026,1,'2026-09-24 08:15:00'),(108,6,10,'2026-09-24',2026,1,'2026-09-24 08:15:00'),(109,1,1,'2026-09-25',2026,1,'2026-09-25 08:15:00'),(110,2,2,'2026-09-25',2026,1,'2026-09-25 08:15:00'),(111,3,3,'2026-09-25',2026,1,'2026-09-25 08:15:00'),(112,4,5,'2026-09-25',2026,1,'2026-09-25 08:15:00'),(113,5,4,'2026-09-25',2026,1,'2026-09-25 08:15:00'),(114,6,10,'2026-09-25',2026,1,'2026-09-25 08:15:00'),(115,1,1,'2026-09-28',2026,1,'2026-09-28 08:15:00'),(116,2,2,'2026-09-28',2026,1,'2026-09-28 08:15:00'),(117,3,3,'2026-09-28',2026,1,'2026-09-28 08:15:00'),(118,4,5,'2026-09-28',2026,1,'2026-09-28 08:15:00'),(119,5,4,'2026-09-28',2026,1,'2026-09-28 08:15:00'),(120,6,10,'2026-09-28',2026,1,'2026-09-28 08:15:00'),(121,1,1,'2026-09-29',2026,1,'2026-09-29 08:15:00'),(122,2,2,'2026-09-29',2026,1,'2026-09-29 08:15:00'),(123,3,3,'2026-09-29',2026,1,'2026-09-29 08:15:00'),(124,4,5,'2026-09-29',2026,1,'2026-09-29 08:15:00'),(125,5,4,'2026-09-29',2026,1,'2026-09-29 08:15:00'),(126,6,10,'2026-09-29',2026,1,'2026-09-29 08:15:00'),(127,1,1,'2026-09-30',2026,1,'2026-09-30 08:15:00'),(128,2,2,'2026-09-30',2026,1,'2026-09-30 08:15:00'),(129,3,3,'2026-09-30',2026,1,'2026-09-30 08:15:00'),(130,4,5,'2026-09-30',2026,1,'2026-09-30 08:15:00'),(131,5,4,'2026-09-30',2026,1,'2026-09-30 08:15:00'),(132,6,10,'2026-09-30',2026,1,'2026-09-30 08:15:00'),(133,1,1,'2026-10-01',2026,1,'2026-10-01 08:15:00'),(134,2,2,'2026-10-01',2026,1,'2026-10-01 08:15:00'),(135,3,3,'2026-10-01',2026,1,'2026-10-01 08:15:00'),(136,4,5,'2026-10-01',2026,1,'2026-10-01 08:15:00'),(137,5,4,'2026-10-01',2026,1,'2026-10-01 08:15:00'),(138,6,10,'2026-10-01',2026,1,'2026-10-01 08:15:00'),(139,1,1,'2026-10-02',2026,1,'2026-10-02 08:15:00'),(140,2,2,'2026-10-02',2026,1,'2026-10-02 08:15:00'),(141,3,3,'2026-10-02',2026,1,'2026-10-02 08:15:00'),(142,4,5,'2026-10-02',2026,1,'2026-10-02 08:15:00'),(143,5,4,'2026-10-02',2026,1,'2026-10-02 08:15:00'),(144,6,10,'2026-10-02',2026,1,'2026-10-02 08:15:00'),(145,1,1,'2026-10-05',2026,1,'2026-10-05 08:15:00'),(146,2,2,'2026-10-05',2026,1,'2026-10-05 08:15:00'),(147,3,3,'2026-10-05',2026,1,'2026-10-05 08:15:00'),(148,4,5,'2026-10-05',2026,1,'2026-10-05 08:15:00'),(149,5,4,'2026-10-05',2026,1,'2026-10-05 08:15:00'),(150,6,10,'2026-10-05',2026,1,'2026-10-05 08:15:00'),(151,1,1,'2026-10-06',2026,0,'2026-10-06 08:15:00'),(152,2,2,'2026-10-06',2026,0,'2026-10-06 08:15:00'),(153,3,3,'2026-10-06',2026,0,'2026-10-06 08:15:00'),(154,4,5,'2026-10-06',2026,0,'2026-10-06 08:15:00'),(155,5,4,'2026-10-06',2026,0,'2026-10-06 08:15:00'),(156,6,10,'2026-10-06',2026,0,'2026-10-06 08:15:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_papers`
--

LOCK TABLES `exam_papers` WRITE;
/*!40000 ALTER TABLE `exam_papers` DISABLE KEYS */;
INSERT INTO `exam_papers` VALUES (1,1,1,10,100.00),(2,1,2,10,100.00),(3,1,3,10,100.00),(4,1,4,10,100.00),(5,1,5,10,100.00),(6,1,6,10,100.00),(7,1,110,10,100.00),(8,1,111,10,100.00),(9,1,112,10,100.00),(10,1,113,10,100.00),(11,1,114,10,100.00),(12,1,115,10,100.00),(13,1,116,10,100.00),(14,1,7,11,100.00),(15,1,8,11,100.00),(16,1,117,11,100.00),(17,1,118,11,100.00),(18,1,119,11,100.00),(19,1,120,11,100.00),(20,1,121,11,100.00),(21,1,122,11,100.00),(22,1,123,11,100.00),(23,1,124,11,100.00),(24,1,125,11,100.00),(25,1,126,11,100.00),(26,1,127,11,100.00),(27,1,101,9,100.00),(28,1,102,9,100.00),(29,1,103,9,100.00),(30,1,104,9,100.00),(31,1,105,9,100.00),(32,1,106,9,100.00),(33,1,107,9,100.00),(34,1,108,9,100.00),(35,1,109,9,100.00),(36,1,128,9,100.00),(37,2,1,10,100.00),(38,2,2,10,100.00),(39,2,3,10,100.00),(40,2,4,10,100.00),(41,2,5,10,100.00),(42,2,6,10,100.00),(43,2,7,11,100.00),(44,2,8,11,100.00),(45,2,117,11,100.00),(46,2,118,11,100.00),(47,2,119,11,100.00),(48,2,120,11,100.00),(49,2,101,9,100.00),(50,2,102,9,100.00),(51,2,103,9,100.00),(52,2,104,9,100.00),(53,2,105,9,100.00),(54,2,106,9,100.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=547 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_results`
--

LOCK TABLES `exam_results` WRITE;
/*!40000 ALTER TABLE `exam_results` DISABLE KEYS */;
INSERT INTO `exam_results` VALUES (1,1,1,95.00,'A+',1,'2026-09-01 08:00:00'),(2,1,2,96.00,'A+',1,'2026-09-01 08:00:00'),(3,1,3,78.00,'A',1,'2026-09-01 08:00:00'),(4,1,9,80.00,'A',1,'2026-09-01 08:00:00'),(5,1,10,85.00,'A',1,'2026-09-01 08:00:00'),(6,1,11,75.00,'A',1,'2026-09-01 08:00:00'),(7,1,12,87.00,'A',1,'2026-09-01 08:00:00'),(8,1,4,78.00,'A',1,'2026-09-01 08:00:00'),(9,1,5,84.00,'A',1,'2026-09-01 08:00:00'),(10,1,13,85.00,'A',1,'2026-09-01 08:00:00'),(11,1,14,82.00,'A',1,'2026-09-01 08:00:00'),(12,1,15,77.00,'A',1,'2026-09-01 08:00:00'),(13,1,16,83.00,'A',1,'2026-09-01 08:00:00'),(14,2,1,90.00,'A+',1,'2026-09-01 08:00:00'),(15,2,2,90.00,'A+',1,'2026-09-01 08:00:00'),(16,2,3,72.00,'B',1,'2026-09-01 08:00:00'),(17,2,9,89.00,'A',1,'2026-09-01 08:00:00'),(18,2,10,79.00,'A',1,'2026-09-01 08:00:00'),(19,2,11,84.00,'A',1,'2026-09-01 08:00:00'),(20,2,12,81.00,'A',1,'2026-09-01 08:00:00'),(21,2,4,72.00,'B',1,'2026-09-01 08:00:00'),(22,2,5,78.00,'A',1,'2026-09-01 08:00:00'),(23,2,13,79.00,'A',1,'2026-09-01 08:00:00'),(24,2,14,76.00,'A',1,'2026-09-01 08:00:00'),(25,2,15,71.00,'B',1,'2026-09-01 08:00:00'),(26,2,16,77.00,'A',1,'2026-09-01 08:00:00'),(27,3,1,86.00,'A',1,'2026-09-01 08:00:00'),(28,3,2,96.00,'A+',1,'2026-09-01 08:00:00'),(29,3,3,78.00,'A',1,'2026-09-01 08:00:00'),(30,3,9,95.00,'A+',1,'2026-09-01 08:00:00'),(31,3,10,85.00,'A',1,'2026-09-01 08:00:00'),(32,3,11,90.00,'A+',1,'2026-09-01 08:00:00'),(33,3,12,87.00,'A',1,'2026-09-01 08:00:00'),(34,3,4,78.00,'A',1,'2026-09-01 08:00:00'),(35,3,5,98.00,'A+',1,'2026-09-01 08:00:00'),(36,3,13,85.00,'A',1,'2026-09-01 08:00:00'),(37,3,14,82.00,'A',1,'2026-09-01 08:00:00'),(38,3,15,77.00,'A',1,'2026-09-01 08:00:00'),(39,3,16,83.00,'A',1,'2026-09-01 08:00:00'),(40,4,1,98.00,'A+',1,'2026-09-01 08:00:00'),(41,4,2,89.00,'A',1,'2026-09-01 08:00:00'),(42,4,3,86.00,'A',1,'2026-09-01 08:00:00'),(43,4,9,88.00,'A',1,'2026-09-01 08:00:00'),(44,4,10,78.00,'A',1,'2026-09-01 08:00:00'),(45,4,11,83.00,'A',1,'2026-09-01 08:00:00'),(46,4,12,80.00,'A',1,'2026-09-01 08:00:00'),(47,4,4,71.00,'B',1,'2026-09-01 08:00:00'),(48,4,5,92.00,'A+',1,'2026-09-01 08:00:00'),(49,4,13,78.00,'A',1,'2026-09-01 08:00:00'),(50,4,14,75.00,'A',1,'2026-09-01 08:00:00'),(51,4,15,70.00,'B',1,'2026-09-01 08:00:00'),(52,4,16,91.00,'A+',1,'2026-09-01 08:00:00'),(53,5,1,93.00,'A+',1,'2026-09-01 08:00:00'),(54,5,2,82.00,'A',1,'2026-09-01 08:00:00'),(55,5,3,79.00,'A',1,'2026-09-01 08:00:00'),(56,5,9,81.00,'A',1,'2026-09-01 08:00:00'),(57,5,10,71.00,'B',1,'2026-09-01 08:00:00'),(58,5,11,76.00,'A',1,'2026-09-01 08:00:00'),(59,5,12,88.00,'A',1,'2026-09-01 08:00:00'),(60,5,4,64.00,'C',1,'2026-09-01 08:00:00'),(61,5,5,85.00,'A',1,'2026-09-01 08:00:00'),(62,5,13,71.00,'B',1,'2026-09-01 08:00:00'),(63,5,14,83.00,'A',1,'2026-09-01 08:00:00'),(64,5,15,63.00,'C',1,'2026-09-01 08:00:00'),(65,5,16,84.00,'A',1,'2026-09-01 08:00:00'),(66,6,1,96.00,'A+',1,'2026-09-01 08:00:00'),(67,6,2,92.00,'A+',1,'2026-09-01 08:00:00'),(68,6,3,89.00,'A',1,'2026-09-01 08:00:00'),(69,6,9,91.00,'A+',1,'2026-09-01 08:00:00'),(70,6,10,96.00,'A+',1,'2026-09-01 08:00:00'),(71,6,11,86.00,'A',1,'2026-09-01 08:00:00'),(72,6,12,98.00,'A+',1,'2026-09-01 08:00:00'),(73,6,4,74.00,'B',1,'2026-09-01 08:00:00'),(74,6,5,95.00,'A+',1,'2026-09-01 08:00:00'),(75,6,13,81.00,'A',1,'2026-09-01 08:00:00'),(76,6,14,93.00,'A+',1,'2026-09-01 08:00:00'),(77,6,15,73.00,'B',1,'2026-09-01 08:00:00'),(78,6,16,94.00,'A+',1,'2026-09-01 08:00:00'),(79,7,1,93.00,'A+',1,'2026-09-01 08:00:00'),(80,7,2,82.00,'A',1,'2026-09-01 08:00:00'),(81,7,3,79.00,'A',1,'2026-09-01 08:00:00'),(82,7,9,81.00,'A',1,'2026-09-01 08:00:00'),(83,7,10,86.00,'A',1,'2026-09-01 08:00:00'),(84,7,11,76.00,'A',1,'2026-09-01 08:00:00'),(85,7,12,88.00,'A',1,'2026-09-01 08:00:00'),(86,7,4,79.00,'A',1,'2026-09-01 08:00:00'),(87,7,5,85.00,'A',1,'2026-09-01 08:00:00'),(88,7,13,71.00,'B',1,'2026-09-01 08:00:00'),(89,7,14,83.00,'A',1,'2026-09-01 08:00:00'),(90,7,15,63.00,'C',1,'2026-09-01 08:00:00'),(91,7,16,84.00,'A',1,'2026-09-01 08:00:00'),(92,8,1,98.00,'A+',1,'2026-09-01 08:00:00'),(93,8,2,98.00,'A+',1,'2026-09-01 08:00:00'),(94,8,3,88.00,'A',1,'2026-09-01 08:00:00'),(95,8,9,90.00,'A+',1,'2026-09-01 08:00:00'),(96,8,10,95.00,'A+',1,'2026-09-01 08:00:00'),(97,8,11,85.00,'A',1,'2026-09-01 08:00:00'),(98,8,12,97.00,'A+',1,'2026-09-01 08:00:00'),(99,8,4,88.00,'A',1,'2026-09-01 08:00:00'),(100,8,5,94.00,'A+',1,'2026-09-01 08:00:00'),(101,8,13,80.00,'A',1,'2026-09-01 08:00:00'),(102,8,14,92.00,'A+',1,'2026-09-01 08:00:00'),(103,8,15,87.00,'A',1,'2026-09-01 08:00:00'),(104,8,16,93.00,'A+',1,'2026-09-01 08:00:00'),(105,9,1,92.00,'A+',1,'2026-09-01 08:00:00'),(106,9,2,96.00,'A+',1,'2026-09-01 08:00:00'),(107,9,3,78.00,'A',1,'2026-09-01 08:00:00'),(108,9,9,80.00,'A',1,'2026-09-01 08:00:00'),(109,9,10,85.00,'A',1,'2026-09-01 08:00:00'),(110,9,11,90.00,'A+',1,'2026-09-01 08:00:00'),(111,9,12,87.00,'A',1,'2026-09-01 08:00:00'),(112,9,4,78.00,'A',1,'2026-09-01 08:00:00'),(113,9,5,84.00,'A',1,'2026-09-01 08:00:00'),(114,9,13,85.00,'A',1,'2026-09-01 08:00:00'),(115,9,14,82.00,'A',1,'2026-09-01 08:00:00'),(116,9,15,77.00,'A',1,'2026-09-01 08:00:00'),(117,9,16,83.00,'A',1,'2026-09-01 08:00:00'),(118,10,1,86.00,'A',1,'2026-09-01 08:00:00'),(119,10,2,90.00,'A+',1,'2026-09-01 08:00:00'),(120,10,3,72.00,'B',1,'2026-09-01 08:00:00'),(121,10,9,89.00,'A',1,'2026-09-01 08:00:00'),(122,10,10,79.00,'A',1,'2026-09-01 08:00:00'),(123,10,11,84.00,'A',1,'2026-09-01 08:00:00'),(124,10,12,81.00,'A',1,'2026-09-01 08:00:00'),(125,10,4,72.00,'B',1,'2026-09-01 08:00:00'),(126,10,5,78.00,'A',1,'2026-09-01 08:00:00'),(127,10,13,79.00,'A',1,'2026-09-01 08:00:00'),(128,10,14,76.00,'A',1,'2026-09-01 08:00:00'),(129,10,15,71.00,'B',1,'2026-09-01 08:00:00'),(130,10,16,77.00,'A',1,'2026-09-01 08:00:00'),(131,11,1,98.00,'A+',1,'2026-09-01 08:00:00'),(132,11,2,98.00,'A+',1,'2026-09-01 08:00:00'),(133,11,3,98.00,'A+',1,'2026-09-01 08:00:00'),(134,11,9,98.00,'A+',1,'2026-09-01 08:00:00'),(135,11,10,92.00,'A+',1,'2026-09-01 08:00:00'),(136,11,11,97.00,'A+',1,'2026-09-01 08:00:00'),(137,11,12,94.00,'A+',1,'2026-09-01 08:00:00'),(138,11,4,85.00,'A',1,'2026-09-01 08:00:00'),(139,11,5,98.00,'A+',1,'2026-09-01 08:00:00'),(140,11,13,92.00,'A+',1,'2026-09-01 08:00:00'),(141,11,14,89.00,'A',1,'2026-09-01 08:00:00'),(142,11,15,84.00,'A',1,'2026-09-01 08:00:00'),(143,11,16,90.00,'A+',1,'2026-09-01 08:00:00'),(144,12,1,92.00,'A+',1,'2026-09-01 08:00:00'),(145,12,2,81.00,'A',1,'2026-09-01 08:00:00'),(146,12,3,78.00,'A',1,'2026-09-01 08:00:00'),(147,12,9,80.00,'A',1,'2026-09-01 08:00:00'),(148,12,10,70.00,'B',1,'2026-09-01 08:00:00'),(149,12,11,75.00,'A',1,'2026-09-01 08:00:00'),(150,12,12,72.00,'B',1,'2026-09-01 08:00:00'),(151,12,4,63.00,'C',1,'2026-09-01 08:00:00'),(152,12,5,84.00,'A',1,'2026-09-01 08:00:00'),(153,12,13,70.00,'B',1,'2026-09-01 08:00:00'),(154,12,14,82.00,'A',1,'2026-09-01 08:00:00'),(155,12,15,62.00,'C',1,'2026-09-01 08:00:00'),(156,12,16,83.00,'A',1,'2026-09-01 08:00:00'),(157,13,1,93.00,'A+',1,'2026-09-01 08:00:00'),(158,13,2,82.00,'A',1,'2026-09-01 08:00:00'),(159,13,3,79.00,'A',1,'2026-09-01 08:00:00'),(160,13,9,81.00,'A',1,'2026-09-01 08:00:00'),(161,13,10,86.00,'A',1,'2026-09-01 08:00:00'),(162,13,11,76.00,'A',1,'2026-09-01 08:00:00'),(163,13,12,88.00,'A',1,'2026-09-01 08:00:00'),(164,13,4,64.00,'C',1,'2026-09-01 08:00:00'),(165,13,5,85.00,'A',1,'2026-09-01 08:00:00'),(166,13,13,71.00,'B',1,'2026-09-01 08:00:00'),(167,13,14,83.00,'A',1,'2026-09-01 08:00:00'),(168,13,15,63.00,'C',1,'2026-09-01 08:00:00'),(169,13,16,84.00,'A',1,'2026-09-01 08:00:00'),(170,14,6,95.00,'A+',1,'2026-09-01 08:00:00'),(171,14,7,89.00,'A',1,'2026-09-01 08:00:00'),(172,14,17,81.00,'A',1,'2026-09-01 08:00:00'),(173,14,18,90.00,'A+',1,'2026-09-01 08:00:00'),(174,14,19,72.00,'B',1,'2026-09-01 08:00:00'),(175,14,8,84.00,'A',1,'2026-09-01 08:00:00'),(176,14,20,82.00,'A',1,'2026-09-01 08:00:00'),(177,14,21,84.00,'A',1,'2026-09-01 08:00:00'),(178,14,22,85.00,'A',1,'2026-09-01 08:00:00'),(179,15,6,90.00,'A+',1,'2026-09-01 08:00:00'),(180,15,7,84.00,'A',1,'2026-09-01 08:00:00'),(181,15,17,91.00,'A+',1,'2026-09-01 08:00:00'),(182,15,18,85.00,'A',1,'2026-09-01 08:00:00'),(183,15,19,82.00,'A',1,'2026-09-01 08:00:00'),(184,15,8,79.00,'A',1,'2026-09-01 08:00:00'),(185,15,20,77.00,'A',1,'2026-09-01 08:00:00'),(186,15,21,79.00,'A',1,'2026-09-01 08:00:00'),(187,15,22,80.00,'A',1,'2026-09-01 08:00:00'),(188,16,6,95.00,'A+',1,'2026-09-01 08:00:00'),(189,16,7,89.00,'A',1,'2026-09-01 08:00:00'),(190,16,17,96.00,'A+',1,'2026-09-01 08:00:00'),(191,16,18,90.00,'A+',1,'2026-09-01 08:00:00'),(192,16,19,87.00,'A',1,'2026-09-01 08:00:00'),(193,16,8,84.00,'A',1,'2026-09-01 08:00:00'),(194,16,20,82.00,'A',1,'2026-09-01 08:00:00'),(195,16,21,84.00,'A',1,'2026-09-01 08:00:00'),(196,16,22,85.00,'A',1,'2026-09-01 08:00:00'),(197,17,6,91.00,'A+',1,'2026-09-01 08:00:00'),(198,17,7,85.00,'A',1,'2026-09-01 08:00:00'),(199,17,17,92.00,'A+',1,'2026-09-01 08:00:00'),(200,17,18,86.00,'A',1,'2026-09-01 08:00:00'),(201,17,19,83.00,'A',1,'2026-09-01 08:00:00'),(202,17,8,80.00,'A',1,'2026-09-01 08:00:00'),(203,17,20,78.00,'A',1,'2026-09-01 08:00:00'),(204,17,21,80.00,'A',1,'2026-09-01 08:00:00'),(205,17,22,81.00,'A',1,'2026-09-01 08:00:00'),(206,18,6,85.00,'A',1,'2026-09-01 08:00:00'),(207,18,7,94.00,'A+',1,'2026-09-01 08:00:00'),(208,18,17,86.00,'A',1,'2026-09-01 08:00:00'),(209,18,18,80.00,'A',1,'2026-09-01 08:00:00'),(210,18,19,77.00,'A',1,'2026-09-01 08:00:00'),(211,18,8,74.00,'B',1,'2026-09-01 08:00:00'),(212,18,20,87.00,'A',1,'2026-09-01 08:00:00'),(213,18,21,74.00,'B',1,'2026-09-01 08:00:00'),(214,18,22,90.00,'A+',1,'2026-09-01 08:00:00'),(215,19,6,95.00,'A+',1,'2026-09-01 08:00:00'),(216,19,7,98.00,'A+',1,'2026-09-01 08:00:00'),(217,19,17,96.00,'A+',1,'2026-09-01 08:00:00'),(218,19,18,98.00,'A+',1,'2026-09-01 08:00:00'),(219,19,19,87.00,'A',1,'2026-09-01 08:00:00'),(220,19,8,84.00,'A',1,'2026-09-01 08:00:00'),(221,19,20,97.00,'A+',1,'2026-09-01 08:00:00'),(222,19,21,84.00,'A',1,'2026-09-01 08:00:00'),(223,19,22,98.00,'A+',1,'2026-09-01 08:00:00'),(224,20,6,84.00,'A',1,'2026-09-01 08:00:00'),(225,20,7,93.00,'A+',1,'2026-09-01 08:00:00'),(226,20,17,85.00,'A',1,'2026-09-01 08:00:00'),(227,20,18,94.00,'A+',1,'2026-09-01 08:00:00'),(228,20,19,76.00,'A',1,'2026-09-01 08:00:00'),(229,20,8,73.00,'B',1,'2026-09-01 08:00:00'),(230,20,20,86.00,'A',1,'2026-09-01 08:00:00'),(231,20,21,73.00,'B',1,'2026-09-01 08:00:00'),(232,20,22,89.00,'A',1,'2026-09-01 08:00:00'),(233,21,6,93.00,'A+',1,'2026-09-01 08:00:00'),(234,21,7,98.00,'A+',1,'2026-09-01 08:00:00'),(235,21,17,94.00,'A+',1,'2026-09-01 08:00:00'),(236,21,18,98.00,'A+',1,'2026-09-01 08:00:00'),(237,21,19,85.00,'A',1,'2026-09-01 08:00:00'),(238,21,8,97.00,'A+',1,'2026-09-01 08:00:00'),(239,21,20,95.00,'A+',1,'2026-09-01 08:00:00'),(240,21,21,82.00,'A',1,'2026-09-01 08:00:00'),(241,21,22,98.00,'A+',1,'2026-09-01 08:00:00'),(242,22,6,98.00,'A+',1,'2026-09-01 08:00:00'),(243,22,7,92.00,'A+',1,'2026-09-01 08:00:00'),(244,22,17,84.00,'A',1,'2026-09-01 08:00:00'),(245,22,18,93.00,'A+',1,'2026-09-01 08:00:00'),(246,22,19,90.00,'A+',1,'2026-09-01 08:00:00'),(247,22,8,87.00,'A',1,'2026-09-01 08:00:00'),(248,22,20,85.00,'A',1,'2026-09-01 08:00:00'),(249,22,21,87.00,'A',1,'2026-09-01 08:00:00'),(250,22,22,88.00,'A',1,'2026-09-01 08:00:00'),(251,23,6,92.00,'A+',1,'2026-09-01 08:00:00'),(252,23,7,86.00,'A',1,'2026-09-01 08:00:00'),(253,23,17,93.00,'A+',1,'2026-09-01 08:00:00'),(254,23,18,87.00,'A',1,'2026-09-01 08:00:00'),(255,23,19,84.00,'A',1,'2026-09-01 08:00:00'),(256,23,8,81.00,'A',1,'2026-09-01 08:00:00'),(257,23,20,79.00,'A',1,'2026-09-01 08:00:00'),(258,23,21,81.00,'A',1,'2026-09-01 08:00:00'),(259,23,22,82.00,'A',1,'2026-09-01 08:00:00'),(260,24,6,98.00,'A+',1,'2026-09-01 08:00:00'),(261,24,7,97.00,'A+',1,'2026-09-01 08:00:00'),(262,24,17,98.00,'A+',1,'2026-09-01 08:00:00'),(263,24,18,98.00,'A+',1,'2026-09-01 08:00:00'),(264,24,19,95.00,'A+',1,'2026-09-01 08:00:00'),(265,24,8,92.00,'A+',1,'2026-09-01 08:00:00'),(266,24,20,90.00,'A+',1,'2026-09-01 08:00:00'),(267,24,21,92.00,'A+',1,'2026-09-01 08:00:00'),(268,24,22,93.00,'A+',1,'2026-09-01 08:00:00'),(269,25,6,83.00,'A',1,'2026-09-01 08:00:00'),(270,25,7,92.00,'A+',1,'2026-09-01 08:00:00'),(271,25,17,84.00,'A',1,'2026-09-01 08:00:00'),(272,25,18,78.00,'A',1,'2026-09-01 08:00:00'),(273,25,19,75.00,'A',1,'2026-09-01 08:00:00'),(274,25,8,72.00,'B',1,'2026-09-01 08:00:00'),(275,25,20,70.00,'B',1,'2026-09-01 08:00:00'),(276,25,21,72.00,'B',1,'2026-09-01 08:00:00'),(277,25,22,88.00,'A',1,'2026-09-01 08:00:00'),(278,26,6,84.00,'A',1,'2026-09-01 08:00:00'),(279,26,7,93.00,'A+',1,'2026-09-01 08:00:00'),(280,26,17,85.00,'A',1,'2026-09-01 08:00:00'),(281,26,18,94.00,'A+',1,'2026-09-01 08:00:00'),(282,26,19,76.00,'A',1,'2026-09-01 08:00:00'),(283,26,8,73.00,'B',1,'2026-09-01 08:00:00'),(284,26,20,86.00,'A',1,'2026-09-01 08:00:00'),(285,26,21,73.00,'B',1,'2026-09-01 08:00:00'),(286,26,22,89.00,'A',1,'2026-09-01 08:00:00'),(287,27,23,94.00,'A+',1,'2026-09-01 08:00:00'),(288,27,24,87.00,'A',1,'2026-09-01 08:00:00'),(289,27,25,75.00,'A',1,'2026-09-01 08:00:00'),(290,27,26,88.00,'A',1,'2026-09-01 08:00:00'),(291,27,27,72.00,'B',1,'2026-09-01 08:00:00'),(292,27,28,84.00,'A',1,'2026-09-01 08:00:00'),(293,27,29,89.00,'A',1,'2026-09-01 08:00:00'),(294,27,30,76.00,'A',1,'2026-09-01 08:00:00'),(295,28,23,91.00,'A+',1,'2026-09-01 08:00:00'),(296,28,24,83.00,'A',1,'2026-09-01 08:00:00'),(297,28,25,86.00,'A',1,'2026-09-01 08:00:00'),(298,28,26,84.00,'A',1,'2026-09-01 08:00:00'),(299,28,27,83.00,'A',1,'2026-09-01 08:00:00'),(300,28,28,80.00,'A',1,'2026-09-01 08:00:00'),(301,28,29,85.00,'A',1,'2026-09-01 08:00:00'),(302,28,30,72.00,'B',1,'2026-09-01 08:00:00'),(303,29,23,89.00,'A',1,'2026-09-01 08:00:00'),(304,29,24,89.00,'A',1,'2026-09-01 08:00:00'),(305,29,25,92.00,'A+',1,'2026-09-01 08:00:00'),(306,29,26,90.00,'A+',1,'2026-09-01 08:00:00'),(307,29,27,89.00,'A',1,'2026-09-01 08:00:00'),(308,29,28,86.00,'A',1,'2026-09-01 08:00:00'),(309,29,29,91.00,'A+',1,'2026-09-01 08:00:00'),(310,29,30,78.00,'A',1,'2026-09-01 08:00:00'),(311,30,23,98.00,'A+',1,'2026-09-01 08:00:00'),(312,30,24,84.00,'A',1,'2026-09-01 08:00:00'),(313,30,25,87.00,'A',1,'2026-09-01 08:00:00'),(314,30,26,85.00,'A',1,'2026-09-01 08:00:00'),(315,30,27,84.00,'A',1,'2026-09-01 08:00:00'),(316,30,28,81.00,'A',1,'2026-09-01 08:00:00'),(317,30,29,86.00,'A',1,'2026-09-01 08:00:00'),(318,30,30,73.00,'B',1,'2026-09-01 08:00:00'),(319,31,23,90.00,'A+',1,'2026-09-01 08:00:00'),(320,31,24,76.00,'A',1,'2026-09-01 08:00:00'),(321,31,25,79.00,'A',1,'2026-09-01 08:00:00'),(322,31,26,77.00,'A',1,'2026-09-01 08:00:00'),(323,31,27,76.00,'A',1,'2026-09-01 08:00:00'),(324,31,28,88.00,'A',1,'2026-09-01 08:00:00'),(325,31,29,78.00,'A',1,'2026-09-01 08:00:00'),(326,31,30,80.00,'A',1,'2026-09-01 08:00:00'),(327,32,23,96.00,'A+',1,'2026-09-01 08:00:00'),(328,32,24,98.00,'A+',1,'2026-09-01 08:00:00'),(329,32,25,88.00,'A',1,'2026-09-01 08:00:00'),(330,32,26,98.00,'A+',1,'2026-09-01 08:00:00'),(331,32,27,85.00,'A',1,'2026-09-01 08:00:00'),(332,32,28,97.00,'A+',1,'2026-09-01 08:00:00'),(333,32,29,87.00,'A',1,'2026-09-01 08:00:00'),(334,32,30,89.00,'A',1,'2026-09-01 08:00:00'),(335,33,23,89.00,'A',1,'2026-09-01 08:00:00'),(336,33,24,90.00,'A+',1,'2026-09-01 08:00:00'),(337,33,25,78.00,'A',1,'2026-09-01 08:00:00'),(338,33,26,91.00,'A+',1,'2026-09-01 08:00:00'),(339,33,27,75.00,'A',1,'2026-09-01 08:00:00'),(340,33,28,87.00,'A',1,'2026-09-01 08:00:00'),(341,33,29,77.00,'A',1,'2026-09-01 08:00:00'),(342,33,30,79.00,'A',1,'2026-09-01 08:00:00'),(343,34,23,98.00,'A+',1,'2026-09-01 08:00:00'),(344,34,24,98.00,'A+',1,'2026-09-01 08:00:00'),(345,34,25,88.00,'A',1,'2026-09-01 08:00:00'),(346,34,26,98.00,'A+',1,'2026-09-01 08:00:00'),(347,34,27,85.00,'A',1,'2026-09-01 08:00:00'),(348,34,28,97.00,'A+',1,'2026-09-01 08:00:00'),(349,34,29,87.00,'A',1,'2026-09-01 08:00:00'),(350,34,30,89.00,'A',1,'2026-09-01 08:00:00'),(351,35,23,98.00,'A+',1,'2026-09-01 08:00:00'),(352,35,24,98.00,'A+',1,'2026-09-01 08:00:00'),(353,35,25,88.00,'A',1,'2026-09-01 08:00:00'),(354,35,26,98.00,'A+',1,'2026-09-01 08:00:00'),(355,35,27,98.00,'A+',1,'2026-09-01 08:00:00'),(356,35,28,97.00,'A+',1,'2026-09-01 08:00:00'),(357,35,29,98.00,'A+',1,'2026-09-01 08:00:00'),(358,35,30,89.00,'A',1,'2026-09-01 08:00:00'),(359,36,23,98.00,'A+',1,'2026-09-01 08:00:00'),(360,36,24,88.00,'A',1,'2026-09-01 08:00:00'),(361,36,25,91.00,'A+',1,'2026-09-01 08:00:00'),(362,36,26,89.00,'A',1,'2026-09-01 08:00:00'),(363,36,27,88.00,'A',1,'2026-09-01 08:00:00'),(364,36,28,85.00,'A',1,'2026-09-01 08:00:00'),(365,36,29,90.00,'A+',1,'2026-09-01 08:00:00'),(366,36,30,77.00,'A',1,'2026-09-01 08:00:00'),(367,37,1,98.00,'A+',1,'2026-09-01 08:00:00'),(368,37,2,86.00,'A',1,'2026-09-01 08:00:00'),(369,37,3,83.00,'A',1,'2026-09-01 08:00:00'),(370,37,9,85.00,'A',1,'2026-09-01 08:00:00'),(371,37,10,90.00,'A+',1,'2026-09-01 08:00:00'),(372,37,11,80.00,'A',1,'2026-09-01 08:00:00'),(373,37,12,92.00,'A+',1,'2026-09-01 08:00:00'),(374,37,4,83.00,'A',1,'2026-09-01 08:00:00'),(375,37,5,89.00,'A',1,'2026-09-01 08:00:00'),(376,37,13,75.00,'A',1,'2026-09-01 08:00:00'),(377,37,14,87.00,'A',1,'2026-09-01 08:00:00'),(378,37,15,67.00,'B',1,'2026-09-01 08:00:00'),(379,37,16,88.00,'A',1,'2026-09-01 08:00:00'),(380,38,1,92.00,'A+',1,'2026-09-01 08:00:00'),(381,38,2,96.00,'A+',1,'2026-09-01 08:00:00'),(382,38,3,78.00,'A',1,'2026-09-01 08:00:00'),(383,38,9,80.00,'A',1,'2026-09-01 08:00:00'),(384,38,10,85.00,'A',1,'2026-09-01 08:00:00'),(385,38,11,75.00,'A',1,'2026-09-01 08:00:00'),(386,38,12,87.00,'A',1,'2026-09-01 08:00:00'),(387,38,4,78.00,'A',1,'2026-09-01 08:00:00'),(388,38,5,84.00,'A',1,'2026-09-01 08:00:00'),(389,38,13,70.00,'B',1,'2026-09-01 08:00:00'),(390,38,14,82.00,'A',1,'2026-09-01 08:00:00'),(391,38,15,77.00,'A',1,'2026-09-01 08:00:00'),(392,38,16,83.00,'A',1,'2026-09-01 08:00:00'),(393,39,1,97.00,'A+',1,'2026-09-01 08:00:00'),(394,39,2,98.00,'A+',1,'2026-09-01 08:00:00'),(395,39,3,83.00,'A',1,'2026-09-01 08:00:00'),(396,39,9,85.00,'A',1,'2026-09-01 08:00:00'),(397,39,10,90.00,'A+',1,'2026-09-01 08:00:00'),(398,39,11,95.00,'A+',1,'2026-09-01 08:00:00'),(399,39,12,92.00,'A+',1,'2026-09-01 08:00:00'),(400,39,4,83.00,'A',1,'2026-09-01 08:00:00'),(401,39,5,89.00,'A',1,'2026-09-01 08:00:00'),(402,39,13,90.00,'A+',1,'2026-09-01 08:00:00'),(403,39,14,87.00,'A',1,'2026-09-01 08:00:00'),(404,39,15,82.00,'A',1,'2026-09-01 08:00:00'),(405,39,16,88.00,'A',1,'2026-09-01 08:00:00'),(406,40,1,90.00,'A+',1,'2026-09-01 08:00:00'),(407,40,2,94.00,'A+',1,'2026-09-01 08:00:00'),(408,40,3,76.00,'A',1,'2026-09-01 08:00:00'),(409,40,9,93.00,'A+',1,'2026-09-01 08:00:00'),(410,40,10,83.00,'A',1,'2026-09-01 08:00:00'),(411,40,11,88.00,'A',1,'2026-09-01 08:00:00'),(412,40,12,85.00,'A',1,'2026-09-01 08:00:00'),(413,40,4,76.00,'A',1,'2026-09-01 08:00:00'),(414,40,5,82.00,'A',1,'2026-09-01 08:00:00'),(415,40,13,83.00,'A',1,'2026-09-01 08:00:00'),(416,40,14,80.00,'A',1,'2026-09-01 08:00:00'),(417,40,15,75.00,'A',1,'2026-09-01 08:00:00'),(418,40,16,81.00,'A',1,'2026-09-01 08:00:00'),(419,41,1,85.00,'A',1,'2026-09-01 08:00:00'),(420,41,2,89.00,'A',1,'2026-09-01 08:00:00'),(421,41,3,86.00,'A',1,'2026-09-01 08:00:00'),(422,41,9,88.00,'A',1,'2026-09-01 08:00:00'),(423,41,10,78.00,'A',1,'2026-09-01 08:00:00'),(424,41,11,83.00,'A',1,'2026-09-01 08:00:00'),(425,41,12,80.00,'A',1,'2026-09-01 08:00:00'),(426,41,4,71.00,'B',1,'2026-09-01 08:00:00'),(427,41,5,92.00,'A+',1,'2026-09-01 08:00:00'),(428,41,13,78.00,'A',1,'2026-09-01 08:00:00'),(429,41,14,75.00,'A',1,'2026-09-01 08:00:00'),(430,41,15,70.00,'B',1,'2026-09-01 08:00:00'),(431,41,16,76.00,'A',1,'2026-09-01 08:00:00'),(432,42,1,98.00,'A+',1,'2026-09-01 08:00:00'),(433,42,2,98.00,'A+',1,'2026-09-01 08:00:00'),(434,42,3,95.00,'A+',1,'2026-09-01 08:00:00'),(435,42,9,97.00,'A+',1,'2026-09-01 08:00:00'),(436,42,10,87.00,'A',1,'2026-09-01 08:00:00'),(437,42,11,92.00,'A+',1,'2026-09-01 08:00:00'),(438,42,12,89.00,'A',1,'2026-09-01 08:00:00'),(439,42,4,80.00,'A',1,'2026-09-01 08:00:00'),(440,42,5,98.00,'A+',1,'2026-09-01 08:00:00'),(441,42,13,87.00,'A',1,'2026-09-01 08:00:00'),(442,42,14,98.00,'A+',1,'2026-09-01 08:00:00'),(443,42,15,79.00,'A',1,'2026-09-01 08:00:00'),(444,42,16,98.00,'A+',1,'2026-09-01 08:00:00'),(445,43,6,84.00,'A',1,'2026-09-01 08:00:00'),(446,43,7,93.00,'A+',1,'2026-09-01 08:00:00'),(447,43,17,85.00,'A',1,'2026-09-01 08:00:00'),(448,43,18,94.00,'A+',1,'2026-09-01 08:00:00'),(449,43,19,76.00,'A',1,'2026-09-01 08:00:00'),(450,43,8,73.00,'B',1,'2026-09-01 08:00:00'),(451,43,20,86.00,'A',1,'2026-09-01 08:00:00'),(452,43,21,73.00,'B',1,'2026-09-01 08:00:00'),(453,43,22,89.00,'A',1,'2026-09-01 08:00:00'),(454,44,6,94.00,'A+',1,'2026-09-01 08:00:00'),(455,44,7,88.00,'A',1,'2026-09-01 08:00:00'),(456,44,17,80.00,'A',1,'2026-09-01 08:00:00'),(457,44,18,89.00,'A',1,'2026-09-01 08:00:00'),(458,44,19,71.00,'B',1,'2026-09-01 08:00:00'),(459,44,8,83.00,'A',1,'2026-09-01 08:00:00'),(460,44,20,81.00,'A',1,'2026-09-01 08:00:00'),(461,44,21,83.00,'A',1,'2026-09-01 08:00:00'),(462,44,22,84.00,'A',1,'2026-09-01 08:00:00'),(463,45,6,98.00,'A+',1,'2026-09-01 08:00:00'),(464,45,7,93.00,'A+',1,'2026-09-01 08:00:00'),(465,45,17,98.00,'A+',1,'2026-09-01 08:00:00'),(466,45,18,94.00,'A+',1,'2026-09-01 08:00:00'),(467,45,19,91.00,'A+',1,'2026-09-01 08:00:00'),(468,45,8,88.00,'A',1,'2026-09-01 08:00:00'),(469,45,20,86.00,'A',1,'2026-09-01 08:00:00'),(470,45,21,88.00,'A',1,'2026-09-01 08:00:00'),(471,45,22,89.00,'A',1,'2026-09-01 08:00:00'),(472,46,6,95.00,'A+',1,'2026-09-01 08:00:00'),(473,46,7,89.00,'A',1,'2026-09-01 08:00:00'),(474,46,17,96.00,'A+',1,'2026-09-01 08:00:00'),(475,46,18,90.00,'A+',1,'2026-09-01 08:00:00'),(476,46,19,87.00,'A',1,'2026-09-01 08:00:00'),(477,46,8,84.00,'A',1,'2026-09-01 08:00:00'),(478,46,20,82.00,'A',1,'2026-09-01 08:00:00'),(479,46,21,84.00,'A',1,'2026-09-01 08:00:00'),(480,46,22,85.00,'A',1,'2026-09-01 08:00:00'),(481,47,6,90.00,'A+',1,'2026-09-01 08:00:00'),(482,47,7,84.00,'A',1,'2026-09-01 08:00:00'),(483,47,17,91.00,'A+',1,'2026-09-01 08:00:00'),(484,47,18,85.00,'A',1,'2026-09-01 08:00:00'),(485,47,19,82.00,'A',1,'2026-09-01 08:00:00'),(486,47,8,79.00,'A',1,'2026-09-01 08:00:00'),(487,47,20,77.00,'A',1,'2026-09-01 08:00:00'),(488,47,21,79.00,'A',1,'2026-09-01 08:00:00'),(489,47,22,80.00,'A',1,'2026-09-01 08:00:00'),(490,48,6,98.00,'A+',1,'2026-09-01 08:00:00'),(491,48,7,98.00,'A+',1,'2026-09-01 08:00:00'),(492,48,17,98.00,'A+',1,'2026-09-01 08:00:00'),(493,48,18,94.00,'A+',1,'2026-09-01 08:00:00'),(494,48,19,91.00,'A+',1,'2026-09-01 08:00:00'),(495,48,8,88.00,'A',1,'2026-09-01 08:00:00'),(496,48,20,98.00,'A+',1,'2026-09-01 08:00:00'),(497,48,21,88.00,'A',1,'2026-09-01 08:00:00'),(498,48,22,98.00,'A+',1,'2026-09-01 08:00:00'),(499,49,23,89.00,'A',1,'2026-09-01 08:00:00'),(500,49,24,90.00,'A+',1,'2026-09-01 08:00:00'),(501,49,25,78.00,'A',1,'2026-09-01 08:00:00'),(502,49,26,91.00,'A+',1,'2026-09-01 08:00:00'),(503,49,27,75.00,'A',1,'2026-09-01 08:00:00'),(504,49,28,87.00,'A',1,'2026-09-01 08:00:00'),(505,49,29,77.00,'A',1,'2026-09-01 08:00:00'),(506,49,30,79.00,'A',1,'2026-09-01 08:00:00'),(507,50,23,84.00,'A',1,'2026-09-01 08:00:00'),(508,50,24,85.00,'A',1,'2026-09-01 08:00:00'),(509,50,25,73.00,'B',1,'2026-09-01 08:00:00'),(510,50,26,86.00,'A',1,'2026-09-01 08:00:00'),(511,50,27,85.00,'A',1,'2026-09-01 08:00:00'),(512,50,28,82.00,'A',1,'2026-09-01 08:00:00'),(513,50,29,87.00,'A',1,'2026-09-01 08:00:00'),(514,50,30,74.00,'B',1,'2026-09-01 08:00:00'),(515,51,23,98.00,'A+',1,'2026-09-01 08:00:00'),(516,51,24,92.00,'A+',1,'2026-09-01 08:00:00'),(517,51,25,95.00,'A+',1,'2026-09-01 08:00:00'),(518,51,26,93.00,'A+',1,'2026-09-01 08:00:00'),(519,51,27,92.00,'A+',1,'2026-09-01 08:00:00'),(520,51,28,89.00,'A',1,'2026-09-01 08:00:00'),(521,51,29,94.00,'A+',1,'2026-09-01 08:00:00'),(522,51,30,81.00,'A',1,'2026-09-01 08:00:00'),(523,52,23,98.00,'A+',1,'2026-09-01 08:00:00'),(524,52,24,87.00,'A',1,'2026-09-01 08:00:00'),(525,52,25,90.00,'A+',1,'2026-09-01 08:00:00'),(526,52,26,88.00,'A',1,'2026-09-01 08:00:00'),(527,52,27,87.00,'A',1,'2026-09-01 08:00:00'),(528,52,28,84.00,'A',1,'2026-09-01 08:00:00'),(529,52,29,89.00,'A',1,'2026-09-01 08:00:00'),(530,52,30,76.00,'A',1,'2026-09-01 08:00:00'),(531,53,23,95.00,'A+',1,'2026-09-01 08:00:00'),(532,53,24,81.00,'A',1,'2026-09-01 08:00:00'),(533,53,25,84.00,'A',1,'2026-09-01 08:00:00'),(534,53,26,82.00,'A',1,'2026-09-01 08:00:00'),(535,53,27,81.00,'A',1,'2026-09-01 08:00:00'),(536,53,28,78.00,'A',1,'2026-09-01 08:00:00'),(537,53,29,83.00,'A',1,'2026-09-01 08:00:00'),(538,53,30,85.00,'A',1,'2026-09-01 08:00:00'),(539,54,23,98.00,'A+',1,'2026-09-01 08:00:00'),(540,54,24,90.00,'A+',1,'2026-09-01 08:00:00'),(541,54,25,93.00,'A+',1,'2026-09-01 08:00:00'),(542,54,26,98.00,'A+',1,'2026-09-01 08:00:00'),(543,54,27,90.00,'A+',1,'2026-09-01 08:00:00'),(544,54,28,98.00,'A+',1,'2026-09-01 08:00:00'),(545,54,29,92.00,'A+',1,'2026-09-01 08:00:00'),(546,54,30,94.00,'A+',1,'2026-09-01 08:00:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examinations`
--

LOCK TABLES `examinations` WRITE;
/*!40000 ALTER TABLE `examinations` DISABLE KEYS */;
INSERT INTO `examinations` VALUES (1,'Term 1 Mid-Year Examination 2026',1,2026,'PUBLISHED','2026-09-01 08:00:00'),(2,'Term 2 Progress Assessment 2026',2,2026,'PUBLISHED','2026-09-01 08:00:00'),(3,'Term 3 Final Examination 2026',3,2026,'DRAFT','2026-09-01 08:00:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_structures`
--

LOCK TABLES `fee_structures` WRITE;
/*!40000 ALTER TABLE `fee_structures` DISABLE KEYS */;
INSERT INTO `fee_structures` VALUES (1,'TUITION',10,25000.00,2026,'2026-09-01 08:00:00',_binary '','First term secondary tuition fees','2026-10-31','Grade 10 Term 1 Tuition Fee',1,NULL),(2,'FACILITY',10,8000.00,2026,'2026-09-01 08:00:00',_binary '','Sports complex and science lab maintenance','2026-09-30','Grade 10 Annual Facility & Sports Fee',1,NULL),(3,'TUITION',11,28000.00,2026,'2026-09-01 08:00:00',_binary '','First term O/L tuition fees','2026-10-31','Grade 11 Term 1 Tuition Fee',1,NULL),(4,'LIBRARY',NULL,5000.00,2026,'2026-09-01 08:00:00',_binary '','School-wide digital library and IT resource access','2026-11-15','Annual Digital Lab & Library Fee',1,NULL),(5,'FACILITY',11,10000.00,2026,'2026-09-01 08:00:00',_binary '','Sports and science lab maintenance for O/L students','2026-09-30','Grade 11 Annual Facility Fee',1,NULL),(6,'EXAMINATION',NULL,3500.00,2026,'2026-09-01 08:00:00',_binary '','All students sit the Term 1 comprehensive exam','2026-10-15','Term 1 Examination Fee',1,NULL),(7,'TRANSPORT',NULL,6000.00,2026,'2026-09-01 08:00:00',_binary '','Daily air-conditioned school bus service','2026-10-01','School Transport Service - Term 1',1,NULL),(8,'ADMISSION',10,15000.00,2026,'2026-09-01 08:00:00',_binary '','One-time admission charge for new Grade 10 enrolments','2026-02-28','Grade 10 Admission & Registration Fee',1,NULL),(9,'TUITION',9,22000.00,2026,'2026-09-01 08:00:00',_binary '','First term middle school tuition fees','2026-10-31','Grade 9 Term 1 Tuition Fee',1,NULL),(10,'FACILITY',9,7500.00,2026,'2026-09-01 08:00:00',_binary '','Annual facility maintenance charge','2026-09-30','Grade 9 Annual Facility Fee',1,NULL);
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
  UNIQUE KEY `user_id_2` (`user_id`),
  CONSTRAINT `fk_parents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parents`
--

LOCK TABLES `parents` WRITE;
/*!40000 ALTER TABLE `parents` DISABLE KEYS */;
INSERT INTO `parents` VALUES (1,19,'Bandula Perera','Sunethra Perera','0771122334','197512345678','124 Temple Road, Yakkala, Gampaha','2026-09-01 08:00:00'),(2,20,'Sarath Silva','Menaka Silva','0775566778','197898765432','45 Kandy Road, Miriswatta, Gampaha','2026-09-01 08:00:00'),(3,21,'Gamini Dissanayake','Priyani Dissanayake','0712345678','197623456781','78 Bauddhaloka Mawatha, Gampaha','2026-09-01 08:00:00'),(4,22,'Rohan Jayawardena','Nilmini Jayawardena','0763456789','197934567892','15 Negombo Road, Ja-Ela','2026-09-01 08:00:00'),(5,23,'Mohan Fernando','Champa Fernando','0784567890','198145678903','210 Main Street, Negombo','2026-09-01 08:00:00'),(6,24,'Asoka Wickramasinghe','Sandya Wickramasinghe','0705678901','197456789014','88 Court Road, Gampaha','2026-09-01 08:00:00'),(7,25,'Douglas Weerasekara','Kusuma Weerasekara','0726789012','197767890125','34 Station Road, Ganemulla','2026-09-01 08:00:00'),(8,26,'Anura Senanayake','Deepthi Senanayake','0757890123','198078901236','56 Colombo Road, Kadawatha','2026-09-01 08:00:00'),(9,27,'Sunil Gunaratne','Ramani Gunaratne','0778901234','197889012347','92 Flower Road, Kelaniya','2026-09-01 08:00:00'),(10,28,'Nimal Rajapaksha','Chandra Rajapaksha','0719012345','197390123458','14 Oruthota Road, Gampaha','2026-09-01 08:00:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_receipts`
--

LOCK TABLES `payment_receipts` WRITE;
/*!40000 ALTER TABLE `payment_receipts` DISABLE KEYS */;
INSERT INTO `payment_receipts` VALUES (1,1,'RCPT-2026-00001','2026-10-01 09:30:00','FULL',NULL,25000.00,'2026-09-01 08:00:00.000000','Grade 10 Term 1 Tuition Fee','TUITION','Admin Counter','Official receipt for Term 1 tuition fee',0.00,'WIS-2026-00101',1,'Kasun Perera'),(2,2,'RCPT-2026-00002','2026-10-02 11:20:00','PARTIAL',NULL,5000.00,'2026-09-01 08:00:00.000000','Grade 10 Annual Facility & Sports Fee','FACILITY','Admin Finance','Partial receipt for facility fee instalment',3000.00,'WIS-2026-00101',1,'Kasun Perera'),(3,3,'RCPT-2026-00003','2026-10-03 14:30:00','FULL',NULL,3500.00,'2026-09-01 08:00:00.000000','Term 1 Examination Fee','EXAMINATION','Admin Counter','Official receipt for Term 1 exam paper access',0.00,'WIS-2026-00101',1,'Kasun Perera'),(4,4,'RCPT-2026-00004','2026-10-02 11:00:00','PARTIAL',NULL,15000.00,'2026-09-01 08:00:00.000000','Grade 10 Term 1 Tuition Fee','TUITION','Admin Finance','Official receipt for first tuition instalment',10000.00,'WIS-2026-00102',2,'Nimasha Silva'),(5,5,'RCPT-2026-00005','2026-10-03 12:10:00','FULL',NULL,3500.00,'2026-09-01 08:00:00.000000','Term 1 Examination Fee','EXAMINATION','Admin Counter','Official receipt for Term 1 exam fee',0.00,'WIS-2026-00102',2,'Nimasha Silva'),(6,6,'RCPT-2026-00006','2026-10-03 15:30:00','PARTIAL',NULL,10000.00,'2026-09-01 08:00:00.000000','Grade 10 Term 1 Tuition Fee','TUITION','Admin Finance','First instalment receipt',15000.00,'WIS-2026-00104',4,'Dilshan Fernando'),(7,7,'RCPT-2026-00007','2026-10-04 09:30:00','PARTIAL',NULL,14000.00,'2026-09-01 08:00:00.000000','Grade 11 Term 1 Tuition Fee','TUITION','Admin Finance','Official receipt for O/L tuition first half',14000.00,'WIS-2024-00201',6,'Rashmi Dissanayake'),(8,8,'RCPT-2026-00008','2026-10-04 11:50:00','FULL',NULL,28000.00,'2026-09-01 08:00:00.000000','Grade 11 Term 1 Tuition Fee','TUITION','Admin Finance','Official receipt for full O/L tuition fee',0.00,'WIS-2024-00202',7,'Malith Weerasekara'),(9,9,'RCPT-2026-00009','2026-10-04 13:00:00','FULL',NULL,10000.00,'2026-09-01 08:00:00.000000','Grade 11 Annual Facility Fee','FACILITY','Admin Counter','Official receipt for facility fee',0.00,'WIS-2024-00202',7,'Malith Weerasekara'),(10,10,'RCPT-2026-00010','2026-10-05 08:45:00','FULL',NULL,25000.00,'2026-09-01 08:00:00.000000','Grade 10 Term 1 Tuition Fee','TUITION','Admin Counter','Official receipt for full tuition fee',0.00,'WIS-2026-00106',9,'Dinuka Wickramasinghe'),(11,11,'RCPT-2026-00011','2026-10-05 09:15:00','FULL',NULL,22000.00,'2026-09-01 08:00:00.000000','Grade 9 Term 1 Tuition Fee','TUITION','Admin Counter','Official receipt for middle school tuition',0.00,'WIS-2025-00301',23,'Nethmi Silva'),(12,14,'RCPT-2026-00012','2026-10-05 11:30:00','FULL',NULL,22000.00,'2026-09-01 08:00:00.000000','Grade 9 Term 1 Tuition Fee','TUITION','Admin Finance','Official receipt for tuition fee',0.00,'WIS-2025-00305',27,'Charith Wickramasinghe'),(13,15,'RCPT-2026-00013','2026-10-05 11:45:00','FULL',NULL,7500.00,'2026-09-01 08:00:00.000000','Grade 9 Annual Facility Fee','FACILITY','Admin Counter','Official receipt for facility fee',0.00,'WIS-2025-00305',27,'Charith Wickramasinghe');
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
  `slip_image_url` longtext,
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_slips`
--

LOCK TABLES `payment_slips` WRITE;
/*!40000 ALTER TABLE `payment_slips` DISABLE KEYS */;
INSERT INTO `payment_slips` VALUES (1,1,1,NULL,25000.00,'APPROVED','Admin Counter',NULL,'2026-09-01 08:00:00','Mr. Bandula Perera (Father)','2026-10-01 09:30:00.000000','CASH','Cash received in full at office counter','2026-10-01 09:30:00.000000',1,'REC-WIS-20261001-01','2026-09-01 08:00:00.000000'),(2,2,1,NULL,5000.00,'APPROVED','Admin Finance',NULL,'2026-09-01 08:00:00','Mr. Bandula Perera (Father)','2026-10-02 11:15:00.000000','BANK_TRANSFER','Partial transfer verified via BOC online statement','2026-10-02 11:20:00.000000',1,'BOC-TRF-982341','2026-09-01 08:00:00.000000'),(3,3,1,'slip_kasun_exam_2026.jpg',3500.00,'APPROVED','Admin Counter',NULL,'2026-09-01 08:00:00','Mrs. Sunethra Perera (Mother)','2026-10-03 14:00:00.000000','BANK_DEPOSIT','Bank deposit slip verified','2026-10-03 14:30:00.000000',1,'BOC-DEP-774129','2026-09-01 08:00:00.000000'),(4,5,2,'slip_nimasha_tuition.jpg',15000.00,'APPROVED','Admin Finance',NULL,'2026-09-01 08:00:00','Mrs. Menaka Silva (Mother)','2026-10-02 10:45:00.000000','BANK_DEPOSIT','First instalment confirmed from HNB Gampaha','2026-10-02 11:00:00.000000',2,'HNB-DEP-558291','2026-09-01 08:00:00.000000'),(5,7,2,NULL,3500.00,'APPROVED','Admin Counter',NULL,'2026-09-01 08:00:00','Mr. Sarath Silva (Father)','2026-10-03 12:10:00.000000','CASH','Counter cash received','2026-10-03 12:10:00.000000',2,'REC-WIS-20261003-02','2026-09-01 08:00:00.000000'),(6,10,5,NULL,10000.00,'APPROVED','Admin Finance',NULL,'2026-09-01 08:00:00','Mr. Mohan Fernando (Father)','2026-10-03 15:20:00.000000','BANK_TRANSFER','Direct Commercial Bank transfer approved','2026-10-03 15:30:00.000000',4,'COMBANK-DILSH-8812','2026-09-01 08:00:00.000000'),(7,14,3,'slip_rashmi_tuition.jpg',14000.00,'APPROVED','Admin Finance',NULL,'2026-09-01 08:00:00','Mr. Gamini Dissanayake (Father)','2026-10-04 09:15:00.000000','BANK_DEPOSIT','First half bank deposit confirmed','2026-10-04 09:30:00.000000',6,'HNB-RASH-449102','2026-09-01 08:00:00.000000'),(8,16,7,'slip_malith_full.jpg',28000.00,'APPROVED','Admin Finance',NULL,'2026-09-01 08:00:00','Mr. Douglas Weerasekara (Father)','2026-10-04 11:40:00.000000','BANK_TRANSFER','Full tuition bank transfer cleared','2026-10-04 11:50:00.000000',7,'SAMPATH-MALT-90182','2026-09-01 08:00:00.000000'),(9,17,7,NULL,10000.00,'APPROVED','Admin Counter',NULL,'2026-09-01 08:00:00','Mr. Douglas Weerasekara (Father)','2026-10-04 13:00:00.000000','CASH','Facility fee paid in full','2026-10-04 13:00:00.000000',7,'REC-WIS-20261004-03','2026-09-01 08:00:00.000000'),(10,19,6,NULL,25000.00,'APPROVED','Admin Counter',NULL,'2026-09-01 08:00:00','Mr. Asoka Wickramasinghe (Father)','2026-10-05 08:45:00.000000','CASH','Cash payment in full','2026-10-05 08:45:00.000000',9,'REC-WIS-20261005-01','2026-09-01 08:00:00.000000'),(11,21,2,NULL,22000.00,'APPROVED','Admin Counter',NULL,'2026-09-01 08:00:00','Mrs. Menaka Silva (Mother)','2026-10-05 09:15:00.000000','CASH','Full tuition payment','2026-10-05 09:15:00.000000',23,'REC-WIS-20261005-02','2026-09-01 08:00:00.000000'),(12,12,4,'slip_tharushi_deposit.jpg',25000.00,'PENDING',NULL,NULL,'2026-09-01 08:00:00','Mr. Rohan Jayawardena (Father)','2026-10-05 10:30:00.000000','BANK_DEPOSIT',NULL,NULL,5,'BOC-THAR-339182','2026-09-01 08:00:00.000000'),(13,23,1,'slip_chq_kaveen.jpg',11000.00,'REJECTED','Admin Finance',NULL,'2026-09-01 08:00:00','Mr. Bandula Perera (Father)','2026-10-04 16:00:00.000000','CHEQUE','Drawer signature mismatch on cheque. Please resubmit counter payment.','2026-10-05 09:00:00.000000',24,'CHQ-BOC-550192','2026-09-01 08:00:00.000000'),(14,25,6,NULL,22000.00,'APPROVED','Admin Finance',NULL,'2026-09-01 08:00:00','Mr. Asoka Wickramasinghe (Father)','2026-10-05 11:20:00.000000','BANK_TRANSFER','Online payment verified','2026-10-05 11:30:00.000000',27,'BOC-TRF-667102','2026-09-01 08:00:00.000000'),(15,26,6,NULL,7500.00,'APPROVED','Admin Counter',NULL,'2026-09-01 08:00:00','Mr. Asoka Wickramasinghe (Father)','2026-10-05 11:45:00.000000','CASH','Cash facility fee received','2026-10-05 11:45:00.000000',27,'REC-WIS-20261005-03','2026-09-01 08:00:00.000000');
/*!40000 ALTER TABLE `payment_slips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `department` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `employee_number` varchar(50) NOT NULL,
  `employment_type` varchar(50) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `hire_date` date DEFAULT NULL,
  `job_position` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `qualification` varchar(150) DEFAULT NULL,
  `salary` double DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','ON_LEAVE') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_q28gs3kbc2g17d6ms5lpl6xmr` (`employee_number`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'12 Park Avenue, Gampaha','2026-09-01 08:00:00.000000','Academic Affairs','rohan.w@wycherley.lk','EMP-STF-001','Full Time','Rohan','2015-01-10','Head of Academic / Sectional Supervisor','Wickramasinghe','0771112233','PhD in Educational Leadership, MSc Ed',285000,'ACTIVE'),(2,'45 Kandy Road, Yakkala, Gampaha','2026-09-01 08:00:00.000000','Academic Affairs','swarna.j@wycherley.lk','EMP-STF-002','Full Time','Swarna','2016-04-15','Sectional Supervisor (Middle School)','Jayatilleke','0712223344','MA in School Administration',220000,'ACTIVE'),(3,'88 Court Road, Gampaha','2026-09-01 08:00:00.000000','Finance & Bursar','bursar@wycherley.lk','EMP-STF-003','Full Time','Mahinda','2017-08-01','Bursar & Senior Finance Officer','Senaratne','0763334455','FCA, BCom Accounting',260000,'ACTIVE'),(4,'32 Negombo Road, Ja-Ela','2026-09-01 08:00:00.000000','Information Technology','itadmin@wycherley.lk','EMP-STF-004','Full Time','Gayan','2021-02-01','Senior IT Systems Administrator','Hettiarachchi','0784445566','BSc Computer Systems & Networks',195000,'ACTIVE'),(5,'14 Oruthota Road, Gampaha','2026-09-01 08:00:00.000000','Admissions','registrar@wycherley.lk','EMP-STF-005','Full Time','Malathi','2018-05-15','School Registrar & Admissions Head','Perera','0705556677','BA Public Administration',180000,'ACTIVE'),(6,'67 Temple Road, Kelaniya','2026-09-01 08:00:00.000000','Library & Learning Center','library@wycherley.lk','EMP-STF-006','Full Time','Shirani','2019-09-01','Chief Librarian','Alwis','0726667788','MLS Library Science',145000,'ACTIVE'),(7,'19 Station Road, Ganemulla','2026-09-01 08:00:00.000000','Science Laboratories','lab@wycherley.lk','EMP-STF-007','Full Time','Susantha','2020-03-10','Senior Laboratory Technologist','Kumara','0757778899','National Diploma in Technology (NDT)',130000,'ACTIVE');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_class_allocations`
--

LOCK TABLES `student_class_allocations` WRITE;
/*!40000 ALTER TABLE `student_class_allocations` DISABLE KEYS */;
INSERT INTO `student_class_allocations` VALUES (1,1,1,2026,'2026-01-05','ACTIVE'),(2,2,1,2026,'2026-01-05','ACTIVE'),(3,3,1,2026,'2026-01-05','ACTIVE'),(4,9,1,2026,'2026-01-05','ACTIVE'),(5,10,1,2026,'2026-01-05','ACTIVE'),(6,11,1,2026,'2026-01-05','ACTIVE'),(7,12,1,2026,'2026-01-05','ACTIVE'),(8,4,2,2026,'2026-01-05','ACTIVE'),(9,5,2,2026,'2026-01-05','ACTIVE'),(10,13,2,2026,'2026-01-05','ACTIVE'),(11,14,2,2026,'2026-01-05','ACTIVE'),(12,15,2,2026,'2026-01-05','ACTIVE'),(13,16,2,2026,'2026-01-05','ACTIVE'),(14,6,3,2026,'2026-01-05','ACTIVE'),(15,7,3,2026,'2026-01-05','ACTIVE'),(16,17,3,2026,'2026-01-05','ACTIVE'),(17,18,3,2026,'2026-01-05','ACTIVE'),(18,19,3,2026,'2026-01-05','ACTIVE'),(19,8,4,2026,'2026-01-05','ACTIVE'),(20,20,4,2026,'2026-01-05','ACTIVE'),(21,21,4,2026,'2026-01-05','ACTIVE'),(22,22,4,2026,'2026-01-05','ACTIVE'),(23,23,5,2026,'2026-01-05','ACTIVE'),(24,24,5,2026,'2026-01-05','ACTIVE'),(25,25,5,2026,'2026-01-05','ACTIVE'),(26,26,5,2026,'2026-01-05','ACTIVE'),(27,27,6,2026,'2026-01-05','ACTIVE'),(28,28,6,2026,'2026-01-05','ACTIVE'),(29,29,6,2026,'2026-01-05','ACTIVE'),(30,30,6,2026,'2026-01-05','ACTIVE');
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
  `status` enum('PENDING','PARTIAL','PAID','OVERDUE','CANCELLED') DEFAULT 'PENDING',
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_fee_accounts`
--

LOCK TABLES `student_fee_accounts` WRITE;
/*!40000 ALTER TABLE `student_fee_accounts` DISABLE KEYS */;
INSERT INTO `student_fee_accounts` VALUES (1,1,1,25000.00,25000.00,0.00,'PAID','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',10,'Counter cash payment in full','WIS-2026-00101','Kasun Perera'),(2,1,2,8000.00,5000.00,3000.00,'PARTIAL','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-09-30',10,'Bank transfer partial payment','WIS-2026-00101','Kasun Perera'),(3,1,6,3500.00,3500.00,0.00,'PAID','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-15',10,'Exam fee paid via bank deposit slip','WIS-2026-00101','Kasun Perera'),(4,1,7,6000.00,0.00,6000.00,'OVERDUE','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-01',10,'Transport fee term 1','WIS-2026-00101','Kasun Perera'),(5,2,1,25000.00,15000.00,10000.00,'PARTIAL','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',10,'First instalment paid','WIS-2026-00102','Nimasha Silva'),(6,2,2,8000.00,0.00,8000.00,'OVERDUE','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-09-30',10,'Annual facility charge','WIS-2026-00102','Nimasha Silva'),(7,2,6,3500.00,3500.00,0.00,'PAID','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-15',10,'Counter cash payment','WIS-2026-00102','Nimasha Silva'),(8,3,1,25000.00,25000.00,0.00,'PAID','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',10,'Paid with sibling discount verification','WIS-2026-00103','Kavindu Bandara'),(9,3,4,5000.00,5000.00,0.00,'PAID','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-11-15',10,'Online bank transfer','WIS-2026-00103','Kavindu Bandara'),(10,4,1,25000.00,10000.00,15000.00,'PARTIAL','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',10,'Instalment 1 paid','WIS-2026-00104','Dilshan Fernando'),(11,4,7,6000.00,0.00,6000.00,'OVERDUE','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-01',10,'School bus fee','WIS-2026-00104','Dilshan Fernando'),(12,5,1,25000.00,0.00,25000.00,'PENDING','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',10,'Awaiting slip review','WIS-2026-00105','Tharushi Jayawardena'),(13,5,2,8000.00,0.00,8000.00,'OVERDUE','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-09-30',10,'Regular facility charge','WIS-2026-00105','Tharushi Jayawardena'),(14,6,3,28000.00,14000.00,14000.00,'PARTIAL','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',11,'First half tuition paid','WIS-2024-00201','Rashmi Dissanayake'),(15,6,5,10000.00,0.00,10000.00,'OVERDUE','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-09-30',11,'Annual facility charge','WIS-2024-00201','Rashmi Dissanayake'),(16,7,3,28000.00,28000.00,0.00,'PAID','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',11,'Full annual tuition cleared','WIS-2024-00202','Malith Weerasekara'),(17,7,5,10000.00,10000.00,0.00,'PAID','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-09-30',11,'Facility fee cleared','WIS-2024-00202','Malith Weerasekara'),(18,8,3,28000.00,0.00,28000.00,'PENDING','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',11,'Pending bursar notification','WIS-2024-00203','Chathura Gimhana'),(19,9,1,25000.00,25000.00,0.00,'PAID','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',10,'Full cash payment','WIS-2026-00106','Dinuka Wickramasinghe'),(20,17,3,28000.00,28000.00,0.00,'PAID','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',11,'Full payment via bank transfer','WIS-2024-00204','Ravindu Wickramasinghe'),(21,23,9,22000.00,22000.00,0.00,'PAID','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',9,'Paid in full at counter','WIS-2025-00301','Nethmi Silva'),(22,23,10,7500.00,0.00,7500.00,'OVERDUE','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-09-30',9,'Annual facility charge','WIS-2025-00301','Nethmi Silva'),(23,24,9,22000.00,11000.00,11000.00,'PARTIAL','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',9,'Half payment made','WIS-2025-00302','Kaveen Perera'),(24,24,10,7500.00,0.00,7500.00,'OVERDUE','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-09-30',9,'Annual facility charge','WIS-2025-00302','Kaveen Perera'),(25,27,9,22000.00,22000.00,0.00,'PAID','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-10-31',9,'Full tuition paid','WIS-2025-00305','Charith Wickramasinghe'),(26,27,10,7500.00,7500.00,0.00,'PAID','2026-09-01 08:00:00',2026,'2026-09-01 08:00:00.000000','2026-09-30',9,'Facility fee paid in full','WIS-2025-00305','Charith Wickramasinghe');
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
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `admission_number` (`admission_number`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_students_parent` (`parent_id`),
  CONSTRAINT `fk_students_parent` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,29,'WIS-2026-00101','Kasun','Perera','2010-05-15','MALE',1,'2026-09-01 08:00:00',1),(2,30,'WIS-2026-00102','Nimasha','Silva','2010-08-22','FEMALE',2,'2026-09-01 08:00:00',1),(3,31,'WIS-2026-00103','Kavindu','Bandara','2010-03-10','MALE',1,'2026-09-01 08:00:00',1),(4,32,'WIS-2026-00104','Dilshan','Fernando','2010-11-04','MALE',5,'2026-09-01 08:00:00',1),(5,33,'WIS-2026-00105','Tharushi','Jayawardena','2010-07-19','FEMALE',4,'2026-09-01 08:00:00',1),(6,34,'WIS-2024-00201','Rashmi','Dissanayake','2009-02-14','FEMALE',3,'2026-09-01 08:00:00',1),(7,35,'WIS-2024-00202','Malith','Weerasekara','2009-09-30','MALE',7,'2026-09-01 08:00:00',1),(8,36,'WIS-2024-00203','Chathura','Gimhana','2009-12-05','MALE',3,'2026-09-01 08:00:00',1),(9,37,'WIS-2026-00106','Dinuka','Wickramasinghe','2010-04-18','MALE',6,'2026-09-01 08:00:00',1),(10,38,'WIS-2026-00107','Sanduni','Senanayake','2010-09-12','FEMALE',8,'2026-09-01 08:00:00',1),(11,39,'WIS-2026-00108','Akila','Gunaratne','2010-01-25','MALE',9,'2026-09-01 08:00:00',1),(12,40,'WIS-2026-00109','Hansika','Rajapaksha','2010-06-30','FEMALE',10,'2026-09-01 08:00:00',1),(13,41,'WIS-2026-00110','Senura','Fernando','2010-02-14','MALE',5,'2026-09-01 08:00:00',1),(14,42,'WIS-2026-00111','Thisuri','Perera','2010-10-08','FEMALE',1,'2026-09-01 08:00:00',1),(15,43,'WIS-2026-00112','Isuru','Dissanayake','2010-12-19','MALE',3,'2026-09-01 08:00:00',1),(16,44,'WIS-2026-00113','Oshadhi','Jayawardena','2010-08-05','FEMALE',4,'2026-09-01 08:00:00',1),(17,45,'WIS-2024-00204','Ravindu','Wickramasinghe','2009-03-22','MALE',6,'2026-09-01 08:00:00',1),(18,46,'WIS-2024-00205','Sachini','Gunaratne','2009-07-11','FEMALE',9,'2026-09-01 08:00:00',1),(19,47,'WIS-2024-00206','Nuwan','Rajapaksha','2009-11-28','MALE',10,'2026-09-01 08:00:00',1),(20,48,'WIS-2024-00207','Dulani','Senanayake','2009-05-17','FEMALE',8,'2026-09-01 08:00:00',1),(21,49,'WIS-2024-00208','Dhanushka','Fernando','2009-08-23','MALE',5,'2026-09-01 08:00:00',1),(22,50,'WIS-2024-00209','Amanda','Weerasekara','2009-10-14','FEMALE',7,'2026-09-01 08:00:00',1),(23,51,'WIS-2025-00301','Nethmi','Silva','2011-04-12','FEMALE',2,'2026-09-01 08:00:00',1),(24,52,'WIS-2025-00302','Kaveen','Perera','2011-06-25','MALE',1,'2026-09-01 08:00:00',1),(25,53,'WIS-2025-00303','Sithum','Jayawardena','2011-09-03','MALE',4,'2026-09-01 08:00:00',1),(26,54,'WIS-2025-00304','Hiruni','Dissanayake','2011-11-15','FEMALE',3,'2026-09-01 08:00:00',1),(27,55,'WIS-2025-00305','Charith','Wickramasinghe','2011-01-30','MALE',6,'2026-09-01 08:00:00',1),(28,56,'WIS-2025-00306','Methma','Senanayake','2011-08-18','FEMALE',8,'2026-09-01 08:00:00',1),(29,57,'WIS-2025-00307','Sanjana','Fernando','2011-03-09','FEMALE',5,'2026-09-01 08:00:00',1),(30,58,'WIS-2025-00308','Janith','Rajapaksha','2011-12-21','MALE',10,'2026-09-01 08:00:00',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'MATH10','Mathematics',10,'2026-09-01 08:00:00'),(2,'SCI10','Science',10,'2026-09-01 08:00:00'),(3,'ENG10','English Language',10,'2026-09-01 08:00:00'),(4,'SIN10','Sinhala Language',10,'2026-09-01 08:00:00'),(5,'HIST10','History',10,'2026-09-01 08:00:00'),(6,'ICT10','Information & Communication Technology',10,'2026-09-01 08:00:00'),(7,'MATH11','Mathematics',11,'2026-09-01 08:00:00'),(8,'SCI11','Science',11,'2026-09-01 08:00:00'),(101,'MATH09','Mathematics',9,'2026-09-01 08:00:00'),(102,'SCI09','Science',9,'2026-09-01 08:00:00'),(103,'ENG09','English Language',9,'2026-09-01 08:00:00'),(104,'SIN09','Sinhala Language',9,'2026-09-01 08:00:00'),(105,'HIST09','History',9,'2026-09-01 08:00:00'),(106,'ICT09','Information & Communication Technology',9,'2026-09-01 08:00:00'),(107,'GEO09','Geography',9,'2026-09-01 08:00:00'),(108,'BUD09','Buddhism',9,'2026-09-01 08:00:00'),(109,'HPE09','Health & Physical Education',9,'2026-09-01 08:00:00'),(110,'COM10','Business & Accounting Studies',10,'2026-09-01 08:00:00'),(111,'BUD10','Buddhism',10,'2026-09-01 08:00:00'),(112,'LIT10','English Literature',10,'2026-09-01 08:00:00'),(113,'GEO10','Geography',10,'2026-09-01 08:00:00'),(114,'HPE10','Health & Physical Education',10,'2026-09-01 08:00:00'),(115,'CHEM10','Chemistry',10,'2026-09-01 08:00:00'),(116,'PHYS10','Physics',10,'2026-09-01 08:00:00'),(117,'ENG11','English Language',11,'2026-09-01 08:00:00'),(118,'SIN11','Sinhala Language',11,'2026-09-01 08:00:00'),(119,'HIST11','History',11,'2026-09-01 08:00:00'),(120,'ICT11','Information & Communication Technology',11,'2026-09-01 08:00:00'),(121,'COM11','Business & Accounting Studies',11,'2026-09-01 08:00:00'),(122,'BUD11','Buddhism',11,'2026-09-01 08:00:00'),(123,'LIT11','English Literature',11,'2026-09-01 08:00:00'),(124,'GEO11','Geography',11,'2026-09-01 08:00:00'),(125,'HPE11','Health & Physical Education',11,'2026-09-01 08:00:00'),(126,'CHEM11','Chemistry',11,'2026-09-01 08:00:00'),(127,'PHYS11','Physics',11,'2026-09-01 08:00:00'),(128,'LIT09','English Literature',9,'2026-09-01 08:00:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_subject_assignments`
--

LOCK TABLES `teacher_subject_assignments` WRITE;
/*!40000 ALTER TABLE `teacher_subject_assignments` DISABLE KEYS */;
INSERT INTO `teacher_subject_assignments` VALUES (1,1,1,1,2026),(37,1,7,4,2026),(48,1,101,5,2026),(14,2,1,2,2026),(25,2,7,3,2026),(58,2,101,6,2026),(2,3,2,1,2026),(26,3,8,3,2026),(59,3,102,6,2026),(12,3,115,1,2026),(35,3,126,3,2026),(3,4,3,1,2026),(50,4,103,5,2026),(22,4,112,2,2026),(27,4,117,3,2026),(45,4,123,4,2026),(67,4,128,6,2026),(6,5,6,1,2026),(53,5,106,5,2026),(30,5,120,3,2026),(5,6,5,1,2026),(18,6,5,2,2026),(52,6,105,5,2026),(62,6,105,6,2026),(54,6,107,5,2026),(64,6,107,6,2026),(10,6,113,1,2026),(23,6,113,2,2026),(29,6,119,3,2026),(41,6,119,4,2026),(33,6,124,3,2026),(46,6,124,4,2026),(15,7,2,2,2026),(38,7,8,4,2026),(49,7,102,5,2026),(13,7,116,1,2026),(36,7,127,3,2026),(7,8,110,1,2026),(20,8,110,2,2026),(31,8,121,3,2026),(43,8,121,4,2026),(55,9,108,5,2026),(65,9,108,6,2026),(8,9,111,1,2026),(21,9,111,2,2026),(32,9,122,3,2026),(44,9,122,4,2026),(4,10,4,1,2026),(17,10,4,2,2026),(51,10,104,5,2026),(61,10,104,6,2026),(28,10,118,3,2026),(40,10,118,4,2026),(56,11,109,5,2026),(66,11,109,6,2026),(11,11,114,1,2026),(24,11,114,2,2026),(34,11,125,3,2026),(47,11,125,4,2026),(19,13,6,2,2026),(63,13,106,6,2026),(42,13,120,4,2026),(16,14,3,2,2026),(60,14,103,6,2026),(9,14,112,1,2026),(39,14,117,4,2026),(57,14,128,5,2026);
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,4,'EMP-WIS-001','Sunil','Fernando','BSc Education (Mathematics)','0771234567','ACTIVE','2020-01-15','2026-09-01 08:00:00'),(2,5,'EMP-WIS-002','Kamala','Rajapaksha','MSc Applied Mathematics (Peradeniya)','0779876543','ACTIVE','2018-05-10','2026-09-01 08:00:00'),(3,6,'EMP-WIS-003','Nihal','Jayasinghe','BSc Biological Science (Colombo)','0714567890','ACTIVE','2021-03-01','2026-09-01 08:00:00'),(4,7,'EMP-WIS-004','Anoma','Wickramasinghe','BA English Language & Literature (Kelaniya)','0763456789','ACTIVE','2019-09-15','2026-09-01 08:00:00'),(5,8,'EMP-WIS-005','Chaminda','Silva','BSc Information Technology (SLIIT)','0725678901','ACTIVE','2022-01-10','2026-09-01 08:00:00'),(6,9,'EMP-WIS-006','Priyantha','Perera','BA Social Sciences & History (Peradeniya)','0756789012','ACTIVE','2017-06-20','2026-09-01 08:00:00'),(7,10,'EMP-WIS-007','Nalini','Gunawardena','BSc Physical Sciences (Sri Jayewardenepura)','0772345678','ACTIVE','2019-02-01','2026-09-01 08:00:00'),(8,11,'EMP-WIS-008','Chandrasiri','Bandara','BCom Commerce & Accounting (Kelaniya)','0713456789','ACTIVE','2020-08-15','2026-09-01 08:00:00'),(9,12,'EMP-WIS-009','Wimalarathana','Thero','BA Buddhist Philosophy & Pali (Honours)','0764567890','ACTIVE','2018-01-10','2026-09-01 08:00:00'),(10,13,'EMP-WIS-010','Deepika','Samaraweera','BA Sinhala Studies (Honours, Colombo)','0785678901','ACTIVE','2021-06-01','2026-09-01 08:00:00'),(11,14,'EMP-WIS-011','Jagath','Jayakody','BSc Physical Education & Sports Management','0706789012','ACTIVE','2022-03-15','2026-09-01 08:00:00'),(12,15,'EMP-WIS-012','Menaka','Karunaratne','BSc Chemistry (Special, Colombo)','0727890123','ON_LEAVE','2019-11-01','2026-09-01 08:00:00'),(13,16,'EMP-WIS-013','Lalith','Abeysekara','MSc Computer Systems & Networking','0758901234','ACTIVE','2023-01-15','2026-09-01 08:00:00'),(14,17,'EMP-WIS-014','Kanthi','Jayasuriya','BA English Language Teaching (Open Univ)','0779012345','ACTIVE','2018-09-01','2026-09-01 08:00:00'),(15,18,'EMP-WIS-015','Rohana','Dissanayake','BSc Mathematics & Statistics','0710123456','ON_LEAVE','2017-04-10','2026-09-01 08:00:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=241 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable_entries`
--

LOCK TABLES `timetable_entries` WRITE;
/*!40000 ALTER TABLE `timetable_entries` DISABLE KEYS */;
INSERT INTO `timetable_entries` VALUES (1,1,1,5,6,'ROOM-10A'),(2,1,2,6,5,'IT-LAB-1'),(3,1,3,3,4,'ROOM-10A'),(4,1,4,4,10,'ROOM-10A'),(5,1,5,114,11,'SPORTS-GRD'),(6,1,6,116,7,'LAB-02'),(7,1,7,3,4,'ROOM-10A'),(8,1,8,1,1,'ROOM-10A'),(9,1,9,5,6,'ROOM-10A'),(10,1,10,1,1,'ROOM-10A'),(11,1,11,110,8,'ROOM-10A'),(12,1,12,112,14,'ROOM-10A'),(13,1,13,5,6,'ROOM-10A'),(14,1,14,111,9,'ROOM-10A'),(15,1,15,113,6,'ROOM-10A'),(16,1,16,110,8,'ROOM-10A'),(17,1,17,3,4,'ROOM-10A'),(18,1,18,1,1,'ROOM-10A'),(19,1,19,112,14,'ROOM-10A'),(20,1,20,6,5,'IT-LAB-1'),(21,1,21,3,4,'ROOM-10A'),(22,1,22,1,1,'ROOM-10A'),(23,1,23,2,3,'LAB-01'),(24,1,24,111,9,'ROOM-10A'),(25,1,25,6,5,'IT-LAB-1'),(26,1,26,4,10,'ROOM-10A'),(27,1,27,3,4,'ROOM-10A'),(28,1,28,4,10,'ROOM-10A'),(29,1,29,2,3,'LAB-01'),(30,1,30,2,3,'LAB-01'),(31,1,31,111,9,'ROOM-10A'),(32,1,32,113,6,'ROOM-10A'),(33,1,33,110,8,'ROOM-10A'),(34,1,34,6,5,'IT-LAB-1'),(35,1,35,2,3,'LAB-01'),(36,1,36,2,3,'LAB-01'),(37,1,37,115,3,'LAB-01'),(38,1,38,4,10,'ROOM-10A'),(39,1,39,1,1,'ROOM-10A'),(40,1,40,1,1,'ROOM-10A'),(41,2,1,6,13,'IT-LAB-2'),(42,2,2,5,6,'ROOM-10B'),(43,2,3,4,10,'ROOM-10B'),(44,2,4,3,14,'ROOM-10B'),(45,2,5,2,7,'LAB-02'),(46,2,6,112,4,'ROOM-10B'),(47,2,7,5,6,'ROOM-10B'),(48,2,8,2,7,'LAB-02'),(49,2,9,1,2,'ROOM-10B'),(50,2,10,6,13,'IT-LAB-2'),(51,2,11,3,14,'ROOM-10B'),(52,2,12,113,6,'ROOM-10B'),(53,2,13,114,11,'SPORTS-GRD'),(54,2,14,4,10,'ROOM-10B'),(55,2,15,3,14,'ROOM-10B'),(56,2,16,4,10,'ROOM-10B'),(57,2,17,2,7,'LAB-02'),(58,2,18,2,7,'LAB-02'),(59,2,19,110,8,'ROOM-10B'),(60,2,20,6,13,'IT-LAB-2'),(61,2,21,110,8,'ROOM-10B'),(62,2,22,1,2,'ROOM-10B'),(63,2,23,1,2,'ROOM-10B'),(64,2,24,2,7,'LAB-02'),(65,2,25,6,13,'IT-LAB-2'),(66,2,26,113,6,'ROOM-10B'),(67,2,27,2,7,'LAB-02'),(68,2,28,1,2,'ROOM-10B'),(69,2,29,111,9,'ROOM-10B'),(70,2,30,111,9,'ROOM-10B'),(71,2,31,114,11,'SPORTS-GRD'),(72,2,32,3,14,'ROOM-10B'),(73,2,33,1,2,'ROOM-10B'),(74,2,34,5,6,'ROOM-10B'),(75,2,35,3,14,'ROOM-10B'),(76,2,36,1,2,'ROOM-10B'),(77,2,37,4,10,'ROOM-10B'),(78,2,38,110,8,'ROOM-10B'),(79,2,39,112,4,'ROOM-10B'),(80,2,40,111,9,'ROOM-10B'),(81,3,1,7,2,'ROOM-11A'),(82,3,2,8,3,'LAB-03'),(83,3,3,7,2,'ROOM-11A'),(84,3,4,119,6,'ROOM-11A'),(85,3,5,7,2,'ROOM-11A'),(86,3,6,125,11,'SPORTS-GRD'),(87,3,7,120,5,'IT-LAB-3'),(88,3,8,8,3,'LAB-03'),(89,3,9,117,4,'ROOM-11A'),(90,3,10,119,6,'ROOM-11A'),(91,3,11,8,3,'LAB-03'),(92,3,12,118,10,'ROOM-11A'),(93,3,13,122,9,'ROOM-11A'),(94,3,14,125,11,'SPORTS-GRD'),(95,3,15,7,2,'ROOM-11A'),(96,3,16,127,7,'LAB-03'),(97,3,17,7,2,'ROOM-11A'),(98,3,18,122,9,'ROOM-11A'),(99,3,19,118,10,'ROOM-11A'),(100,3,20,124,6,'ROOM-11A'),(101,3,21,8,3,'LAB-03'),(102,3,22,120,5,'IT-LAB-3'),(103,3,23,117,4,'ROOM-11A'),(104,3,24,118,10,'ROOM-11A'),(105,3,25,121,8,'ROOM-11A'),(106,3,26,117,4,'ROOM-11A'),(107,3,27,126,3,'LAB-01'),(108,3,28,120,5,'IT-LAB-3'),(109,3,29,121,8,'ROOM-11A'),(110,3,30,119,6,'ROOM-11A'),(111,3,31,117,4,'ROOM-11A'),(112,3,32,121,8,'ROOM-11A'),(113,3,33,124,6,'ROOM-11A'),(114,3,34,8,3,'LAB-03'),(115,3,35,127,7,'LAB-03'),(116,3,36,118,10,'ROOM-11A'),(117,3,37,122,9,'ROOM-11A'),(118,3,38,120,5,'IT-LAB-3'),(119,3,39,7,2,'ROOM-11A'),(120,3,40,117,4,'ROOM-11A'),(121,4,1,122,9,'ROOM-11B'),(122,4,2,117,14,'ROOM-11B'),(123,4,3,8,7,'LAB-02'),(124,4,4,7,1,'ROOM-11B'),(125,4,5,119,6,'ROOM-11B'),(126,4,6,120,13,'IT-LAB-2'),(127,4,7,121,8,'ROOM-11B'),(128,4,8,123,4,'ROOM-11B'),(129,4,9,121,8,'ROOM-11B'),(130,4,10,117,14,'ROOM-11B'),(131,4,11,118,10,'ROOM-11B'),(132,4,12,125,11,'SPORTS-GRD'),(133,4,13,117,14,'ROOM-11B'),(134,4,14,117,14,'ROOM-11B'),(135,4,15,118,10,'ROOM-11B'),(136,4,16,120,13,'IT-LAB-2'),(137,4,17,7,1,'ROOM-11B'),(138,4,18,118,10,'ROOM-11B'),(139,4,19,120,13,'IT-LAB-2'),(140,4,20,8,7,'LAB-02'),(141,4,21,8,7,'LAB-02'),(142,4,22,120,13,'IT-LAB-2'),(143,4,23,122,9,'ROOM-11B'),(144,4,24,124,6,'ROOM-11B'),(145,4,25,8,7,'LAB-02'),(146,4,26,117,14,'ROOM-11B'),(147,4,27,7,1,'ROOM-11B'),(148,4,28,121,8,'ROOM-11B'),(149,4,29,118,10,'ROOM-11B'),(150,4,30,123,4,'ROOM-11B'),(151,4,31,7,1,'ROOM-11B'),(152,4,32,7,1,'ROOM-11B'),(153,4,33,125,11,'SPORTS-GRD'),(154,4,34,7,1,'ROOM-11B'),(155,4,35,119,6,'ROOM-11B'),(156,4,36,8,7,'LAB-02'),(157,4,37,119,6,'ROOM-11B'),(158,4,38,122,9,'ROOM-11B'),(159,4,39,124,6,'ROOM-11B'),(160,4,40,8,7,'LAB-02'),(161,5,1,104,10,'ROOM-09A'),(162,5,2,103,4,'ROOM-09A'),(163,5,3,106,5,'IT-LAB-1'),(164,5,4,108,9,'ROOM-09A'),(165,5,5,104,10,'ROOM-09A'),(166,5,6,107,6,'ROOM-09A'),(167,5,7,102,7,'LAB-03'),(168,5,8,106,5,'IT-LAB-1'),(169,5,9,102,7,'LAB-03'),(170,5,10,103,4,'ROOM-09A'),(171,5,11,107,6,'ROOM-09A'),(172,5,12,101,1,'ROOM-09A'),(173,5,13,104,10,'ROOM-09A'),(174,5,14,101,1,'ROOM-09A'),(175,5,15,109,11,'SPORTS-GRD'),(176,5,16,106,5,'IT-LAB-1'),(177,5,17,128,14,'ROOM-09A'),(178,5,18,103,4,'ROOM-09A'),(179,5,19,101,1,'ROOM-09A'),(180,5,20,108,9,'ROOM-09A'),(181,5,21,101,1,'ROOM-09A'),(182,5,22,128,14,'ROOM-09A'),(183,5,23,105,6,'ROOM-09A'),(184,5,24,103,4,'ROOM-09A'),(185,5,25,101,1,'ROOM-09A'),(186,5,26,106,5,'IT-LAB-1'),(187,5,27,107,6,'ROOM-09A'),(188,5,28,102,7,'LAB-03'),(189,5,29,102,7,'LAB-03'),(190,5,30,128,14,'ROOM-09A'),(191,5,31,105,6,'ROOM-09A'),(192,5,32,102,7,'LAB-03'),(193,5,33,102,7,'LAB-03'),(194,5,34,103,4,'ROOM-09A'),(195,5,35,108,9,'ROOM-09A'),(196,5,36,101,1,'ROOM-09A'),(197,5,37,109,11,'SPORTS-GRD'),(198,5,38,105,6,'ROOM-09A'),(199,5,39,104,10,'ROOM-09A'),(200,5,40,105,6,'ROOM-09A'),(201,6,1,103,14,'ROOM-09B'),(202,6,2,101,2,'ROOM-09B'),(203,6,3,102,3,'LAB-01'),(204,6,4,106,13,'IT-LAB-2'),(205,6,5,108,9,'ROOM-09B'),(206,6,6,103,14,'ROOM-09B'),(207,6,7,108,9,'ROOM-09B'),(208,6,8,108,9,'ROOM-09B'),(209,6,9,106,13,'IT-LAB-2'),(210,6,10,104,10,'ROOM-09B'),(211,6,11,101,2,'ROOM-09B'),(212,6,12,102,3,'LAB-01'),(213,6,13,101,2,'ROOM-09B'),(214,6,14,107,6,'ROOM-09B'),(215,6,15,102,3,'LAB-01'),(216,6,16,107,6,'ROOM-09B'),(217,6,17,105,6,'ROOM-09B'),(218,6,18,101,2,'ROOM-09B'),(219,6,19,107,6,'ROOM-09B'),(220,6,20,103,14,'ROOM-09B'),(221,6,21,105,6,'ROOM-09B'),(222,6,22,128,4,'ROOM-09B'),(223,6,23,106,13,'IT-LAB-2'),(224,6,24,109,11,'SPORTS-GRD'),(225,6,25,101,2,'ROOM-09B'),(226,6,26,101,2,'ROOM-09B'),(227,6,27,104,10,'ROOM-09B'),(228,6,28,102,3,'LAB-01'),(229,6,29,105,6,'ROOM-09B'),(230,6,30,104,10,'ROOM-09B'),(231,6,31,106,13,'IT-LAB-2'),(232,6,32,102,3,'LAB-01'),(233,6,33,103,14,'ROOM-09B'),(234,6,34,109,11,'SPORTS-GRD'),(235,6,35,128,4,'ROOM-09B'),(236,6,36,105,6,'ROOM-09B'),(237,6,37,128,4,'ROOM-09B'),(238,6,38,103,14,'ROOM-09B'),(239,6,39,102,3,'LAB-01'),(240,6,40,104,10,'ROOM-09B');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetables`
--

LOCK TABLES `timetables` WRITE;
/*!40000 ALTER TABLE `timetables` DISABLE KEYS */;
INSERT INTO `timetables` VALUES (1,1,2026,1,'PUBLISHED','2026-09-01 08:00:00','2026-09-01 08:00:00'),(2,2,2026,1,'PUBLISHED','2026-09-01 08:00:00','2026-09-01 08:00:00'),(3,3,2026,1,'PUBLISHED','2026-09-01 08:00:00','2026-09-01 08:00:00'),(4,4,2026,1,'PUBLISHED','2026-09-01 08:00:00','2026-09-01 08:00:00'),(5,5,2026,1,'PUBLISHED','2026-09-01 08:00:00','2026-09-01 08:00:00'),(6,6,2026,1,'PUBLISHED','2026-09-01 08:00:00','2026-09-01 08:00:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@wycherley.lk','$2a$10$jQ5U7328CX/nBYiXT9TmOuabDNfNX7uXPFv3ZuDWR9Ic5V6oLnL1W','ADMIN',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(2,'head_academic','academic@wycherley.lk','$2a$10$I6gpPe3Cw.T4lcixgwBMge8KlkMTg1f3rVFZOTMaLk9b66EBbzQd6','HEAD_OF_ACADEMIC',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(3,'bursar','bursar@wycherley.lk','$2a$10$jQ5U7328CX/nBYiXT9TmOuabDNfNX7uXPFv3ZuDWR9Ic5V6oLnL1W','ADMIN',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(4,'teacher1','teacher1@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(5,'teacher2','teacher2@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(6,'teacher3','teacher3@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(7,'teacher4','teacher4@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(8,'teacher5','teacher5@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(9,'teacher6','teacher6@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(10,'teacher7','teacher7@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(11,'teacher8','teacher8@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(12,'teacher9','teacher9@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(13,'teacher10','teacher10@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(14,'teacher11','teacher11@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(15,'teacher12','teacher12@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(16,'teacher13','teacher13@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(17,'teacher14','teacher14@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(18,'teacher15','teacher15@wycherley.lk','$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW','TEACHER',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(19,'parent1','parent1@wycherley.lk','$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu','PARENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(20,'parent2','parent2@wycherley.lk','$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu','PARENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(21,'parent3','parent3@wycherley.lk','$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu','PARENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(22,'parent4','parent4@wycherley.lk','$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu','PARENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(23,'parent5','parent5@wycherley.lk','$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu','PARENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(24,'parent6','parent6@wycherley.lk','$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu','PARENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(25,'parent7','parent7@wycherley.lk','$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu','PARENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(26,'parent8','parent8@wycherley.lk','$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu','PARENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(27,'parent9','parent9@wycherley.lk','$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu','PARENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(28,'parent10','parent10@wycherley.lk','$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu','PARENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(29,'student1','student1@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(30,'student2','student2@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(31,'student3','student3@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(32,'student4','student4@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(33,'student5','student5@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(34,'student6','student6@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(35,'student7','student7@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(36,'student8','student8@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(37,'student9','student9@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(38,'student10','student10@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(39,'student11','student11@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(40,'student12','student12@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(41,'student13','student13@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(42,'student14','student14@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(43,'student15','student15@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(44,'student16','student16@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(45,'student17','student17@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(46,'student18','student18@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(47,'student19','student19@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(48,'student20','student20@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(49,'student21','student21@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(50,'student22','student22@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(51,'student23','student23@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(52,'student24','student24@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(53,'student25','student25@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(54,'student26','student26@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(55,'student27','student27@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(56,'student28','student28@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(57,'student29','student29@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00'),(58,'student30','student30@wycherley.lk','$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq','STUDENT',1,'2026-09-01 08:00:00','2026-09-01 08:00:00');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-05 21:05:30
