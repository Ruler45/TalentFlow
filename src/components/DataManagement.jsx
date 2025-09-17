import React, { useState } from 'react';
import {
  exportToJson,
  exportToCsv,
  importFromJson,
  importFromCsv
} from '../utils/dataExport';
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Alert,
  Snackbar,
  Paper,
  Grid,
  Divider
} from '@mui/material';

const DataManagement = () => {
  const [exportType, setExportType] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [importType, setImportType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleExport = async () => {
    try {
      if (exportFormat === 'json') {
        await exportToJson(exportType);
      } else {
        await exportToCsv(exportType);
      }
      setSnackbar({
        open: true,
        message: 'Export completed successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Export failed: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileFormat = file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'json';
      
      if (fileFormat === 'json') {
        await importFromJson(file, importType);
      } else {
        await importFromCsv(file, importType);
      }

      setSnackbar({
        open: true,
        message: 'Import completed successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Import failed: ${error.message}`,
        severity: 'error'
      });
    }
    // Reset the file input
    event.target.value = '';
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Data Management
      </Typography>
      
      <Grid container spacing={3}>
        {/* Export Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Export Data
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <FormControl fullWidth>
              <InputLabel>Export Type</InputLabel>
              <Select
                value={exportType}
                label="Export Type"
                onChange={(e) => setExportType(e.target.value)}
              >
                <MenuItem value="jobs">Jobs</MenuItem>
                <MenuItem value="candidates">Candidates</MenuItem>
                <MenuItem value="assessments">Assessments</MenuItem>
                <MenuItem value="all">All Data</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={exportFormat}
                label="Format"
                onChange={(e) => setExportFormat(e.target.value)}
                disabled={exportType === 'assessments' || exportType === 'all'}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleExport}
              disabled={!exportType}
              fullWidth
            >
              Export
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Import Data
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <FormControl fullWidth>
              <InputLabel>Import Type</InputLabel>
              <Select
                value={importType}
                label="Import Type"
                onChange={(e) => setImportType(e.target.value)}
              >
                <MenuItem value="jobs">Jobs</MenuItem>
                <MenuItem value="candidates">Candidates</MenuItem>
                <MenuItem value="assessments">Assessments</MenuItem>
                <MenuItem value="all">All Data</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              component="label"
              disabled={!importType}
              fullWidth
            >
              Upload File
              <input
                type="file"
                hidden
                accept=".json,.csv"
                onChange={handleImport}
              />
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default DataManagement;