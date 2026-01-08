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
    <svg width="150" height="35" viewBox="0 0 150 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shopping Bag Icon */}
      <path
        d="M9 4L6 9V27C6 28.1046 6.89543 29 8 29H24C25.1046 29 26 28.1046 26 27V9L23 4H9Z"
        stroke={theme.palette.secondary.main}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 9H26"
        stroke={theme.palette.secondary.main}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 14C21 16.7614 18.7614 19 16 19C13.2386 19 11 16.7614 11 14"
        stroke={theme.palette.secondary.main}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Text Logo */}
      <text
        x="35"
        y="24"
        fill={theme.palette.grey[900]}
        style={{
          fontSize: '20px',
          fontWeight: '700',
          fontFamily: "'Inter', 'Poppins', sans-serif"
        }}
      >
        ShopFlow
      </text>
    </svg>
  );
}
