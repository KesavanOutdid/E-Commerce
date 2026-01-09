// material-ui
import { useTheme } from '@mui/material/styles';

// project imports

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

export default function Logo() {
  const theme = useTheme();

  return (
    <svg width="200" height="50" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shopping Bag Icon */}
      <path
        d="M9 10L6 15V33C6 34.1046 6.89543 35 8 35H24C25.1046 35 26 34.1046 26 33V15L23 10H9Z"
        stroke={theme.palette.secondary.main}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 15H26"
        stroke={theme.palette.secondary.main}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 20C21 22.7614 18.7614 25 16 25C13.2386 25 11 22.7614 11 20"
        stroke={theme.palette.secondary.main}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Text Logo - Line 1 */}
      <text
        x="35"
        y="25"
        fill={theme.palette.grey[900]}
        style={{
          fontSize: '20px',
          fontWeight: '700',
          fontFamily: "'Inter', 'Poppins', sans-serif"
        }}
      >
        ShopFlow
      </text>
      {/* Text Logo - Line 2 */}
      <text
        x="35"
        y="42"
        fill={theme.palette.grey[600]}
        style={{
          fontSize: '13px',
          fontWeight: '500',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          fontFamily: "'Inter', 'Poppins', sans-serif"
        }}
      >
        Administration
      </text>
    </svg>
  );
}
