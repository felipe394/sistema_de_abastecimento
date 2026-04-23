const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config.development);

async function seedTransactions() {
  try {
    const custodies = await db('tb_custodias').select('id');
    const atms = await db('tb_atms').select('id', 'custody_id');
    
    if (atms.length === 0) {
      console.log('No ATMs found to seed transactions.');
      return;
    }

    const transactions = [];
    const dates = ['2025-11-03', '2026-02-02', '2026-03-02', '2026-04-01', '2026-03-30'];

    for (const atm of atms) {
      for (const date of dates) {
        // Withdrawal
        transactions.push({
          id_atm: atm.id,
          tipo: 'saque',
          valor: Math.floor(Math.random() * 50000) + 10000,
          data: date,
          nome_arquivo: 'SEED_DATA.xlsx'
        });
        // Deposit
        transactions.push({
          id_atm: atm.id,
          tipo: 'deposito',
          valor: Math.floor(Math.random() * 30000) + 5000,
          data: date,
          nome_arquivo: 'SEED_DATA.xlsx'
        });
      }
    }

    await db('tb_transacoes').insert(transactions);
    console.log('Seeded transactions successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await db.destroy();
  }
}

seedTransactions();
