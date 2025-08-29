# Chart.js Installation Guide

To use the new admin dashboard charts, you need to install the required dependencies.

## Install Dependencies

Run this command in your frontend directory:

```bash
cd frontend
npm install chart.js react-chartjs-2
```

## What's New

The admin dashboard now includes:

1. **Enhanced Metrics Display**: Beautiful metric cards with icons and hover effects
2. **Line Charts**: Showing activity over the last 30 days for:
   - Posts created
   - Reports created  
   - New users registered
3. **Combined Chart**: All activities in one view
4. **Bar Chart**: Monthly comparison of all activities
5. **Responsive Design**: Works on all screen sizes

## Features

- **Real-time Data**: Charts show actual data from your database
- **Interactive**: Hover over charts to see detailed information
- **Professional Look**: Clean, modern design that matches your app
- **Performance**: Optimized queries with proper date filtering

## Backend Changes

The dashboard now fetches data from a new endpoint:
- `/api/admin/chart-data` - Provides time-series data for charts

## Usage

After installation, the charts will automatically load when you visit the admin dashboard. The data is fetched from your database and displayed in beautiful, interactive charts.
