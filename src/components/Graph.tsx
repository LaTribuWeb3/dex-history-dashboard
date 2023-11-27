/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography } from '@mui/material';
import { AxisConfig, LineChart, LineSeriesType } from '@mui/x-charts';

export interface GraphProperies {
  title: string;
  xAxisLabel: string;
  xAxisData: number[];
  leftYAxis: {
    min?: number;
    max?: number;
    formatter: ((value: any) => string) | undefined;
  };
  rightYAxis?: {
    min?: number;
    max?: number;
    formatter: ((value: any) => string) | undefined;
  };
  leftAxisSeries: {
    label: string;
    data: number[];
    formatter: ((value: any) => string) | undefined;
  }[];
  rightAxisSeries?: {
    label: string;
    data: number[];
    formatter: ((value: any) => string) | undefined;
  }[];
}

export default function Graph(props: GraphProperies) {
  const yAxisConfigs: AxisConfig[] = [
    {
      id: 'leftAxisId',
      min: props.leftYAxis.min,
      max: props.leftYAxis.max,
      valueFormatter: props.leftYAxis.formatter
    }
  ];

  if (props.rightYAxis) {
    yAxisConfigs.push({
      id: 'rightAxisId',
      min: props.rightYAxis.min,
      max: props.rightYAxis.max,
      valueFormatter: props.rightYAxis.formatter
    });
  }

  const series: LineSeriesType[] = [];

  for (const serie of props.leftAxisSeries) {
    series.push({
      type: 'line',
      label: serie.label,
      data: serie.data,
      valueFormatter: serie.formatter,
      showMark: false,
      yAxisKey: 'leftAxisId'
    });
  }

  if (props.rightAxisSeries) {
    for (const serie of props.rightAxisSeries) {
      series.push({
        type: 'line',
        label: serie.label,
        data: serie.data,
        valueFormatter: serie.formatter,
        yAxisKey: 'rightAxisId',
        showMark: false
      });
    }
  }

  return (
    <Box>
      <Typography textAlign={'center'} mt={2}>
        {props.title}
      </Typography>
      <LineChart
        legend={{
          direction: 'column',
          position: {
            vertical: 'top',
            horizontal: 'middle'
          }
        }}
        sx={{
          marginTop: '-50px',
          '--ChartsLegend-rootOffsetX': '0px',
          '--ChartsLegend-rootOffsetY': '0px',
          '--ChartsLegend-rootSpacing': '3px'
        }}
        xAxis={[
          {
            label: props.xAxisLabel,
            data: props.xAxisData,
            tickMinStep: 250000,
            min: props.xAxisData[0],
            max: props.xAxisData.at(-1)
          }
        ]}
        yAxis={yAxisConfigs}
        rightAxis={props.rightYAxis ? 'rightAxisId' : null}
        series={series}
        height={450}
      />
    </Box>
  );
}