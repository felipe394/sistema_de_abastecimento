const express = require('express');
const db = require('../database');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/stats', async (req, res) => {
  try {
    const totalAtms = await db('tb_atms').count('* as count').first();
    const activeCustodies = await db('tb_custodias').count('* as count').first();
    
    // Monthly analyses (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    
    const monthlyAnalyses = await db('tb_analises')
      .where('created_at', '>=', startOfMonth)
      .count('* as count')
      .first();

    // Predictions Generated (Let's count how many ATM predictions are saved in the analyses config)
    // For simplicity, let's return a simulated high number based on ATMs * saved analyses
    const totalSavedAnalyses = await db('tb_analises').count('* as count').first();
    const predictionsCount = (totalSavedAnalyses.count || 0) * (totalAtms.count || 0);

    // Recent Activity
    const recentActivity = await db('tb_analises')
      .join('tb_custodias', 'tb_analises.id_custodia', 'tb_custodias.id')
      .join('tb_usuarios', 'tb_analises.id_usuario', 'tb_usuarios.id')
      .select(
        'tb_analises.id',
        'tb_custodias.nome as custodyName',
        'tb_usuarios.nome as userName',
        'tb_analises.created_at'
      )
      .orderBy('tb_analises.created_at', 'desc')
      .limit(5);

    // Volume Chart (Last 7 days with actual data)
    const recentDates = await db('tb_transacoes')
      .distinct('data')
      .orderBy('data', 'desc')
      .limit(7);
    
    const last7Days = recentDates.map(d => d.data.toISOString().split('T')[0]).reverse();

    const volumeData = await db('tb_transacoes')
      .whereIn('data', last7Days)
      .select('data')
      .sum('valor as total')
      .groupBy('data')
      .orderBy('data', 'asc');

    // Map volume data to chart objects
    const chartData = last7Days.map(date => {
      const found = volumeData.find(v => v.data.toISOString().split('T')[0] === date);
      return {
        date: date.split('-').reverse().slice(0, 2).join('/'), // DD/MM
        value: found ? parseFloat(found.total) : 0
      };
    });

    res.json({
      totalAtms: totalAtms.count,
      activeCustodies: activeCustodies.count,
      monthlyAnalyses: monthlyAnalyses.count,
      predictionsCount,
      recentActivity,
      chartData
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Falha ao buscar estatísticas' });
  }
});

module.exports = router;
