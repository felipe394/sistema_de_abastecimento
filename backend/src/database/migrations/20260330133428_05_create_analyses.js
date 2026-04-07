exports.up = function(knex) {
  return knex.schema.createTable('tb_analises', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('tb_usuarios').onDelete('CASCADE');
    table.integer('custody_id').unsigned().references('id').inTable('tb_custodias').onDelete('CASCADE');
    table.date('reference_date').notNullable();
    table.json('config'); // Store the complex calculations (macro/micro, lines, factors) as a JSON blob
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tb_analises');
};
