/** Class implementing the table. */
class Content {
  /**
   * Creates graph object
   */
  constructor(sd_eachCBG, sd_graph, slc_Covid, slc_Json) {

    //data Load
    this.sd_eachCBG = sd_eachCBG;
    this.sd_graph = sd_graph;
    this.slc_Covid = slc_Covid;
    this.slc_Json = slc_Json;

    // map object
    this.map = '';
    this.type='median_home_dwell_time'; // current focused type
    this.typeRange = {'median_home_dwell_time': [0, 1500], 'median_non_home_dwell_time': [0, 1400], 'full_time_work_behavior_devices': [0, 1000]};
    this.colorRange = {'median_home_dwell_time': ['#F7FBFF', '#0A306B'], 'median_non_home_dwell_time': ['#f5fff7', '#26943c'], 'full_time_work_behavior_devices': ['#fffcf7', '#d68420']};
    this.colorMap = d3.scaleLinear().domain(this.typeRange['median_home_dwell_time']).range(['#F7FBFF', '#0A306B']);
    this.colorMap2 = d3.scaleLinear().domain(this.typeRange['full_time_work_behavior_devices']).range(['#fffcf7', '#d68420']);
    this.colorMap3 = d3.scaleLinear().domain(this.typeRange['median_non_home_dwell_time']).range(['#f5fff7', '#26943c']);
    this.brushedData = '';
    this.clickedGeoID = 0;
    this.preClickedGeoID = -1;
    // console.log('range', d3.min(this.sd_eachCBG, d=>parseInt(d['full_time_work_behavior_devices'])), d3.max(this.sd_eachCBG, d=>parseInt(d['median_home_dwell_time'])))

    this.MARGIN = {left: 33, bottom: 20, top: 10, right: 5};

    //convert time format
    const formatTime = d3.timeFormat("%m/%d/%Y");

    this.sd_eachCBG.forEach(d => {
      d.Date = formatTime(new Date(d.Date))
    });

    this.slc_Covid.forEach(d => {
      d.date = formatTime(new Date(d.date))
    });

    this.slc_Covid = this.slc_Covid.splice(0, this.slc_Covid.length - 7);

    this.sd_graph.forEach(d => {
      d.date_range_start = formatTime(new Date(d.date_range_start))
    });

    this.sd_graph = this.sd_graph.splice(67, this.sd_graph.length);

    //d3 setting up 
    this.CHART_WIDTH = parseInt(d3.select('#CovidCaseG').style('width'));
    this.CHART_HEIGHT = parseInt(d3.select('#CovidCaseG').style('height'));

    this.covidSVG = d3.select('#CovidCaseG')
      .append('svg')
      .attr('id', 'covidCase-svg');
      
    this.covidCaseG = this.covidSVG.append('g')
      .attr('id', 'covidCase')
      .attr('class', 'covid-case');

    this.homeSVG = d3.select('#Home')
      .append('svg')
      .attr('id', 'home-svg');
    
    this.homeG = this.homeSVG.append('g')
      .attr('id', 'home')
      .attr('class', 'home-g');
    
    this.outdoorSVG = d3.select('#Others')
      .append('svg')
      .attr('id', 'outdoor-svg');

    this.outdoorG = this.outdoorSVG.append('g')
    .attr('id', 'outdoor')
    .attr('class', 'outdoor-g');
    
    this.workSVG = d3.select('#Work')
      .append('svg')
      .attr('id', 'work-svg');

    this.workG = this.workSVG.append('g')
    .attr('id', 'work')
    .attr('class', 'work-g');

    //xScale for home, outdoor, and work graphs
    this.xScale = d3.scaleBand()
      .domain(this.sd_graph.map(d => d.date_range_start))
      .range([this.MARGIN.left, this.CHART_WIDTH-this.MARGIN.right]);

    // add listners on buttons (work, home, other behaviours) upper map
    this.changeType();

    //draw graphs
    this.covidCaseGraph();
    this.homeGraph();
    this.outdoorGraph();
    this.workDeviceGraph();
    this.COVID_situation(this.slc_Covid);
    this.pieChart(this.sd_graph);
    this.drawTable(this.sd_graph);
    this.brush();
    this.initMap();

    // update color map
    this.updateColorBar();


    console.log("sd_graph: ", this.sd_graph);
    console.log('cbg: ', this.sd_eachCBG);
    //console.log("covid_case: ", this.slc_Covid);
  }

