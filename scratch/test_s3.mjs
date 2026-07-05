import fetch from 'node-fetch'; // wait, we can just use native fetch in node 18+

async function testS3() {
  const url = 'https://igloo-mock-docs.s3.amazonaws.com/user_3D2drRQCaFO6Vtuy2rIeSWeeKCF/rg_1163880_6ec48.jpg';
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log('S3 response status:', res.status);
  } catch (e) {
    console.error('Error fetching S3:', e);
  }
}

testS3();
