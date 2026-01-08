import PropTypes from 'prop-types';
import { forwardRef, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Card,
  Grid,
  InputAdornment,
  OutlinedInput,
  Popper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  IconButton
} from '@mui/material';

// third party
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';

// project imports
import Transitions from 'ui-component/extended/Transitions';
import axios from 'utils/axiosInstance';
import { API_ENDPOINTS } from 'config/apiConfig';

// assets
import { IconAdjustmentsHorizontal, IconSearch, IconX, IconUser, IconPackage, IconShoppingCart, IconCategory, IconShieldLock } from '@tabler/icons-react';

const ResultsWrapper = styled(Paper)(({ theme }) => ({
  zIndex: 1500,
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: theme.spacing(1),
  maxHeight: 400,
  overflowY: 'auto',
  boxShadow: theme.shadows[8],
  borderRadius: theme.shape.borderRadius
}));

function HeaderAvatarComponent({ children, ...others }, ref) {
  const theme = useTheme();

  return (
    <Avatar
      ref={ref}
      variant="rounded"
      sx={{
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        bgcolor: 'secondary.light',
        color: 'secondary.dark',
        '&:hover': {
          bgcolor: 'secondary.dark',
          color: 'secondary.light'
        }
      }}
      {...others}
    >
      {children}
    </Avatar>
  );
}

const HeaderAvatar = forwardRef(HeaderAvatarComponent);

// ==============================|| SEARCH INPUT - MOBILE||============================== //

function MobileSearch({ value, setValue, popupState }) {
  const theme = useTheme();

  return (
    <OutlinedInput
      id="input-search-header"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search"
      startAdornment={
        <InputAdornment position="start">
          <IconSearch stroke={1.5} size="16px" />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment position="end">
          <HeaderAvatar>
            <IconAdjustmentsHorizontal stroke={1.5} size="20px" />
          </HeaderAvatar>
          <Box sx={{ ml: 2 }}>
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                bgcolor: 'orange.light',
                color: 'orange.dark',
                '&:hover': {
                  bgcolor: 'orange.dark',
                  color: 'orange.light'
                }
              }}
              {...bindToggle(popupState)}
            >
              <IconX stroke={1.5} size="20px" />
            </Avatar>
          </Box>
        </InputAdornment>
      }
      aria-describedby="search-helper-text"
      inputProps={{ 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } }}
      sx={{ width: '100%', ml: 0.5, px: 2, bgcolor: 'background.paper' }}
    />
  );
}

// ==============================|| SEARCH INPUT ||============================== //

export default function SearchSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (value.trim().length >= 2) {
        setLoading(true);
        setShowResults(true);
        try {
          const response = await axios.get(`${API_ENDPOINTS.SEARCH.GLOBAL}?query=${value}`);
          if (response.data.success) {
            setResults(response.data.data);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults(null);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [value]);

  const handleItemClick = (link) => {
    navigate(link);
    setShowResults(false);
    setValue('');
  };

  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'user': return <IconUser size={18} />;
      case 'product': return <IconPackage size={18} />;
      case 'order': return <IconShoppingCart size={18} />;
      case 'category':
      case 'subcategory': return <IconCategory size={18} />;
      case 'role': return <IconShieldLock size={18} />;
      default: return <IconSearch size={18} />;
    }
  };

  const renderResults = () => {
    if (loading) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (!results || Object.keys(results).every(key => results[key].data.length === 0)) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">No results found</Typography>
        </Box>
      );
    }

    return (
      <List sx={{ p: 0 }}>
        {Object.keys(results).map((module) => {
          const moduleData = results[module];
          if (moduleData.data.length === 0) return null;

          return (
            <Box key={module}>
              <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                  {module}
                </Typography>
                <Chip label={moduleData.total} size="small" sx={{ height: 16, fontSize: '0.65rem' }} />
              </Box>
              {moduleData.data.map((item, index) => (
                <ListItemButton key={`${module}-${index}`} onClick={() => handleItemClick(item.link)}>
                  <Avatar sx={{ mr: 2, width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.main' }}>
                    {getIcon(item.type)}
                  </Avatar>
                  <ListItemText
                    primary={item.title}
                    secondary={item.subtitle}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              ))}
              <Divider />
            </Box>
          );
        })}
      </List>
    );
  };

  return (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <PopupState variant="popper" popupId="demo-popup-popper">
          {(popupState) => (
            <>
              <Box sx={{ ml: 2 }}>
                <HeaderAvatar {...bindToggle(popupState)}>
                  <IconSearch stroke={1.5} size="19.2px" />
                </HeaderAvatar>
              </Box>
              <Popper
                {...bindPopper(popupState)}
                transition
                sx={{ zIndex: 1100, width: '99%', top: '-55px !important', px: { xs: 1.25, sm: 1.5 } }}
              >
                {({ TransitionProps }) => (
                  <>
                    <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                      <Card sx={{ bgcolor: 'background.default', border: 0, boxShadow: 'none' }}>
                        <Box sx={{ p: 2 }}>
                          <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Grid item xs={12}>
                               <Box sx={{ position: 'relative' }}>
                                <OutlinedInput
                                    fullWidth
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="Search everything..."
                                    startAdornment={<InputAdornment position="start"><IconSearch size={16} /></InputAdornment>}
                                    size="small"
                                />
                                {showResults && <ResultsWrapper>{renderResults()}</ResultsWrapper>}
                               </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Card>
                    </Transitions>
                  </>
                )}
              </Popper>
            </>
          )}
        </PopupState>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }} ref={searchRef}>
        <OutlinedInput
          id="input-search-header"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Super Search (Users, Products, Orders...)"
          startAdornment={
            <InputAdornment position="start">
              <IconSearch stroke={1.5} size="16px" />
            </InputAdornment>
          }
          endAdornment={
            value && (
                <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setValue('')}>
                        <IconX size={16} />
                    </IconButton>
                </InputAdornment>
            )
          }
          aria-describedby="search-helper-text"
          inputProps={{ 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } }}
          sx={{ width: { md: 250, lg: 434 }, ml: 2, px: 2 }}
        />
        {showResults && (
            <ResultsWrapper>
                {renderResults()}
            </ResultsWrapper>
        )}
      </Box>
    </>
  );
}

HeaderAvatarComponent.propTypes = { children: PropTypes.node, others: PropTypes.any };

MobileSearch.propTypes = { value: PropTypes.string, setValue: PropTypes.func, popupState: PropTypes.any };
