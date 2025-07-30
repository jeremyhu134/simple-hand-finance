// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface BillEntry {
    _id: string;
    userId: string;
    date: string;
    electricity: number | null;
    gas: number | null;
    water: number | null;
    internet: number | null;
    phone: number | null;
    homeSecurity: number | null;
    cloudStorage: number | null;
    streamingServiceA: number | null;
    streamingServiceB: number | null;
    softwareSubscription: number | null;
    [key: string]: string | number | null | Date | string[];
    uploadedAt: Date;
    originalFilenames: string[];
}


export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [allBills, setAllBills] = useState<BillEntry[]>([]);
    const [filteredBills, setFilteredBills] = useState<BillEntry[]>([]);
    const [chartData, setChartData] = useState<any>(null);
    const [loadingChart, setLoadingChart] = useState<boolean>(true);
    const [errorChart, setErrorChart] = useState<string | null>(null);

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        if (status === 'loading') {
            return;
        }
        if (status === 'unauthenticated') {
            router.push('/signin');
        }
    }, [status, router]);

    useEffect(() => {
        const fetchAllBillData = async () => {
            if (status !== 'authenticated') {
                return;
            }

            setLoadingChart(true);
            setErrorChart(null);

            try {
                const res = await fetch('/api/bills');
                if (!res.ok) {
                    throw new Error(`Failed to fetch bills: ${res.statusText}`);
                }
                const bills: BillEntry[] = await res.json();
                setAllBills(bills);
                setLoadingChart(false);

                if (bills.length > 0) {
                    const sortedDates = bills.map(b => b.date).sort();
                    setStartDate(sortedDates[0]);
                    setEndDate(sortedDates[sortedDates.length - 1]);
                }
            } catch (err: any) {
                console.error('Error in fetching all bill data:', err);
                setErrorChart(err.message);
                setLoadingChart(false);
            }
        };

        fetchAllBillData();
    }, [status]);

    useEffect(() => {
        if (allBills.length === 0 && !loadingChart) {
            setChartData(null);
            return;
        }

        const applyFiltersAndPrepareChart = () => {
            let currentFilteredBills = allBills;

            // Apply date range filter
            if (startDate && endDate) {
                currentFilteredBills = allBills.filter(bill => {
                    return bill.date >= startDate && bill.date <= endDate;
                });
            } else if (startDate) {
                 currentFilteredBills = allBills.filter(bill => bill.date >= startDate);
            } else if (endDate) {
                 currentFilteredBills = allBills.filter(bill => bill.date <= endDate);
            }

            setFilteredBills(currentFilteredBills);

            if (currentFilteredBills.length === 0) {
                setChartData(null);
                return;
            }

            const allDates = [...new Set(currentFilteredBills.map(bill => bill.date))].sort();

            const discoveredCategories = new Set<string>();
            const excludedKeys = new Set(['_id', 'userId', 'date', 'uploadedAt', 'originalFilenames']);

            currentFilteredBills.forEach(bill => {
                for (const key in bill) {
                    if (Object.prototype.hasOwnProperty.call(bill, key) && !excludedKeys.has(key)) {
                        if (typeof bill[key as keyof BillEntry] === 'number' || bill[key as keyof BillEntry] === null) {
                            discoveredCategories.add(key);
                        }
                    }
                }
            });

            const categoriesToUse = Array.from(discoveredCategories).sort();

            if (categoriesToUse.length === 0 && currentFilteredBills.length === 0) {
                categoriesToUse.push('electricity', 'gas', 'water', 'internet', 'phone');
            } else if (categoriesToUse.length === 0) {
            }

            const colors = [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
                'rgb(255, 159, 64)',
                'rgb(201, 203, 207)',
                'rgb(255, 0, 0)',
                'rgb(0, 0, 255)',
                'rgb(0, 128, 0)',
                'rgb(255, 255, 0)',
                'rgb(255, 0, 255)',
                'rgb(0, 255, 255)',
                'rgb(255, 105, 180)',
                'rgb(0, 204, 0)',
                'rgb(255, 204, 204)',
                'rgb(204, 255, 204)',
                'rgb(204, 204, 255)',
                'rgb(255, 255, 204)',
                'rgb(220, 220, 220)',
                'rgb(255, 229, 204)',
                'rgb(204, 229, 255)',
                'rgb(240, 255, 240)',
                'rgb(128, 0, 0)',
                'rgb(0, 0, 128)',
                'rgb(0, 100, 0)',
                'rgb(139, 69, 19)',
                'rgb(128, 128, 0)',
                'rgb(72, 61, 139)',
                'rgb(107, 142, 35)',
                'rgb(178, 34, 34)',
                'rgb(128, 128, 128)',
                'rgb(64, 64, 64)',
                'rgb(102, 204, 255)',
                'rgb(255, 165, 0)',
                'rgb(127, 255, 0)',
                'rgb(218, 112, 214)',
                'rgb(0, 191, 255)',
                'rgb(255, 69, 0)'
            ];

            const datasets = categoriesToUse.map((category, index) => {
                const dataPoints = allDates.map(date => {
                    const billForDate = currentFilteredBills.find(b => b.date === date);
                    return billForDate ? (billForDate[category] as number | null) : null;
                });

                const borderColor = colors[index % colors.length];
                const backgroundColor = borderColor.replace('rgb', 'rgba').replace(')', ', 0.5)');

                return {
                    label: category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1'),
                    data: dataPoints,
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: false,
                    showLine: true,
                };
            });

            setChartData({
                labels: allDates,
                datasets: datasets,
            });
        };

        applyFiltersAndPrepareChart();
    }, [allBills, startDate, endDate, loadingChart]);

    if (status === 'loading' || status === 'unauthenticated') {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
                <p>{status === 'loading' ? 'Checking authentication...' : 'Redirecting to login...'}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center py-8 px-4 bg-gray-50 min-h-[calc(100vh-64px)]">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8">Your Bill Dashboard</h1>

            <div className="mb-8 p-4 bg-white rounded-lg shadow-md flex flex-wrap gap-4 items-center justify-center">
                <label htmlFor="startDate" className="font-medium text-gray-700">From:</label>
                <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <label htmlFor="endDate" className="font-medium text-gray-700">To:</label>
                <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {(startDate || endDate) && (
                    <button
                        onClick={() => { setStartDate(''); setEndDate(''); }}
                        className="ml-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {loadingChart ? (
                <p>Loading chart data...</p>
            ) : errorChart ? (
                <p className="text-red-500">Error: {errorChart}</p>
            ) : chartData && chartData.labels.length > 0 ? (
                <div className="w-full max-w-6xl bg-white p-6 rounded-lg shadow-xl" style={{ height: '600px' }}>
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Monthly Utility Expenses',
                                    font: { size: 24 }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                                label += ': ';
                                            }
                                            if (context.parsed.y !== null) {
                                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                            }
                                            return label;
                                        }
                                    }
                                }
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Billing Month',
                                        font: { size: 16 }
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Cost ($)',
                                        font: { size: 16 }
                                    },
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function(value: string | number) {
                                            return '$' + value;
                                        },
                                        font: { size: 14 }
                                    }
                                }
                            }
                        }}
                    />
                </div>
            ) : (
                <p>No bill data available to display. Upload some bills first!</p>
            )}
        </div>
    );
}