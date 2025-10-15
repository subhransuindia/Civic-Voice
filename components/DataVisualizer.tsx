import React from 'react';
import type { ChartDataPoint } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface DataVisualizerProps {
    data: ChartDataPoint[];
}

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500 py-8">No data available for visualization.</p>;
    }
    
    return (
        <div className="w-full h-80 bg-gray-50 p-4 rounded-lg border border-gray-200">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5, right: 20, left: -10, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '0.5rem'
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: "14px" }} />
                    <Bar dataKey="If Passed" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="If Not Passed" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}