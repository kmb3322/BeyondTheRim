// src/components/ScoreChart.tsx
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type ScoreChartProps = {
  labels: string[];
  scores: number[];
};

export default function ScoreChart({ labels, scores }: ScoreChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: '슛폼 점수',
        data: scores,
        borderColor: 'rgba(255, 0, 0, 1)',
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  return <Line data={data} options={options} />;
}
