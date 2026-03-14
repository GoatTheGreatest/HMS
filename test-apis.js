const DOCTOR_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YjQwYjYwZDg1NDc1OTJjODlmZTdlOCIsInJvbGUiOiJET0NUT1IiLCJlbWFpbCI6ImRvY3RvckBnbWFpbC5jb20iLCJpYXQiOjE3NzM0OTc4NzMsImV4cCI6MTc3MzU4NDI3M30.2qUgtsIQnY3gEJEdq12cxvWQUS-tTXZTHoYo-g0y954';
const PATIENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YjQxNjA2ZDg1NDc1OTJjODlmZTdmMiIsInJvbGUiOiJQQVRJRU5UIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNzczNDk3ODczLCJleHAiOjE3NzM1ODQyNzN9.JvMMedA_UKtrE3Y2d86b1rPale975jwRlNHF0-vqSyc';
const PHARMA_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YjQ0YjYxMmEyMzIxNTFhNGY0MzllYiIsInJvbGUiOiJQSEFSTUFDRVVUSUNBTCIsImVtYWlsIjoicGhhcm1hQGhtcy5jb20iLCJpYXQiOjE3NzM0OTc4NzMsImV4cCI6MTc3MzU4NDI3M30.uENi2YzQiBv9VEU0c_BXwNw7tbs-eSMy7kT1RQM6Y40';

const PATIENT_ID = '69b41606d8547592c89fe7f2';
const DOCTOR_ID = '69b40b60d8547592c89fe7e8';

async function makeRequest(path, method, token, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token}`
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`http://localhost:3000${path}`, options);
  const text = await res.text();
  return { status: res.status, body: text };
}

async function run() {
  console.log('--- Testing Doctor Admit Flow ---');
  const res1 = await makeRequest(`/api/patients/${PATIENT_ID}/status`, 'PATCH', DOCTOR_TOKEN, { admissionStatus: 'ADMITTED' });
  console.log('Admit Response:', res1.status, res1.body);

  console.log('\n--- Testing Patient Message Send ---');
  const res2 = await makeRequest('/api/messages', 'POST', PATIENT_TOKEN, { receiverId: DOCTOR_ID, subject: 'Test', content: 'Hello doctor' });
  console.log('Message POST Response:', res2.status, res2.body);

  console.log('\n--- Testing Pharma Inventory POST ---');
  const res3 = await makeRequest('/api/medicines', 'POST', PHARMA_TOKEN, { name: 'Test Med', category: 'General', stock: 100, expiryDate: '2027-01-01', price: 10 });
  console.log('Inventory POST Response:', res3.status, res3.body);
  
  if (res3.status === 201) {
    const medId = JSON.parse(res3.body).medicine._id;
    console.log('\n--- Testing Pharma Inventory DELETE ---');
    const res4 = await makeRequest(`/api/medicines/${medId}`, 'DELETE', PHARMA_TOKEN);
    console.log('Inventory DELETE Response:', res4.status, res4.body);
  }
}

run().catch(console.error);
