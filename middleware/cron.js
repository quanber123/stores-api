import cron from 'node-cron';

export const setCampaign = async (time, cb) => {
  const job = cron.schedule(
    time,
    async () => {
      try {
        await cb();
      } catch (error) {
        console.error('Error running campaign:', error);
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
    console.log('Running campaign...');
  });

  job.on('completed', () => {
    console.log('Campaign completed.');
  });

  job.on('stopped', () => {
    console.log('Campaign stopped.');
  });

  job.on('error', (error) => {
    console.error('Error with sale campaign job:', error);
  });
};
