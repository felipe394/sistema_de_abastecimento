const db = require('./backend/src/database');

async function seed() {
  try {
    console.log('Limpando tabelas...');
    await db('tb_transacoes').del();
    await db('tb_atms').del();
    await db('tb_custodias').del();

    console.log('Inserindo Custódias...');
    const [custodyId] = await db('tb_custodias').insert({
      name: 'CUSTÓDIA TESTE SÃO PAULO',
      region: 'Sudeste',
      cities: 'São Paulo, Campinas',
      description: 'Agrupamento para testes de sistema',
      status: 'Ativo'
    });

    console.log('Inserindo ATMs...');
    const atms = [
      { number: 'ATM-CENTRAL-01', custody_id: custodyId },
      { number: 'ATM-CENTRAL-02', custody_id: custodyId },
      { number: 'ATM-SHOPPING-01', custody_id: custodyId },
    ];
    
    const atmIds = [];
    for (const atm of atms) {
       const [id] = await db('tb_atms').insert(atm);
       atmIds.push(id);
    }

    console.log('Inserindo Transações...');
    // Vamos inserir 3 semanas de dados para as segundas-feiras
    const dates = ['2026-03-23', '2026-03-16', '2026-03-09'];
    
    for (const date of dates) {
      for (const atmId of atmIds) {
        // Saques (Withdrawals)
        await db('tb_transacoes').insert({
          atm_id: atmId,
          type: 'withdrawal',
          amount: 50000 + Math.random() * 20000,
          date: date
        });
        // Depósitos (Deposits)
        await db('tb_transacoes').insert({
          atm_id: atmId,
          type: 'deposit',
          amount: 20000 + Math.random() * 10000,
          date: date
        });
      }
    }

    console.log('Dados inseridos com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao popular banco:', err);
    process.exit(1);
  }
}

seed();
