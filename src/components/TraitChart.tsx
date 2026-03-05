import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Props = {
  percentages: Record<string, number>;
};

export function TraitChart({ percentages }: Props) {
  const labels = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Trait %',
        data: labels.map((label) => percentages[label] ?? 0),
        backgroundColor: '#6366f1',
      },
    ],
  };

  return <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />;
}
