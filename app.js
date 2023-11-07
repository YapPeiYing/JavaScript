const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;
const PDFDocument = require('pdfkit');
const session = require('express-session');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

let admin = {
    username: '',
    password: '',
};

let members = [];

app.use(session({
    secret: 'abcdefg', 
    resave: false,
    saveUninitialized: true,
  }));

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === admin.username && password === admin.password) {
        req.session.isAdminLoggedIn = true; // Set a session variable
        res.render('admin', { members });
    } else {
        res.render('login', { error: 'Invalid username and password. Please try again.' });
    }
});

app.get('/add-member', (req, res) => {
    res.render('member');
});

app.post('/add-member', (req, res) => {
    const { name, gender, email, phone, birthdate, address } = req.body;

    const phoneRegex = /^\d+$/;
    if (!phone.match(phoneRegex)) {
        return res.render('member', { error: 'Invalid phone number. Please enter only numerical digits.' });
    }

    if (phone.length > 11) {
        return res.render('member', { error: 'Phone number must be no more than 11 digits.' });
    }

    members.push({ name, gender, email, phone, birthdate, address });
    res.redirect('/admin');
});

app.get('/admin', (req, res) => {
    res.render('admin', { members });
});

app.get('/export-pdf', (req, res) => {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=member-details.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Member Details:', 50, 50);

    members.forEach((member, index) => {
        doc
            .fontSize(14)
            .text(`${index + 1}. Name: ${member.name}`)
            .text(`   Gender: ${member.gender}`)
            .text(`   Email: ${member.email}`)
            .text(`   Phone Number: ${member.phone}`)
            .text(`   Birthdate: ${member.birthdate}`)
            .text(`   Address: ${member.address}`)
            .moveDown();
    });

    doc.end();
});

app.get('/register-admin', (req, res) => {
    res.render('admin-registration');
});


app.post('/register-admin', (req, res) => {
    const { username, password } = req.body;

    console.log('Received registration request:', username, password);

    if (admin.username) {
        console.log('Admin is already registered.');
        return res.render('admin-registration', { error: 'Admin already registered.' });
    }

    admin.username = username;
    admin.password = password;

    console.log('Admin registered:', admin);

    res.redirect('/login');
});

app.get('/logout', (req, res) => {
    req.session.isAdminLoggedIn = false; 
    res.redirect('/login');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});