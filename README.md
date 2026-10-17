# Activity 7 Escuela de robótica

Proyecto independiente de PrintBox para modelar una escuela de robótica. Implementado con **Express + Sequelize + MySQL/MariaDB**, con la adaptación de framework autorizada por el docente. Sequelize sustituye a Eloquent y su CLI sustituye a Artisan para generar modelos y migraciones. No es un proyecto Laravel.

## Entregables

- [Diagrama ER en PNG](docs/diagrama_er.png)
- [Diagrama ER en PDF](docs/diagrama_er.pdf)
- [Base de datos exportada](database/activity7.sql)
- [Comandos usados para generar archivos](docs/CLI_GENERATION.md)
- [Diseño y validación](docs/DESIGN.md)

El [reporte editable de entrega y sus adjuntos](docs/REPORT.md) están enlazados en `docs/REPORT.md`.

## Modelo

Seis entidades y seis controladores de consulta:

| Tabla | Modelo | Controlador |
| --- | --- | --- |
| users | User | UserController |
| groups | Group | GroupController |
| courses | Course | CourseController |
| robotics_kits | RoboticsKit | RoboticsKitController |
| didactic_materials | DidacticMaterial | DidacticMaterialController |
| group_courses | GroupCourse | GroupCourseController |

- Un usuario tiene un solo rol: `student`, `teacher` o `administrator`.
- Un estudiante requiere un grupo. Los otros roles no tienen grupo. Una restricción CHECK protege esta regla también fuera del ORM.
- Los grupos son registros: inicialmente `beginner`, `intermediate` y `advanced`, y se pueden agregar más sin modificar el esquema.
- Grupos y cursos tienen relación N:M mediante la clave primaria compuesta de `group_courses`.
- Un kit puede usarse en varios cursos; cada curso requiere un kit.
- Se asume un material principal propio por curso: FK obligatoria y única en `courses`. El material puede existir antes de vincularse a su curso.

## Instalación en Windows PowerShell

Requisitos: Node.js 22 o superior y MariaDB 10.4 o MySQL 8.0.16 o superior, para que CHECK se aplique.

```powershell
npm ci
Copy-Item .env.example .env
# Configurar usuario, contraseña, puerto y base en .env; encender MySQL/MariaDB.
npm run db:create
npm run db:migrate
npm run db:seed
npm run dev
```

No repetir `db:create` si la base ya existe. El seeder registra su ejecución en `SequelizeData`. La configuración por defecto usa `activity7`, puerto de BD 3306 y puerto web 3001. No incluir `.env` ni `node_modules` en Git.

## API de consulta

GET `/api/users`, `/api/groups`, `/api/courses`, `/api/robotics-kits`, `/api/didactic-materials` y `/api/group-courses`. Los primeros cinco recursos admiten `/:id`; las asignaciones usan `/:groupId/:courseId`. GET `/health` comprueba el servidor.

Los controladores incluyen las relaciones relevantes. La actividad cubre modelado, consultas y entregables; no implementa autenticación ni una plataforma web completa.

## Pruebas en una base separada

```powershell
$env:DB_NAME = 'activity7_test'
npm run db:create
npm run db:migrate
npm run db:seed
npm test
Remove-Item Env:DB_NAME
```

`npm test` exige un nombre de base `activity7..._test`. Verifica los datos del caso, asociaciones, integridad referencial, roles, unicidad, nuevos grupos y los seis controladores. Los registros temporales se revierten mediante una transacción.

## Importar la entrega SQL

En phpMyAdmin: crear una base vacía `activity7`, seleccionarla, abrir **Importar**, elegir `database/activity7.sql` y ejecutar. Importar el SQL es una alternativa a ejecutar migraciones y semillas: no hacer ambas inicializaciones sobre una base ya cargada.

La exportación incluye esquema, restricciones, datos de ejemplo y las tablas técnicas de historial de Sequelize. Se obtuvo con `mysqldump` y se verificó importándola en `activity7_restore_test`. Los usuarios y los recursos didácticos son ejemplos académicos, no datos personales reales.
