const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  await knex('users').insert([
    {
      name: 'Admin',
      email: 'admin@system.com',
      password: hashedPassword,
      role: 'admin'
    }
  ]);
};
