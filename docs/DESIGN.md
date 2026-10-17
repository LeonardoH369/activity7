# Diseño y validación de Activity 7

## Decisiones de diseño

El rol es un ENUM porque cada usuario tiene exactamente un rol entre los tres indicados. No es necesario un catálogo de roles para cumplir este caso. La FK nullable `users.group_id` se combina con CHECK para exigir grupo a los alumnos y prohibirlo a los otros roles.

Los niveles se modelan como una tabla de grupos, no como ENUM. La asignación grupo-curso usa dos FK que forman una PK compuesta: el mismo par no puede repetirse, pero ambos extremos pueden participar en varias asignaciones.

Se separan los kits para no duplicar `StarterKit` en Rob101 y Rob102. Los cursos conservan clave única, título, portada y contenido. Se considera un material principal exclusivo para cada curso; esta decisión de diseño se documenta porque el caso no define varios materiales por curso.

## Asociaciones Sequelize

- Group.hasMany(User) y User.belongsTo(Group).
- Group.belongsToMany(Course) y Course.belongsToMany(Group), a través de GroupCourse.
- Group y Course tienen hasMany(GroupCourse); GroupCourse pertenece a ambos.
- RoboticsKit.hasMany(Course) y Course.belongsTo(RoboticsKit).
- DidacticMaterial.hasOne(Course) y Course.belongsTo(DidacticMaterial).

Las asociaciones están definidas en los archivos de cada modelo, no solo en el controlador. El esquema real se crea con migraciones; no se utiliza `sync({ force: true })`.

## Datos iniciales

| Clave | Curso | Kit |
| --- | --- | --- |
| Rob101 | Introduction to Robotics | StarterKit |
| Rob102 | Introduction to Automation | StarterKit |
| Rob103 | Programming for Robotics | Educational Robotics Kit |
| Rob104 | Characteristics of a Robot | Kit5 |

Se agregan tres grupos, tres alumnos de ejemplo, un docente y un administrador. Hay cuatro materiales de ejemplo y cinco asignaciones grupo-curso. El caso no asigna docentes a cursos: no se inventa esa relación.

## Validación ejecutada el 17 de octubre de 2026

- Node.js 24.19.0, Sequelize 6.37.8 y MariaDB 10.4.32 en una instancia aislada.
- Seis migraciones aplicadas correctamente a `activity7`.
- Seeder ejecutado y registrado en SequelizeData.
- Cinco pruebas aprobadas en `activity7_test`.
- Semilla revertida y las seis migraciones revertidas, reaplicadas y sembradas en la base de pruebas.
- SQL exportado desde `activity7` e importado en `activity7_restore_test`.
- Las mismas cinco pruebas aprobadas contra la base restaurada.
- Diagrama generado en PDF vectorial y PNG, revisado visualmente.

Las cinco pruebas incluyen restricciones CHECK, FK, clave compuesta, material obligatorio y exclusivo, asociaciones bidireccionales y respuestas de los seis controladores. Los archivos de portada y materiales se sirven desde `public/` para que las rutas de ejemplo existan.

## Referencias

- https://sequelize.org/docs/v6/core-concepts/assocs/
- https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/
- https://sequelize.org/docs/v6/other-topics/migrations/
