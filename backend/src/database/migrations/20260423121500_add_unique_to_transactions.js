exports.up = async function(knex) {
  // 1. Delete duplicates first to avoid errors during index creation
  // We use a join to find records with the same identifying fields and keep only the one with the highest ID
  await knex.raw(`
    DELETE t1 FROM tb_transacoes t1
    INNER JOIN tb_transacoes t2 
    WHERE t1.id < t2.id 
      AND t1.id_atm = t2.id_atm 
      AND (t1.data_hora_transacao = t2.data_hora_transacao OR (t1.data_hora_transacao IS NULL AND t2.data_hora_transacao IS NULL))
      AND t1.valor = t2.valor 
      AND t1.tipo = t2.tipo 
      AND (t1.nsu = t2.nsu OR (t1.nsu IS NULL AND t2.nsu IS NULL))
  `);

  // 2. Add the unique index
  // Note: In MySQL, a unique index on multiple columns allows multiple NULL values.
  // This is acceptable as a first layer of protection.
  await knex.schema.alterTable('tb_transacoes', table => {
    table.unique(['id_atm', 'data_hora_transacao', 'valor', 'tipo', 'nsu'], { name: 'idx_unique_transaction' });
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('tb_transacoes', table => {
    table.dropUnique(['id_atm', 'data_hora_transacao', 'valor', 'tipo', 'nsu'], 'idx_unique_transaction');
  });
};
