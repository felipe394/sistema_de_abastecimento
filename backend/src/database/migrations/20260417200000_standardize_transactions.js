exports.up = async function(knex) {
  const hasAtmId = await knex.schema.hasColumn('tb_transacoes', 'atm_id');
  if (hasAtmId) {
    await knex.schema.alterTable('tb_transacoes', table => {
      table.renameColumn('atm_id', 'id_atm');
      table.renameColumn('amount', 'valor');
      table.renameColumn('date', 'data');
      table.renameColumn('transaction_datetime', 'data_hora_transacao');
      table.renameColumn('accounting_date', 'data_contabil');
      table.renameColumn('accounting_control', 'controle_contabil');
      table.string('nome_arquivo').nullable();
    });
  }
  
  const hasType = await knex.schema.hasColumn('tb_transacoes', 'type');
  if (hasType) {
    await knex.schema.alterTable('tb_transacoes', table => {
      table.renameColumn('type', 'tipo');
    });
  }

  const hasNomeArquivo = await knex.schema.hasColumn('tb_transacoes', 'nome_arquivo');
  if (!hasNomeArquivo) {
    await knex.schema.alterTable('tb_transacoes', table => {
      table.string('nome_arquivo').nullable();
    });
  }

  // Change enum to string so we can insert portuguese values
  await knex.raw("ALTER TABLE tb_transacoes MODIFY COLUMN tipo VARCHAR(255) NOT NULL");

  await knex('tb_transacoes').where('tipo', 'withdrawal').update({ tipo: 'saque' });
  await knex('tb_transacoes').where('tipo', 'deposit').update({ tipo: 'deposito' });
};

exports.down = async function(knex) {
  await knex('tb_transacoes').where('tipo', 'saque').update({ tipo: 'withdrawal' });
  await knex('tb_transacoes').where('tipo', 'deposito').update({ tipo: 'deposit' });
  
  // Revert back to enum
  await knex.raw("ALTER TABLE tb_transacoes MODIFY COLUMN tipo ENUM('deposit', 'withdrawal') NOT NULL");

  const hasIdAtm = await knex.schema.hasColumn('tb_transacoes', 'id_atm');
  if (hasIdAtm) {
    await knex.schema.alterTable('tb_transacoes', table => {
      table.renameColumn('id_atm', 'atm_id');
      table.renameColumn('valor', 'amount');
      table.renameColumn('tipo', 'type');
      table.renameColumn('data', 'date');
      table.renameColumn('data_hora_transacao', 'transaction_datetime');
      table.renameColumn('data_contabil', 'accounting_date');
      table.renameColumn('controle_contabil', 'accounting_control');
      table.dropColumn('nome_arquivo');
    });
  }
};
