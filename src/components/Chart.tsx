
import React, { useState } from 'react';
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ChartProps {
    value: number;
}

const ChartDonut: React.FC<ChartProps> = ({ value }) => {
    const [series] = useState<number[]>([value]);
    const [options] = useState<ApexOptions>({
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 225,
                hollow: {
                    margin: 0,
                    size: '70%',
                    background: '#8D2026',
                    image: undefined,
                    imageOffsetX: 0,
                    imageOffsetY: 0,
                    position: 'front',
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 0,
                        blur: 2,
                        opacity: 0.14
                    }
                },
                track: {
                    background: '#fff',
                    strokeWidth: '67%',
                    margin: 0,
                    dropShadow: {
                        enabled: true,
                        top: -3,
                        left: 0,
                        blur: 4,
                        opacity: 0.15
                    }
                },
                dataLabels: {
                    show: true,
                    name: {
                        offsetY: -10,
                        show: false,
                        color: '#888',
                        fontSize: '17px'
                    },
                    value: {
                      formatter: function (val: number) {
                        return val.toString();
                    },
                    
                        color: '#fff',
                        fontSize: '36px',
                        show: true,
                    }
                }
            }
        },
        fill: {
            type: 'solid',
            colors: ['#FFE500']
        },
        stroke: {
            lineCap: 'round'
        },
        labels: ['Total'],
    });

    return <Chart options={options} series={series} type="radialBar" height={200} />;
};

export default ChartDonut;
