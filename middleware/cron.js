import cron from 'node-cron';

export const setCampaign = (time, cb) => {
  const job = cron.schedule(
    time,
    async () => {
      try {
        await cb();
      } catch (error) {
        console.error('Error running sale campaign:', error);
      }
    },
    {
      timezone: 'Asia/Ho_Chi_Minh',
    }
  );
  job.on('scheduled', (time) => {
    console.log(`Campaign scheduled at: ${time}`);
  });

  job.on('run', () => {
    console.log('Running sale campaign...');
  });

  job.on('completed', () => {
    console.log('Sale campaign completed.');
  });

  job.on('stopped', () => {
    console.log('Sale campaign stopped.');
  });

  job.on('error', (error) => {
    console.error('Error with sale campaign job:', error);
  });
};
