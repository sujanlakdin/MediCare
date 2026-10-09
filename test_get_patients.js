const { getPatients } = require('./backend/controllers/patientController');

async function test() {
  const req = {};
  const res = {
    json: (data) => {
      console.log('PATIENTS_COUNT:', data.length);
      console.log('PATIENTS_LIST:', JSON.stringify(data, null, 2));
    }
  };
  await getPatients(req, res);
}

test();
