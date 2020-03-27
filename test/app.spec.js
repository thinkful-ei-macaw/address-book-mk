const app = require('../src/app');
const API_TOKEN = process.env.API_TOKEN;

const testData = {
  firstName: 'Mojo',
  lastName: 'Jojo',
  address1: '123 Klose Way',
  address2: 'Apt 2',
  city: 'Townsville',
  state: 'CN',
  zip: '69420'
};

describe('App', () => {

  // GET requests
  describe('GET /address', () => {
    it('returns 200 with an array of addresses', () => {
      supertest(app)
        .get('/address')
        .expect(200)
        .then(res => {
          expect(res.body).to.be.an('array');
        });
    });
  });


  // POST requests
  describe('POST /address', () => {
    it('returns 201 with an address object', () => {
      supertest(app)
        .post('/address')
        .set('Authorization', 'Bearer ' + API_TOKEN)
        .send(testData)
        .expect(201)
        .then(res => {
          expect(res.body).to.be.an('object');
        });
    });

    it('returns 400 when authorization header is missing', () => {
      supertest(app)
        .post('/address')
        .send(testData)
        .expect(400, 'No Authorization header was present in the request');
    });

    it('returns 401 when incorrect bearer token is provided', () => {
      supertest(app)
        .post('/address')
        .set('Authorization', 'Bearer ' + 'some-invalid-token')
        .send(testData)
        .expect(401, 'Unauthorized token provided');
    });

    it('returns 400 when required fields are ommitted', () => {
      let ommittedData = {
        ...testData
      };
      delete ommittedData.firstName;

      supertest(app)
        .post('/address')
        .set('Authorization', 'Bearer ' + API_TOKEN)
        .send(ommittedData)
        .expect(400, 'firstName is required');
    });
    
    it('returns 400 when length-requirement fields mismatch', () => {
      let ommittedData = {
        ...testData
      };
      ommittedData.state = 'CNN';

      supertest(app)
        .post('/address')
        .set('Authorization', 'Bearer ' + API_TOKEN)
        .send(ommittedData)
        .expect(400, 'state must be a string of length 2');
    });
  });


  // DELETE requests
  describe('DELETE /address/:id', () => {
    it('returns 204 and successfully deletes the address', () => {
      // post something first
      supertest(app)
        .post('/address')
        .set('Authorization', 'Bearer ' + API_TOKEN)
        .send(testData)
        .then(res => {
          const { id } = res.body;

          // then delete it
          supertest(app)
            .delete(`/address/${id}`)
            .set('Authorization', 'Bearer ' + API_TOKEN)
            .expect(204)
            .then(res => res);

        });
    });

    it('returns 401 when incorrect bearer token is provided', () => {
      // no need to make a post here, we're testing the token
      supertest(app)
        .delete('/address/some-id')
        .set('Authorization', 'Bearer ' + 'some-invalid-token')
        .expect(401, 'Unauthorized token provided');
    });

    it('returns 404 when address id is not found', () => {
      // no need to post here, we're seeing the result when it DOESN'T find the id
      supertest(app)
        .delete('/address/id-you-will-not-find')
        .set('Authorization', 'Bearer ' + API_TOKEN)
        .expect(404, 'Address not found');
    });
  });
});