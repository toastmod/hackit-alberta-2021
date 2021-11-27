function loadcsv(path) {
    var database = new XMLHttpRequest();
    database.open("GET", path);
    database.onreadystatechange = function () {
        console.log(database.responseText);
    }
    database.send();
}


function is_point_in(point, circ_point, diam) {

    var bounds = [
        //x1
        circ_point[0]-(diam/2),
       
        //x2
        circ_point[0]+(diam/2),

        //y1
        circ_point[1]-(diam/2),
    
        //y2
        circ_point[1]+(diam/2), 
    
    ];
    
    if((point[0] > bounds[0]) && (point[0] < bounds[1])){
        if((point[1] > bounds[2]) && (point[1] < bounds[3])){
            return true;
        }else{
            return false;
        }
    }else{
        return false;
    }
}