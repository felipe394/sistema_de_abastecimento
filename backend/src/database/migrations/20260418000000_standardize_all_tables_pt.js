exports.up = async function(knex) {
  // First, change ENUM to string via raw SQL
  const hasRole = await knex.schema.hasColumn('tb_usuarios', 'role');
  if (hasRole) {
    await knex.raw("ALTER TABLE tb_usuarios MODIFY COLUMN role VARCHAR(255) NOT NULL DEFAULT 'analyst'");
  } else {
    await knex.raw("ALTER TABLE tb_usuarios MODIFY COLUMN perfil VARCHAR(255) NOT NULL DEFAULT 'analyst'");
  }

  // Rename columns
  const hasName = await knex.schema.hasColumn('tb_usuarios', 'name');
  if (hasName) {
    await knex.schema.alterTable('tb_usuarios', table => {
      table.renameColumn('name', 'nome');
      table.renameColumn('password', 'senha');
      table.renameColumn('role', 'perfil');
    });
  }

  // Atualizar valores de perfil para português
  await knex('tb_usuarios').where('perfil', 'admin').update({ perfil: 'administrador' });
  await knex('tb_usuarios').where('perfil', 'analyst').update({ perfil: 'analista' });

  const hasCustodyName = await knex.schema.hasColumn('tb_custodias', 'name');
  if (hasCustodyName) {
    await knex.schema.alterTable('tb_custodias', table => {
      table.renameColumn('name', 'nome');
      table.renameColumn('region', 'regiao');
      table.renameColumn('cities', 'cidades');
      table.renameColumn('description', 'descricao');
    });
  }
  
  const hasAtmNumber = await knex.schema.hasColumn('tb_atms', 'number');
  if (hasAtmNumber) {
    await knex.schema.alterTable('tb_atms', table => {
      table.renameColumn('number', 'numero');
      table.renameColumn('custody_id', 'id_custodia');
    });
  }
  
  const hasAnalysisUserId = await knex.schema.hasColumn('tb_analises', 'user_id');
  if (hasAnalysisUserId) {
    await knex.schema.alterTable('tb_analises', table => {
      table.renameColumn('user_id', 'id_usuario');
      table.renameColumn('custody_id', 'id_custodia');
      table.renameColumn('reference_date', 'data_referencia');
      table.renameColumn('config', 'configuracao');
    });
  }
};

exports.down = async function(knex) {
  await knex('tb_usuarios').where('perfil', 'administrador').update({ perfil: 'admin' });
  await knex('tb_usuarios').where('perfil', 'analista').update({ perfil: 'analyst' });

  await knex.raw("ALTER TABLE tb_usuarios MODIFY COLUMN perfil ENUM('admin', 'analyst') NOT NULL DEFAULT 'analyst'");

  const hasNome = await knex.schema.hasColumn('tb_usuarios', 'nome');
  if (hasNome) {
    await knex.schema.alterTable('tb_usuarios', table => {
      table.renameColumn('nome', 'name');
      table.renameColumn('senha', 'password');
      table.renameColumn('perfil', 'role');
    });
  }

  const hasCustodiaNome = await knex.schema.hasColumn('tb_custodias', 'nome');
  if (hasCustodiaNome) {
    await knex.schema.alterTable('tb_custodias', table => {
      table.renameColumn('nome', 'name');
      table.renameColumn('regiao', 'region');
      table.renameColumn('cidades', 'cities');
      table.renameColumn('descricao', 'description');
    });
  }
  
  const hasAtmNumero = await knex.schema.hasColumn('tb_atms', 'numero');
  if (hasAtmNumero) {
    await knex.schema.alterTable('tb_atms', table => {
      table.renameColumn('numero', 'number');
      table.renameColumn('id_custodia', 'custody_id');
    });
  }
  
  const hasAnalysisIdUsuario = await knex.schema.hasColumn('tb_analises', 'id_usuario');
  if (hasAnalysisIdUsuario) {
    await knex.schema.alterTable('tb_analises', table => {
      table.renameColumn('id_usuario', 'user_id');
      table.renameColumn('id_custodia', 'custody_id');
      table.renameColumn('data_referencia', 'reference_date');
      table.renameColumn('configuracao', 'config');
    });
  }
};