  /**
     * Bar chart for covid case graph
  */
  covidCaseGraph(){
    this.covidSVG
      .attr("width", this.CHART_WIDTH)
      .attr("height", this.CHART_HEIGHT);
    
    this.covidSVG.append('text')
      .attr('x', 220)
      .attr('y', 20)
      .attr('font-size', '18px')
      .style('fill', '#4e565f')
      .text('Covid Cases');
    
    let xAxisG = this.covidSVG.append('g')
      .attr('id', 'covidCase-x-axis');

    let yAxisG = this.covidSVG.append('g')
      .attr('id', 'covidCase-y-axis');

    //set up bar chart scales
    const xScale = d3.scaleBand()
      .domain(this.slc_Covid.map(d => d.date))
      .range([this.MARGIN.left, this.CHART_WIDTH-this.MARGIN.right]);

    const cases = this.slc_Covid.map(d => d.InfC).map(d => parseInt(d, 10));
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(cases)])
      .range([this.CHART_HEIGHT - this.MARGIN.bottom - this.MARGIN.top, 0])
      .nice();

    //set up bar chart axises
    const tickPts = Math.round(this.slc_Covid.map(d => d.date).length/4);
    xAxisG.attr('transform', `translate(0,${this.CHART_HEIGHT - this.MARGIN.bottom})`)
      .call(d3.axisBottom(xScale).tickValues(this.slc_Covid.map((d, i) => {
        if(i % tickPts == 0){
          return d.date;
        }
      }).filter(d => d)))
      .selectAll('path')
      .remove();

    yAxisG.attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .call(d3.axisLeft(yScale).ticks(4))
      .selectAll('path')
      .remove();

    //draw bar chart
    this.covidCaseG.attr('transform', `translate(0, ${this.MARGIN.top})`)
      .selectAll('rect')
      .data(this.slc_Covid, d => d.date)
      .join('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.InfC))
      .attr('x', d => xScale(d.date))
      .attr('y', d => yScale(d.InfC))
      .attr('opacity', 1)
      .attr('classed', 'covid-case');
  }

  COVID_situation(slc_Covid){
    console.log(slc_Covid)
    if(slc_Covid.length == 0){
      slc_Covid = this.slc_Covid
    }


    const cases = slc_Covid.map(item => parseInt(item.InfC))
    .reduce((prev, curr) => prev + curr, 0)
    
    

    var recovCases = d3.max(slc_Covid, function(d){
          return parseInt(d.Recov);
        }) - slc_Covid[0].Recov
    var diedCases = d3.max(slc_Covid, function(d){
      return parseInt(d.Died);
    }) - slc_Covid[0].Died
    
    if(slc_Covid.length == 1){ //brush only1 row
      recovCases = slc_Covid[0].Recov
      diedCases = slc_Covid[0].Died
    }
    
    let xmargin = 40;
    let ymargin = 20;


    // Data
    


    let cumulative = this.covidSVG.append('g')
    .attr('id', 'cumulative');
    let recovered = this.covidSVG.append('g')
    .attr('id', 'recovered');
    let died = this.covidSVG.append('g')
    .attr('id', 'died');

    const cum = d3.select("#cumulative").append("rect")
    .attr('width', 150)
    .attr('height', 30)
    .attr('x', xmargin)
    .attr('y', 10)
    .attr('fill', 'grey')
    .attr('opacity', 0.2);

    const cumT = d3.select("#cumulative").append("text")
    .text("Cases: " + cases)
    .attr("x", xmargin + 5)
    .attr("y", 10 + ymargin)
    
    const rec = d3.select("#recovered").append("rect")
    .attr('width', 150)
    .attr('height', 30)
    .attr('x', xmargin)
    .attr('y', 45)
    .attr('fill', 'grey')
    .attr('opacity', 0.2)

    const recT = d3.select("#recovered").append("text")
    .text("Recovered: " + recovCases)
    .attr("x", xmargin + 5)
    .attr("y", 45 + ymargin)
    
    const die = d3.select("#died").append("rect")
    .attr('width', 150)
    .attr('height', 30)
    .attr('x', xmargin)
    .attr('y', 80)
    .attr('fill', 'grey')
    .attr('opacity', 0.2)

    const dieT = d3.select("#died").append("text")
    .text("Died: " + diedCases)
    .attr("x", xmargin + 5)
    .attr("y", 80 + ymargin)



  }

  /**
   * Bar chart for median home spending time graph
   */
  homeGraph(){
    this.homeSVG
      .attr("width", this.CHART_WIDTH)
      .attr("height", this.CHART_HEIGHT);

    this.homeSVG.append('text')
      .attr('x', 170)
      .attr('y', 20)
      .attr('font-size', '18px')
      .style('fill', '#4e565f')
      .text('Median Home Dwell Time');
    
    let xAxisG = this.homeSVG.append('g')
      .attr('id', 'home-x-axis');

    let yAxisG = this.homeSVG.append('g')
      .attr('id', 'home-y-axis');

    //set up bar chart scales
    const counts = this.sd_graph.map(d => d.median_home_dwell_time).map(d => parseInt(d, 10));
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(counts)])
      .range([this.CHART_HEIGHT - this.MARGIN.bottom - this.MARGIN.top, 0])
      .nice();

    //set up bar chart axises
    const tickPts = Math.round(this.sd_graph.map(d => d.date_range_start).length/4);
    xAxisG.attr('transform', `translate(0,${this.CHART_HEIGHT - this.MARGIN.bottom})`)
      .call(d3.axisBottom(this.xScale).tickValues(this.sd_graph.map((d, i) => {
        if(i % tickPts == 0){
          return d.date_range_start;
        }
      }).filter(d => d)))
      .selectAll('path')
      .remove();

    yAxisG.attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .call(d3.axisLeft(yScale).ticks(3))
      .selectAll('path')
      .remove();

    //draw bar chart
    this.homeG.selectAll('rect')
      .data(this.sd_graph, d => d.date_range_start)
      .join('rect')
      .attr('width', this.xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.median_home_dwell_time))
      .attr('x', d => this.xScale(d.date_range_start))
      .attr('y', d => yScale(d.median_home_dwell_time) + this.MARGIN.top)
      .attr('opacity', 1)
      .attr('class', 'home-g');
  }

  /**
   * Bar chart for median outdoor spending time graph
   */
  outdoorGraph(){
    this.outdoorSVG
      .attr("width", this.CHART_WIDTH)
      .attr("height", this.CHART_HEIGHT);

    this.outdoorSVG.append('text')
      .attr('x', 150)
      .attr('y', 20)
      .attr('font-size', '18px')
      .style('fill', '#4e565f')
      .text('Median Non Home Dwell Time');
    
    let xAxisG = this.outdoorSVG.append('g')
      .attr('id', 'outdoor-x-axis');

    let yAxisG = this.outdoorSVG.append('g')
      .attr('id', 'outdoor-y-axis');

    //set up bar chart scales
    const counts = this.sd_graph.map(d => d.median_non_home_dwell_time).map(d => parseInt(d, 10));
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(counts)])
      .range([this.CHART_HEIGHT - this.MARGIN.bottom - this.MARGIN.top, 0])
      .nice();

    //set up bar chart axises
    const tickPts = Math.round(this.sd_graph.map(d => d.date_range_start).length/4);
    xAxisG.attr('transform', `translate(0,${this.CHART_HEIGHT - this.MARGIN.bottom})`)
      .call(d3.axisBottom(this.xScale).tickValues(this.sd_graph.map((d, i) => {
        if(i % tickPts == 0){
          return d.date_range_start;
        }
      }).filter(d => d)))
      .selectAll('path')
      .remove();

    yAxisG.attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .call(d3.axisLeft(yScale).ticks(4))
      .selectAll('path')
      .remove();

    //draw bar chart
    this.outdoorG.selectAll('rect')
      .data(this.sd_graph, d => d.date_range_start)
      .join('rect')
      .attr('width', this.xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.median_non_home_dwell_time))
      .attr('x', d => this.xScale(d.date_range_start))
      .attr('y', d => yScale(d.median_non_home_dwell_time) + this.MARGIN.top)
      .attr('opacity', 1)
      .attr('class', 'outdoor-g');
  }

  /**
   * Bar chart for work devices count graph
   */
  workDeviceGraph(){
    this.workSVG
      .attr("width", this.CHART_WIDTH)
      .attr("height", this.CHART_HEIGHT);

    this.workSVG.append('text')
      .attr('x', 185)
      .attr('y', 20)
      .attr('font-size', '18px')
      .style('fill', '#4e565f')
      .text('Work Device Counts');
    
    let xAxisG = this.workSVG.append('g')
      .attr('id', 'work-x-axis');

    let yAxisG = this.workSVG.append('g')
      .attr('id', 'work-y-axis');

    //set up bar chart scales
    const counts = this.sd_graph.map(d => d.sum_work_behavior_device).map(d => parseInt(d, 10));
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(counts)])
      .range([this.CHART_HEIGHT - this.MARGIN.bottom - this.MARGIN.top, 0])
      .nice();

    //set up bar chart axises
    const tickPts = Math.round(this.sd_graph.map(d => d.date_range_start).length/4);
    xAxisG.attr('transform', `translate(0,${this.CHART_HEIGHT - this.MARGIN.bottom})`)
      .call(d3.axisBottom(this.xScale).tickValues(this.sd_graph.map((d, i) => {
        if(i % tickPts == 0){
          return d.date_range_start;
        }
      }).filter(d => d)))
      .selectAll('path')
      .remove();

    yAxisG.attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .call(d3.axisLeft(yScale).ticks(3).tickFormat(d3.format(".2s")))
      .selectAll('path')
      .remove();

    //draw bar chart
    this.workG.selectAll('rect')
      .data(this.sd_graph, d => d.date_range_start)
      .join('rect')
      .attr('width', this.xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.sum_work_behavior_device))
      .attr('x', d => this.xScale(d.date_range_start))
      .attr('y', d => yScale(d.sum_work_behavior_device) + this.MARGIN.top)
      .attr('opacity', 1)
      .attr('class', 'work-g');
  }

  /**
   * Brush covid cases graph to highlight data of the same time period in home, outdoor, and work graphs
   */
  brush(){
    this.brushedDates;
    this.covidSVG.append('g')
    .attr('id', 'brush')
    .call(d3.brushX().extent([[this.MARGIN.left, 20], [this.CHART_WIDTH, this.CHART_HEIGHT - this.MARGIN.bottom]]).on("start brush", brushed)
    .on("end", updateChoroplethMap));

    let that = this;
    let brushedData = [];
    function brushed({selection}){

      if(selection){
        const [x0, x1] = selection;

        that.homeG.selectAll('rect')
        .classed('brushed',  function(d){return that.xScale(d.date_range_start) > x0 && that.xScale(d.date_range_start) < x1});

        that.outdoorG.selectAll('rect')
        .classed('brushed',  function(d){return that.xScale(d.date_range_start) > x0 && that.xScale(d.date_range_start) < x1});

        that.workG.selectAll('rect')
        .classed('brushed',  function(d){return that.xScale(d.date_range_start) > x0 && that.xScale(d.date_range_start) < x1});
        
        brushedData = that.sd_graph.filter(d => that.xScale(d.date_range_start) > x0 && that.xScale(d.date_range_start) < x1);

        //store brushed dates in array
        that.brushedDates = brushedData.map(d => d.date_range_start);
        //console.log(brushedDates)
        that.filterDataByBrushing(that.brushedDates);

        that.drawTable(brushedData);
      }
    }
    function updateChoroplethMap(){
      that.pieChart(brushedData);
      that.filterDataAfterBrushing(that.brushedDates);
    }
  }

  /**
   * Intialize the map object
   */
  initMap(){
    const that = this;
    const mapStylesArray = [
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f5f5f5"
          }
        ]
      },
      {
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#616161"
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#f5f5f5"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#bdbdbd"
          }
        ]
      },
      {
        "featureType": "administrative.locality",
        "elementType": "labels.text",
        "stylers": [
          {
            "saturation": -85
          },
          {
            "lightness": 45
          },
          {
            "weight": 0.5
          }
        ]
      },
      {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "saturation": -85
          }
        ]
      },
      {
        "featureType": "administrative.locality",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "lightness": 80
          },
          {
            "weight": 0.5
          }
        ]
      },
      {
        "featureType": "administrative.neighborhood",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "administrative.province",
        "elementType": "labels.text",
        "stylers": [
          {
            "weight": 0.5
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#eeeeee"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "poi.business",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#ffffff"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dadada"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#616161"
          }
        ]
      },
      {
        "featureType": "road.local",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      },
      {
        "featureType": "transit",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#eeeeee"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#c9c9c9"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      }
    ];
    this.map = new google.maps.Map(d3.select("#Map").node(), {
      center: { lat: 40.69, lng: -111.906 },
      zoom: 10.2,
      styles: mapStylesArray
    });
    
    this.map.data.addGeoJson(
      //'./data/CBG_SaltLakeCounty.geojson' //this works but from path.
        that.slc_Json
    );
    this.filterDataAfterBrushing(this.brushedData);
  }

  /**
   * add color on each ID block
   * attrData {'CBGID', 'value'}
   */
  styleMap(attrData){
    let that = this;
    let color = 'none';
    //console.log(attrData);
    
    this.map.data.addListener('click', function(d){//click function
      const geoId = d.feature.j.GEOID20;
      that.clickedGeoID = geoId
      console.log(that.clickedGeoID)
    
         //var mapObject = new Map(attrData)
      // for(var obj of mapObject){
      //   if(obj[0]==geoId){
      //     //console.log(obj[1],", ",that.type) //values of selected GeoId
      //     console.log(obj[1]) //values of selected GeoId
      //   }
      // }
      MapStyle();
    })
    MapStyle();
    function MapStyle(){

      that.map.data.setStyle(function(d){    //Style for Choropleth map
        const CBGID = d.j['GEOID20'];
        if(attrData.has(CBGID)){
          if(that.type == 'median_home_dwell_time'){
            color = that.colorMap(attrData.get(CBGID));
          }
          else if(that.type == 'full_time_work_behavior_devices'){
            color = that.colorMap2(attrData.get(CBGID));
          }
          else{
            color = that.colorMap3(attrData.get(CBGID));
          }
          
        }
        if(that.clickedGeoID == CBGID){
          if(that.preClickedGeoID == that.clickedGeoID){ //click the same polygon
            that.preClickedGeoID = -1; //initialize
            that.clickedGeoID =  0;

            return{  
              fillColor: color,
              fillOpacity: 0.7,
              strokeWeight: 0.2
            }
          }
          else{
            that.preClickedGeoID = that.clickedGeoID;
            that.clickedGeoID = 0;

            return{  
              fillColor: color,
              fillOpacity: 0.7,
              strokeWeight: 2
            }
          }
        } 
        else{     
          return{  
            fillColor: color,
            fillOpacity: 0.7,
            strokeWeight: 0.2
          }
        }
      });

    }

    var infowindow = new google.maps.InfoWindow(); //tooltips

    this.map.data.addListener("mousemove", function(d){
      
      const geoId = d.feature.j.GEOID20;
      //console.log(geoId)
      let html = 'CBG: ' + geoId;
      infowindow.setContent(html);
      infowindow.setPosition(d.latLng);
      infowindow.setOptions({pixelOffset: new google.maps.Size(5,-5)});
      infowindow.open(this.map);
    });


    
  }


