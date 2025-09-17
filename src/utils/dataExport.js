import { db } from '../db/db';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

// Export utilities
export async function exportToJson(type) {
  try {
    let data;
    switch (type) {
      case 'jobs':
        data = await db.jobs.toArray();
        break;
      case 'candidates':
        data = await db.candidates.toArray();
        break;
      case 'assessments':
        data = await db.assessments.toArray();
        break;
      case 'all':
        data = {
          jobs: await db.jobs.toArray(),
          candidates: await db.candidates.toArray(),
          assessments: await db.assessments.toArray(),
        };
        break;
      default:
        throw new Error('Invalid export type');
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `talentflow-${type}-${new Date().toISOString()}.json`);
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

export async function exportToCsv(type) {
  try {
    let data;
    switch (type) {
      case 'jobs':
        data = await db.jobs.toArray();
        break;
      case 'candidates':
        data = await db.candidates.toArray();
        break;
      default:
        throw new Error('Only jobs and candidates can be exported to CSV');
    }

    // Flatten nested objects
    const flattenedData = data.map(item => {
      const flattened = { ...item };
      if (type === 'jobs') {
        flattened.tags = item.tags?.join(',') || '';
      }
      if (type === 'candidates') {
        flattened.timeline = JSON.stringify(item.timeline || []);
      }
      return flattened;
    });

    const csv = Papa.unparse(flattenedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `talentflow-${type}-${new Date().toISOString()}.csv`);
    return true;
  } catch (error) {
    console.error('CSV export failed:', error);
    throw error;
  }
}

// Import utilities
export async function importFromJson(file, type) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate data structure
    const isValid = validateImportData(data, type);
    if (!isValid) {
      throw new Error('Invalid data structure');
    }

    // Handle import based on type
    switch (type) {
      case 'jobs':
        await db.jobs.bulkPut(data);
        break;
      case 'candidates':
        await db.candidates.bulkPut(data);
        break;
      case 'assessments':
        await db.assessments.bulkPut(data);
        break;
      case 'all':
        await db.transaction('rw', [db.jobs, db.candidates, db.assessments], async () => {
          if (data.jobs) await db.jobs.bulkPut(data.jobs);
          if (data.candidates) await db.candidates.bulkPut(data.candidates);
          if (data.assessments) await db.assessments.bulkPut(data.assessments);
        });
        break;
      default:
        throw new Error('Invalid import type');
    }

    return true;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

export async function importFromCsv(file, type) {
  try {
    const text = await file.text();
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        complete: async (results) => {
          try {
            // Transform data back to proper structure
            const transformedData = results.data.map(item => {
              const transformed = { ...item };
              if (type === 'jobs' && item.tags) {
                transformed.tags = item.tags.split(',');
              }
              if (type === 'candidates' && item.timeline) {
                transformed.timeline = JSON.parse(item.timeline);
              }
              return transformed;
            });

            // Import to database
            switch (type) {
              case 'jobs':
                await db.jobs.bulkPut(transformedData);
                break;
              case 'candidates':
                await db.candidates.bulkPut(transformedData);
                break;
              default:
                throw new Error('Only jobs and candidates can be imported from CSV');
            }
            resolve(true);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    console.error('CSV import failed:', error);
    throw error;
  }
}

function validateImportData(data, type) {
  // Add validation logic based on data type
  switch (type) {
    case 'jobs':
      return Array.isArray(data) && data.every(job => 
        job.title && typeof job.title === 'string' &&
        job.status && ['active', 'archived'].includes(job.status)
      );
    case 'candidates':
      return Array.isArray(data) && data.every(candidate => 
        candidate.name && typeof candidate.name === 'string' &&
        candidate.email && typeof candidate.email === 'string'
      );
    case 'assessments':
      return Array.isArray(data) && data.every(assessment => 
        assessment.jobId && typeof assessment.jobId === 'string' &&
        Array.isArray(assessment.questions)
      );
    case 'all':
      return data.jobs && data.candidates && data.assessments &&
        validateImportData(data.jobs, 'jobs') &&
        validateImportData(data.candidates, 'candidates') &&
        validateImportData(data.assessments, 'assessments');
    default:
      return false;
  }
}