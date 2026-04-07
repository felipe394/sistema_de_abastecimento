exports.up = function(knex) {
  return knex.schema.createTable('analyses', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('custody_id').unsigned().references('id').inTable('custodies').onDelete('CASCADE');
    table.date('reference_date').notNullable();
    table.json('config'); // Store the complex calculations (macro/micro, lines, factors) as a JSON blob
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('analyses');
};
