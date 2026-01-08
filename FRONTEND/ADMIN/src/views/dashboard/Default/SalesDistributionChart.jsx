import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { CardContent, Grid, Typography } from '@mui/material';

// third party
import Chart from 'react-apexcharts';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';

// ==============================|| DASHBOARD - SALES DISTRIBUTION CHART ||============================== //

const SalesDistributionChart = ({ isLoading, userStats }) => {
  const theme = useTheme();

  const chartOptions = {
    chart: {
      type: 'donut',
      height: 350
    },
    labels: userStats?.roleDistribution?.map((r) => r.roleName) || [],
    legend: {
      show: true,
      position: 'bottom',
      fontFamily: 'inherit',
      labels: {
        colors: theme.palette.grey[500]
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main
    ],
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Users',
              formatter: () => userStats?.roleDistribution?.reduce((acc, curr) => acc + curr.count, 0) || 0
            }
          }
        }
      }
    }
  };

  const series = userStats?.roleDistribution?.map((r) => r.count) || [];

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h4">User Distribution</Typography>
              </Grid>
              <Grid item xs={12}>
                <Chart options={chartOptions} series={series} type="donut" height={350} />
              </Grid>
            </Grid>
          </CardContent>
        </MainCard>
      )}
    </>
  );
};

SalesDistributionChart.propTypes = {
  isLoading: PropTypes.bool,
  userStats: PropTypes.object
};

export default SalesDistributionChart;
