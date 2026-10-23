const { DataTypes } = require('sequelize');
module.exports = db => db.define('MailEvent', {
 id: {type:DataTypes.UUID,primaryKey:true},
 user_id: {type:DataTypes.INTEGER.UNSIGNED,allowNull:false},
 kind: {type:DataTypes.ENUM('welcome','login'),allowNull:false},
 recipient: {type:DataTypes.STRING(254),allowNull:false},
 recipient_name: {type:DataTypes.STRING(100),allowNull:false},
 status: {type:DataTypes.ENUM('pending','sending','sent','preview','failed'),allowNull:false,defaultValue:'pending'},
 attempts: {type:DataTypes.INTEGER.UNSIGNED,allowNull:false,defaultValue:0},
 last_error: {type:DataTypes.STRING(80),allowNull:true},
 sent_at: {type:DataTypes.DATE,allowNull:true}
},{tableName:'mail_events',underscored:true});
