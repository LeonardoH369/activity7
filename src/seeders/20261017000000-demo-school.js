'use strict';
const { randomBytes } = require('node:crypto');
const { hashPassword } = require('../utils/password');
const data = {
  "groups": [
    {
      "id": 1,
      "name": "beginner"
    },
    {
      "id": 2,
      "name": "intermediate"
    },
    {
      "id": 3,
      "name": "advanced"
    }
  ],
  "robotics_kits": [
    {
      "id": 1,
      "name": "StarterKit"
    },
    {
      "id": 2,
      "name": "Educational Robotics Kit"
    },
    {
      "id": 3,
      "name": "Kit5"
    }
  ],
  "didactic_materials": [
    {
      "id": 1,
      "title": "Guía Rob101",
      "file_url": "/assets/materials/Rob101.md"
    },
    {
      "id": 2,
      "title": "Guía Rob102",
      "file_url": "/assets/materials/Rob102.md"
    },
    {
      "id": 3,
      "title": "Guía Rob103",
      "file_url": "/assets/materials/Rob103.md"
    },
    {
      "id": 4,
      "title": "Guía Rob104",
      "file_url": "/assets/materials/Rob104.md"
    }
  ],
  "users": [
    {
      "id": 1,
      "name": "Estudiante principiante",
      "email": "beginner@example.test",
      "role": "student",
      "group_id": 1
    },
    {
      "id": 2,
      "name": "Estudiante intermedio",
      "email": "intermediate@example.test",
      "role": "student",
      "group_id": 2
    },
    {
      "id": 3,
      "name": "Estudiante avanzado",
      "email": "advanced@example.test",
      "role": "student",
      "group_id": 3
    },
    {
      "id": 4,
      "name": "Docente de ejemplo",
      "email": "teacher@example.test",
      "role": "teacher",
      "group_id": null
    },
    {
      "id": 5,
      "name": "Administración de ejemplo",
      "email": "admin@example.test",
      "role": "administrator",
      "group_id": null
    }
  ],
  "courses": [
    {
      "id": 1,
      "code": "Rob101",
      "title": "Introduction to Robotics",
      "cover_url": "/assets/course-cover.svg",
      "content": "Identificación de sensores y actuadores; diseño de un robot básico.",
      "robotics_kit_id": 1,
      "didactic_material_id": 1
    },
    {
      "id": 2,
      "code": "Rob102",
      "title": "Introduction to Automation",
      "cover_url": "/assets/course-cover.svg",
      "content": "Entradas, salidas y secuencias para automatizar tareas.",
      "robotics_kit_id": 1,
      "didactic_material_id": 2
    },
    {
      "id": 3,
      "code": "Rob103",
      "title": "Programming for Robotics",
      "cover_url": "/assets/course-cover.svg",
      "content": "Variables, condiciones y ciclos aplicados al control de robots.",
      "robotics_kit_id": 2,
      "didactic_material_id": 3
    },
    {
      "id": 4,
      "code": "Rob104",
      "title": "Characteristics of a Robot",
      "cover_url": "/assets/course-cover.svg",
      "content": "Estructura, movilidad y características de los sistemas robóticos.",
      "robotics_kit_id": 3,
      "didactic_material_id": 4
    }
  ],
  "group_courses": [
    {
      "group_id": 1,
      "course_id": 1
    },
    {
      "group_id": 1,
      "course_id": 4
    },
    {
      "group_id": 2,
      "course_id": 2
    },
    {
      "group_id": 2,
      "course_id": 3
    },
    {
      "group_id": 3,
      "course_id": 3
    }
  ]
};
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const now = new Date();
      for (const [table, rows] of Object.entries(data)) {
        await queryInterface.bulkInsert(table, rows.map((row) => ({ ...row, ...(table === 'users' ? { username: `user_${row.id}`, password_hash: hashPassword(randomBytes(32).toString('hex')) } : {}), created_at: now, updated_at: now })), { transaction });
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const table of Object.keys(data).reverse()) {
        const where = table === 'group_courses' ? { group_id: [1, 2, 3], course_id: [1, 2, 3, 4] } : { id: data[table].map((row) => row.id) };
        await queryInterface.bulkDelete(table, where, { transaction });
      }
    });
  }
};
