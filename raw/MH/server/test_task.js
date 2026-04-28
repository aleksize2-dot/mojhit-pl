const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config({ path: '.env' });

async function checkTask(taskId) {
  const KIE_API_KEY = process.env.KIE_API_KEY;
  const KIE_API_BASE_URL = process.env.KIE_API_BASE_URL || 'https://api.kie.ai';

  const paths = [
    `/api/v1/jobs/query?taskId=${taskId}`,
    `/api/v1/jobs/record-info?taskId=${taskId}`,
    `/api/v1/generate/record-info?taskId=${taskId}`,
    `/api/v1/tasks/${taskId}`,
    `/api/v1/jobs/${taskId}`
  ];

  for (const p of paths) {
    const res = await fetch(`${KIE_API_BASE_URL}${p}`, {
      headers: { 'Authorization': `Bearer ${KIE_API_KEY}` }
    });
    console.log(p, res.status);
    if (res.ok) {
      const data = await res.text();
      console.log('Result:', data);
    }
  }
}
checkTask('e9aed8fee5f7352bf07d9de9bab84c07');
