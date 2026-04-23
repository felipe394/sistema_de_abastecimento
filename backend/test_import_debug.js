const fs = require('fs');
const db = require('./src/database');

async function testImport() {
  try {
    const fileContent = `H:4341;20260331003350;001715;
D:41275               ;20260328135348;20260330;761941275606301;SAQUE                                             ;0000000000060000;000000;   ;      ;050;000004;100;000004;   ;      ;
    `;
    const lines = fileContent.split(/\r?\n/);
    let recordsProcessed = 0;
    let skippedLines = 0;

    await db.transaction(async trx => {
      for (let i = 1; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(';');
        if (parts.length < 6) continue;
        
        const firstPart = parts[0] || '';
        if (!firstPart.startsWith('D:')) continue;
        
        const atmCode = firstPart.substring(2).trim(); 
        const dataHoraStr = parts[1] ? parts[1].trim() : '';
        const dataContabilStr = parts[2] ? parts[2].trim() : '';
        const controleContabil = parts[3] ? parts[3].trim() : '';
        const tipo = parts[4] ? parts[4].trim() : '';
        const valorStr = parts[5] ? parts[5].trim() : '';
        const nsu = parts[6] ? parts[6].trim() : '';

        if (!atmCode || !dataHoraStr || !dataContabilStr || !tipo || !valorStr) {
          skippedLines++;
          continue;
        }

        if (dataContabilStr.endsWith('31')) {
          skippedLines++;
          continue;
        }

        const amount = parseFloat(valorStr) / 100;

        let transactionType = 'withdrawal'; 
        if (tipo.toUpperCase() === 'SAQUE') transactionType = 'withdrawal';
        else if (tipo.toUpperCase() === 'DEPOSITO') transactionType = 'deposit';

        let transactionDatetime = null;
        if (dataHoraStr.length >= 14) {
          transactionDatetime = `${dataHoraStr.substring(0,4)}-${dataHoraStr.substring(4,6)}-${dataHoraStr.substring(6,8)} ${dataHoraStr.substring(8,10)}:${dataHoraStr.substring(10,12)}:${dataHoraStr.substring(12,14)}`;
        }

        let accountingDate = null;
        if (dataContabilStr.length >= 8) {
          accountingDate = `${dataContabilStr.substring(0,4)}-${dataContabilStr.substring(4,6)}-${dataContabilStr.substring(6,8)}`;
        }

        let atm = await trx('tb_atms').where({ numero: atmCode }).first();
        if (!atm) {
          let custody = await trx('tb_custodias').first();
          if (!custody) {
             const [custodyId] = await trx('tb_custodias').insert({ nome: 'Custódia Padrão' });
             custody = { id: custodyId };
          }
          const [atmId] = await trx('tb_atms').insert({
            numero: atmCode,
            id_custodia: custody.id
          });
          atm = { id: atmId, numero: atmCode };
        }

        const insertPayload = {
          id_atm: atm.id,
          valor: amount,
          tipo: transactionType === 'withdrawal' ? 'saque' : 'deposito',
          data_hora_transacao: transactionDatetime,
          data_contabil: accountingDate,
          controle_contabil: controleContabil.substring(0, 15),
          nsu: nsu.substring(0, 6),
          data: accountingDate,
          nome_arquivo: 'DEBUG_TEST_FILE.txt'
        };
        console.log("Inserting:", insertPayload);
        
        await trx('tb_transacoes').insert(insertPayload);
        recordsProcessed++;
      }
    });

    console.log('Success:', { recordsProcessed, skippedLines });
  } catch (err) {
    console.error("DEBUG ERROR:", err);
  } finally {
    db.destroy();
  }
}

testImport();
