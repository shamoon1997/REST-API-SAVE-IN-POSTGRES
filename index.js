const express = require('express');
const app = express();
app.use(express.json());
let Validator = require('jsonschema').Validator;
let v = new Validator();
let schema = require('./movie.json');
const { Client } = require('pg');
let movies = [];
let port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`Listening on port ${port}`) });
let Moviename;
let year;

const client = new Client({
    user: 'shamoon',
    host: 'localhost',
    database: 'shamoondb',
    password: 'cow.7???',
    port: 5432,
});

client.connect();
const query = `SELECT id, "Moviename", "Year"
FROM public."Movie";`


client.query(query, (err, res) => {
    if (err) {
        console.log(err);
        return;
    }
    movies = res.rows;
    console.log(movies);

});


function validatetherequest(req, res, next) {
    try {
        const movie = {
            id: req.body.id,
            Moviename: req.body.Moviename,
            Year: req.body.Year,
        }
        v.validate(movie, schema, { throwError: true })
        next();
    } catch (error) {
        res.status(404).send("Bad Request " + error);
        return
    }
}

app.get('/api/movies', (req, response) => {
    client.query(query, (err, res) => {
        if (err) {
            console.log(err);
            response.send(`Error while reading from database ` + err)
            return;
        } else {
            movies = res.rows;
            console.log(movies);
            response.send(movies);
            response.end();
        }


    });
})

app.get('/api/movies/:id', (req, response) => {
    client.query(query, (err, res) => {
        if (err) {
            console.log(err);
            response.send(`Error while reading from database ` + err)
            return;
        } else {
            let movieFlag = true;
            movies = res.rows;
            for (let i = 0; i < movies.length; i++) {
                if (req.params.id == movies[i].id) {
                    response.send(movies[i]);
                    movieFlag = false;
                }
            }
            if (movieFlag == true) {
                response.send("Bad Request Movie with respective id not found");
            }
        }

    });
})

app.post('/api/movies', validatetherequest, (req, response) => {
    Moviename = req.body.Moviename
    Year = req.body.Year
    let insertquery = `INSERT INTO public."Movie"(
        id, "Moviename", "Year")
        VALUES (Default,'${Moviename}',${Year});`
    client.query(insertquery, (err, res) => {
        if (err) {
            console.log(err);
            return;
        } else {
            response.send('data inserted on database and server successfully');
            response.end();
        }
    });

})
app.put('/api/movies/:id', validatetherequest, (req, response) => {
    let flag = true;
    let id = req.params.id;
    let Moviename = req.body.Moviename;
    let Year = req.body.Year;
    for (let i = 0; i < movies.length; i++) {
        if (id == movies[i].id) {
            movies[i].Moviename = Moviename;
            movies[i].Year = Year;
            console.log(movies[i]);
            flag = false;
        }
    }
    if (flag == false) {
        let updatequery = `UPDATE public."Movie"
        SET "Moviename"='${Moviename}' ,"Year"='${Year}'
        WHERE id=${id}`;
        client.query(updatequery, (err, res) => {
            if (err) {
                console.log(err);
                return;
            } else {
                response.send('Updation done successfully');
                response.end();
                console.log('Updation done successfully');
            }
        });
    } else if (flag == true) {
        response.send("Bad request Movie with respective id not found");
    }



});
app.delete('/api/movies/:id', (req, response) => {
    let flag = true;
    let queryresult = true;
    let id = req.params.id;
    console.log(id);
    for (let i = 0; i < movies.length; i++) {
        if (id == movies[i].id) {
            flag = false;
        }
        console.log(movies[i]);
        console.log("falg " + flag);
    }
    if (flag == false) {
        let deletequery = `DELETE FROM public."Movie"
        WHERE id=${id};`
        client.query(deletequery, (err, res) => {
            if (err) {
                console.log(err);
                return;
            } else {
                response.status(200).send("Deleted successfully");
                response.end();
            }
        });
    }
    if (flag == true) {
        response.status(404).send("Bad Request not able to delete id not found");
        console.log("Id didn't found");
    }

});