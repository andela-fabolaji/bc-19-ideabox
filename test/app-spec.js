var app = require('../app.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
chai.use(chaiHttp);

describe('Index test', function () {
  it('Should Load ideas and trends', function (done) {
    chai.request(app)
      .get('/get_ideas')
      .end(function (err, res) {
        res.body.should.be.a('object');
        res.body.trends.should.be.a('array');
        res.body.should.have.property('ideas');
        done();
      })
  });
});

describe('Login test', function () {
    it('Should return success if user is valid', function (done) {
      chai.request(app)
        .post('/signin')
        .send({'email': 'johndoe@mailer.com', 'password': 'johndoe'})
        .end(function (err, res) {
          res.body.status.should.equal(true);
          res.body.msg.should.equal('Welcome!');
          res.body.should.have.property('authtoken');
          res.body.fullname.should.equal('John Doe');
          done();
        })
    });

    it('Should return failure msg if user is invalid', function (done) {
      chai.request(app)
        .post('/signin')
        .send({'email': 'notjohndoe@mailer.com', 'password': 'notjohndoe'})
        .end(function (err, res) {
          res.body.status.should.equal(false);
          res.body.msg.should.equal('User does not exist!');
          done();
        })
    });

    it('Should return failure msg if user is invalid', function (done) {
      chai.request(app)
        .post('/signin')
        .send({'email': 'johndoe@mailer.com', 'password': 'notjohndoe'})
        .end(function (err, res) {
          res.body.status.should.equal(false);
          res.body.msg.should.equal('Invalid password');
          done();
        })
    });
});

describe('Sign up test', function () {
    it('Should return error if user exists', function (done) {
      chai.request(app)
        .post('/signup')
        .send({
          'fullname': 'Tunde Miller',
          'regemail': 'tundemiller@mailer.com',
          'regpassword': 'tundemiller',
          'confirmpassword': 'tundemiller'
        })
        .end(function (err, res) {
          console.log(res.body);
          res.body.status.should.equal(false);
          res.body.msg.should.equal('This email already exists');
          done();
        })
    });
});