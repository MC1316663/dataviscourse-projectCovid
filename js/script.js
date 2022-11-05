SLCJson = d3.json('./data/CBG_SaltLakeCounty.json');
// extraCredit = d3.csv('./data/senate_polls.csv');

Promise.all([d3.csv('./data/social_distancing_sample.csv'), d3.csv('./data/SLC_Covid.csv'), SLCJson]).then( data =>
// Promise.all([d3.csv('./data/words-without-force-positions.csv')]).then( data =>
    {
        let sdMatrix = data[0];
        let slc_Covid = data[1];
        let slc_Json = data[2];

        //let content = new Content(wordData, wordNoForceData);
        let content = new Content(sdMatrix, slc_Covid, slc_Json);
        //table.drawTable();
        

    });