filterDataByBrushing(brushedDates){
  const that = this
  //console.log(brushedDates)

  //Filter data 
  const selected_slc_Covid = that.slc_Covid.filter(d => brushedDates.includes(d.date))
  const selected_sd_graph = that.sd_graph.filter(d => brushedDates.includes(d.date_range_start))
  
  //const selected_sd_eachCBG = that.sd_eachCBG.filter(d => brushedDates.includes(d.Date))
  //console.log(selected_sd_eachCBG)

  //const selected_sd_eachCBG = that.sd_eachCBG.filter(d => brushedDates.includes(d.Date))

  

  //Color Map bar - use selected_df_eachCBG
  

  
  //Table

  
}

pieChart(sd_graph){
  //console.log(sd_graph)
  if(sd_graph.length == 0){
    sd_graph = this.sd_graph;
  }

  //pie차트 default를 그리고 나주엥 클릭 했을 때 다른 하나의 데이터에다가
  //원래 that.sd_graph와 클릭해서 나온 filtered sd_graph를 2개의 row를 가진 데이터로
  //만들어 2개의 파이차트로 만들어보자.

  //if brushed

  const AvgHomeTime = sd_graph.reduce((total, d) => total + parseInt(d.median_home_dwell_time), 0 )/ sd_graph.length
  const AvgNonHomeTime = sd_graph.reduce((total, d) => total + parseInt(d.median_non_home_dwell_time), 0 )/ sd_graph.length
  const AvgworkCount = sd_graph.reduce((total, d) => total + parseInt(d.sum_work_behavior_device), 0 )/ sd_graph.length
  

  const sdData =  [
    {
      key: "Home",
      value: AvgHomeTime
    },
    {
      key: "Non-Home",
      value: AvgNonHomeTime
    }
  ]
  
  //set size of extent first
  let width = 300
  let height = 300

  //Color scale
  let color = d3.scaleOrdinal()
  .range(['rgb(10, 48, 107)',
      'rgb(38, 148, 60)']);

  let pieSVG = d3.select("#piechartDiv")
      .attr("width", width)
      .attr("height", height)
    // // .append('g')
    // .attr("transform", "translate(" + width / 1.9 + "," + height / 1.9 + ")");

  let pie = d3.pie();
  pie.value(function(d){ //value data
    return d.value
  });

  let pieData = pie(sdData); //Make pie data format
  //console.log(pieData)

  let arc = d3.arc(); //path set

  //set pie chart extent (size)
  let radius = Math.min(width, height) / 2 - 15; //pie chart size
  arc.outerRadius(radius);
  arc.innerRadius(15); //inner radius size

  // let pieGroups = pieSVG.selectAll('g')
  //   .data([1])
  //   .join('g');

  let pieGroups = pieSVG.selectAll("path").data(pieData).join("path")
  .transition()
  .duration(500)
    .attr("d", arc)
    .style("fill", d => color(d.data.key))
    .attr("transform", "translate(" + width / 1.9 + "," + height / 1.9 + ")");
  
    
  console.log(arc.centroid(pieData[0])[1])  //Text

  let textGroup = pieSVG.selectAll("text").data(pieData).join("text")
  .transition()
  .duration(500)
   .text(d => d.data.key + ": " + d.data.value.toFixed(2)) // 2 decimal degree
    .style("text-anchor", "middle")
    .style("font-size", "15px")
    .style("fill", "white")
     .attr("transform", d => "translate(" + (arc.centroid(d)[0]+150) + "," + (arc.centroid(d)[1] + 150) + ")")
    //.attr("transform", d => "translate(100, 70)")
    


}

