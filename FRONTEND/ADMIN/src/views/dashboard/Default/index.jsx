import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Chart from 'react-apexcharts';

import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useDashboard } from '../../../hooks/dashboard/useDashboard';

const StatCard = ({ icon: Icon, label, value, loading, color = '#667eea' }) => {
  return (
    <Card
      sx={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: 'none',
        transition: 'all 0.3s ease',
        height: '100%',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '12px',
              backgroundColor: color,
              color: '#fff',
              flexShrink: 0
            }}
          >
            <Icon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#999',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {label}
            </Typography>
            {loading ? (
              <Skeleton width="60%" height={24} />
            ) : (
              <Typography
                sx={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#212121',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {typeof value === 'number' ? value.toLocaleString('en-US') : value}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const ChartCard = ({ title, children, loading }) => (
  <Card
    sx={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      height: '100%',
      '&:hover': {
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
      }
    }}
  >
    <CardContent sx={{ p: 3 }}>
      {title && (
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#212121',
            marginBottom: '20px'
          }}
        >
          {title}
        </Typography>
      )}
      {loading ? (
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Skeleton variant="rectangular" width="100%" height={350} sx={{ borderRadius: '12px' }} />
        </Box>
      ) : (
        children
      )}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { stats, loading, error, filter, handleFilterChange, refreshStats } = useDashboard();

  const revenueChartData = useMemo(() => {
    if (!stats?.charts?.revenueChart) return { options: {}, series: [] };

    return {
      options: {
        chart: {
          id: 'revenue-chart',
          toolbar: { show: false },
          animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        xaxis: {
          categories: stats.charts.revenueChart.map(d => d._id),
          labels: {
            style: { fontSize: '12px', fontWeight: 500, colors: '#757575' }
          }
        },
        plotOptions: {
          bar: { columnWidth: '55%', borderRadius: 8 }
        },
        colors: ['#667eea'],
        dataLabels: { enabled: false },
        grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
        tooltip: {
          theme: 'light',
          y: {
            formatter: val => `₹${val.toLocaleString('en-IN')}`
          }
        }
      },
      series: [
        {
          name: 'Revenue',
          data: stats.charts.revenueChart.map(d => d.revenue),
          type: 'column'
        }
      ]
    };
  }, [stats?.charts?.revenueChart]);

  const ordersChartData = useMemo(() => {
    if (!stats?.charts?.revenueChart) return { options: {}, series: [] };

    return {
      options: {
        chart: {
          id: 'orders-chart',
          toolbar: { show: false },
          animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        xaxis: {
          categories: stats.charts.revenueChart.map(d => d._id),
          labels: {
            style: { fontSize: '12px', fontWeight: 500, colors: '#757575' }
          }
        },
        colors: ['#f093fb'],
        dataLabels: { enabled: false },
        grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
        tooltip: {
          theme: 'light',
          y: {
            formatter: val => `${val} orders`
          }
        }
      },
      series: [
        {
          name: 'Orders',
          data: stats.charts.revenueChart.map(d => d.orders),
          type: 'area'
        }
      ]
    };
  }, [stats?.charts?.revenueChart]);

  const usersChartData = useMemo(() => {
    if (!stats?.userStats?.roleDistribution || stats.userStats.roleDistribution.length === 0) {
      return { options: {}, series: [] };
    }

    const colors = ['#667eea', '#f093fb', '#fca311', '#06ffa5', '#ff6b6b', '#4ecdc4'];
    
    return {
      options: {
        chart: { type: 'donut', toolbar: { show: false } },
        labels: stats.userStats.roleDistribution.map(r => r.roleName || 'Unknown'),
        colors: colors.slice(0, stats.userStats.roleDistribution.length),
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val.toFixed(1)}%`
        },
        legend: {
          position: 'bottom',
          fontSize: '12px'
        },
        tooltip: { y: { formatter: val => `${val} users` } }
      },
      series: stats.userStats.roleDistribution.map(r => r.count)
    };
  }, [stats?.userStats?.roleDistribution]);

  const topProductsChartData = useMemo(() => {
    if (!stats?.topPerformers?.bestProducts) return { options: {}, series: [] };

    const top5 = stats.topPerformers.bestProducts.slice(0, 5);

    return {
      options: {
        chart: { type: 'bar', toolbar: { show: false } },
        xaxis: {
          categories: top5.map(p => p.productName?.substring(0, 15) || 'Unknown'),
          labels: { style: { fontSize: '11px' } }
        },
        colors: ['#667eea'],
        plotOptions: { bar: { columnWidth: '50%', borderRadius: 6 } },
        dataLabels: { enabled: false },
        grid: { borderColor: '#f1f1f1' },
        tooltip: {
          y: { formatter: val => `₹${val.toLocaleString('en-IN')}` }
        }
      },
      series: [
        {
          name: 'Sales',
          data: top5.map(p => p.totalSales)
        }
      ]
    };
  }, [stats?.topPerformers?.bestProducts]);

  const topSellersChartData = useMemo(() => {
    if (!stats?.topPerformers?.bestSellers) return { options: {}, series: [] };

    const top5 = stats.topPerformers.bestSellers.slice(0, 5);

    return {
      options: {
        chart: { type: 'bar', toolbar: { show: false } },
        xaxis: {
          categories: top5.map(s => s.sellerName?.substring(0, 15) || 'Unknown'),
          labels: { style: { fontSize: '11px' } }
        },
        colors: ['#f093fb'],
        plotOptions: { bar: { columnWidth: '50%', borderRadius: 6 } },
        dataLabels: { enabled: false },
        grid: { borderColor: '#f1f1f1' },
        tooltip: {
          y: { formatter: val => `₹${val.toLocaleString('en-IN')}` }
        }
      },
      series: [
        {
          name: 'Total Sales',
          data: top5.map(s => s.totalSales)
        }
      ]
    };
  }, [stats?.topPerformers?.bestSellers]);

  const orderStatusChartData = useMemo(() => {
    if (!stats?.summary?.orderStatusBreakdown) return { options: {}, series: [] };

    const statuses = Object.keys(stats.summary.orderStatusBreakdown);
    const counts = Object.values(stats.summary.orderStatusBreakdown);

    return {
      options: {
        chart: { type: 'bar', toolbar: { show: false } },
        xaxis: {
          categories: statuses.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
          labels: { style: { fontSize: '12px' } }
        },
        colors: ['#06ffa5'],
        plotOptions: { bar: { columnWidth: '50%', borderRadius: 6 } },
        dataLabels: { enabled: false },
        grid: { borderColor: '#f1f1f1' },
        tooltip: { y: { formatter: val => `${val} orders` } }
      },
      series: [
        {
          name: 'Orders',
          data: counts
        }
      ]
    };
  }, [stats?.summary?.orderStatusBreakdown]);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#212121', mb: 0.5 }}>
                Dashboard
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#757575' }}>
                Real-time Analytics & Performance Metrics
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>View</InputLabel>
                <Select
                  value={filter}
                  label="View"
                  onChange={(e) => handleFilterChange(e.target.value)}
                  disabled={loading}
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="thisWeek">This Week</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="thisYear">This Year</MenuItem>
                </Select>
              </FormControl>
              <IconButton
                onClick={refreshStats}
                disabled={loading}
                sx={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  color: 'white',
                  width: 42,
                  height: 42,
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.5)',
                    transform: 'translateY(-2px)'
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: '24px'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Grid>

        {error && (
          <Grid size={12}>
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {error}
            </Alert>
          </Grid>
        )}

        <Grid size={12}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StatCard
                    icon={TrendingUpOutlinedIcon}
                    label="Total Revenue"
                    value={
                      stats?.summary?.totalRevenue
                        ? `₹${(stats.summary.totalRevenue / 100000).toFixed(1)}L`
                        : '₹0'
                    }
                    loading={loading}
                    color="#667eea"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StatCard
                    icon={ShoppingBagOutlinedIcon}
                    label="Total Orders"
                    value={stats?.summary?.totalOrders || 0}
                    loading={loading}
                    color="#f093fb"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StatCard
                    icon={CheckCircleOutlinedIcon}
                    label="Successful Orders"
                    value={stats?.summary?.successfulOrders || 0}
                    loading={loading}
                    color="#06ffa5"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StatCard
                    icon={PeopleAltOutlinedIcon}
                    label="Total Users"
                    value={stats?.summary?.totalUsers || 0}
                    loading={loading}
                    color="#fca311"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StatCard
                    icon={LocalOfferOutlinedIcon}
                    label="Total Products"
                    value={stats?.summary?.totalProducts || 0}
                    loading={loading}
                    color="#06ffa5"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StatCard
                    icon={AssignmentOutlinedIcon}
                    label="Total Roles"
                    value={stats?.summary?.totalRoles || 0}
                    loading={loading}
                    color="#fca311"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card
                sx={{
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#212121',
                      marginBottom: '20px'
                    }}
                  >
                    User Distribution by Role
                  </Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} variant="rectangular" height={45} sx={{ borderRadius: '8px' }} />
                      ))}
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {stats?.userStats?.roleDistribution?.map((role, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#212121' }}>
                            {role.roleName}
                          </Typography>
                          <Typography sx={{ fontSize: '14px', fontWeight: '700', color: '#667eea' }}>
                            {role.count}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={12}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <ChartCard title="Revenue Trend" loading={loading}>
                <Chart
                  options={revenueChartData.options}
                  series={revenueChartData.series}
                  type="bar"
                  height={300}
                />
              </ChartCard>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <ChartCard title="Orders Trend" loading={loading}>
                <Chart
                  options={ordersChartData.options}
                  series={ordersChartData.series}
                  type="area"
                  height={300}
                />
              </ChartCard>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={12}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <ChartCard title="Top 5 Sellers by Sales" loading={loading}>
                <Chart
                  options={topSellersChartData.options}
                  series={topSellersChartData.series}
                  type="bar"
                  height={350}
                />
              </ChartCard>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <ChartCard title="Order Status Distribution" loading={loading}>
                <Chart
                  options={orderStatusChartData.options}
                  series={orderStatusChartData.series}
                  type="bar"
                  height={350}
                />
              </ChartCard>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={12}>
          <Grid container spacing={3}>
            {/* Top Products - 70% */}
            <Grid size={{ xs: 12, lg: 8.4 }}>
              <Card
                sx={{
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#212121',
                      marginBottom: '20px'
                    }}
                  >
                    Top 5 Products
                  </Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} variant="rectangular" height={50} sx={{ borderRadius: '8px' }} />
                      ))}
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ background: 'linear-gradient(135deg, #eeeff4ff 0%, #e5e3e3ff 100%)' }}>
                            <TableCell sx={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>
                              Product Name
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>
                              Total Sales
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>
                              Quantity Sold
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats?.topPerformers?.bestProducts?.slice(0, 5).map((product, idx) => (
                            <TableRow
                              key={idx}
                              sx={{
                                '&:hover': { backgroundColor: '#f0f4ff' },
                                borderBottom: '1px solid #f1f1f1'
                              }}
                            >
                              <TableCell sx={{ fontSize: '13px', color: '#212121', fontWeight: '500' }}>
                                {product.productName || 'Unknown'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '13px', fontWeight: '700', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                ₹{(product.totalSales / 1000).toFixed(1)}K
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '13px', color: '#757575' }}>
                                {product.quantity} units
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Top Categories - 30% */}
            <Grid size={{ xs: 12, lg: 3.6 }}>
              <Card
                sx={{
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#212121',
                      marginBottom: '20px'
                    }}
                  >
                    Top 5 Categories
                  </Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: '8px' }} />
                      ))}
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      {stats?.topPerformers?.bestCategories?.slice(0, 5).map((cat, idx) => {
                        const colors = ['#667eea', '#f093fb', '#06ffa5', '#fca311', '#ff6b6b'];
                        const color = colors[idx % colors.length];
                        return (
                          <Box
                            key={idx}
                            sx={{
                              padding: '12px 14px',
                              borderRadius: '10px',
                              background: color,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              color: 'white',
                              boxShadow: `0 4px 12px ${color}40`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(4px)',
                                boxShadow: `0 6px 18px ${color}60`
                              }
                            }}
                          >
                            <Box>
                              <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                                {cat.categoryName || 'Unknown'}
                              </Typography>
                              <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                                {cat.count} orders
                              </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                              ₹{(cat.totalSales / 1000).toFixed(1)}K
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
