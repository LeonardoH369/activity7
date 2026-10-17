# Generación con Sequelize CLI

Los siguientes comandos se ejecutaron para generar los modelos y sus migraciones. Después se completaron tipos, claves y asociaciones. Los controladores se escribieron en Express porque Sequelize CLI no genera controladores.

```sh
npx sequelize-cli model:generate --name Group --attributes name:string
npx sequelize-cli model:generate --name RoboticsKit --attributes name:string
npx sequelize-cli model:generate --name DidacticMaterial --attributes title:string,file_url:string
npx sequelize-cli model:generate --name User --attributes name:string,email:string,role:string,group_id:string
npx sequelize-cli model:generate --name Course --attributes code:string,title:string,cover_url:string,content:string,robotics_kit_id:string,didactic_material_id:string
npx sequelize-cli model:generate --name GroupCourse --attributes group_id:string,course_id:string
```
