import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

// third party
import Chart from 'react-apexcharts';

// project imports
import useConfig from 'hooks/useConfig';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

export default function TotalGrowthBarChart({ isLoading, chartData: backendChartData }) {
  const theme = useTheme();
  const { mode } = useConfig();

  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const grey500 = theme.palette.grey[500];

  const [series, setSeries] = React.useState([]);
  const [options, setOptions] = React.useState({
    chart: {
      type: 'line',
      height: 480,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: false
      }
    },
    stroke: {
      width: [0, 3],
      curve: 'smooth'
    },
    plotOptions: {
      bar: {
        columnWidth: '50%'
      }
    },
    colors: [secondary, primary],
    fill: {
      opacity: [0.85, 1],
    },
    labels: [],
    markers: {
      size: 0
    },
    xaxis: {
      type: 'category',
      labels: {
        style: {
          colors: grey500
        }
      }
    },
    yaxis: [
      {
        title: {
          text: 'Orders',
          style: { color: secondary }
        },
        labels: {
          style: { colors: secondary }
        }
      },
      {
        opposite: true,
        title: {
          text: 'Revenue (₹)',
          style: { color: primary }
        },
        labels: {
          style: { colors: primary },
          formatter: (val) => `₹${val?.toLocaleString('en-IN')}`
        }
      }
    ],
    tooltip: {
      theme: mode,
      shared: true,
      intersect: false,
      y: {
        formatter: function (y) {
          if (typeof y !== 'undefined') {
            return y.toLocaleString('en-IN');
          }
          return y;
        }
      }
    },
    legend: {
      labels: {
        colors: grey500
      },
      position: 'top',
      horizontalAlign: 'right'
    },
    grid: {
      borderColor: theme.palette.divider
    }
  });

  React.useEffect(() => {
    if (backendChartData && backendChartData.length > 0) {
      const categories = backendChartData.map((d) => d._id);
      const revenue = backendChartData.map((d) => d.revenue);
      const orders = backendChartData.map((d) => d.orders);

      setSeries([
        {
          name: 'Orders',
          type: 'column',
          data: orders
        },
        {
          name: 'Revenue',
          type: 'line',
          data: revenue
        }
      ]);

      setOptions((prev) => ({
        ...prev,
        labels: categories,
        tooltip: { ...prev.tooltip, theme: mode }
      }));
    }
  }, [backendChartData, mode]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Grid container spacing={gridSpacing}>
            <Grid size={12}>
              <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Grid>
                  <Grid container direction="column" spacing={1}>
                    <Grid>
                      <Typography variant="subtitle2">Performance Metrics</Typography>
                    </Grid>
                    <Grid>
                      <Typography variant="h3">Revenue & Orders Trend</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={12}>
              <Chart options={options} series={series} type="line" height={480} />
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
}

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool,
  chartData: PropTypes.array
};
