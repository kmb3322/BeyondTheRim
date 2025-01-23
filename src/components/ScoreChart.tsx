// client/src/components/ScoreChart.tsx
import { Box } from '@chakra-ui/react';
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
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.4, // Smooth curves
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 16, family: 'Noto Sans KR' },
        bodyFont: { size: 14, family: 'Noto Sans KR' },
        callbacks: {
          label: function (context: any) {
            return `점수: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        ticks: {
          color: '#fff',
          font: { family: 'Noto Sans KR', size: 12 },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        ticks: {
          color: '#fff',
          font: { family: 'Noto Sans KR', size: 12 },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <Box bg="blackAlpha.800" p={4} borderRadius="md" boxShadow="lg">
      <Line
        data={data}
        options={options}
      />
    </Box>
  );
}
