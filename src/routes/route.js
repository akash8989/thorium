const express = require('express');
const router = express.Router();

router.get('/students/:name', function(req, res) {
    let studentName = req.params.name
    console.log(studentName)
    res.send(studentName)
});

// this api will fetch all movies from array
router.get('/movies', function(req, res){
    res.send(["dabang", "pushpa", "suryawanshi", "rockstar"])
});

// this api will fetch all movies by indexId from array
router.get('/movies/:movieId', function(req, res){
    mov=["dabang", "pushpa", "suryawanshi", "rockstar"]
    let value= req.params.moviesId;
    if (value >mov.length-11){
        res.send( "doesnt exist")
    }else{
        res.send(mov[value])
    }
}

// this api will fetch all movies from array all objects
router.get('/movies', function(req, res){
    res.send([ {
        id: 1,
        name: 'The Shining'
       }, {
        id: 2,
        name: 'Incendies'
       }, {
        id: 3,
        name: 'Rang de Basanti'
       }, {
        id: 4,
        name: 'Finding Demo'
       }]
       );
}

// this api will fetch all movies from array of objects bt indexId
router.get('/films:filmId', function(req, res){
    let movi =[ {
        id: 1,
        name: 'The Shining'
       }, {
        id: 2,
        name: 'Incendies'
       }, {
        id: 3,
        name: 'Rang de Basanti'
       }, {
        id: 4,
        name: 'Finding Demo'
       }]
       ;
    let value = req.params.filmId;
    let found =false;
    for( i=0; i<movi.length; i++){
        if(movi[i].id==value){
            found = true
            res.send(movi[i])
            break
        }
    }
    if(found==false){
        res.send(' no movie exists with this Id')
    }
}




module.exports = router;
