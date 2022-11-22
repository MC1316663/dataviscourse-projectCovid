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

    //draw graphs
    this.covidCaseGraph();
    this.homeGraph();
    this.outdoorGraph();
    this.workDeviceGraph();
    this.brush();
    this.map();

    // add listners on buttons (work, home, other behaviours) upper map
    this.changeType();

    //console.log("sd_graph: ", this.sd_graph);
    //console.log("covid_case: ", this.slc_Covid);
  }
  /**
     * Bar chart for covid case graph
  */
  covidCaseGraph(){
    this.covidSVG
      .attr("width", this.CHART_WIDTH)
      .attr("height", this.CHART_HEIGHT);
    
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

  /**
   * Bar chart for median home spending time graph
   */
  homeGraph(){
    this.homeSVG
      .attr("width", this.CHART_WIDTH)
      .attr("height", this.CHART_HEIGHT);
    
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
    
    this.covidSVG.append('g')
    .attr('id', 'brush')
    .call(d3.brushX().extent([[this.MARGIN.left, 15], [this.CHART_WIDTH, this.CHART_HEIGHT - this.MARGIN.bottom]]).on("start brush", brushed));

    let that = this;
    let brushedData = [];
    function brushed({selection}){

      if(selection){
        const [x0, x1] = selection;

        that.homeG.selectAll('rect')
        .classed('brushed',  function(d){
          return that.xScale(d.date_range_start) > x0 && that.xScale(d.date_range_start) < x1});

        that.outdoorG.selectAll('rect')
        .classed('brushed',  function(d){return that.xScale(d.date_range_start) > x0 && that.xScale(d.date_range_start) < x1});

        that.workG.selectAll('rect')
        .classed('brushed',  function(d){return that.xScale(d.date_range_start) > x0 && that.xScale(d.date_range_start) < x1});
        
        brushedData = that.sd_graph.filter(d => that.xScale(d.date_range_start) > x0 && that.xScale(d.date_range_start) < x1);

        //store brushed dates in array
        let brushedDates = brushedData.map(d => d.date_range_start);
        //console.log(brushedDates)
        that.filterDataByBrushing(brushedDates)

      }
    }
  }

  map(){
    const that = this;
    let map;
    function initMap() {
      map = new google.maps.Map(d3.select("#Map").node(), {
        center: { lat: 40.69, lng: -111.906 },
        zoom: 10,
      });
      map.data.addGeoJson(
        //'./data/CBG_SaltLakeCounty.geojson' //this works but from path.
          that.slc_Json
      );
  
      //Chropleth map
      // map.data.setStyle({
      //   fillColor: "green",
      //   fillOpacity: 0.2,
      //   strokeWeight: 0.2
      // });

      //Example -----> min and max for classification of choroplethmap!
      //console.log("asd",that.slc_Json.features)
      const maxV = d3.max(that.slc_Json.features, function(d){
        //console.log(d.properties)
        return parseInt(d.properties.FID);
      })
      const minV = d3.min(that.slc_Json.features, function(d){
        return parseInt(d.properties.FID);
      })
      
      map.data.setStyle(function(d){    //Style for Choropleth map
        const value = d.j.FID        
        if(value >= minV && value < (minV+maxV)/3){
          var color =  "green"
        }
        else if(value >= (minV+maxV)/3 && value < (minV+maxV)/2){
          var color = "grey"
        }
        else if(value >= (minV+maxV)/2 && value < (minV+maxV)/1.5){
          var color = "blue"
        }
        else{
          var color = "red"
        }
        return{
          fillColor: color,
          fillOpacity: 0.2,
          strokeWeight: 0.2
        }
      });
  
    }

      initMap(); // Generate Map

      console.log("sd_eachCBG", that.sd_eachCBG)
      console.log("sd_graph", that.sd_graph)
      console.log("slc_Covid", that.slc_Covid)
}

filterDataByBrushing(brushedDates){
  const that = this
  //console.log(brushedDates)

  //Filter data 
  const selected_slc_Covid = that.slc_Covid.filter(d => brushedDates.includes(d.date))
  const selected_sd_graph = that.sd_graph.filter(d => brushedDates.includes(d.date_range_start))
  const selected_sd_eachCBG = that.sd_eachCBG.filter(d => brushedDates.includes(d.Date))


  //Color Map bar - use selected_df_eachCBG
  console.log(selected_sd_eachCBG)

  //Map - Need to aggregate data by its date. (average? sum?)
  //https://www.tutorialspoint.com/aggregate-records-in-javascript
  


  //Table

  
}

changeType(){
  d3.select('#mapNav').selectAll('button')
    .on('click', function(){
      console.log(d3.select(this).text());
    })
}
}
