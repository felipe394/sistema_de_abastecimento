exports.up = function(knex) {
  return knex.schema.table('tb_custodias', table => {
    table.string('region');
    table.text('cities');
    table.text('description');
    table.string('status').defaultTo('Ativo');
  });
};

exports.down = function(knex) {
  return knex.schema.table('tb_custodias', table => {
    table.dropColumn('region');
    table.dropColumn('cities');
    table.dropColumn('description');
    table.dropColumn('status');
  });
};
