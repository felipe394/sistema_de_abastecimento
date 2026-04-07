exports.up = function(knex) {
  return knex.schema.createTable('tb_atms', table => {
    table.increments('id').primary();
    table.string('number').notNullable().unique(); // ATM identifier (e.g. terminal number)
    table.integer('custody_id').unsigned().references('id').inTable('tb_custodias').onDelete('CASCADE');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tb_atms');
};