filterDataAfterBrushing(brushedDates){
  this.brushedData = brushedDates;
  let grouped_sd_eachCBG = '';
  if(!brushedDates || brushedDates.length == 0){
    // when dismiss a brush area, recover the entire day
    this.brushedData = '';
    grouped_sd_eachCBG = this.getCBGAttrData(this.sd_eachCBG);
  }
  else{
    const selected_sd_eachCBG = this.sd_eachCBG.filter(d => brushedDates.includes(d.Date));
    grouped_sd_eachCBG = this.getCBGAttrData(selected_sd_eachCBG);
  }
  //console.log(grouped_sd_eachCBG)
  this.styleMap(grouped_sd_eachCBG);


  //Covid-19 Data

  const selected_slc_Covid = this.slc_Covid.filter(d => brushedDates.includes(d.date))
  //console.log("asdsss", selected_slc_Covid)
  //console.log(selected_slc_Covid)
  //Refresh text in COVID-19 graph
  d3.selectAll('#recovered').remove();
  d3.selectAll('#cumulative').remove();
  d3.selectAll('#died').remove();
  
  this.COVID_situation(selected_slc_Covid);
  

  // Map - Need to aggregate data by its date. (average? sum?)
  
  // const aggregate = d => {
  //   if(selected_sd_eachCBG.length > 0){ //If brushed
  //     return d.reduce((acc, val) => {
  //       const index = acc.findIndex(obj => obj.origin_census_block_group === val.origin_census_block_group);
  //       if(index !== -1){ //if there are some duplicated one
  //         acc[index].median_home_dwell_time += val.median_home_dwell_time; 
  //         acc[index].delivery_behavior_devices += val.delivery_behavior_devices;
  //         acc[index].distance_traveled_from_home += val.distance_traveled_from_home
  //         acc[index].full_time_work_behavior_devices += val.full_time_work_behavior_devices
  //         acc[index].median_non_home_dwell_time += val.median_non_home_dwell_time
  //         acc[index].part_time_work_behavior_devices += val.part_time_work_behavior_devices
  //         acc[index].work_behavior_device += val.work_behavior_device
  //       }else{ //there is no duplicated one
  //         acc.push({
  //           origin_census_block_group: val.origin_census_block_group,
  //           median_home_dwell_time: (val.median_home_dwell_time / brushedDates.length).toFixed(2), //mean
  //           delivery_behavior_devices: val.delivery_behavior_devices, //sum
  //           distance_traveled_from_home: (val.distance_traveled_from_home/ brushedDates.length).toFixed(2), //mean
  //           full_time_work_behavior_devices: (val.full_time_work_behavior_devices/ brushedDates.length).toFixed(2), //mean,
  //           median_non_home_dwell_time: (val.median_non_home_dwell_time / brushedDates.length).toFixed(2), //mean,
  //           part_time_work_behavior_devices: (val.part_time_work_behavior_devices/ brushedDates.length).toFixed(2), //mean,
  //           work_behavior_device: (val.work_behavior_device/ brushedDates.length).toFixed(2), //mean
  //         });
  //       };
  //       return acc;
  //     }, []);

  //   }
  // }
  // const aggregated_sd_eachCBG = aggregate(selected_sd_eachCBG)
  // console.log(aggregated_sd_eachCBG)
}

