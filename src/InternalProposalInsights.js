import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ResponsiveBar } from '@nivo/bar';

const supabase = createClient(
  'https://xlnuivlsdzwbejkfeijh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsbnVpdmxzZHp3YmVqa2ZlaWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTc0NjUsImV4cCI6MjA1ODU3MzQ2NX0.q8DlJA3ouiwbNlwa5rF5Mq2zfo27ptL6NauLdWRhm2c'
);

const bucketWeights = {
  'Critical to Me & Others': 5,
  'Good Idea': 4,
  'Indifferent': 3,
  'Dislike It': 2,
  'Hate It': 1,
};

export default function InternalProposalInsights() {
  const [averageScores, setAverageScores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('submissions').select('*');
      if (error) {
        console.error('Error fetching submissions:', error);
        return;
      }

      const scores = {};

      data.forEach((submission) => {
        if (!Array.isArray(submission.assignment)) return;
        submission.assignment.forEach(({ proposal_id, title, bucket }) => {
          if (!scores[proposal_id]) {
            scores[proposal_id] = { id: proposal_id, title, total: 0, count: 0 };
          }
          const weight = bucketWeights[bucket] || 0;
          scores[proposal_id].total += weight;
          scores[proposal_id].count += 1;
        });
      });

      const result = Object.values(scores)
        .map(({ id, title, total, count }) => ({
          title,
          average: count > 0 ? (total / count).toFixed(2) : 0,
        }))
        .sort((a, b) => b.average - a.average);

      setAverageScores(result);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Average Proposal Favorability</h2>
      <div style={{ height: `${Math.max(averageScores.length, 5) * 30}px` }}>
        <ResponsiveBar
          data={averageScores}
          keys={['average']}
          indexBy="title"
          margin={{ top: 30, right: 20, bottom: 150, left: 80 }}
          padding={0.3}
          layout="vertical"
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'set2' }}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          axisBottom={{
            tickRotation: -45,
            legend: 'Proposals',
            legendPosition: 'middle',
            legendOffset: 120,
          }}
          axisLeft={{
            tickValues: [1, 2, 3, 4, 5],
            legend: 'Avg Favorability',
            legendPosition: 'middle',
            legendOffset: -50,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          enableLabel={false}
        />
      </div>
    </div>
  );
}