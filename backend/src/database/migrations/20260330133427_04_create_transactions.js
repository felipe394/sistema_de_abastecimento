exports.up = function(knex) {
  return knex.schema.createTable('tb_transacoes', table => {
    table.increments('id').primary();
    table.integer('atm_id').unsigned().references('id').inTable('tb_atms').onDelete('CASCADE');
    table.date('date').notNullable();
    table.enum('type', ['deposit', 'withdrawal']).notNullable();
    table.decimal('amount', 14, 2).notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tb_transacoes');
};
