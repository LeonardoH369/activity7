
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `title` varchar(150) NOT NULL,
  `cover_url` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `robotics_kit_id` int(10) unsigned NOT NULL,
  `didactic_material_id` int(10) unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `didactic_material_id` (`didactic_material_id`),
  KEY `robotics_kit_id` (`robotics_kit_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`robotics_kit_id`) REFERENCES `robotics_kits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`didactic_material_id`) REFERENCES `didactic_materials` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'Rob101','Introduction to Robotics','/assets/course-cover.svg','Identificación de sensores y actuadores; diseño de un robot básico.',1,1,'2026-10-17 19:29:02','2026-10-17 19:29:02'),(2,'Rob102','Introduction to Automation','/assets/course-cover.svg','Entradas, salidas y secuencias para automatizar tareas.',1,2,'2026-10-17 19:29:02','2026-10-17 19:29:02'),(3,'Rob103','Programming for Robotics','/assets/course-cover.svg','Variables, condiciones y ciclos aplicados al control de robots.',2,3,'2026-10-17 19:29:02','2026-10-17 19:29:02'),(4,'Rob104','Characteristics of a Robot','/assets/course-cover.svg','Estructura, movilidad y características de los sistemas robóticos.',3,4,'2026-10-17 19:29:02','2026-10-17 19:29:02');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `didactic_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `didactic_materials` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `didactic_materials` WRITE;
/*!40000 ALTER TABLE `didactic_materials` DISABLE KEYS */;
INSERT INTO `didactic_materials` VALUES (1,'Guía Rob101','/assets/materials/Rob101.md','2026-10-17 19:29:02','2026-10-17 19:29:02'),(2,'Guía Rob102','/assets/materials/Rob102.md','2026-10-17 19:29:02','2026-10-17 19:29:02'),(3,'Guía Rob103','/assets/materials/Rob103.md','2026-10-17 19:29:02','2026-10-17 19:29:02'),(4,'Guía Rob104','/assets/materials/Rob104.md','2026-10-17 19:29:02','2026-10-17 19:29:02');
/*!40000 ALTER TABLE `didactic_materials` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `group_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_courses` (
  `group_id` int(10) unsigned NOT NULL,
  `course_id` int(10) unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`group_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `group_courses_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `group_courses` WRITE;
/*!40000 ALTER TABLE `group_courses` DISABLE KEYS */;
INSERT INTO `group_courses` VALUES (1,1,'2026-10-17 19:29:02','2026-10-17 19:29:02'),(1,4,'2026-10-17 19:29:02','2026-10-17 19:29:02'),(2,2,'2026-10-17 19:29:02','2026-10-17 19:29:02'),(2,3,'2026-10-17 19:29:02','2026-10-17 19:29:02'),(3,3,'2026-10-17 19:29:02','2026-10-17 19:29:02');
/*!40000 ALTER TABLE `group_courses` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groups` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
INSERT INTO `groups` VALUES (1,'beginner','2026-10-17 19:29:02','2026-10-17 19:29:02'),(2,'intermediate','2026-10-17 19:29:02','2026-10-17 19:29:02'),(3,'advanced','2026-10-17 19:29:02','2026-10-17 19:29:02');
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `robotics_kits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `robotics_kits` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `robotics_kits` WRITE;
/*!40000 ALTER TABLE `robotics_kits` DISABLE KEYS */;
INSERT INTO `robotics_kits` VALUES (1,'StarterKit','2026-10-17 19:29:02','2026-10-17 19:29:02'),(2,'Educational Robotics Kit','2026-10-17 19:29:02','2026-10-17 19:29:02'),(3,'Kit5','2026-10-17 19:29:02','2026-10-17 19:29:02');
/*!40000 ALTER TABLE `robotics_kits` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sequelizedata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sequelizedata` (
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sequelizedata` WRITE;
/*!40000 ALTER TABLE `sequelizedata` DISABLE KEYS */;
INSERT INTO `sequelizedata` VALUES ('20261017000000-demo-school.js');
/*!40000 ALTER TABLE `sequelizedata` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('20261017192755-create-group.js'),('20261017192756-create-robotics-kit.js'),('20261017192758-create-didactic-material.js'),('20261017192759-create-user.js'),('20261017192801-create-course.js'),('20261017192802-create-group-course.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `role` enum('student','teacher','administrator') NOT NULL,
  `group_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_users_role_group` CHECK (`role` = 'student' and `group_id` is not null or `role` in ('teacher','administrator') and `group_id` is null)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Estudiante principiante','beginner@example.test','student',1,'2026-10-17 19:29:02','2026-10-17 19:29:02'),(2,'Estudiante intermedio','intermediate@example.test','student',2,'2026-10-17 19:29:02','2026-10-17 19:29:02'),(3,'Estudiante avanzado','advanced@example.test','student',3,'2026-10-17 19:29:02','2026-10-17 19:29:02'),(4,'Docente de ejemplo','teacher@example.test','teacher',NULL,'2026-10-17 19:29:02','2026-10-17 19:29:02'),(5,'Administración de ejemplo','admin@example.test','administrator',NULL,'2026-10-17 19:29:02','2026-10-17 19:29:02');
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

