var Member = require('./model/member.js');

module.exports = function(app) {
    /*WebPage*/
    app.get('/', function(req, res) {
        res.render('index.html');
    });
    app.get('/index.html', function(req, res) {
        res.render('index.html');
    });
    app.get('/Finish.html', function(req, res) {
        res.render('Finish.html');
    });
    app.get('/Register.html', function(req, res) {
        res.render('Register.html');
    });
    app.get('/Important.html', function(req, res) {
        res.render('Important.html');
    });
    app.get('/Recent.html', function(req, res) {
        res.render('Recent.html');
    });
    app.get('/Trash.html', function(req, res) {
        res.render('Trash.html');
    });
    app.get('/Login.html', function(req, res) {
        res.render('Login.html');
    });

    /*DB*/
    // GET ALL MEMBERS
    app.get('/api/members', function(req, res) {
        Member.find(function(err, members) {
            if (err)
                return res.status(500).send({ error: 'database failure' });
            res.json(members);
        });
    });
    // GET SINGLE MEMBER
    app.get('/api/members/:email', function(req, res) {
        Member.findOne({ _email: req.params.email }, function(err, member) {
            if (err)
                return res.status(500).json({ error: err });
            if (!member)
                return res.status(404).json({ error: 'member not found' });
            res.json(member);
        });
    });
    // GET MEMBER BY NAME
    app.get('/api/members/name/:name', function(req, res) {
        Member.findOne({ _name: req.params.name }, function(err, book) {
            if (err)
                return res.status(500).json({ error: err });
            if (!member)
                return res.status(404).json({ error: 'member not found' });
            res.json(member);
        });
    });

    // CREATE MEMBER
    app.post('/api/members', function(req, res) {
        var member = new Member();
        member.email = req.body.email;
        member.password = req.body.password;
        member.name = req.body.name;
        member.phone = req.body.phone;
        member.registered_date = new Date(req.body.registered_date);

        member.save(function(err) {
            if (err) {
                console.error(err);
                res.json({ result: 0 });
                return;
            }

            res.json({ result: 1 });
        });
    });

    // UPDATE THE MEBER
    app.put('/api/members/:email', function(req, res) {
        Member.findByEmail(req.params.email, function(err, member) {
            if (err)
                return res.status(500).json({ error: 'database failure' });
            if (!member)
                return res.status(404).json({ error: 'member not found' });

            if (req.body.password) member.password = req.body.password;
            if (req.body.name) member.name = req.body.name;
            if (req.body.phone) member.phone = req.body.phone;

            member.save(function(err) {
                if (err)
                    res.status(500).json({ error: 'failed to update' });
                res.json({ message: 'member updated' });
            });
        });
    });

    // DELETE BOOK
    app.delete('/api/members/:email', function(req, res) {
        res.end();
    });
}