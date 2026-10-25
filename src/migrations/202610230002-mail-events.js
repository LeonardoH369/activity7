'use strict';
module.exports = {
 async up(q,S){await q.createTable('mail_events',{
 id:{type:S.UUID,primaryKey:true,allowNull:false},
 user_id:{type:S.INTEGER.UNSIGNED,allowNull:false,references:{model:'users',key:'id'},onDelete:'CASCADE',onUpdate:'CASCADE'},
 kind:{type:S.ENUM('welcome','login'),allowNull:false},
 recipient:{type:S.STRING(254),allowNull:false},recipient_name:{type:S.STRING(100),allowNull:false},
 status:{type:S.ENUM('pending','sending','sent','preview','failed'),allowNull:false,defaultValue:'pending'},
 attempts:{type:S.INTEGER.UNSIGNED,allowNull:false,defaultValue:0},last_error:{type:S.STRING(80),allowNull:true},sent_at:{type:S.DATE,allowNull:true},
 created_at:{type:S.DATE,allowNull:false},updated_at:{type:S.DATE,allowNull:false}
 });await q.addIndex('mail_events',['status']);},
 async down(q){await q.dropTable('mail_events');}
};
