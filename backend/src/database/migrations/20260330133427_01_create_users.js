exports.up = function(knex) {
  return knex.schema.createTable('tb_usuarios', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.enum('role', ['admin', 'analyst']).defaultTo('analyst');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tb_usuarios');
};
