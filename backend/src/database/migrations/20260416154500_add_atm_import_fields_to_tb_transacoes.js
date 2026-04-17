exports.up = function(knex) {
  return knex.schema.alterTable('tb_transacoes', table => {
    table.datetime('transaction_datetime');
    table.date('accounting_date');
    table.string('accounting_control', 15);
    table.string('nsu', 6);
    // Notice we keep `date` to avoid breaking existing logic until we are sure, but make it nullable
    table.date('date').nullable().alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('tb_transacoes', table => {
    table.dropColumn('transaction_datetime');
    table.dropColumn('accounting_date');
    table.dropColumn('accounting_control');
    table.dropColumn('nsu');
    table.date('date').notNullable().alter();
  });
};
