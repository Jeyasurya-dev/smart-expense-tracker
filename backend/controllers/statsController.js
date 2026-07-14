import { getSummary, getChartData } from '../utils/stats.js';

export const getSummaryHandler = async (_req, res) => {
  try {
    const summary = await getSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching summary', error: error.message });
  }
};

export const getChartsHandler = async (_req, res) => {
  try {
    const charts = await getChartData();
    res.status(200).json({ success: true, data: charts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching chart data', error: error.message });
  }
};
