const http = require('http');

const testAPI = (path) => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET'
    }, (res) => {
      console.log(`${res.statusCode} - ${path}`);
      resolve(res.statusCode);
    });
    
    req.on('error', (err) => {
      console.log(`ERROR - ${path}: ${err.message}`);
      resolve('ERROR');
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      console.log(`TIMEOUT - ${path}`);
      resolve('TIMEOUT');
    });
    
    req.end();
  });
};

async function test() {
  console.log('Testing APIs...');
  await testAPI('/api/categories');
  await testAPI('/api/categories?active=true');
  await testAPI('/api/products');
  await testAPI('/api/suppliers');
  await testAPI('/health');
}

test();

