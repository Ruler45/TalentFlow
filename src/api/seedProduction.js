export function seedProductionData(server) {
  // Create jobs
  const jobs = server.createList('job', 10);

  // Create candidates for each job
  jobs.forEach(job => {
    server.createList('candidate', 3, { jobId: job.id });
  });

  // Create some assessments
  jobs.forEach(job => {
    server.schema.assessments.create({
      jobId: job.id,
      questions: [
        {
          id: '1',
          text: 'What is your experience with React?',
          type: 'text',
          validation: { required: true }
        },
        {
          id: '2',
          text: 'Years of experience',
          type: 'single',
          options: ['0-2', '3-5', '5+'],
          validation: { required: true }
        }
      ],
      structure: [
        {
          id: '1',
          text: 'Technical Skills',
          type: 'text',
          validation: { required: true }
        },
        {
          id: '2',
          text: 'Experience Level',
          type: 'single',
          options: ['Junior', 'Mid-Level', 'Senior'],
          validation: { required: true }
        }
      ],
      responses: {}
    });
  });
}