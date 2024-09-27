var express = require('express');
var app = express();
var mssql = require('mssql');
var path = require('path');

var port = 8080;

const config = {
    user: 'test',
    password: '12345',
    server: 'ANDREYPC',
    database: 'Library',
    port: 1433,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

var connectionPool;

mssql.connect(config)
    .then(pool => {
        connectionPool = pool;
        console.log('Connected to database');
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1); 
    });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

app.get('/', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'Pages', '/main.html'));
    } catch (err) {
        console.error('Error sending file', err);
        res.status(500).send('Error retrieving page');
    }
});

app.get('/students.html', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'Pages', '/students.html'));
    } catch (err) {
        console.error('Error sending file', err);
        res.status(500).send('Error retrieving page');
    }
});

app.post('/addStudent', async (req, res) => {
    const { firstname, lastname, groupname } = req.body;

    const transaction = new mssql.Transaction(connectionPool);
    try {
        await transaction.begin();

        const request = transaction.request();
        
        let result = await request
            .input('groupname', mssql.VarChar, groupname)
            .query('SELECT Id FROM Groups WHERE Name = @groupname');
        
        if (result.recordset.length === 0) {
            await transaction.rollback(); 
            return res.status(404).send('Группа не найдена');
        }

        const groupId = result.recordset[0].Id; 

        await request
            .input('firstname', mssql.VarChar, firstname)
            .input('lastname', mssql.VarChar, lastname)
            .input('id_group', mssql.Int, groupId) 
            .query("INSERT INTO Students (FirstName, LastName, Id_Group, Term) VALUES (@firstname, @lastname, @id_group, 2)");

        await transaction.commit(); 
        res.send('Студент успешно добавлен!');
    } catch (err) {
        console.error('Ошибка:', err);
        await transaction.rollback();
        res.status(500).send('Ошибка добавления данных');
    }
});

app.get('/groups.html', async (req, res) => {
    try {
        const request = connectionPool.request();
        const result = await request.query('SELECT Name FROM Groups');
        res.render('groups', { groups: result.recordset }); 
    } catch (err) {
        console.error('Ошибка при получении групп:', err);
        res.status(500).send('Ошибка получения групп');
    }
});


app.post('/addGroup',async(req,res) =>{
    const groupname = req.body.groupname;
    const facultyName = req.body.facultyname

    const transaction = new mssql.Transaction(connectionPool);
    try {
        await transaction.begin();

        const request = transaction.request();
        
        let result = await request
            .input('facultyname', mssql.VarChar, facultyName)
            .query('SELECT Id FROM Faculties WHERE Name = @facultyname');
        
        if (result.recordset.length === 0) {
            await transaction.rollback(); 
            return res.status(404).send('Факультет не найден');
        }

        const facultyId = result.recordset[0].Id; 

        await request
            .input('faculty', mssql.Int, facultyId) 
            .input('group', mssql.VarChar, groupname) 
            .query("INSERT INTO Groups (Name, Id_Faculty) VALUES (@group, @faculty)");
    
        await transaction.commit(); 
        res.send('Группа успешно добавлена!');
    } catch (err) {
        console.error('Ошибка:', err);
        await transaction.rollback();
        res.status(500).send('Ошибка добавления данных');
    }
})

app.post('/updateGroup', async (req, res) => {
    const { groupname, oldName } = req.body;

    const transaction = new mssql.Transaction(connectionPool);
    try {
        await transaction.begin();

        const request = transaction.request();
        
        await request
            .input('groupname', mssql.VarChar, groupname)
            .input('oldName', mssql.VarChar, oldName)
            .query('UPDATE Groups SET Name = @groupname WHERE Name = @oldName');

        await transaction.commit();
        res.send('Группа успешно обновлена!');
    } catch (err) {
        console.error('Ошибка:', err);
        await transaction.rollback();
        res.status(500).send('Ошибка обновления данных');
    }
});


app.post('/deleteGroup', async (req, res) => {
    const { groupname} = req.body;

    const transaction = new mssql.Transaction(connectionPool);
    try {
        await transaction.begin();

        const request = transaction.request();
        
        await request
            .input('groupname', mssql.VarChar, groupname)
            .query('DELETE FROM groups WHERE Name = @groupname');

        await transaction.commit();
        res.send('Группа успешно удалена!');
    } catch (err) {
        console.error('Ошибка:', err);
        await transaction.rollback();
        res.status(500).send('Ошибка обновления данных');
    }
});






app.get('/faculties.html', async (req, res) => {
    try {
        const request = connectionPool.request();
        const result = await request.query('SELECT Name FROM Faculties');
        res.render('faculties', { faculties: result.recordset }); 
    } catch (err) {
        console.error('Ошибка при получении групп:', err);
        res.status(500).send('Ошибка получения групп');
    }
});

app.post('/addFaculty', async (req, res) => {
    const facultyName = req.body.facultyname;

    const transaction = new mssql.Transaction(connectionPool);
    try {
        await transaction.begin();

        const request = transaction.request();
        
        await request
            .input('facultyname', mssql.VarChar, facultyName)
        await request
            .query("INSERT INTO Faculties (Name) VALUES (@facultyname)");

        await transaction.commit(); 
        res.send('Факультет успешно добавлен!');
    } catch (err) {
        console.error('Ошибка:', err);
        await transaction.rollback();
        res.status(500).send('Ошибка добавления данных');
    }
});

app.post('/updateFaculty', async (req, res) => {
    const { facultyname, oldName } = req.body;

    const transaction = new mssql.Transaction(connectionPool);
    try {
        await transaction.begin();

        const request = transaction.request();
        
        await request
            .input('facultyname', mssql.VarChar, facultyname)
            .input('oldName', mssql.VarChar, oldName)
            .query('UPDATE Faculties SET Name = @facultyname WHERE Name = @oldName');

        await transaction.commit();
        res.send('Факультет успешно обновлен!');
    } catch (err) {
        console.error('Ошибка:', err);
        await transaction.rollback();
        res.status(500).send('Ошибка обновления данных');
    }
});


app.post('/deleteFaculty', async (req, res) => {
    const { facultyname} = req.body;

    const transaction = new mssql.Transaction(connectionPool);
    try {
        await transaction.begin();

        const request = transaction.request();
        
        await request
            .input('facultyname', mssql.VarChar, facultyname)
            .query('DELETE FROM Faculties WHERE Name = @facultyname');

        await transaction.commit();
        res.send('Группа успешно удалена!');
    } catch (err) {
        console.error('Ошибка:', err);
        await transaction.rollback();
        res.status(500).send('Ошибка обновления данных');
    }
});



app.listen(port, () => {
    console.log('App listening on port ' + port);
});