// get the average of a specific type for each CBG
getCBGAttrData(selected_sd_eachCBG){
  // aggregate data according to the CBGID
  let grouped_sd_eachCBG = d3.group(selected_sd_eachCBG, d => d['origin_census_block_group']);
  // console.log('grouped_sd_eachCBG', grouped_sd_eachCBG);
  grouped_sd_eachCBG.forEach(function(value, key){
    grouped_sd_eachCBG.set(key, d3.mean(value, d=>parseFloat(d['median_home_dwell_time'])));
  });
  return grouped_sd_eachCBG;
} 


changeType(){
  let that = this;
  d3.select("#home-svg").append("rect") //initial highlight on home graph
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', that.CHART_WIDTH)
  .attr('height', that.CHART_HEIGHT)
  .attr('fill', 'none')
  .attr('stroke-width', 5)          
  .attr('stroke', 'rgb(10, 48, 107)')
  .attr("id", 'highlight')


  d3.select('#mapNav').selectAll('button')
    .on('click', function(){
        that.type = d3.select(this).attr('value');
        that.colorMap.domain(that.typeRange[that.type]);
        console.log('new colormap', that.colorMap.domain())
        that.filterDataAfterBrushing(that.brushedData);
        // update colormap
        that.updateColorBar();

        //that.type: median_home_dwell_time, full_time_work_behavior_devices, median_non_home_dwell_time
        d3.selectAll('#highlight').remove(); //initialize

        HighlightGraph(that.type)        
        function HighlightGraph(type){
          var select;
          var color;
          if(type == "median_home_dwell_time"){
            select = '#home-svg'
            color = 'rgb(10, 48, 107)'
          }else if(type == "full_time_work_behavior_devices"){
            select = '#work-svg'
            color = 'orange'
          }else if(type == "median_non_home_dwell_time"){
            select = '#outdoor-svg'
            color = 'green'
          }

          d3.select(select).append("rect")
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', that.CHART_WIDTH)
          .attr('height', that.CHART_HEIGHT)
          .attr('fill', 'none')
          .attr('stroke-width', 5)         
          .attr('stroke', color)
          .attr("id", 'highlight')

        }

    });


    //Style of graphs by click button
  
    // if(that.type == )
}

