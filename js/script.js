SLCJson = d3.json('./data/CBG_SaltLakeCounty.geojson');
//SLCJson = JSON.parse('./data/CBG_SaltLakeCounty.geojson');



Promise.all([d3.csv('./data/SD_eachCBG.csv'), d3.csv('./data/SD_graph.csv'),d3.csv('./data/SLC_Covid.csv'), SLCJson]).then( data =>
// Promise.all([d3.csv('./data/words-without-force-positions.csv')]).then( data =>
    {
        let sd_eachCBG = data[0];
        let sd_graph = data[1];
        let slc_Covid = data[2];
        let slc_Json = data[3];

        //let content = new Content(wordData, wordNoForceData);
        let content = new Content(sd_eachCBG, sd_graph, slc_Covid, slc_Json);
        //table.drawTable();
        

    });