/**
  * Draw table on the right panel
  */
drawTable(data){
  // console.log(data.length)
  if(data.length == 0){
    data = this.sd_graph;
  }

  let tableDiv = d3.select('#TableBody');
  let table = tableDiv.selectAll('tr')
    .data(data)
    .join('tr');

  let tableSel = table.selectAll('td')
    .data(d => [d, d, d, d])
    .join('td');

  let date = tableSel.filter((d,i) => i === 0);
  date.text(d => d.date_range_start);

  let home = tableSel.filter((d,i) => i === 1);
  home.text(d => d.median_home_dwell_time);

  let work = tableSel.filter((d,i) => i === 2);
  work.text(d => d.sum_work_behavior_device);
  
  let outdoor = tableSel.filter((d,i) => i === 3);
  outdoor.text(d => d.median_non_home_dwell_time);

 }


updateColorBar(){
  const divSelector = d3.select('#colorMap');
  const colorMapsvg = divSelector.select('svg');
  colorMapsvg.selectAll('*').remove();
  let divWid = parseFloat(divSelector.style('width'));
  let divHei = parseFloat(divSelector.style('height'));
  colorMapsvg.attr('width', divWid).attr('height', divHei);

  // dimension setting
  let barWid = 3*divWid/4;
  let barHei = barWid/25;
  let fontSize = barHei/1.5;

  // get the range and color 
  let range = this.typeRange[this.type];
  let colorrange = this.colorRange[this.type];

  // add the colormap bar
  let graGenerator = colorMapsvg.append('linearGradient').attr('id', 'colorMapGrad')
            .attr('x1', '0').attr('x2', '1').attr('y1', '0').attr('y2', '0');
  graGenerator.append('stop').attr('offset', '0').attr('stop-color', colorrange[0]);
  graGenerator.append('stop').attr('offset', '1').attr('stop-color', colorrange[1]);

  // add a color bar
  let barGroup = colorMapsvg.append('g'); 
  barGroup.append('rect').attr('x', (divWid-barWid)/2).attr('y', (divHei-barHei)/2)
    .attr('width', barWid).attr('height', barHei).attr('fill', `url(#colorMapGrad)`);
  barGroup.append('text')
      .attr('x', (divWid-barWid)/2).attr('y', divHei/2).attr('dy', '0.5em').attr('dx', '-0.2em')
      .attr('text-anchor', 'end')
      .attr('font-size', `${fontSize}px`)
      .text(range[0]);
  barGroup.append('text')
      .attr('x', divWid/2+barWid/2).attr('y', divHei/2).attr('dy', '0.5em').attr('dx', '0.2em')
      .attr('text-anchor', 'begin')
      .attr('font-size', `${fontSize}px`)
      .text(range[1]);
}

}